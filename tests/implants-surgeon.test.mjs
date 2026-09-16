import test from "node:test";
import assert from "node:assert/strict";

// The Chirurgeon localises as it builds its view model, so the labels need a
// stub — the same one radiation-effect.test.mjs uses. Nothing here touches a
// Foundry document: every function under test takes plain objects.
globalThis.game = { i18n: { localize: key => key, format: (key, data) => `${key}:${data.level}` } };

const { slotOf, occupancy, offerSides, placementFor } = await import("../module/implants/surgeon-app.js");
const { implantLocation, implantTint } = await import("../module/biomonitor/biomonitor-body.js");

const item = (id, system = {}) => ({ id, system });

/* -------------------------------------------- */
/*  Slots are read, never derived               */
/* -------------------------------------------- */

test("the slot is the stored field, not the name", () => {
  assert.equal(slotOf({ name: "Bionic Arm", system: { slot: "cortex" } }), "cortex");
  assert.equal(slotOf({ name: "Железная Рука", system: { slot: "ocular" } }), "ocular");
});

test("an implant with no slot lands in other, where it is visible and fittable", () => {
  // The failure this guards: in the reference system a whole-body kit had no
  // slot to land in, so it appeared in no slot at all and could never be
  // fitted. Every implant must resolve to one of the eleven.
  assert.equal(slotOf({ system: {} }), "other");
  assert.equal(slotOf({ system: { slot: "" } }), "other");
  assert.equal(slotOf({ system: { slot: "torso" } }), "other", "an unrecognised slot is not dropped");
  assert.equal(slotOf({}), "other");
  assert.equal(slotOf(undefined), "other");
});

test("every slot key SLOTS declares survives the round trip", async () => {
  const { SLOTS } = await import("../module/implants/classify.js");
  for (const slot of SLOTS) assert.equal(slotOf({ system: { slot: slot.key } }), slot.key);
});

/* -------------------------------------------- */
/*  Paired slots                                */
/* -------------------------------------------- */

test("an empty paired slot has both sides free", () => {
  const { free, taken } = occupancy([]);
  assert.deepEqual(free, ["left", "right"]);
  assert.equal(taken.size, 0);
});

test("one fitted implant takes its own side and leaves the other", () => {
  const { free, placement } = occupancy([item("a", { side: "right" })]);
  assert.deepEqual(free, ["left"]);
  assert.equal(placement.get("a"), "right");
});

test("a fitted implant with no side still occupies a socket", () => {
  // Otherwise "both sides" would be offered over an arm that already has one.
  const { free, placement } = occupancy([item("a", {})]);
  assert.deepEqual(free, ["right"]);
  assert.equal(placement.get("a"), "left");
});

test("two implants on the same declared side are placed one each, not on top of each other", () => {
  const { free, placement } = occupancy([item("a", { side: "left" }), item("b", { side: "left" })]);
  assert.deepEqual(free, []);
  assert.equal(placement.get("a"), "left");
  assert.equal(placement.get("b"), "right");
});

test("both sides is offered only while both sides are free", () => {
  const bothFree = occupancy([]).free;
  const oneTaken = occupancy([item("a", { side: "left" })]).free;
  const bothTaken = occupancy([item("a", { side: "left" }), item("b", { side: "right" })]).free;

  // The window's own condition, stated the way buildSlot states it.
  assert.equal(bothFree.length === 2, true, "both free — offered");
  assert.equal(oneTaken.length === 2, false, "one taken — not offered");
  assert.equal(bothTaken.length === 2, false, "both taken — not offered");
});

test("a paired slot offers one button per free side; an unpaired slot offers one", () => {
  assert.deepEqual(offerSides(false, []).map(offer => offer.side), [""]);
  assert.deepEqual(offerSides(true, ["left", "right"]).map(offer => offer.side), ["left", "right"]);
  assert.deepEqual(offerSides(true, ["right"]).map(offer => offer.side), ["right"]);
});

test("a full paired slot still offers a fit rather than no button at all", () => {
  const offers = offerSides(true, []);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].side, "");
});

/* -------------------------------------------- */
/*  Placement of a compendium copy              */
/* -------------------------------------------- */

test("a copy created for a side carries the matching location, not the source's", () => {
  // The regression: a compendium arm authored for the left, fitted on the
  // right. `implantLocation` prefers a stored zone, so leaving the source's
  // `location` in place lit the wrong limb — and "both sides" put both copies
  // on the same one.
  const source = { system: { slot: "arm", side: "left", location: "leftArm", category: "bionic" } };

  const right = { system: { ...source.system, ...placementFor("arm", "right") } };
  assert.equal(right.system.location, "rightArm");
  assert.equal(implantLocation(right), "rightArm");

  const left = { system: { ...source.system, ...placementFor("arm", "left") } };
  assert.equal(implantLocation(left), "leftArm");
  assert.notEqual(implantLocation(left), implantLocation(right), "both sides must not share a limb");
});

test("placement writes all three fields together", () => {
  assert.deepEqual(placementFor("leg", "right"), { slot: "leg", side: "right", location: "rightLeg" });
  assert.deepEqual(placementFor("cortex", ""), { slot: "cortex", side: "", location: "head" });
  assert.deepEqual(placementFor("other"), { slot: "other", side: "", location: "internal" });
  // A limb with no side is internal rather than a guessed limb.
  assert.equal(placementFor("arm", "").location, "internal");
});

/* -------------------------------------------- */
/*  Where an implant shows on the figure        */
/* -------------------------------------------- */

test("a stored location wins only when it names a real body zone", () => {
  assert.equal(implantLocation({ system: { location: "head", slot: "arm", side: "left" } }), "head");
  assert.equal(implantLocation({ system: { location: "internal", slot: "arm", side: "left" } }), "leftArm");
  assert.equal(implantLocation({ system: { location: "torso", slot: "arm", side: "left" } }), "leftArm");
  assert.equal(implantLocation({ system: { location: "", slot: "cortex" } }), "head");
});

test("placement never comes from the implant's name", () => {
  const named = { name: "Бионическая Рука", system: { slot: "cortex" } };
  assert.equal(implantLocation(named), "head");
});

test("a malformed implant reports a location rather than throwing", () => {
  assert.equal(implantLocation({}), "internal");
  assert.equal(implantLocation(undefined), "internal");
});

/* -------------------------------------------- */
/*  Category tint                               */
/* -------------------------------------------- */

test("a category always tints the same, and different categories differ", () => {
  assert.equal(implantTint("bionic"), implantTint("bionic"));
  assert.notEqual(implantTint("bionic"), implantTint("mechadendrite"));
  assert.match(implantTint("bionic"), /^hsl\(\d+ \d+% \d+%\)$/);
});

test("no category falls back to the brass token instead of a colour", () => {
  assert.match(implantTint(""), /^var\(--navis-brass-dim/);
  assert.equal(implantTint(undefined), implantTint(null));
});
