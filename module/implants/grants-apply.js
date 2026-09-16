/**
 * Turning an implant's planned grants into documents on the actor, and back.
 *
 * grants.js decides WHAT should exist, in plain objects, with no document
 * touched. This is the Foundry half: read what the implant has already
 * granted (documents on the actor flagged with this implant's id), diff
 * against `plannedGrants`, and create/delete to match.
 *
 * Grants live on the ACTOR, not on the implant item — unlike the mechanics
 * effect in mechanics/apply.js, which lives on the item and rides its
 * lifecycle for free. A granted weapon has no such parent to ride, so
 * deleting the implant must explicitly clear its grants here; Foundry will
 * not cascade that delete on its own.
 */

import { GRANT_FLAG, diffGrants, grantKey, plannedGrants, weaponTraitEntries } from "./grants.js";
import { enqueue } from "./mechanics/apply.js";
import { WEAPON_TRAITS_WITH_VALUE, weaponDataFromProfile } from "./weapon-profile.js";
import { IMPLANT_TYPE } from "./state.js";

const MODULE_ID = "navis-apexialis";

/**
 * A trait entry becomes {key} or {key, value} — the same mapping
 * weapon-profile.js uses internally for a weapon's own profile. Duplicated
 * rather than imported: that module's exported surface is fixed by task 5's
 * tests, and a weaponMount's referenced weapon needs the identical three-line
 * map applied to a document weapon-profile.js never sees.
 */
function traitFromEntry(entry) {
  const key = entry?.traitKey;
  if (!key) return null;
  if (!WEAPON_TRAITS_WITH_VALUE.includes(key)) return { key };
  const value = entry.traitValue;
  return (value === undefined || value === null || value === "") ? { key } : { key, value };
}

const traitsList = (traitEntries) => traitEntries.map(traitFromEntry).filter(Boolean);

/**
 * The traits a MOUNTED weapon ends up with: its own, plus the implant's, the
 * implant winning where both name the same trait.
 *
 * This must merge and not replace. A mount's source is a real weapon fetched by
 * UUID and it arrives carrying its own traits — overwriting the list strips a
 * bolt pistol of `loud`, a chainsword of `rend`, a plasma gun of `supercharge`,
 * silently, the moment it is socketed. The weapon path has no such problem:
 * there the profile IS the weapon, so its trait list is authored whole.
 */
function mergedTraitsList(sourceList, traitEntries) {
  const merged = Array.isArray(sourceList) ? sourceList.filter(trait => trait?.key) : [];
  const byKey = new Map(merged.map((trait, index) => [trait.key, index]));

  for (const trait of traitsList(traitEntries)) {
    const at = byKey.get(trait.key);
    if (at === undefined) {
      byKey.set(trait.key, merged.length);
      merged.push(trait);
    } else {
      merged[at] = trait;
    }
  }

  return merged;
}

/** Documents this implant has already granted, read off its actor. */
function existingGrants(item) {
  const actor = item?.parent;
  const prefix = `${item.id}:`;
  return (actor?.items ?? [])
    .filter(doc => doc.getFlag(MODULE_ID, GRANT_FLAG)?.startsWith(prefix))
    .map(doc => ({ id: doc.id, key: doc.getFlag(MODULE_ID, GRANT_FLAG) }));
}

/**
 * One planned grant → creation data for `Actor#createEmbeddedDocuments`, or
 * null if it cannot be built. Exported for tests, which pass a stub source
 * document rather than reaching a compendium.
 */
export async function creationDataFor(item, planned, traitEntries) {
  const flags = { [MODULE_ID]: { [GRANT_FLAG]: grantKey(item.id, planned.entryId, planned.hash) } };

  if (planned.kind === "weapon") {
    const data = weaponDataFromProfile(planned.data.profile, traitEntries);
    if (!data) return null;
    data.flags = foundry.utils.mergeObject(data.flags ?? {}, flags);
    return data;
  }

  // weaponMount and trait/talent all start from a compendium/world source document.
  const source = await fromUuid(planned.data.sourceUuid);
  if (!source) return null;

  const data = source.toObject();
  delete data._id;
  data.flags = foundry.utils.mergeObject(data.flags ?? {}, flags);

  if (planned.kind === "weaponMount") {
    // `force` is load-bearing, exactly as in weapon-profile.js for a grown-in
    // weapon: without it impmal's computeEquipped (impmal.js:8757) recomputes
    // `value` from whether a hand is holding the item, and a socketed weapon is
    // in no hand — so it un-equips itself on the first data preparation.
    foundry.utils.setProperty(data, "system.equipped", { value: true, force: true });
    foundry.utils.setProperty(data, "system.traits.list",
      mergedTraitsList(foundry.utils.getProperty(data, "system.traits.list"), traitEntries));
  }

  return data;
}

/**
 * Rebuild what this implant has granted on its actor, to match `plannedGrants`.
 * Idempotent — safe to call on every relevant update. Not itself queued; call
 * through `queueGrantSync` so overlapping hook firings serialise instead of
 * both taking the create path and doubling the grant.
 */
export async function syncImplantGrants(item) {
  if (item?.type !== IMPLANT_TYPE) return;

  const actor = item.parent;
  if (!actor) return;

  // A deleteItem hook receives the already-removed document: its own fields
  // still say "installed and active", so plannedGrants(item) would still plan
  // its grants unless we recognise it is gone and treat that as "plan nothing".
  const stillOnActor = actor.items?.has?.(item.id) ?? false;
  const planned = stillOnActor ? plannedGrants(item) : [];

  const existing = existingGrants(item);
  const { create, remove } = diffGrants(planned, existing, item.id);

  if (create.length) {
    const traitEntries = weaponTraitEntries(item);
    const toCreate = [];
    for (const p of create) {
      const data = await creationDataFor(item, p, traitEntries);
      if (data) toCreate.push(data);
    }
    if (toCreate.length) await actor.createEmbeddedDocuments("Item", toCreate);
  }

  if (remove.length) await actor.deleteEmbeddedDocuments("Item", remove);
}

/**
 * Serialised `syncImplantGrants`, keyed per implant.
 *
 * Foundry batches `createEmbeddedDocuments`, so several `createItem`/
 * `updateItem` hooks can fire for one user action before the first sync's
 * writes land. Without a queue keyed per implant id, an overlapping pair both
 * read the same stale "existing" snapshot and both take the create path,
 * leaving the implant with two weapons — the same bug cycle A shipped once
 * already with the mechanics effect.
 *
 * The queue itself is mechanics/apply.js's `enqueue`, shared rather than
 * re-typed: it already carries the two properties that matter (the work passed
 * as both handlers so a rejection cannot wedge the chain, and a failure logged
 * rather than swallowed), and a private copy is a place for them to drift.
 */
const grantQueues = new Map();

export function queueGrantSync(item) {
  return enqueue(grantQueues, item?.id, () => syncImplantGrants(item), "Implant grants");
}
