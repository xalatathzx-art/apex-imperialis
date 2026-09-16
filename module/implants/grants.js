/**
 * What an implant should have created on its actor, and what to do about the
 * difference.
 *
 * Everything an implant grants carries a flag naming the implant AND the entry
 * that asked for it, so two entries on one implant cannot be confused and a
 * grant can never outlive its origin. This is the machinery cycle A declared
 * for trait and talent and never built.
 *
 * Pure: plain objects in, plain objects out, no document touched. The Foundry
 * half is in grants-apply.js.
 */

import { resolveEntries } from "./mechanics/entries.js";
import { isImplantActive } from "./state.js";

export const GRANT_FLAG = "grantedBy";

/**
 * Identifies one grant: which implant, which entry, and what the entry SAID.
 *
 * The content hash is what makes an edit visible. An entry id does not change
 * when its contents do, so on the id alone a GM who re-points a `weaponMount`
 * at a different weapon, edits a fitted weapon's profile, or adds a
 * `weaponTrait` afterwards gets nothing at all: the old grant still matches the
 * new plan, so it is neither removed nor replaced. Folding the hash in makes
 * changed content read as "not the grant we have" — a remove plus a create.
 *
 * The implant id stays FIRST and the separator stays `:` because the removal
 * path in grants-apply.js finds this implant's grants by the `${item.id}:`
 * prefix.
 */
export function grantKey(implantId, entryId, hash = "") {
  const base = `${implantId}:${entryId}`;
  return hash ? `${base}:${hash}` : base;
}

/**
 * Stable JSON — object keys sorted at every level, so a document that merely
 * stored its fields in a different order does not read as edited content.
 */
function stableStringify(value) {
  if (value === undefined) return "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/**
 * FNV-1a over that text, base 36. Not a security hash: it only has to change
 * when the content does, and stay short enough to leave the grant flag
 * readable in a document's flags.
 */
function contentHash(value) {
  const text = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

/**
 * Kinds that put a document on the actor. NOT weaponTrait.
 *
 * This set differs from targets.js GRANT_KINDS, which means "has no Active
 * Effect data path" and includes weaponTrait (applied TO weapons, not an effect
 * path). GRANTING_KINDS means "creates a document on the actor", so weaponTrait
 * is excluded — it is applied to a weapon another entry grants, not granted as
 * a separate document. Future readers may try to unify these names; they are
 * both correct, and unifying them would silently start granting trait entries
 * as documents despite this distinction.
 */
const GRANTING_KINDS = new Set(["weapon", "weaponMount", "trait", "talent"]);

/** A mount with nothing mounted grants nothing; a weapon needs a profile. */
function grantable(entry) {
  if (!GRANTING_KINDS.has(entry?.kind)) return false;
  if (entry.kind === "weaponMount") return !!entry.sourceUuid;
  if (entry.kind === "weapon") return !!entry.profile;
  return !!entry.sourceUuid;
}

/** Kinds whose granted document also carries the implant's weaponTrait entries. */
const TRAIT_BEARING_KINDS = new Set(["weapon", "weaponMount"]);

/**
 * This implant's `weaponTrait` entries — applied TO a granted weapon, never
 * granted as their own document. Shared with grants-apply.js, which builds the
 * weapon from them, so both halves read the same list.
 */
export function weaponTraitEntries(item) {
  const chosen = item?.system?.chosenEffects ?? {};
  return resolveEntries(item?.system?.mechanics, chosen).filter(entry => entry?.kind === "weaponTrait");
}

/**
 * @param {object} item a plain implant-shaped object
 * @returns {Array<{entryId: string, kind: string, data: object, hash: string}>}
 */
export function plannedGrants(item) {
  if (!isImplantActive(item)) return [];
  const chosen = item.system?.chosenEffects ?? {};
  const entries = resolveEntries(item.system?.mechanics, chosen);
  const traits = entries.filter(entry => entry?.kind === "weaponTrait");

  return entries
    .filter(grantable)
    .map(entry => ({
      entryId: entry.id,
      kind: entry.kind,
      data: entry,
      // A weapon-bearing grant is built from its entry AND the implant's
      // weaponTrait entries, so a trait added later has to change the hash too
      // — otherwise it would never reach the weapon already granted.
      hash: contentHash(TRAIT_BEARING_KINDS.has(entry.kind) ? { entry, traits } : { entry })
    }));
}

/**
 * @param {Array} planned  from plannedGrants
 * @param {Array<{id: string, key: string}>} existing documents already granted by this implant
 * @param {string} implantId
 */
export function diffGrants(planned, existing = [], implantId = "") {
  const wanted = new Set(planned.map(p => grantKey(implantId, p.entryId, p.hash)));
  const present = new Set(existing.map(e => e.key));

  return {
    create: planned.filter(p => !present.has(grantKey(implantId, p.entryId, p.hash))),
    remove: existing.filter(e => !wanted.has(e.key)).map(e => e.id)
  };
}
