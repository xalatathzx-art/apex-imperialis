/**
 * Test modifiers, in impmal's own vocabulary.
 *
 * impmal has no effect key for "one more success" or for Advantage. Both are
 * decided while a test is being prepared, by scripts attached to an effect and
 * fired on a trigger: the actor runs `runScripts("dialog", args)` and the
 * scripts read and write `args.fields.SL`, `args.fields.advantage`,
 * `args.fields.disadvantage` and `args.skill`.
 *
 * So a `testMod` entry becomes a scriptData record on the implant's own effect
 * rather than a hook of ours. Two things follow, both good:
 *
 *   - the gate comes free — a disabled effect runs none of its scripts, so
 *     switching an implant off silences its modifiers with no bookkeeping;
 *   - the player can see the modifier on the effect, where impmal's own
 *     scripted traits appear, instead of it arriving from nowhere.
 *
 * `module/config/weapon-trait-effects.js` is this module's existing example of
 * the same shape — read it alongside this file.
 */

import { resolveQualityValue } from "./rules.js";

/**
 * Talents that move the implant ceilings, by name in both languages.
 *
 * Matched by name because talents are content, not code. A renamed talent stops
 * applying, which is why tools/check-implants.mjs asserts these names exist in
 * the talent pack — the failure is caught at build time rather than at the table.
 */
export const TALENT_NAMES = Object.freeze({
  tuning: Object.freeze(["Скитарий Альфа", "Skitarii Alpha"]),
  sacredCode: Object.freeze(["Смещающаяся Мантия", "Shifting Mantle"])
});

const nameMatches = (item, names) =>
  names.some(name => name.toLowerCase() === String(item?.name ?? "").toLowerCase());

export function talentBonuses(actor) {
  let talentBonus = 0;
  let sacredCode = false;

  for (const item of actor?.items ?? []) {
    if (item?.type !== "talent") continue;
    if (nameMatches(item, TALENT_NAMES.tuning)) talentBonus += 1;
    if (nameMatches(item, TALENT_NAMES.sacredCode)) sacredCode = true;
  }

  return { talentBonus, sacredCode };
}

/**
 * A `dialog` script is a row in the roll dialog, and a row does nothing until it
 * is ACTIVATED. `WarhammerScript.activated()` returns false outright when
 * `options.activateScript` is missing, so a dialog script without one renders as
 * an unticked line the player has to opt into by hand — fine for an optional
 * bonus, useless for a penalty nobody will ever tick against themselves.
 *
 * So the guard that used to sit at the top of the script body moves into
 * `activateScript`, and `hideScript` keeps rows that cannot apply to THIS roll
 * out of the list entirely. impmal's own built-ins (Aim, Charge) pair the two
 * exactly this way, and module/environment/gravity-rules.js already follows it.
 * The script body itself then does its work unconditionally.
 */

/** Being over either ceiling is −30 in the book (p. 269) — Disadvantage under the doctrine. */
export const CAP_PENALTY_SCRIPT = Object.freeze({
  label: "NAVIS.Implant.OverCap",
  trigger: "dialog",
  script: "args.disadvantage++;",
  // Over the cap is over the cap: every test, no condition, never hidden.
  options: Object.freeze({
    activateScript: "return true;",
    hideScript: "return false;"
  })
});

/**
 * @param {object} entry   a constructor entry
 * @param {number} quality the implant's level, 1..4
 * @returns {{label: string, trigger: string, script: string, options: object}|null}
 */
export function testModScript(entry, quality) {
  if (entry?.kind !== "testMod") return null;

  const successes = resolveQualityValue(entry.value, quality);
  const advantage = Math.sign(Number(entry.advantage) || 0);

  // An entry that would change nothing is not a neutral script — it is a line
  // of code running on every roll for no reason.
  if (!successes && !advantage) return null;

  const lines = [];

  // An entry with no skill speaks to every test, so its guard is a constant.
  const guard = entry.skill ? `args.skill === ${JSON.stringify(entry.skill)}` : "true";

  if (successes) lines.push(`args.fields.SL += ${successes};`);
  // Use ++ to increment, not assignment. impmal's computeState (impmal.js:156-168)
  // compares advantage and disadvantage as numbers. Assignment would wipe out
  // contributions from other sources (weapon traits, other implants, Fate).
  if (advantage > 0) lines.push("args.advantage++;");
  if (advantage < 0) lines.push("args.disadvantage++;");

  return {
    label: entry.label || "NAVIS.Implant.TestMod",
    trigger: "dialog",
    script: lines.join("\n"),
    options: {
      activateScript: `return ${guard};`,
      hideScript: `return !(${guard});`
    }
  };
}
