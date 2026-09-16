import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  temperatureReadout, radiationReadout, gravityReadout, atmosphereReadout
} from "../module/environment/environment-readout.js";
import { GRAVITY_BANDS, gravityEffects } from "../module/environment/gravity-rules.js";

const load = name => JSON.parse(fs.readFileSync(new URL(`../lang/${name}.json`, import.meta.url), "utf8"));
const RU = load("ru");
const EN = load("en");

function requireKey(key) {
  assert.ok(key in RU, `ru.json is missing ${key}`);
  assert.ok(key in EN, `en.json is missing ${key}`);
  assert.ok(String(RU[key]).trim(), `ru.json has an empty ${key}`);
}

test("every readout label the UI renders exists in both languages", () => {
  for (const celsius of [-60, -35, -25, -12, -5, 0, 5, 9, 20, 31, 35, 45, 55, 70]) {
    requireKey(temperatureReadout(celsius).labelKey);
  }
  for (let level = 0; level <= 10; level++) requireKey(radiationReadout(level).labelKey);
  for (const g of [0, 0.3, 0.6, 0.9, 1, 1.5, 3]) requireKey(gravityReadout(g).labelKey);
  for (const type of ["normal", "thin", "unbreathable", "toxic", "vacuum"]) {
    requireKey(atmosphereReadout({ type, intensity: 5 }).labelKey);
  }
});

test("every gravity line is translated", () => {
  for (const band of GRAVITY_BANDS) {
    for (const effect of band.effects) requireKey(effect.labelKey);
  }
  for (const key of ["Title", "AutoHint", "ManualHint", "Quiet", "weight", "weightZero", "weightFactor"]) {
    requireKey(`NAVIS.Gravity.${key}`);
  }
  requireKey("NAVIS.Radiation.Title");
  for (const key of ["WeatherLabel", "WeatherPlaceholder", "WeatherTone", "WeatherUnset",
    "RadiationUnit", "WidgetTemperature", "WidgetGravity", "WidgetRadiation", "WidgetAtmosphere"]) {
    requireKey(`NAVIS.Environment.${key}`);
  }
});

test("the settings window only localizes keys that exist", () => {
  const template = fs.readFileSync(new URL("../templates/apps/environment.hbs", import.meta.url), "utf8");
  const keys = [...template.matchAll(/localize "([^"]+)"/g)].map(match => match[1]);
  assert.ok(keys.length > 8, "expected the window to localize its labels");
  for (const key of keys) requireKey(key);
});

test("no flat key is also a branch of another key", () => {
  // Foundry разворачивает "a.b.c" в дерево: строка не может быть и веткой,
  // иначе вся ветка перестаёт резолвиться.
  for (const [name, table] of [["ru", RU], ["en", EN]]) {
    const keys = Object.keys(table);
    for (const key of keys) {
      if (typeof table[key] !== "string") continue;
      const branch = keys.find(other => other !== key && other.startsWith(`${key}.`));
      assert.equal(branch, undefined,
        `${name}.json: "${key}" is a string but "${branch}" needs it to be an object`);
    }
  }
});

test("only gravity and radiation dose are automated", () => {
  const dir = new URL("../module/environment/", import.meta.url);
  const files = fs.readdirSync(dir);
  assert.deepEqual(files.sort(), [
    "environment-app.js", "environment-data.js", "environment-derived.js",
    "environment-readout.js", "environment-widget.js", "gravity-effect.js",
    "gravity-rules.js", "index.js", "radiation-effect.js", "widget-dock.js"
  ]);
  const source = files.map(file => fs.readFileSync(new URL(file, dir), "utf8")).join(" ");
  for (const banned of ["setupSkillTest", "applyDamage", "addCondition", "updateWorldTime",
                        "computeFields", "libWrapper", "weather-catalog"]) {
    assert.ok(!source.includes(banned), `${banned} should stay out of the environment module`);
  }
  // Скрипты гравитации живут только в своём файле.
  const rules = fs.readFileSync(new URL("gravity-rules.js", dir), "utf8");
  assert.ok(rules.includes("args.disCount++"));
  assert.ok(rules.includes("system.encumbrance"));
});
