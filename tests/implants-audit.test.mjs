import test from "node:test";
import assert from "node:assert/strict";
import {
  weaponTraitProblems,
  conditionImmunityProblems,
  weaponProblems,
  weaponMountProblems,
  WEAPON_TRAIT_KEYS
} from "../tools/check-implants.mjs";

/* ── weaponTrait ───────────────────────────────────────────────────────── */

test("weaponTrait: a trait outside impmal's 21 fails", () => {
  const problems = weaponTraitProblems({ id: "e1", traitKey: "notATrait" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /not one of impmal's 21/);
});

test("weaponTrait: one of impmal's 21, no value, is fine", () => {
  assert.deepEqual(weaponTraitProblems({ id: "e1", traitKey: "loud" }), []);
});

test("weaponTrait: a value-taking trait may carry a value", () => {
  assert.deepEqual(weaponTraitProblems({ id: "e1", traitKey: "rend", traitValue: "3" }), []);
});

test("weaponTrait: a value on a trait that does not take one fails", () => {
  const problems = weaponTraitProblems({ id: "e1", traitKey: "loud", traitValue: "3" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /does not take one/);
});

test("WEAPON_TRAIT_KEYS holds exactly impmal's 21 weapon/armour traits", () => {
  assert.equal(WEAPON_TRAIT_KEYS.size, 21);
  for (const key of [
    "blast", "burst", "close", "defensive", "flamer", "heavy", "ineffective",
    "inflict", "loud", "penetrating", "rapidFire", "reach", "reliable", "rend",
    "shield", "spread", "subtle", "supercharge", "thrown", "twohanded", "unstable"
  ]) {
    assert.ok(WEAPON_TRAIT_KEYS.has(key), `missing "${key}"`);
  }
});

/* ── conditionImmunity ─────────────────────────────────────────────────── */

test("conditionImmunity: one of the 14 tiered conditions is fine", () => {
  assert.deepEqual(conditionImmunityProblems({ id: "e1", condition: "stunned" }), []);
  assert.deepEqual(conditionImmunityProblems({ id: "e1", condition: "dead" }), []);
});

test("conditionImmunity: anything else fails", () => {
  const problems = conditionImmunityProblems({ id: "e1", condition: "confused" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /not one of impmal's tiered conditions/);
});

/* ── weapon ────────────────────────────────────────────────────────────── */

test("weapon: a named profile with a real attack type is fine", () => {
  assert.deepEqual(weaponProblems({ id: "e1", profile: { name: "Когти", attackType: "melee" } }), []);
  assert.deepEqual(weaponProblems({ id: "e1", profile: { name: "Пистолет", attackType: "ranged" } }), []);
});

test("weapon: no profile fails on both counts", () => {
  const problems = weaponProblems({ id: "e1", profile: null });
  assert.equal(problems.length, 2);
});

test("weapon: a profile with no name fails", () => {
  const problems = weaponProblems({ id: "e1", profile: { name: "", attackType: "melee" } });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /no profile name/);
});

test("weapon: an attackType outside melee/ranged fails", () => {
  const problems = weaponProblems({ id: "e1", profile: { name: "x", attackType: "thrown" } });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /expected "melee" or "ranged"/);
});

/* ── weaponMount ───────────────────────────────────────────────────────── */

test("weaponMount: a sourceUuid is fine", () => {
  assert.deepEqual(weaponMountProblems({ id: "e1", sourceUuid: "Item.abc" }), []);
});

test("weaponMount: emptySocket: true is fine — a declared empty socket is finished", () => {
  assert.deepEqual(weaponMountProblems({ id: "e1", emptySocket: true }), []);
});

test("weaponMount: neither sourceUuid nor emptySocket fails — a silent-inert mount", () => {
  const problems = weaponMountProblems({ id: "e1" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /no sourceUuid and is not marked emptySocket/);
});

test("weaponMount: emptySocket as a truthy non-true value still fails", () => {
  const problems = weaponMountProblems({ id: "e1", emptySocket: "yes" });
  assert.equal(problems.length, 1);
});
