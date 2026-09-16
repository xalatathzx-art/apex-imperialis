import test from "node:test";
import assert from "node:assert/strict";
import { ENTRY_KINDS, LIVE_KINDS, targetPath, entryToChange } from "../module/implants/mechanics/targets.js";

test("the entry kinds are the set cycle A's families need", () => {
  assert.deepEqual([...ENTRY_KINDS].sort(), [
    "armour", "armourAll", "characteristic", "criticals", "encumbrance",
    "energy", "script", "skill", "speed", "talent", "testMod", "trait", "wounds"
  ]);
});

test("live kinds write nothing and are read at roll time", () => {
  assert.deepEqual([...LIVE_KINDS].sort(), ["script", "testMod"]);
  for (const kind of LIVE_KINDS) assert.equal(targetPath({ kind }), null);
});

test("characteristics and skills target impmal's own modifier fields", () => {
  assert.equal(targetPath({ kind: "characteristic", key: "tgh" }), "system.characteristics.tgh.modifier");
  assert.equal(targetPath({ kind: "skill", key: "medicae" }), "system.skills.medicae.modifier");
});

test("armour targets the six hit locations impmal already has", () => {
  assert.equal(targetPath({ kind: "armour", key: "leftArm" }), "system.combat.hitLocations.leftArm.armour");
  assert.equal(targetPath({ kind: "armourAll" }), "system.combat.armourModifier");
});

test("wounds, criticals, speed and encumbrance target their real paths", () => {
  assert.equal(targetPath({ kind: "wounds" }), "system.combat.wounds.max");
  assert.equal(targetPath({ kind: "criticals" }), "system.combat.criticals.max");
  assert.equal(targetPath({ kind: "speed", key: "land" }), "system.combat.speed.land.modifier");
  assert.equal(targetPath({ kind: "speed", key: "fly" }), "system.combat.speed.fly.modifier");
  assert.equal(targetPath({ kind: "encumbrance", key: "overburdened" }), "system.encumbrance.overburdened");
});

test("Заряд is a module flag, because impmal has no such pool", () => {
  assert.equal(targetPath({ kind: "energy" }), "flags.navis-apexialis.mechanicum.energy.max");
});

test("grants have no data path — they create items instead", () => {
  assert.equal(targetPath({ kind: "trait" }), null);
  assert.equal(targetPath({ kind: "talent" }), null);
});

test("an unknown kind resolves to nothing rather than to a wrong path", () => {
  assert.equal(targetPath({ kind: "nonsense" }), null);
});

test("an entry becomes an additive change at its quality level", () => {
  const change = entryToChange({ kind: "characteristic", key: "str", value: 10 }, 2);
  assert.deepEqual(change, {
    key: "system.characteristics.str.modifier",
    mode: 2,
    value: 10,
    priority: 20
  });
});

test("a per-level value resolves before becoming a change", () => {
  const entry = { kind: "energy", value: { 1: 1, 2: 3, 3: 5, 4: 7 } };
  assert.equal(entryToChange(entry, 1).value, 1);
  assert.equal(entryToChange(entry, 4).value, 7);
});

test("a live entry produces no change at all", () => {
  assert.equal(entryToChange({ kind: "testMod", value: 1 }, 2), null);
});

test("a zero value produces no change — an effect that does nothing is noise on the sheet", () => {
  assert.equal(entryToChange({ kind: "wounds", value: 0 }, 2), null);
});
