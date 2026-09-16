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

/** Identifies one grant: which implant, which entry. */
export function grantKey(implantId, entryId) {
  return `${implantId}:${entryId}`;
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

/**
 * @param {object} item a plain implant-shaped object
 * @returns {Array<{entryId: string, kind: string, data: object}>}
 */
export function plannedGrants(item) {
  if (!isImplantActive(item)) return [];
  const chosen = item.system?.chosenEffects ?? {};
  return resolveEntries(item.system?.mechanics, chosen)
    .filter(grantable)
    .map(entry => ({ entryId: entry.id, kind: entry.kind, data: entry }));
}

/**
 * @param {Array} planned  from plannedGrants
 * @param {Array<{id: string, key: string}>} existing documents already granted by this implant
 * @param {string} implantId
 */
export function diffGrants(planned, existing = [], implantId = "") {
  const wanted = new Set(planned.map(p => grantKey(implantId, p.entryId)));
  const present = new Set(existing.map(e => e.key));

  return {
    create: planned.filter(p => !present.has(grantKey(implantId, p.entryId))),
    remove: existing.filter(e => !wanted.has(e.key)).map(e => e.id)
  };
}
