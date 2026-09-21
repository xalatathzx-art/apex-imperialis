import test from "node:test";
import assert from "node:assert/strict";
import { matchesSkillSearch } from "../module/skill-search.js";

test("skill search matches a skill name without case or ё", () => {
  assert.equal(matchesSkillSearch("рефлексы", ["Рефлексы", "Уклонение"]), true);
  assert.equal(matchesSkillSearch("уклонение", ["Рефлексы", "Уклонение"]), true);
  assert.equal(matchesSkillSearch("dodge", ["Рефлексы", "Уклонение"]), true);
  assert.equal(matchesSkillSearch("уклонене", ["Рефлексы", "Уклонение"]), true);
  assert.equal(matchesSkillSearch("пистолеты", ["Стрельба", "Пистолеты"]), true);
  assert.equal(matchesSkillSearch("техника", ["Рефлексы", "Уклонение"]), false);
  assert.equal(matchesSkillSearch("уклл", ["Рефлексы", "Уклонение"]), false);
});

test("an empty skill search keeps every row", () => {
  assert.equal(matchesSkillSearch("   ", ["Стрельба", "Пистолеты"]), true);
});
