import test from "node:test";
import assert from "node:assert/strict";
import { adaptationDays } from "../module/implants/surgery.js";

test("adaptation is the roll plus three, less the Toughness bonus (DoomBC p. 49)", () => {
  assert.equal(adaptationDays(10, 0), 13);
  assert.equal(adaptationDays(5, 4), 4);
  assert.equal(adaptationDays(1, 3), 1);
});

test("adaptation never falls below one day, however tough the patient", () => {
  assert.equal(adaptationDays(1, 20), 1);
  assert.equal(adaptationDays(10, 99), 1);
});

test("a missing Toughness bonus does not shorten recovery", () => {
  assert.equal(adaptationDays(4, undefined), 7);
});
