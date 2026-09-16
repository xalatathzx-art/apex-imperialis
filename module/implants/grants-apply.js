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

import { GRANT_FLAG, diffGrants, grantKey, plannedGrants } from "./grants.js";
import { resolveEntries } from "./mechanics/entries.js";
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

/** This implant's weaponTrait entries — applied TO a granted weapon, never granted as their own document. */
function weaponTraitEntriesOf(item) {
  const chosen = item.system?.chosenEffects ?? {};
  return resolveEntries(item.system?.mechanics, chosen).filter(entry => entry?.kind === "weaponTrait");
}

/** Documents this implant has already granted, read off its actor. */
function existingGrants(item) {
  const actor = item?.parent;
  const prefix = `${item.id}:`;
  return (actor?.items ?? [])
    .filter(doc => doc.getFlag(MODULE_ID, GRANT_FLAG)?.startsWith(prefix))
    .map(doc => ({ id: doc.id, key: doc.getFlag(MODULE_ID, GRANT_FLAG) }));
}

/** One planned grant → creation data for `Actor#createEmbeddedDocuments`, or null if it cannot be built. */
async function creationDataFor(item, planned, traitEntries) {
  const flags = { [MODULE_ID]: { [GRANT_FLAG]: grantKey(item.id, planned.entryId) } };

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
    foundry.utils.setProperty(data, "system.equipped.value", true);
    foundry.utils.setProperty(data, "system.traits.list", traitsList(traitEntries));
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
    const traitEntries = weaponTraitEntriesOf(item);
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
 * Keyed promise chain, copied from mechanics/apply.js's `mechanicsQueues`:
 * Foundry batches `createEmbeddedDocuments`, so several `createItem`/
 * `updateItem` hooks can fire for one user action before the first sync's
 * writes land. Without a queue keyed per implant id, an overlapping pair both
 * read the same stale "existing" snapshot and both take the create path,
 * leaving the implant with two weapons — the same bug cycle A shipped once
 * already with the mechanics effect.
 */
const grantQueues = new Map();

/**
 * Serialised `syncImplantGrants`, keyed per implant.
 *
 * `work` is passed as BOTH the fulfilment and rejection handler: a rejected
 * sync must not wedge this implant's chain, or one failure would stop that
 * implant from ever syncing its grants again for the rest of the session. The
 * failure is logged rather than swallowed so a grant that silently stopped
 * following its sheet is not indistinguishable from a grant that never had
 * anything wrong with it.
 */
export function queueGrantSync(item) {
  if (!item?.id) return Promise.resolve();

  const work = () => syncImplantGrants(item);
  const next = (grantQueues.get(item.id) ?? Promise.resolve()).then(work, work);
  grantQueues.set(item.id, next);

  return next.catch(error => {
    console.error(`${MODULE_ID} | grant sync failed`, error);
  });
}
