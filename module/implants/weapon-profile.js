/**
 * An implant's weapon profile, in impmal's own weapon shape.
 *
 * The shape was read from a real impmal weapon document (Фраг-граната):
 *   attackType "ranged", category "grenadesExplosives", spec "ordnance",
 *   range "medium", damage { base: "6", characteristic: "", SL: false,
 *   ignoreAP: false }, traits.list [{key:"blast"}, {key:"thrown", value:"Medium"}]
 *
 * Pure: no Foundry import, no document.
 */

/** impmal's traits that carry a value; the rest are presence-only. */
export const WEAPON_TRAITS_WITH_VALUE = Object.freeze([
  "heavy", "inflict", "penetrating", "rapidFire", "rend", "shield", "supercharge", "thrown"
]);

/** A trait entry becomes {key} or {key, value} — never {key, value: undefined}. */
function traitFromEntry(entry) {
  const key = entry?.traitKey;
  if (!key) return null;
  if (!WEAPON_TRAITS_WITH_VALUE.includes(key)) return { key };
  const value = entry.traitValue;
  return (value === undefined || value === null || value === "") ? { key } : { key, value };
}

/**
 * @param {object} profile     the entry's stored profile
 * @param {Array}  traitEntries the implant's weaponTrait entries
 * @returns {object|null} creation data for an impmal weapon
 */
export function weaponDataFromProfile(profile, traitEntries = []) {
  if (!profile?.name) return null;

  const damage = profile.damage ?? {};

  return {
    name: profile.name,
    type: "weapon",
    img: profile.img ?? undefined,
    system: {
      attackType: profile.attackType ?? "melee",
      category: profile.category ?? "",
      spec: profile.spec ?? "",
      range: profile.range ?? "",
      damage: {
        base: damage.base ?? "",
        characteristic: damage.characteristic ?? "",
        SL: !!damage.SL,
        ignoreAP: !!damage.ignoreAP
      },
      traits: { list: traitEntries.map(traitFromEntry).filter(Boolean) },
      // Grown into the limb: there is nothing to draw. `force` is load-bearing —
      // without it, impmal's computeEquipped (impmal.js:8757) recomputes `value`
      // from whether a hand is holding the item and un-equips it immediately.
      equipped: { value: true, force: true }
    }
  };
}
