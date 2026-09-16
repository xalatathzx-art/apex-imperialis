import test from "node:test";
import assert from "node:assert/strict";

/**
 * grants-apply.js is the Foundry half, so it needs the handful of globals it
 * actually calls. These are the real semantics of the three foundry.utils
 * helpers, small enough to state here, which lets a test hand `creationDataFor`
 * a REAL-shaped source document — the case no test covered while a mount was
 * quietly discarding the source weapon's own traits.
 */
const getProperty = (object, path) =>
  path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), object);

const setProperty = (object, path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  let node = object;
  for (const key of keys) node = (node[key] ??= {});
  node[last] = value;
};

const mergeObject = (target, other) => {
  const out = { ...target };
  for (const [key, value] of Object.entries(other ?? {})) {
    out[key] = (value && typeof value === "object" && !Array.isArray(value))
      ? mergeObject(out[key] ?? {}, value)
      : value;
  }
  return out;
};

globalThis.foundry = { utils: { getProperty, setProperty, mergeObject } };

let sourceDocument = null;
globalThis.fromUuid = async () => sourceDocument;

const { creationDataFor } = await import("../module/implants/grants-apply.js");

const sourceWeapon = (traits) => ({
  toObject: () => ({
    _id: "src1",
    name: "Болт-пистолет",
    type: "weapon",
    system: { attackType: "ranged", traits: { list: structuredClone(traits) } }
  })
});

const implant = { id: "imp1" };
const mount = { entryId: "e1", kind: "weaponMount", hash: "abc", data: { sourceUuid: "Compendium.x.y.Item.z" } };

test("a mounted weapon keeps its own traits alongside the implant's", async () => {
  sourceDocument = sourceWeapon([{ key: "loud" }, { key: "rend", value: 2 }]);

  const data = await creationDataFor(implant, mount, [
    { kind: "weaponTrait", traitKey: "penetrating", traitValue: 4 }
  ]);

  assert.deepEqual(data.system.traits.list, [
    { key: "loud" },
    { key: "rend", value: 2 },
    { key: "penetrating", value: 4 }
  ]);
});

test("the implant wins where both name the same trait", async () => {
  sourceDocument = sourceWeapon([{ key: "penetrating", value: 2 }, { key: "loud" }]);

  const data = await creationDataFor(implant, mount, [
    { kind: "weaponTrait", traitKey: "penetrating", traitValue: 6 }
  ]);

  assert.deepEqual(data.system.traits.list, [{ key: "penetrating", value: 6 }, { key: "loud" }]);
});

test("a mount with no traits of its own leaves the source weapon's list untouched", async () => {
  sourceDocument = sourceWeapon([{ key: "supercharge", value: 3 }, { key: "penetrating", value: 4 }]);

  const data = await creationDataFor(implant, mount, []);

  assert.deepEqual(data.system.traits.list, [{ key: "supercharge", value: 3 }, { key: "penetrating", value: 4 }]);
});

test("a mounted weapon is equipped WITH force, or impmal un-equips it again", async () => {
  sourceDocument = sourceWeapon([]);
  const data = await creationDataFor(implant, mount, []);
  assert.deepEqual(data.system.equipped, { value: true, force: true });
});

test("the grant flag carries the implant id, the entry id and the content hash", async () => {
  sourceDocument = sourceWeapon([]);
  const data = await creationDataFor(implant, mount, []);
  assert.equal(data.flags["navis-apexialis"].grantedBy, "imp1:e1:abc");
  assert.equal(data._id, undefined);
});

test("a weapon grown into the limb is built from its profile, force-equipped too", async () => {
  const data = await creationDataFor(implant, {
    entryId: "e2", kind: "weapon", hash: "def",
    data: { profile: { name: "Когти", attackType: "melee" } }
  }, [{ kind: "weaponTrait", traitKey: "rend", traitValue: 2 }]);

  assert.equal(data.name, "Когти");
  assert.deepEqual(data.system.traits.list, [{ key: "rend", value: 2 }]);
  assert.deepEqual(data.system.equipped, { value: true, force: true });
  assert.equal(data.flags["navis-apexialis"].grantedBy, "imp1:e2:def");
});

test("a source that cannot be found builds nothing", async () => {
  sourceDocument = null;
  assert.equal(await creationDataFor(implant, mount, []), null);
});
