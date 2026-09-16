/**
 * Everything about implants that is decided by arithmetic rather than by a
 * Foundry document. Nothing here is imported from Foundry, so it is testable
 * without a running game — the same division `module/technomiracles/rules.js`
 * uses.
 *
 * Two book rules live here.
 *
 * The cap (DoomBC p. 269): a character may carry no more than ½ T.b (rounded
 * up) Modules. If the Toughness bonus drops — from Toughness damage, say — the
 * excess must be switched OFF, or everything is at −30. Under this module's
 * conversion doctrine (±30 and beyond → Disadvantage) that penalty is
 * Disadvantage on all tests.
 *
 * Installed and active are separate ceilings (DoomBC p. 102): the Mysteries of
 * the Sacred Code let a character FIT two more than the limit, which does not
 * raise how many may be ACTIVE — it only allows reconfiguring on the fly.
 */

export const QUALITY_LEVELS = Object.freeze([1, 2, 3, 4]);

/** Level 2 is the ordinary article; the book only prints the levels that differ from it. */
export const ORDINARY_QUALITY = 2;

/** The Sacred Code's allowance, in extra INSTALLED modules only. */
const SACRED_CODE_BONUS = 2;

const atLeastZero = n => Math.max(0, Number.isFinite(n) ? n : 0);

/** ½ T.b rounded up, never below zero, plus whatever talents grant. */
function baseCap(toughnessBonus, talentBonus) {
  return Math.ceil(atLeastZero(toughnessBonus) / 2) + atLeastZero(talentBonus);
}

export function installedCap(toughnessBonus, talentBonus = 0, sacredCode = false) {
  return baseCap(toughnessBonus, talentBonus) + (sacredCode ? SACRED_CODE_BONUS : 0);
}

export function activeCap(toughnessBonus, talentBonus = 0) {
  return baseCap(toughnessBonus, talentBonus);
}

/**
 * @param {object} input
 * @param {number} input.installed       how many implants are fitted
 * @param {number} input.active          how many of those are switched on
 * @param {number} input.toughnessBonus
 * @param {number} [input.talentBonus]
 * @param {boolean} [input.sacredCode]
 * @returns {{installedCap: number, activeCap: number, overInstalled: number,
 *            overActive: number, penalty: ""|"disadvantage"}}
 */
export function capState({ installed, active, toughnessBonus, talentBonus = 0, sacredCode = false }) {
  const iCap = installedCap(toughnessBonus, talentBonus, sacredCode);
  const aCap = activeCap(toughnessBonus, talentBonus);

  const overInstalled = Math.max(0, atLeastZero(installed) - iCap);
  const overActive = Math.max(0, atLeastZero(active) - aCap);

  return {
    installedCap: iCap,
    activeCap: aCap,
    overInstalled,
    overActive,
    penalty: (overInstalled || overActive) ? "disadvantage" : ""
  };
}

/**
 * A constructor entry's value, which may depend on the implant's quality.
 *
 * A plain number is the same at every level. An object is a ladder keyed 1..4.
 * A level the ladder does not mention falls back to the ordinary article rather
 * than to zero: the book writes only the levels that DIFFER from level 2, so a
 * missing level means "same as ordinary", not "nothing".
 */
export function resolveQualityValue(value, quality) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value || typeof value !== "object") return 0;

  const exact = value[quality];
  if (Number.isFinite(exact)) return exact;

  const ordinary = value[ORDINARY_QUALITY];
  return Number.isFinite(ordinary) ? ordinary : 0;
}
