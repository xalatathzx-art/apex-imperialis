import test from "node:test";
import assert from "node:assert/strict";
import {
  normaliseName, canonicalSpecialisationName, displaySpecialisationName,
  isBaseSpecialisation, groupBySkill, ownedSpecialisation, specialisationTotal, rollSpecialisation
} from "../module/skill-specialisations.js";

const spec = (skill, name, extra = {}) =>
  ({ type: "specialisation", name, system: { skill, advances: 0, restricted: false, ...extra } });

test("names compare without case or stray spaces", () => {
  assert.equal(normaliseName("  Слух  "), "слух");
  assert.equal(normaliseName("Взлом  замков"), "взлом замков");
});

test("everything from the compendiums is offered, specials included", () => {
  // Право взять специализацию решает ведущий; видеть их все полезно всегда.
  assert.ok(isBaseSpecialisation(spec("awareness", "Зрение")));
  assert.ok(isBaseSpecialisation(spec("awareness", "Психическое чутьё (Особое)", { restricted: true })));
  assert.ok(isBaseSpecialisation(spec("tech", "Безопасность")));
  assert.ok(isBaseSpecialisation(spec("tech", "Аугметика")));
  assert.ok(isBaseSpecialisation(spec("linguistics", "Запретное (Разное, особое)")));

  // Отсекаем только то, что списком быть не может.
  assert.ok(!isBaseSpecialisation(spec("", "Без умения")));
  assert.ok(!isBaseSpecialisation({ type: "talent", name: "X", system: { skill: "awareness" } }));
});

test("the catalogue groups by skill, drops repeats and sorts", () => {
  const groups = groupBySkill([
    spec("awareness", "Слух"), spec("awareness", "Зрение"),
    // Одна и та же специализация приходит из нескольких компендиумов.
    spec("awareness", " СЛУХ "), spec("athletics", "Бег"),
    spec("awareness", "Психическое чутьё", { restricted: true })
  ]);
  assert.deepEqual(groups.awareness, ["Зрение", "Слух"]);
  assert.deepEqual(groups.athletics, ["Бег"]);
});

test("an empty catalogue is an empty object, not a crash", () => {
  assert.deepEqual(groupBySkill([]), {});
  assert.deepEqual(groupBySkill(), {});
});

test("a bought specialisation is found on the sheet despite spacing", () => {
  const actor = { items: [{ id: "x", type: "specialisation", name: " Слух ", system: { skill: "awareness" } }] };
  assert.ok(ownedSpecialisation(actor, "awareness", "слух"));
  assert.equal(ownedSpecialisation(actor, "awareness", "Зрение"), undefined);
  assert.equal(ownedSpecialisation(actor, "intuition", "Слух"), undefined);
});

test("English system labels find their Russian owned equivalent", () => {
  const actor = { items: [
    { id: "pistol", type: "specialisation", name: "Пистолеты", system: { skill: "ranged" } },
    { id: "dodge", type: "specialisation", name: "Уклонение", system: { skill: "reflexes" } }
  ] };
  assert.equal(canonicalSpecialisationName("Pistols"), canonicalSpecialisationName("Пистолеты"));
  assert.equal(ownedSpecialisation(actor, "ranged", "Pistols")?.id, "pistol");
  assert.equal(ownedSpecialisation(actor, "reflexes", "Dodge")?.id, "dodge");
  assert.equal(displaySpecialisationName("Pistols", "ru"), "Пистолеты");
});

test("Dodge display uses the owned specialisation total over base Reflexes", () => {
  const actor = {
    system: { skills: { reflexes: { total: 63 } } },
    items: [{ id: "dodge", type: "specialisation", name: "Уклонение", system: { skill: "reflexes", total: 68 } }]
  };
  assert.equal(specialisationTotal(actor, "reflexes", "Dodge"), 68);
});

test("the catalogue folds translated aliases into one entry", () => {
  const groups = groupBySkill([
    spec("ranged", "Pistols"),
    spec("ranged", "Пистолеты"),
    spec("reflexes", "Dodge"),
    spec("reflexes", "Уклонение")
  ]);
  assert.deepEqual(groups.ranged, ["Pistols"]);
  assert.deepEqual(groups.reflexes, ["Dodge"]);
});

test("rolling uses the owned item when there is one, so advances count", () => {
  const calls = [];
  const actor = {
    items: [{ id: "x", type: "specialisation", name: "Слух", system: { skill: "awareness", advances: 2 } }],
    setupSkillTest: arg => { calls.push(arg); return arg; }
  };
  rollSpecialisation(actor, "awareness", "Слух");
  assert.deepEqual(calls.at(-1), { itemId: "x" });

  // Ничего не куплено — бросаем по имени, предмет заводить не нужно.
  rollSpecialisation(actor, "awareness", "Зрение");
  assert.deepEqual(calls.at(-1), { key: "awareness", name: "Зрение" });
});
