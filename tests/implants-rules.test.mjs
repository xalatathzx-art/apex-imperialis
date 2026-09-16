import test from "node:test";
import assert from "node:assert/strict";
import {
  QUALITY_LEVELS, ORDINARY_QUALITY,
  installedCap, activeCap, capState, resolveQualityValue
} from "../module/implants/rules.js";

test("the cap is half the Toughness bonus, rounded up (DoomBC p. 269)", () => {
  assert.equal(installedCap(0), 0);
  assert.equal(installedCap(1), 1);
  assert.equal(installedCap(2), 1);
  assert.equal(installedCap(3), 2);
  assert.equal(installedCap(4), 2);
  assert.equal(installedCap(5), 3);
  assert.equal(installedCap(7), 4);
});

test("a negative or missing Toughness bonus is a cap of zero, not a negative cap", () => {
  assert.equal(installedCap(-3), 0);
  assert.equal(installedCap(undefined), 0);
});

test("the talent raises both caps by one (DoomBC p. 102)", () => {
  assert.equal(installedCap(4, 1), 3);
  assert.equal(activeCap(4, 1), 3);
});

test("the Sacred Code adds two INSTALLED only, never active", () => {
  assert.equal(installedCap(4, 0, true), 4);
  assert.equal(activeCap(4, 0), 2);
});

test("within both caps there is no penalty", () => {
  const s = capState({ installed: 2, active: 2, toughnessBonus: 4 });
  assert.equal(s.installedCap, 2);
  assert.equal(s.activeCap, 2);
  assert.equal(s.overInstalled, 0);
  assert.equal(s.overActive, 0);
  assert.equal(s.penalty, "");
});

test("too many active modules is Disadvantage on everything (−30 under the doctrine)", () => {
  const s = capState({ installed: 2, active: 3, toughnessBonus: 4 });
  assert.equal(s.overActive, 1);
  assert.equal(s.penalty, "disadvantage");
});

test("a dropping Toughness bonus puts a legal character over the cap", () => {
  const before = capState({ installed: 3, active: 3, toughnessBonus: 5 });
  assert.equal(before.penalty, "");
  const after = capState({ installed: 3, active: 3, toughnessBonus: 3 });
  assert.equal(after.overActive, 1);
  assert.equal(after.penalty, "disadvantage");
});

test("the Sacred Code lets you carry excess installed without penalty, but not active", () => {
  const s = capState({ installed: 4, active: 2, toughnessBonus: 4, sacredCode: true });
  assert.equal(s.overInstalled, 0);
  assert.equal(s.overActive, 0);
  assert.equal(s.penalty, "");
});

test("quality levels are 1..4 and 2 is the ordinary article", () => {
  assert.deepEqual(QUALITY_LEVELS, [1, 2, 3, 4]);
  assert.equal(ORDINARY_QUALITY, 2);
});

test("a plain number is the same at every level", () => {
  for (const q of QUALITY_LEVELS) assert.equal(resolveQualityValue(5, q), 5);
});

test("a per-level value picks its level", () => {
  const ladder = { 1: 1, 2: 3, 3: 5, 4: 7 };
  assert.equal(resolveQualityValue(ladder, 1), 1);
  assert.equal(resolveQualityValue(ladder, 2), 3);
  assert.equal(resolveQualityValue(ladder, 3), 5);
  assert.equal(resolveQualityValue(ladder, 4), 7);
});

test("a missing level falls back to the ordinary article, not to zero", () => {
  assert.equal(resolveQualityValue({ 2: 3 }, 4), 3);
});

test("nothing at all is zero", () => {
  assert.equal(resolveQualityValue(undefined, 2), 0);
  assert.equal(resolveQualityValue({}, 2), 0);
});
