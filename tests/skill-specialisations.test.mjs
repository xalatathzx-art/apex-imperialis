import test from "node:test";
import assert from "node:assert/strict";
import {
  normaliseName, isBaseSpecialisation, groupBySkill, ownedSpecialisation, rollSpecialisation
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
  assert.deepEqual(groups.awareness, ["Зрение", "Психическое чутьё", "Слух"]);
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
