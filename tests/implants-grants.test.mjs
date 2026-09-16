import test from "node:test";
import assert from "node:assert/strict";
import { GRANT_FLAG, grantKey, plannedGrants, diffGrants, weaponTraitEntries } from "../module/implants/grants.js";

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

test("an edited profile reads as a different grant — remove plus create", () => {
  const before = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти", damage: { base: "4" } } }
  ]));
  const existing = [{ id: "doc1", key: grantKey("imp1", "e1", before[0].hash) }];

  // Same entry id, edited contents.
  const after = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти", damage: { base: "6" } } }
  ]));

  const { create, remove } = diffGrants(after, existing, "imp1");
  assert.deepEqual(remove, ["doc1"]);
  assert.equal(create.length, 1);
  assert.equal(create[0].entryId, "e1");
});

test("re-pointing a mount replaces the weapon instead of leaving the old one", () => {
  const before = plannedGrants(implant([{ id: "e1", kind: "weaponMount", sourceUuid: "Compendium.x.y.Item.old" }]));
  const existing = [{ id: "doc1", key: grantKey("imp1", "e1", before[0].hash) }];

  const after = plannedGrants(implant([{ id: "e1", kind: "weaponMount", sourceUuid: "Compendium.x.y.Item.new" }]));
  const { create, remove } = diffGrants(after, existing, "imp1");
  assert.deepEqual(remove, ["doc1"]);
  assert.equal(create.length, 1);
});

test("a weaponTrait added later changes the weapon's grant key", () => {
  const before = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти" } }
  ]));
  const after = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти" } },
    { id: "e2", kind: "weaponTrait", traitKey: "rend", traitValue: 2 }
  ]));
  assert.notEqual(before[0].hash, after[0].hash);
});

test("untouched content keeps its hash, so an unchanged grant is left alone", () => {
  const entries = [{ id: "e1", kind: "weapon", profile: { name: "Когти", damage: { base: "4" } } }];
  const a = plannedGrants(implant(entries));
  const b = plannedGrants(implant(structuredClone(entries)));
  assert.equal(a[0].hash, b[0].hash);

  const existing = [{ id: "doc1", key: grantKey("imp1", "e1", a[0].hash) }];
  const { create, remove } = diffGrants(b, existing, "imp1");
  assert.deepEqual(create, []);
  assert.deepEqual(remove, []);
});

test("the grant key still starts with the implant id, which the removal path matches on", () => {
  const planned = plannedGrants(implant([{ id: "e1", kind: "weapon", profile: { name: "Когти" } }]));
  assert.ok(grantKey("imp1", "e1", planned[0].hash).startsWith("imp1:"));
});

test("weaponTraitEntries reports only the trait entries", () => {
  const entries = weaponTraitEntries(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти" } },
    { id: "e2", kind: "weaponTrait", traitKey: "rend", traitValue: 2 }
  ]));
  assert.equal(entries.length, 1);
  assert.equal(entries[0].traitKey, "rend");
});
