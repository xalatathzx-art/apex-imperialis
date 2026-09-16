import test from "node:test";
import assert from "node:assert/strict";
import { scriptsForImplant } from "../module/implants/mechanics/apply.js";

const group = entries => [{ id: "g1", operator: "AND", entries }];

test("a testMod and an attackMod both compile, from their own compilers", () => {
  const scripts = scriptsForImplant(group([
    { id: "e1", kind: "testMod", skill: "stealth", value: 1 },
    { id: "e2", kind: "attackMod", value: 2 }
  ]), {}, 2);
  assert.equal(scripts.length, 2);
  assert.ok(scripts.every(s => s.trigger));
  assert.ok(scripts.some(s => /args\.fields\.SL \+= 1/.test(s.script)));
  assert.ok(scripts.some(s => /args\.fields\.SL \+= 2/.test(s.script)));
});

test("numeric kinds contribute no scripts", () => {
  const scripts = scriptsForImplant(group([
    { id: "e1", kind: "characteristic", key: "tgh", value: 5 },
    { id: "e2", kind: "wounds", value: 2 }
  ]), {}, 2);
  assert.deepEqual(scripts, []);
});

test("an unchosen OR group contributes nothing", () => {
  const mechanics = [{ id: "g", operator: "OR", entries: [{ id: "e", kind: "attackMod", value: 2 }] }];
  assert.deepEqual(scriptsForImplant(mechanics, {}, 2), []);
  assert.equal(scriptsForImplant(mechanics, { g: "e" }, 2).length, 1);
});

test("quality reaches both compilers", () => {
  const scripts = scriptsForImplant(group([
    { id: "e1", kind: "damageBonus", value: { 1: 1, 2: 2, 3: 3, 4: 4 } }
  ]), {}, 4);
  assert.match(scripts[0].script, /args\.fields\.damage \+= 4/);
});
