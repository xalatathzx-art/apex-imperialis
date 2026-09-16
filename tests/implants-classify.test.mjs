import test from "node:test";
import assert from "node:assert/strict";
import { SLOTS, SLOT_LOCATION, classifyImplant, locationForSlot } from "../module/implants/classify.js";

test("slot keys are the eleven body systems the Surgeon lays out", () => {
  assert.deepEqual(SLOTS.map(s => s.key), [
    "cortex", "ocular", "respiratory", "circulatory", "skeleton",
    "skin", "arm", "leg", "mechadendrite", "fullbody", "other"
  ]);
});

test("every slot has a location rule", () => {
  for (const slot of SLOTS) assert.ok(SLOT_LOCATION[slot.key], `no location for ${slot.key}`);
});

test("category wins over the name where it is already precise", () => {
  // Серво-Коготь contains "коготь" and would otherwise be read as a leg.
  assert.equal(classifyImplant("Серво-Коготь", "mechadendrite", ""), "mechadendrite");
});

test("Russian and English names both classify", () => {
  assert.equal(classifyImplant("Bionic Arm", "", ""), "arm");
  assert.equal(classifyImplant("Бионическая рука", "", ""), "arm");
  assert.equal(classifyImplant("Cortical Implant", "", ""), "cortex");
  assert.equal(classifyImplant("Кортикальный Имплант", "", ""), "cortex");
  assert.equal(classifyImplant("Memorance Implant", "", ""), "cortex");
  assert.equal(classifyImplant("Ranger Visors", "", ""), "ocular");
  assert.equal(classifyImplant("Визоры Рейнджера", "", ""), "ocular");
  assert.equal(classifyImplant("Бионическое Сердце", "", ""), "circulatory");
  assert.equal(classifyImplant("Когти Птераксии", "", ""), "leg");
  assert.equal(classifyImplant("Сикарианские ЭФМ", "", ""), "skeleton");
});

test("the ordering traps from the reference system are preserved", () => {
  // "Сус-ан Мембрана" must not fall into skin on the word "мембрана".
  assert.equal(classifyImplant("Сус-ан Мембрана", "", ""), "cortex");
  // "Железы Бетчера" must not fall into the torso.
  assert.equal(classifyImplant("Железы Бетчера", "", ""), "cortex");
});

test("full-body kits are their own slot", () => {
  assert.equal(classifyImplant("Боевые Латы Скитарии (всё тело)", "", ""), "fullbody");
});

test("an unmatched name lands in other, never nowhere", () => {
  assert.equal(classifyImplant("Нечто Безымянное", "", ""), "other");
});

test("locations resolve to impmal hit locations, limbs by side", () => {
  assert.equal(locationForSlot("cortex", ""), "head");
  assert.equal(locationForSlot("ocular", ""), "head");
  assert.equal(locationForSlot("circulatory", ""), "body");
  assert.equal(locationForSlot("arm", "left"), "leftArm");
  assert.equal(locationForSlot("arm", "right"), "rightArm");
  assert.equal(locationForSlot("leg", "left"), "leftLeg");
  assert.equal(locationForSlot("leg", "right"), "rightLeg");
  assert.equal(locationForSlot("fullbody", ""), "body");
  assert.equal(locationForSlot("other", ""), "internal");
});

test("a limb with no side chosen is internal rather than guessing a side", () => {
  assert.equal(locationForSlot("arm", ""), "internal");
});
