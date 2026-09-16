import test from "node:test";
import assert from "node:assert/strict";
import { TALENT_NAMES, talentBonuses, testModScript, CAP_PENALTY_SCRIPT } from "../module/implants/test-mods.js";

test("the talent names the caps depend on are named, not guessed at", () => {
  assert.ok(TALENT_NAMES.tuning.length > 0);
  assert.ok(TALENT_NAMES.sacredCode.length > 0);
});

test("a matching talent raises the cap bonus", () => {
  const actor = { items: [{ type: "talent", name: TALENT_NAMES.tuning[0] }] };
  assert.deepEqual(talentBonuses(actor), { talentBonus: 1, sacredCode: false });
});

test("talent matching ignores case and is not fooled by a partial name", () => {
  const actor = { items: [{ type: "talent", name: TALENT_NAMES.tuning[0].toUpperCase() }] };
  assert.equal(talentBonuses(actor).talentBonus, 1);
  assert.equal(talentBonuses({ items: [{ type: "talent", name: "Настройка" }] }).talentBonus, 0);
});

test("the Sacred Code is recognised separately", () => {
  const actor = { items: [{ type: "talent", name: TALENT_NAMES.sacredCode[0] }] };
  assert.deepEqual(talentBonuses(actor), { talentBonus: 0, sacredCode: true });
});

test("only talents count — an implant of the same name does not", () => {
  const actor = { items: [{ type: "navis-apexialis.implant", name: TALENT_NAMES.tuning[0] }] };
  assert.deepEqual(talentBonuses(actor), { talentBonus: 0, sacredCode: false });
});

test("an actor with no talents gets no bonus", () => {
  assert.deepEqual(talentBonuses({ items: [] }), { talentBonus: 0, sacredCode: false });
});

test("a successes entry fires on the dialog trigger and adds to SL", () => {
  const script = testModScript({ kind: "testMod", skill: "reflexes", value: 2 }, 2);
  assert.equal(script.trigger, "dialog");
  assert.match(script.script, /args\.fields\.SL \+= 2/);
  assert.match(script.script, /args\.skill !== "reflexes"/);
});

test("an entry with no skill guards on nothing and applies to every test", () => {
  const script = testModScript({ kind: "testMod", value: 1 }, 2);
  assert.doesNotMatch(script.script, /args\.skill !==/);
  assert.match(script.script, /args\.fields\.SL \+= 1/);
});

test("the value is resolved at the implant's quality before it reaches the script", () => {
  const entry = { kind: "testMod", skill: "tech", value: { 1: 1, 2: 2, 3: 3, 4: 4 } };
  assert.match(testModScript(entry, 4).script, /args\.fields\.SL \+= 4/);
});

test("advantage and disadvantage set impmal's own flags", () => {
  assert.match(testModScript({ kind: "testMod", advantage: 1 }, 2).script, /args\.fields\.advantage = true/);
  assert.match(testModScript({ kind: "testMod", advantage: -1 }, 2).script, /args\.fields\.disadvantage = true/);
});

test("an entry of another kind produces no script", () => {
  assert.equal(testModScript({ kind: "wounds", value: 2 }, 2), null);
});

test("an entry that would do nothing produces no script", () => {
  assert.equal(testModScript({ kind: "testMod", value: 0 }, 2), null);
  assert.equal(testModScript({ kind: "testMod" }, 2), null);
});

test("the cap penalty is a dialog script applying Disadvantage", () => {
  assert.equal(CAP_PENALTY_SCRIPT.trigger, "dialog");
  assert.match(CAP_PENALTY_SCRIPT.script, /args\.fields\.disadvantage = true/);
});
