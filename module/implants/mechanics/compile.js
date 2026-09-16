/**
 * Entry → impmal script.
 *
 * Every trigger and argument name here was read from impmal's own shipped
 * scripts in a running world, not inferred from the trigger's name. The
 * examples, for the next reader:
 *
 *   dialog          args.fields.SL++            (weapon trait "mastercrafted")
 *                   args.fields.damage += N     (weapon category "force")
 *                   args.advantage++            (weapon trait "defensive")
 *                   args.isAttack && args.weapon  (impmal's own attack guard)
 *   preApplyDamage  args.modifiers.push({value, label})   (category "graviton")
 *   immunity idiom  hasCondition(k) → notification → delete()
 *
 * Scripts need `options.activateScript` or they render as unticked rows a
 * player must opt into — warhammer-lib's `activated()` returns false without
 * one. Cycle A shipped that bug; module/environment/gravity-rules.js is the
 * house example of the correct shape.
 */

import { resolveQualityValue } from "../rules.js";

/** impmal's tiered conditions, in its own order. */
export const CONDITION_KEYS = Object.freeze([
  "ablaze", "bleeding", "blinded", "deafened", "fatigued", "frightened",
  "incapacitated", "overburdened", "poisoned", "prone", "restrained",
  "stunned", "unconscious", "dead"
]);

/**
 * The EXPRESSION that says "this is an attack we care about" — not a whole
 * statement. Both the activate and hide scripts are built from it, so the two
 * can never drift, and neither is produced by string-surgery on the other.
 */
function attackGuardExpression(attackType) {
  const parts = ["args.isAttack", "args.weapon"];
  if (attackType === "melee" || attackType === "ranged") {
    parts.push(`args.weapon?.system?.attackType === ${JSON.stringify(attackType)}`);
  }
  return parts.join(" && ");
}

const scripted = (labelKey, trigger, script, guardExpression) => ({
  labelKey, trigger, script,
  options: {
    activateScript: `return ${guardExpression};`,
    hideScript: `return !(${guardExpression});`
  }
});

/** Always on: a guard that is a constant still has to be present. */
const ALWAYS = "true";

function attackMod(entry, quality) {
  const successes = resolveQualityValue(entry.value, quality);
  const advantage = Math.sign(Number(entry.advantage) || 0);
  if (!successes && !advantage) return null;

  const lines = [];
  if (successes) lines.push(`args.fields.SL += ${successes};`);
  // A counter, never an assignment: impmal's computeState compares the two
  // numerically, so assigning discards another source's contribution.
  if (advantage > 0) lines.push("args.advantage++;");
  if (advantage < 0) lines.push("args.disadvantage++;");

  return scripted("NAVIS.Implant.Kind.attackMod", "dialog", lines.join("\n"), attackGuardExpression(entry.attackType));
}

function damageBonus(entry, quality) {
  const value = resolveQualityValue(entry.value, quality);
  if (!value) return null;
  return scripted("NAVIS.Implant.Kind.damageBonus", "dialog",
    `args.fields.damage += ${value};`, attackGuardExpression(entry.attackType));
}

function damageReduction(entry, quality) {
  const value = resolveQualityValue(entry.value, quality);
  if (!value) return null;
  // A labelled modifier, as impmal's own graviton script does, so the player
  // can see where the reduction came from instead of an unexplained number.
  return scripted("NAVIS.Implant.Kind.damageReduction", "preApplyDamage",
    `args.modifiers.push({ value: ${-Math.abs(value)}, label: this.effect.name });`, ALWAYS);
}

function conditionImmunity(entry) {
  const key = entry.condition;
  if (!CONDITION_KEYS.includes(key)) return null;
  return scripted("NAVIS.Implant.Kind.conditionImmunity", "createCondition", [
    `let c = this.actor.hasCondition(${JSON.stringify(key)});`,
    `if (c) { this.script.notification(this.effect.name); c.delete(); }`
  ].join("\n"), ALWAYS);
}

const COMPILERS = { attackMod, damageBonus, damageReduction, conditionImmunity };

/**
 * @param {object} entry
 * @param {number} quality 1..4
 * @returns {{labelKey: string, trigger: string, script: string, options: object}|null}
 */
export function compileEntry(entry, quality) {
  const compiler = COMPILERS[entry?.kind];
  return compiler ? compiler(entry, quality) : null;
}
