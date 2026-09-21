import test from "node:test";
import assert from "node:assert/strict";
import {
  gravityBand, weightFactor, gravityEffects, gravityScripts, heavyPenalty
} from "../module/environment/gravity-rules.js";

test("weight scales straight with G, and vanishes in freefall", () => {
  // Ровно то поведение, которое заказано: 0G — веса нет, 0.5G — вдвое меньше,
  // 1G — как есть, 2G — вдвое больше, дальше по множителю.
  assert.equal(weightFactor(0), 0);
  assert.equal(weightFactor(0.5), 0.5);
  assert.equal(weightFactor(1), 1);
  assert.equal(weightFactor(2), 2);
  assert.equal(weightFactor(3.5), 3.5);
  // Отрицательная гравитация — это ноль, а не сюрприз.
  assert.equal(weightFactor(-4), 0);
});

test("the bands split weightless, low, normal, high and extreme", () => {
  assert.equal(gravityBand(0).kind, "zero");
  assert.equal(gravityBand(0.2).kind, "low");
  assert.equal(gravityBand(0.9).kind, "low");
  assert.equal(gravityBand(1).kind, "normal");
  assert.equal(gravityBand(1.5).kind, "high");
  assert.equal(gravityBand(2).kind, "high");
  assert.equal(gravityBand(2.1).kind, "extreme");
});

test("normal gravity changes nothing at all", () => {
  assert.deepEqual(gravityEffects(1), []);
  assert.deepEqual(gravityScripts(1), []);
});

test("no band hits the same roll twice", () => {
  for (const g of [0, 0.5, 1, 1.5, 3]) {
    const targets = gravityEffects(g).filter(effect => !effect.manual).map(effect => effect.target);
    assert.equal(new Set(targets).size, targets.length, `${g}G hits ${targets.join(", ")} twice`);
  }
});

test("weightlessness is one disadvantage on everything physical", () => {
  const rolls = gravityEffects(0).filter(e => !e.manual);
  assert.equal(rolls.length, 1, "zero-G should not scatter several modifiers");
  assert.equal(rolls[0].rule, "disadvantage");
  assert.equal(rolls[0].target, "physical");

  // Помеха ловит боевые навыки, Силу и Ловкость — по характеристике, не по
  // списку навыков, чтобы подтянулось всё, что их использует.
  const script = gravityScripts(0).find(s => s.trigger === "dialog");
  const hits = c => new Function("args", script.options.activateScript)({ data: { characteristic: c } });
  for (const c of ["ws", "bs", "str", "ag"]) assert.equal(hits(c), true, c);
  for (const c of ["int", "wil", "fel", "per", "tgh"]) assert.equal(hits(c), false, c);
});

test("low gravity helps you jump and hinders your blows", () => {
  const effects = gravityEffects(0.5);
  assert.ok(effects.some(e => e.rule === "advantage" && e.target === "athletics"));
  assert.ok(effects.some(e => e.rule === "disadvantage" && e.target === "melee"));
});

test("heavy gravity costs one success per full extra G", () => {
  assert.equal(heavyPenalty(1), 0);
  // Неполная прибавка не считается.
  assert.equal(heavyPenalty(1.5), 0);
  assert.equal(heavyPenalty(1.9), 0);
  assert.equal(heavyPenalty(2), 1);
  assert.equal(heavyPenalty(2.9), 1);
  assert.equal(heavyPenalty(3), 2);
  assert.equal(heavyPenalty(5), 4);
  // Ниже единицы штрафа нет вовсе.
  assert.equal(heavyPenalty(0.5), 0);
  assert.equal(heavyPenalty(0), 0);
});

test("the penalty lands on Strength and Agility, not on a skill list", () => {
  const effect = gravityEffects(2).find(e => e.rule === "sl");
  assert.ok(effect, "2G must cost successes");
  assert.equal(effect.target, "strAg");
  assert.equal(effect.value, -1);
  // Помех на Атлетику и Рефлексы больше нет — их заменил штраф.
  assert.ok(!gravityEffects(3).some(e => e.rule === "disadvantage"));

  const script = gravityScripts(2).find(s => s.trigger === "rollTest");
  const hits = c => {
    const args = { data: { characteristic: c }, result: { SL: 3 } };
    new Function("args", script.script)(args);
    return args.result.SL;
  };
  assert.equal(hits("str"), 2);
  assert.equal(hits("ag"), 2);
  for (const c of ["ws", "bs", "int", "wil", "tgh", "fel", "per"]) {
    assert.equal(hits(c), 3, `${c} must be untouched`);
  }
});

test("dialog scripts activate themselves and carry a key, not text", () => {
  for (const g of [0, 0.5, 2, 3]) {
    for (const script of gravityScripts(g)) {
      assert.match(script.labelKey, /^NAVIS\.Gravity\./);
      assert.equal(script.label, undefined);
      if (script.trigger !== "dialog") continue;
      assert.ok(script.options?.activateScript, `${g}G: ${script.labelKey} never activates`);
      // Неподходящее прячем, иначе в окне броска висят чужие модификаторы.
      assert.ok(script.options?.hideScript, `${g}G: ${script.labelKey} never hides`);
      assert.match(script.script, /^args\.(dis|adv)Count\+\+;$/);
    }
  }
});

