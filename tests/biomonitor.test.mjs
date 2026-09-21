import test from "node:test";
import assert from "node:assert/strict";
import { BODY_SCAN_LAYERS, BODY_ZONES, augmeticLocation } from "../module/biomonitor/biomonitor-body.js";
import { adjustRadiationDose, buildBiomonitorModel, biomonitorThreats } from "../module/biomonitor/biomonitor-data.js";
import fs from "node:fs";

test("biomonitor has the six IM hit locations", () => {
  assert.deepEqual(BODY_ZONES.map(x => x.key), ["head", "leftArm", "rightArm", "body", "leftLeg", "rightLeg"]);
});

test("DOOMBC anatomy layers map exactly onto the IM hit locations", () => {
  assert.deepEqual(BODY_SCAN_LAYERS.map(layer => layer.zone), ["leftLeg", "rightLeg", "leftArm", "rightArm", "body", "head"]);
  for (const layer of BODY_SCAN_LAYERS) {
    assert.match(layer.src, /^\/modules\/apex-imperialis\/assets\/biomonitor\/.+\.png$/);
    assert.ok(fs.existsSync(new URL(`../${layer.src.replace("/modules/apex-imperialis/", "")}`, import.meta.url)));
  }
});

test("augmetic placement uses slot then effect then flag and never its name", () => {
  assert.equal(augmeticLocation({ system: { slot: "leftArm" }, effects: [], flags: {} }), "leftArm");
  assert.equal(augmeticLocation({ system: {}, effects: [{ changes: [{ key: "system.location.value", value: "head" }] }], flags: {} }), "head");
  assert.equal(augmeticLocation({ name: "Bionic Eye", system: {}, effects: [], flags: { "apex-imperialis": { location: "rightArm" } } }), "rightArm");
  assert.equal(augmeticLocation({ name: "Bionic Eye", system: {}, effects: [], flags: {} }), "internal");
});

test("view model reads native wounds and exposure without duplicating them", () => {
  const actor = {
    id: "a", name: "A", system: { combat: { wounds: { value: 7, max: 10 }, criticals: { value: 1, max: 3 }, hitLocations: {} } },
    itemTypes: { injury: [], critical: [], augmetic: [] }, effects: [], items: []
  };
  const model = buildBiomonitorModel(actor, { radiationDose: 6, radiation: 4, temperature: 50, gravity: 2, atmosphere: { type: "thin" }, nextExposure: 30 });
  assert.equal(model.status.key, "severe");
  assert.equal(model.wounds.value, 7);
  assert.equal(model.environment.radiationDose, 6);
  assert.equal(model.environment.radiation, 4);
  assert.equal(model.zones.length, 6);
});

test("death flatlines the monitor, from the status effect or from unhealed criticals", () => {
  const base = () => ({
    id: "a", name: "A",
    system: { combat: { wounds: { value: 4, max: 10 }, criticals: { value: 1, max: 3 }, hitLocations: {} } },
    itemTypes: { injury: [], critical: [], augmetic: [] }, effects: [], items: []
  });

  // Помеченный мёртвым персонаж мёртв независимо от счётчиков.
  const flagged = base();
  flagged.statuses = new Set(["dead"]);
  assert.equal(buildBiomonitorModel(flagged).status.key, "dead");

  // Смерть по правилам: непролеченные критические СВЕРХ бонуса Стойкости (p.214-218).
  const overflowed = base();
  overflowed.system.combat.criticals = { value: 4, max: 3 };
  assert.equal(buildBiomonitorModel(overflowed).status.key, "dead");

  // Ровно на пределе — ещё жив, но в критическом состоянии.
  const atLimit = base();
  atLimit.system.combat.criticals = { value: 3, max: 3 };
  assert.equal(buildBiomonitorModel(atLimit).status.key, "critical");

  // Максимум ран без смерти — критическое состояние, а не плоская линия.
  const maxed = base();
  maxed.system.combat.wounds = { value: 10, max: 10 };
  assert.equal(buildBiomonitorModel(maxed).status.key, "critical");
});

test("empty medical categories collapse into one stable threat summary", () => {
  const summary = biomonitorThreats({ effects: [], injuries: [], criticalItems: [] });
  assert.deepEqual(summary, { empty: true, entries: [] });
});

test("head and body have localized labels", () => {
  for (const file of ["lang/en.json", "lang/ru.json"]) {
    const lang = JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
    assert.ok(lang["NAVIS.Location.head"]);
    assert.ok(lang["NAVIS.Location.body"]);
  }
});

test("radiation dose controls step immediately and clamp to the IM track", () => {
  assert.equal(adjustRadiationDose(4, 1), 5);
  assert.equal(adjustRadiationDose(4, -1), 3);
  assert.equal(adjustRadiationDose(10, 1), 10);
  assert.equal(adjustRadiationDose(0, -1), 0);
});
