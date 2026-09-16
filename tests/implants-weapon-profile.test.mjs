import test from "node:test";
import assert from "node:assert/strict";
import { weaponDataFromProfile, WEAPON_TRAITS_WITH_VALUE } from "../module/implants/weapon-profile.js";

test("the eight value-taking traits are impmal's", () => {
  assert.deepEqual([...WEAPON_TRAITS_WITH_VALUE].sort(), [
    "heavy", "inflict", "penetrating", "rapidFire", "rend", "shield", "supercharge", "thrown"
  ]);
});

test("a melee profile maps onto impmal's own weapon shape", () => {
  const data = weaponDataFromProfile({
    name: "Когти Птераксии", attackType: "melee",
    damage: { base: "1d10+2", characteristic: "str" }
  }, []);
  assert.equal(data.name, "Когти Птераксии");
  assert.equal(data.type, "weapon");
  assert.equal(data.system.attackType, "melee");
  assert.equal(data.system.damage.base, "1d10+2");
  assert.equal(data.system.damage.characteristic, "str");
  assert.equal(data.system.damage.SL, false);
  assert.equal(data.system.damage.ignoreAP, false);
});

test("a granted weapon comes equipped — it is grown into the limb", () => {
  const data = weaponDataFromProfile({ name: "x", attackType: "melee" }, []);
  assert.equal(data.system.equipped.value, true);
});

test("weaponTrait entries become the weapon's trait list", () => {
  const data = weaponDataFromProfile({ name: "x", attackType: "melee" }, [
    { kind: "weaponTrait", traitKey: "penetrating", traitValue: 4 },
    { kind: "weaponTrait", traitKey: "reach" }
  ]);
  assert.deepEqual(data.system.traits.list, [
    { key: "penetrating", value: 4 },
    { key: "reach" }
  ]);
});

test("a value on a trait that takes none is dropped, not passed through", () => {
  const data = weaponDataFromProfile({ name: "x", attackType: "melee" }, [
    { kind: "weaponTrait", traitKey: "reach", traitValue: 9 }
  ]);
  assert.deepEqual(data.system.traits.list, [{ key: "reach" }]);
});

test("a ranged profile carries its category, spec and range", () => {
  const data = weaponDataFromProfile({
    name: "Плазменный резак", attackType: "ranged",
    category: "plasma", spec: "pistol", range: "short",
    damage: { base: "8" }
  }, []);
  assert.equal(data.system.category, "plasma");
  assert.equal(data.system.spec, "pistol");
  assert.equal(data.system.range, "short");
});

test("a profile with no name yields nothing rather than an unnamed weapon", () => {
  assert.equal(weaponDataFromProfile({ attackType: "melee" }, []), null);
  assert.equal(weaponDataFromProfile(null, []), null);
});