test("the weight script rewrites the sheet, not the roll", () => {
  const heavy = gravityScripts(2).find(script => script.trigger === "prepareDerivedData");
  assert.ok(heavy, "2G must rescale encumbrance");
  assert.match(heavy.script, /system\.encumbrance/);
  assert.match(heavy.script, /\* 2 \*/);

  const weightless = gravityScripts(0).find(script => script.trigger === "prepareDerivedData");
  assert.ok(weightless, "0G must zero encumbrance");
  assert.match(weightless.script, /\* 0 \*/);

  assert.equal(gravityScripts(1).find(script => script.trigger === "prepareDerivedData"), undefined);
});

test("the weight script actually zeroes and doubles when run", () => {
  const run = (g, value) => {
    const script = gravityScripts(g).find(s => s.trigger === "prepareDerivedData");
    const actor = { system: { encumbrance: { value, overburdened: 8, restrained: 16 } } };
    if (script) new Function("args", script.script).call({ actor }, {});
    return actor.system.encumbrance.value;
  };
  assert.equal(run(0, 7), 0);
  assert.equal(run(0.5, 7), 3.5);
  assert.equal(run(2, 7), 14);
  assert.equal(run(1, 7), 7);
});

test("the effect is named from a real key at every band", async () => {
  const { buildGravityEffect } = await import("../module/environment/gravity-effect.js");
  const lang = JSON.parse(
    (await import("node:fs")).readFileSync(new URL("../lang/ru.json", import.meta.url), "utf8"));
  globalThis.game = { i18n: { localize: k => lang[k] ?? k,
    format: (k, d) => String(lang[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => d[n]) } };
  for (const g of [0, 0.5, 2, 3, 10]) {
    const effect = buildGravityEffect({ gravity: g });
    // Склейка имени ключа однажды уже дала "gravHighxtreme" прямо в названии.
    assert.ok(!effect.name.includes("NAVIS."), `${g}G shows a raw key: ${effect.name}`);
    assert.ok(effect.name.includes(`${g}G`), effect.name);
  }
  assert.equal(buildGravityEffect({ gravity: 1 }), null);
});

test("the effect stamps its own content, so rule changes force a rewrite", async () => {
  const { buildGravityEffect } = await import("../module/environment/gravity-effect.js");
  globalThis.game = { i18n: { localize: k => k, format: (k, d) => `${k}:${d.n}` } };
  const flag = g => buildGravityEffect({ gravity: g }).flags["apex-imperialis"].gravityEffect;

  // Отпечаток есть и различает разные наборы скриптов.
  assert.ok(flag(0).stamp, "zero-G effect must carry a stamp");
  assert.notEqual(flag(0).stamp, flag(2).stamp);
  assert.notEqual(flag(2).stamp, flag(3).stamp);
  // Одна и та же гравитация даёт один и тот же отпечаток.
  assert.equal(flag(2).stamp, flag(2).stamp);
});

test("effects from the removed subsystems are swept off the actor", async () => {
  const { clearStaleEffects } = await import("../module/environment/gravity-effect.js");
  const deleted = [];
  const effect = (id, flag) => ({
    id, getFlag: (_module, key) => (key === flag ? { some: "data" } : undefined)
  });
  const actor = {
    // Погода и воздействие среды удалены из кода, но их документы остались в
    // мире и продолжали сыпать модификаторами в окно броска.
    effects: [effect("a", "weatherEffect"), effect("b", "gravityEffect"), effect("c", "exposureEffect")],
    deleteEmbeddedDocuments: async (_type, ids) => deleted.push(...ids)
  };
  const count = await clearStaleEffects(actor);
  assert.equal(count, 2);
  assert.deepEqual(deleted.sort(), ["a", "c"]);
});

test("the new weight is turned back into an encumbrance state", () => {
  // Система считает state в computeEncumbranceState() до наших скриптов, а
  // _onUpdate() уже по нему вешает Перегрузку и Обездвижен. Не пересчитаем —
  // вес растёт, а условий нет и скорость не падает.
  const state = (g, value) => {
    const script = gravityScripts(g).find(s => s.trigger === "prepareDerivedData");
    const actor = { system: { encumbrance: { value, overburdened: 8, restrained: 16, state: 0 } } };
    if (script) new Function("args", script.script).call({ actor }, {});
    return actor.system.encumbrance.state;
  };
  // 6 при 2G становится 12: выше предела 8, но ниже 16 — Перегрузка.
  assert.equal(state(2, 6), 1);
  // 9 при 2G становится 18 — выше 16, это Обездвижен.
  assert.equal(state(2, 9), 2);
  // 3 при 2G это 6 — всё ещё норма.
  assert.equal(state(2, 3), 0);
  // В невесомости вес обнуляется, значит никакой Перегрузки.
  assert.equal(state(0, 20), 0);
  // При половинной гравитации 14 превращается в 7 — из Перегрузки в норму.
  assert.equal(state(0.5, 14), 0);
});
