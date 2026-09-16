/**
 * Where a constructor entry points.
 *
 * This file is the whole translation layer between DoomBC's vocabulary and
 * Imperium Maledictum's data paths, and it holds nothing else — adding a target
 * is a one-line change in one place.
 *
 * Every path here was taken from impmal's own effect-key list
 * (`templates/apps/effect-key-options.hbs`), so an implant reaches exactly the
 * fields the system already lets an Active Effect reach.
 *
 * Three groups of kinds have NO path:
 * - Live kinds (`testMod`, `script`): decided when a test is prepared.
 * - Grant kinds (`trait`, `talent`): create items rather than change numbers.
 * - Computed kinds (`energy`): computed directly, not via effects pipeline.
 */

import { resolveQualityValue } from "../rules.js";

/** Foundry's CONST.ACTIVE_EFFECT_MODES.ADD, inlined so this file needs no Foundry import. */
const MODE_ADD = 2;

/** After impmal's own derived values, before anything that reads a final total. */
const PRIORITY = 20;

export const ENTRY_KINDS = Object.freeze([
  "characteristic", "skill", "armour", "armourAll",
  "wounds", "criticals", "speed", "encumbrance",
  "energy", "trait", "talent", "testMod", "script"
]);

/** Kinds that store nothing and are read at the moment of a roll. */
export const LIVE_KINDS = Object.freeze(["testMod", "script"]);

/** Kinds that create an item on the actor rather than changing a number. */
const GRANT_KINDS = Object.freeze(["trait", "talent"]);

/**
 * Kinds computed directly rather than applied as an effect. Заряд lives in a
 * module flag, which an Active Effect cannot reach — module/technomiracles/
 * resources.js records this from an earlier cycle. Task 12's energyCapacity()
 * walks these entries itself, so producing a change here would be dead at best
 * and a double-count at worst.
 */
const COMPUTED_KINDS = Object.freeze(["energy"]);

const FIXED_PATHS = Object.freeze({
  armourAll: "system.combat.armourModifier",
  wounds: "system.combat.wounds.max",
  criticals: "system.combat.criticals.max"
});

const KEYED_PATHS = Object.freeze({
  characteristic: key => `system.characteristics.${key}.modifier`,
  skill: key => `system.skills.${key}.modifier`,
  armour: key => `system.combat.hitLocations.${key}.armour`,
  speed: key => `system.combat.speed.${key}.modifier`,
  encumbrance: key => `system.encumbrance.${key}`
});

/**
 * @param {{kind: string, key?: string}} entry
 * @returns {string|null} the data path, or null for live, grant, and computed kinds
 */
export function targetPath(entry) {
  const kind = entry?.kind;
  if (!kind) return null;
  if (LIVE_KINDS.includes(kind) || GRANT_KINDS.includes(kind) || COMPUTED_KINDS.includes(kind)) return null;

  if (FIXED_PATHS[kind]) return FIXED_PATHS[kind];

  const build = KEYED_PATHS[kind];
  if (!build || !entry.key) return null;
  return build(entry.key);
}

/**
 * @param {object} entry   a constructor entry
 * @param {number} quality the implant's level, 1..4
 * @returns {{key: string, mode: number, value: number, priority: number}|null}
 */
export function entryToChange(entry, quality) {
  const key = targetPath(entry);
  if (!key) return null;

  const value = resolveQualityValue(entry?.value, quality);
  // An effect that adds nothing is noise on the sheet, not a neutral no-op.
  if (!value) return null;

  return { key, mode: MODE_ADD, value, priority: PRIORITY };
}
