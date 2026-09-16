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
});

// A dialog script with no activateScript never runs on its own: warhammer-lib's
// activated() returns false outright when the option is missing.
test("a testMod activates itself rather than waiting to be ticked", () => {
  const script = testModScript({ kind: "testMod", skill: "reflexes", value: 2 }, 2);
  assert.ok(script.options.activateScript);
  assert.ok(script.options.hideScript);
});

test("the skill comparison lives in the activation, not in the script body", () => {
  const script = testModScript({ kind: "testMod", skill: "reflexes", value: 2 }, 2);
  assert.doesNotMatch(script.script, /args\.skill/);
  assert.match(script.options.activateScript, /args\.skill === "reflexes"/);
  assert.match(script.options.hideScript, /args\.skill === "reflexes"/);
});

test("an entry with no skill guards on nothing and applies to every test", () => {
  const script = testModScript({ kind: "testMod", value: 1 }, 2);
  assert.doesNotMatch(script.script, /args\.skill/);
  assert.equal(script.options.activateScript, "return true;");
  assert.match(script.script, /args\.fields\.SL \+= 1/);
});

test("the value is resolved at the implant's quality before it reaches the script", () => {
  const entry = { kind: "testMod", skill: "tech", value: { 1: 1, 2: 2, 3: 3, 4: 4 } };
  assert.match(testModScript(entry, 4).script, /args\.fields\.SL \+= 4/);
});

test("advantage and disadvantage set impmal's own flags", () => {
  assert.match(testModScript({ kind: "testMod", advantage: 1 }, 2).script, /args\.advantage\+\+/);
  assert.match(testModScript({ kind: "testMod", advantage: -1 }, 2).script, /args\.disadvantage\+\+/);
});

test("an entry of another kind produces no script", () => {
  assert.equal(testModScript({ kind: "wounds", value: 2 }, 2), null);
});

test("an entry that would do nothing produces no script", () => {
  assert.equal(testModScript({ kind: "testMod", value: 0 }, 2), null);
  assert.equal(testModScript({ kind: "testMod" }, 2), null);
});

// This file is pure and has no game.i18n to call: it hands back a key, not
// text, and module/implants/mechanics/apply.js resolves it before the
// script reaches a stored effect (see the comment on resolveLabel there).
test("a testMod with no author label carries a key, not text", () => {
  const script = testModScript({ kind: "testMod", value: 1 }, 2);
  assert.equal(script.labelKey, "NAVIS.Implant.TestMod");
  assert.equal(script.label, undefined);
});

// An author-supplied entry.label is literal text for THIS implant, not a
// translation key, so it must come back under a different property name —
// otherwise apply.js's resolveLabel would try to localize plain text.
test("an author-supplied label is literal text, not a key to resolve", () => {
  const script = testModScript({ kind: "testMod", value: 1, label: "Second Heart pulse" }, 2);
  assert.equal(script.label, "Second Heart pulse");
  assert.equal(script.labelKey, undefined);
});

test("the cap penalty is a dialog script applying Disadvantage", () => {
  assert.equal(CAP_PENALTY_SCRIPT.trigger, "dialog");
  assert.match(CAP_PENALTY_SCRIPT.script, /args\.disadvantage\+\+/);
});

// Nobody ticks a penalty against themselves, so it must activate on its own.
test("the cap penalty activates itself and is never hidden", () => {
  assert.equal(CAP_PENALTY_SCRIPT.options.activateScript, "return true;");
  assert.equal(CAP_PENALTY_SCRIPT.options.hideScript, "return false;");
});

test("the cap penalty carries a key too — this file cannot localize it", () => {
  assert.equal(CAP_PENALTY_SCRIPT.labelKey, "NAVIS.Implant.OverCap");
  assert.equal(CAP_PENALTY_SCRIPT.label, undefined);
});
