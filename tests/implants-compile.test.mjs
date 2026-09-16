import test from "node:test";
import assert from "node:assert/strict";
import { compileEntry, CONDITION_KEYS } from "../module/implants/mechanics/compile.js";

test("the fourteen tiered conditions are the ones impmal has", () => {
  assert.deepEqual([...CONDITION_KEYS], [
    "ablaze", "bleeding", "blinded", "deafened", "fatigued", "frightened",
    "incapacitated", "overburdened", "poisoned", "prone", "restrained",
    "stunned", "unconscious", "dead"
  ]);
});

test("attackMod fires on the dialog trigger and guards on isAttack", () => {
  const s = compileEntry({ kind: "attackMod", value: 2 }, 2);
  assert.equal(s.trigger, "dialog");
  assert.match(s.options.activateScript, /args\.isAttack/);
  assert.match(s.script, /args\.fields\.SL \+= 2/);
});

test("attackMod can narrow to melee or ranged", () => {
  const s = compileEntry({ kind: "attackMod", value: 1, attackType: "melee" }, 2);
  assert.match(s.options.activateScript, /args\.weapon\?\.system\?\.attackType === "melee"/);
});

test("attackMod advantage increments the counter, never assigns", () => {
  const s = compileEntry({ kind: "attackMod", advantage: 1 }, 2);
  assert.match(s.script, /args\.advantage\+\+/);
  assert.doesNotMatch(s.script, /args\.advantage\s*=/);
});

test("damageBonus adds to the dialog's damage field", () => {
  const s = compileEntry({ kind: "damageBonus", value: 3 }, 2);
  assert.equal(s.trigger, "dialog");
  assert.match(s.script, /args\.fields\.damage \+= 3/);
  assert.match(s.options.activateScript, /args\.isAttack/);
});

test("damageReduction pushes a labelled modifier on preApplyDamage", () => {
  const s = compileEntry({ kind: "damageReduction", value: 2 }, 2);
  assert.equal(s.trigger, "preApplyDamage");
  assert.match(s.script, /args\.modifiers\.push/);
  assert.match(s.script, /-2/);
});

test("conditionImmunity deletes the condition and says so", () => {
  const s = compileEntry({ kind: "conditionImmunity", condition: "fatigued" }, 2);
  assert.equal(s.trigger, "createCondition");
  assert.match(s.script, /hasCondition\("fatigued"\)/);
  assert.match(s.script, /\.delete\(\)/);
});

test("values resolve at the implant's quality before reaching the script", () => {
  const entry = { kind: "damageBonus", value: { 1: 1, 2: 2, 3: 3, 4: 4 } };
  assert.match(compileEntry(entry, 4).script, /args\.fields\.damage \+= 4/);
  assert.match(compileEntry(entry, 1).script, /args\.fields\.damage \+= 1/);
});

test("an entry that would do nothing compiles to nothing", () => {
  assert.equal(compileEntry({ kind: "attackMod", value: 0 }, 2), null);
  assert.equal(compileEntry({ kind: "damageBonus" }, 2), null);
  assert.equal(compileEntry({ kind: "conditionImmunity" }, 2), null);
});

test("a kind this file does not own compiles to nothing", () => {
  assert.equal(compileEntry({ kind: "characteristic", key: "tgh", value: 5 }, 2), null);
  assert.equal(compileEntry({ kind: "testMod", value: 1 }, 2), null);
});

test("an unknown condition key compiles to nothing rather than a broken script", () => {
  assert.equal(compileEntry({ kind: "conditionImmunity", condition: "notAThing" }, 2), null);
});

test("every generated script is valid JavaScript", () => {
  const cases = [
    { kind: "attackMod", value: 2, attackType: "ranged" },
    { kind: "attackMod", advantage: -1 },
    { kind: "damageBonus", value: 3 },
    { kind: "damageReduction", value: 2 },
    { kind: "conditionImmunity", condition: "bleeding" }
  ];
  for (const c of cases) {
    const s = compileEntry(c, 2);
    assert.doesNotThrow(() => new Function("args", s.script), `bad script for ${c.kind}`);
    if (s.options?.activateScript) {
      assert.doesNotThrow(() => new Function("args", s.options.activateScript), `bad guard for ${c.kind}`);
    }
  }
});
