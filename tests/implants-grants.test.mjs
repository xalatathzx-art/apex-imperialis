import test from "node:test";
import assert from "node:assert/strict";
import { GRANT_FLAG, grantKey, plannedGrants, diffGrants } from "../module/implants/grants.js";

const IMPLANT = "navis-apexialis.implant";
const implant = (entries, { installed = true, disabled = false, active = true, id = "imp1" } = {}) => ({
  id, type: IMPLANT,
  system: { installed, disabled, active, quality: 2, chosenEffects: {},
            mechanics: [{ id: "g1", operator: "AND", entries }] }
});

test("the grant key names both the implant and the entry", () => {
  assert.equal(grantKey("imp1", "e1"), "imp1:e1");
});

test("a weapon entry plans one grant", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти", attackType: "melee" } }
  ]));
  assert.equal(planned.length, 1);
  assert.equal(planned[0].kind, "weapon");
  assert.equal(planned[0].entryId, "e1");
});

test("a switched-off implant plans nothing", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти" } }
  ], { active: false }));
  assert.deepEqual(planned, []);
});

test("an unfitted or damaged implant plans nothing either", () => {
  assert.deepEqual(plannedGrants(implant([{ id: "e", kind: "weapon", profile: {} }], { installed: false })), []);
  assert.deepEqual(plannedGrants(implant([{ id: "e", kind: "weapon", profile: {} }], { disabled: true })), []);
});

test("non-grant kinds are not planned", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "characteristic", key: "tgh", value: 5 },
    { id: "e2", kind: "attackMod", value: 1 }
  ]));
  assert.deepEqual(planned, []);
});

test("weaponTrait is not granted on its own — it rides the weapon", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "weaponTrait", traitKey: "penetrating", traitValue: 4 }
  ]));
  assert.deepEqual(planned, []);
});

test("an empty mount plans nothing; a filled one plans a grant", () => {
  assert.deepEqual(plannedGrants(implant([{ id: "e1", kind: "weaponMount" }])), []);
  const filled = plannedGrants(implant([{ id: "e1", kind: "weaponMount", sourceUuid: "Compendium.x.y.Item.z" }]));
  assert.equal(filled.length, 1);
  assert.equal(filled[0].kind, "weaponMount");
});

test("diff creates what is planned and missing", () => {
  const { create, remove } = diffGrants([{ entryId: "e1", kind: "weapon", data: {} }], []);
  assert.equal(create.length, 1);
  assert.deepEqual(remove, []);
});

test("diff removes what exists and is no longer planned", () => {
  const existing = [{ id: "doc1", key: "imp1:e1" }];
  const { create, remove } = diffGrants([], existing, "imp1");
  assert.deepEqual(create, []);
  assert.deepEqual(remove, ["doc1"]);
});

test("diff leaves a grant that is both planned and present", () => {
  const existing = [{ id: "doc1", key: "imp1:e1" }];
  const planned = [{ entryId: "e1", kind: "weapon", data: {} }];
  const { create, remove } = diffGrants(planned, existing, "imp1");
  assert.deepEqual(create, []);
  assert.deepEqual(remove, []);
});
