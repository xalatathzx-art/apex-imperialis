/**
 * Horde rules — pure functions, no Foundry globals, so they can be exercised
 * outside the game.
 *
 * The whole subsystem rests on one asymmetry, and on keeping SL out of it:
 *
 *   • against a horde you attack with **Advantage** — a wall of people is hard
 *     to miss, but it is not easier to hurt;
 *   • the horde's own tests take a **modifier** from its numbers — its volume of
 *     fire, its many eyes, its many voices.
 *
 * Neither side is handed bonus SL, and that is deliberate: in impmal damage is
 * weapon damage + SL, so bonus SL silently becomes damage. Granting it against a
 * horde made every shot into a crowd hit harder the bigger the crowd was, which
 * is how a hundred gangers used to evaporate in two rounds.
 *
 * Damage itself is spent against the horde's armour as a threshold — see
 * casualtiesFrom. That is the whole conversion; there are no per-weapon cases.
 */

/** Strength bands, descending. Each is roughly double the one below. */
export const TIER_BANDS = [
  { min: 100, tier: 5 },
  { min: 50, tier: 4 },
  { min: 25, tier: 3 },
  { min: 10, tier: 2 },
  { min: 1, tier: 1 }
];

/** 0 for a destroyed or unset horde, 1–5 otherwise. */
export function tierFor(size) {
  const n = Math.floor(Number(size) || 0);
  if (n <= 0) return 0;
  return TIER_BANDS.find(band => n >= band.min).tier;
}

/**
 * The modifier a horde's own numbers give it.
 *
 * Finer-grained than Tier and much larger, because this one is a modifier to the
 * target number rather than bonus SL: it is the mob's own volume of fire, eyes
 * and voices, and it is meant to be felt.
 */
export const MODIFIER_BANDS = [
  { min: 120, modifier: 60 },
  { min: 90, modifier: 50 },
  { min: 60, modifier: 40 },
  { min: 40, modifier: 30 },
  { min: 20, modifier: 20 },
  { min: 10, modifier: 10 },
  { min: 5, modifier: 5 },
  { min: 1, modifier: 0 }
];

export function modifierFor(size) {
  const n = Math.floor(Number(size) || 0);
  if (n <= 0) return 0;
  return MODIFIER_BANDS.find(band => n >= band.min).modifier;
}

/**
 * Which of the horde's own tests the modifier reaches.
 *
 * Stated as characteristics rather than as a list of skills, because that is
 * exactly the same set and it also catches the raw characteristic tests:
 * Perception covers Awareness and Intuition, Weapon Skill covers Melee, Ballistic
 * Skill covers Ranged and its Thrown specialisation, Fellowship covers Rapport.
 */
export const HORDE_TEST_CHARACTERISTICS = ["per", "ws", "bs", "fel"];

export function modifierApplies(characteristic) {
  return HORDE_TEST_CHARACTERISTICS.includes(characteristic);
}

/**
 * Traits that make an attack sweep a packed formation.
 *
 * Spread is deliberately absent. It sits on a great deal of ordinary weaponry —
 * every bolt weapon, and the Spread branch of Rapid Fire — so doubling for it
 * made one gun the answer to every crowd. Blast and Flamer stay: those genuinely
 * cover ground rather than splashing onto a neighbour, and a flame weapon still
 * carries the Flamer trait itself, so removing Spread does not weaken it.
 *
 * Nothing else is a special case. Burst, Rapid Fire and Supercharge already pay
 * for themselves through impmal's own numbers — an extra SL, Advantage, +X
 * damage — and every one of those is damage over armour, which the rule below
 * counts. A weapon group is not on this list either: a chainsword kills through
 * the damage it rolls, like everything else.
 */
export const AREA_TRAITS = ["blast", "flamer"];

/**
 * Damage becomes bodies.
 *
 * Armour is a threshold, not a subtraction. Beat it — meeting it counts — and
 * the round that did it kills one of them; every 2 points past that kills
 * another. An area attack spends 1 point per body instead of 2, and a Triumph
 * doubles the lot, because a critical would simply kill an ordinary minor NPC
 * and the horde is made of them.
 *
 *   armour 4, damage 4  → 1 body
 *   armour 4, damage 6  → 2 bodies
 *   armour 4, damage 6, Blast → 3 bodies
 *   armour 4, damage 3  → none; the armour held
 */
export function casualtiesFrom({ armourBeaten, damageOverArmour = 0, area = false, triumph = false } = {}) {
  if (!armourBeaten) return 0;
  const over = Math.max(0, Math.floor(Number(damageOverArmour) || 0));
  const base = 1 + Math.floor(over / (area ? 1 : 2));
  return triumph ? base * 2 : base;
}

/**
 * How much Resolve the horde loses for falling from one band to another.
 * One per band crossed, so a single devastating hit can break a unit outright.
 */
export function resolveLostBetween(sizeBefore, sizeAfter) {
  return Math.max(0, tierFor(sizeBefore) - tierFor(sizeAfter));
}

/** Everything one attack does to a horde, in one place, for one test to cover. */
export function resolveAttack({ size, armourBeaten, damageOverArmour = 0, area = false, triumph = false }) {
  const casualties = Math.min(Math.max(0, Math.floor(Number(size) || 0)),
                              casualtiesFrom({ armourBeaten, damageOverArmour, area, triumph }));
  const after = Math.max(0, (Math.floor(Number(size) || 0)) - casualties);
  return {
    casualties,
    sizeAfter: after,
    tierBefore: tierFor(size),
    tierAfter: tierFor(after),
    resolveLost: resolveLostBetween(size, after),
    destroyed: after === 0
  };
}
