import test from "node:test";
import assert from "node:assert/strict";
import { widenNames } from "../module/script-names.js";

const run = (text, args) => new Function("args", text).call({ actor: args.actor }, args);

const talent = (name, originalName) => ({ name, flags: originalName ? { babele: { originalName } } : {} });

// The requirement script "Mastery (Athletics)" ships with, verbatim.
const MASTERY = 'return this.actor.system.skills.athletics.advances >= 4 && this.actor.itemTypes["talent"].find(i => i.name == "Talented (Athletics)")';

test("a requirement that names an owned talent still finds it once Babele renames it", () => {
  const actor = {
    system: { skills: { athletics: { advances: 4 } } },
    itemTypes: { talent: [talent("Одарённость (Атлетика)", "Talented (Athletics)")] }
  };
  assert.equal(Boolean(run(MASTERY, { actor })), false, "unwidened, the English name is not found");
  const widened = widenNames(MASTERY);
  assert.equal(widened.count, 1);
  assert.ok(run(widened.text, { actor }), "widened, the stored English name matches");
});

test("an untranslated world keeps the original behaviour", () => {
  const actor = {
    system: { skills: { athletics: { advances: 4 } } },
    itemTypes: { talent: [talent("Talented (Athletics)")] }
  };
  assert.ok(run(widenNames(MASTERY).text, { actor }));
});

test("a negated comparison stays negated in both languages", () => {
  const text = 'return args.item.name != "Dodge"';
  const widened = widenNames(text).text;
  assert.equal(run(widened, { item: talent("Уклонение", "Dodge") }), false);
  assert.equal(run(widened, { item: talent("Бег", "Running") }), true);
});

test("a script with nothing to widen is left alone", () => {
  assert.equal(widenNames("return args.actor.system.wounds.value > 0"), null);
});
