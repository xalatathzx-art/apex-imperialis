/**
 * Where a horde lives on the actor.
 *
 * A flag, not an Active Effect and not a data-model extension: the value has to
 * survive on NPCs that already exist in three paid compendia, and a flag is the
 * only store that needs nothing declared in the manifest and nothing migrated.
 *
 *   flags["navis-apexialis"].horde = { size, start }
 *
 * `size` is the whole subsystem. `start` is shown on the sheet so the GM can see
 * how far a unit has been ground down; nothing reads it as a rule, because the
 * morale rule keys off the Tier falling, not off a fraction of the original.
 */

export const MODULE_ID = "navis-apexialis";
export const FLAG = "horde";

import { tierFor } from "./horde-rules.js";

/**
 * The horde on this actor, or null if it is an ordinary NPC.
 *
 * A horde ground down to nothing is still a horde — tier 0, size 0 — and not an
 * NPC that starts taking wounds again. Only clearing the field on the sheet
 * removes it.
 */
export function readHorde(actor) {
  const data = actor?.getFlag?.(MODULE_ID, FLAG);
  if (!data) return null;
  const size = Math.max(0, Math.floor(Number(data.size) || 0));
  return {
    size,
    start: Math.max(size, Math.floor(Number(data.start) || 0)),
    tier: tierFor(size),
    destroyed: size === 0
  };
}

/** True when the actor is fielded as a horde, including one reduced to nothing. */
export function isHorde(actor) {
  return Boolean(actor?.getFlag?.(MODULE_ID, FLAG));
}

/**
 * Set the strength.
 *
 * Typing a number larger than the recorded start is read as deploying a new
 * unit, so the "of N" readout follows rather than needing its own control.
 * Only `clear` removes the flag — that is the empty field on the sheet. A horde
 * reduced to 0 in play stays a horde, so it does not quietly become an NPC with
 * wounds to lose.
 */
export async function writeSize(actor, size, { start, clear = false } = {}) {
  const next = Math.max(0, Math.floor(Number(size) || 0));
  const current = actor.getFlag(MODULE_ID, FLAG) ?? {};
  // Clearing the field removes the horde; being wiped out in play does not.
  if (next <= 0 && clear) return actor.unsetFlag(MODULE_ID, FLAG);
  const recorded = Math.floor(Number(start ?? current.start) || 0);
  return actor.setFlag(MODULE_ID, FLAG, { size: next, start: Math.max(next, recorded) });
}

/** Read the horde's Resolve, which the morale rule spends. */
export function readResolve(actor) {
  return Math.max(0, Math.floor(Number(actor?.system?.combat?.resolve) || 0));
}

export async function writeResolve(actor, value) {
  return actor.update({ "system.combat.resolve": Math.max(0, Math.floor(value)) });
}

/**
 * The armour a hit finds. Every hit on a horde is a body hit, so the body
 * location's rating is the horde's armour; impmal's own damage pipeline reads
 * it once we pin the location, and nothing here has to duplicate that.
 */
export const HORDE_HIT_LOCATION = "body";
