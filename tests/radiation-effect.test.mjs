import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRadiationEffect, actorDose, PENALTY_PER_DOSE
} from "../module/environment/radiation-effect.js";

globalThis.game = { i18n: { localize: k => k } };
globalThis.CONST = { ACTIVE_EFFECT_MODES: { ADD: 2 } };

test("five points per dose, off Toughness, Strength and Agility", () => {
  assert.equal(PENALTY_PER_DOSE, 5);
  const effect = buildRadiationEffect(3);
  assert.deepEqual(effect.changes.map(c => c.key).sort(), [
    "system.characteristics.ag.modifier",
    "system.characteristics.str.modifier",
    "system.characteristics.tgh.modifier"
  ]);
  for (const change of effect.changes) assert.equal(change.value, "-15");
});

test("the penalty scales straight with the dose", () => {
  for (const dose of [1, 2, 7, 10]) {
    const value = buildRadiationEffect(dose).changes[0].value;
    assert.equal(value, String(-5 * dose), `dose ${dose}`);
  }
});

test("no dose means no effect document", () => {
  assert.equal(buildRadiationEffect(0), null);
  assert.equal(buildRadiationEffect(-3), null);
  assert.equal(buildRadiationEffect(undefined), null);
});

test("it edits modifier, so the system recomputes the total itself", () => {
  // characteristic.total = starting + modifier + advances, и computeTotal()
  // считает его сам — трогать total напрямую было бы затиранием.
  for (const change of buildRadiationEffect(2).changes) {
    assert.match(change.key, /\.modifier$/);
    assert.equal(change.mode, CONST.ACTIVE_EFFECT_MODES.ADD);
  }
});

test("the dose is read off the actor flag the biomonitor writes", () => {
  const actor = flag => ({ getFlag: (_m, key) => (key === "exposure" ? flag : undefined) });
  assert.equal(actorDose(actor({ radiationDose: 4 })), 4);
  assert.equal(actorDose(actor({})), 0);
  assert.equal(actorDose(actor(undefined)), 0);
  assert.equal(actorDose({}), 0);
  // Дробную дозу округляем, отрицательную не пропускаем.
  assert.equal(actorDose(actor({ radiationDose: 2.6 })), 3);
  assert.equal(actorDose(actor({ radiationDose: -2 })), 0);
});

test("the effect names its dose so the sheet shows why stats dropped", () => {
  assert.match(buildRadiationEffect(6).name, /6$/);
  assert.equal(buildRadiationEffect(6).flags["apex-imperialis"].radiationEffect.dose, 6);
});
