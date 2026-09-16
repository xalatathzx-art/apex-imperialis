import test from "node:test";
import assert from "node:assert/strict";
import { needsChoice, pendingChoices, resolveEntries, changesFor, liveEntries } from "../module/implants/mechanics/entries.js";

const AND_GROUP = {
  id: "g1",
  operator: "AND",
  entries: [
    { id: "e1", kind: "characteristic", key: "tgh", value: 5 },
    { id: "e2", kind: "armour", key: "leftArm", value: 1 }
  ]
};

const OR_GROUP = {
  id: "g2",
  operator: "OR",
  entries: [
    { id: "e3", kind: "skill", key: "athletics", value: 10 },
    { id: "e4", kind: "skill", key: "stealth", value: 10 }
  ]
};

test("an AND group needs no choice", () => {
  assert.equal(needsChoice([AND_GROUP]), false);
});

test("an OR group needs a choice until one is made", () => {
  assert.equal(needsChoice([OR_GROUP]), true);
  assert.equal(needsChoice([OR_GROUP], { g2: "e3" }), false);
});

test("pendingChoices names the groups still waiting", () => {
  assert.deepEqual(pendingChoices([AND_GROUP, OR_GROUP], {}).map(g => g.id), ["g2"]);
  assert.deepEqual(pendingChoices([AND_GROUP, OR_GROUP], { g2: "e4" }), []);
});

test("an AND group contributes all of its entries", () => {
  assert.deepEqual(resolveEntries([AND_GROUP], {}).map(e => e.id), ["e1", "e2"]);
});

test("an OR group contributes exactly the chosen entry", () => {
  assert.deepEqual(resolveEntries([OR_GROUP], { g2: "e4" }).map(e => e.id), ["e4"]);
});

test("an unchosen OR group contributes nothing rather than guessing", () => {
  assert.deepEqual(resolveEntries([OR_GROUP], {}), []);
});

test("a choice naming an entry that is not in the group contributes nothing", () => {
  assert.deepEqual(resolveEntries([OR_GROUP], { g2: "e99" }), []);
});

test("changes are built at the implant's quality", () => {
  const changes = changesFor([AND_GROUP], {}, 2);
  assert.deepEqual(changes, [
    { key: "system.characteristics.tgh.modifier", mode: 2, value: 5, priority: 20 },
    { key: "system.combat.hitLocations.leftArm.armour", mode: 2, value: 1, priority: 20 }
  ]);
});

test("live entries are separated out and never become changes", () => {
  const group = {
    id: "g3",
    operator: "AND",
    entries: [
      { id: "e5", kind: "testMod", skill: "reflexes", value: 1 },
      { id: "e6", kind: "wounds", value: 2 }
    ]
  };
  assert.deepEqual(changesFor([group], {}, 2).map(c => c.key), ["system.combat.wounds.max"]);
  assert.deepEqual(liveEntries([group], {}).map(e => e.id), ["e5"]);
});

test("empty and malformed mechanics are inert rather than throwing", () => {
  assert.deepEqual(resolveEntries(undefined, undefined), []);
  assert.deepEqual(changesFor([], {}, 2), []);
  assert.deepEqual(resolveEntries([{ id: "g", operator: "AND" }], {}), []);
});
