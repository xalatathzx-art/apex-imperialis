/**
 * Гравитация — единственный автоматизированный параметр сцены.
 *
 * Она делает то, чего не делает никакой другой: пересчитывает **цифру в листе**.
 * Вес снаряжения умножается на G, а предел переноски в impmal — это бонус Силы
 * плюс бонус Стойкости, так что при 2G персонаж уходит в Перегрузку ровно вдвое
 * раньше, а в невесомости не уходит никогда.
 *
 * Поверх веса — помехи и преимущества на те броски, где тяжесть или её
 * отсутствие мешают телу. Правило то же, что было у погоды: одна ступень не
 * задевает один бросок дважды.
 *
 * Мишени на языке impmal: так система описывает себя в scriptData.
 */

const TARGETS = {
  // Тело целиком: боевые навыки, Сила и Ловкость. Бьём по характеристике, а не
  // по списку навыков — навыки подтянутся сами, какой бы из них ни бросали.
  physical: "['ws', 'bs', 'str', 'ag'].includes(args.data.characteristic)",
  // Всё, что идёт от Силы и Ловкости: навыки подтянутся сами.
  strAg: "['str', 'ag'].includes(args.data.characteristic)",
  melee: "args.isAttack && !args.data.item?.system?.isRanged",
  athletics: "args.data.skill === 'athletics'"
};

const key = name => `NAVIS.Gravity.${name}`;
const dis = (target, name) => ({ rule: "disadvantage", target, labelKey: key(name) });
const adv = (target, name) => ({ rule: "advantage", target, labelKey: key(name) });
const sl = (target, value, name) => ({ rule: "sl", target, value, labelKey: key(name) });
const gm = name => ({ rule: "manual", target: null, labelKey: key(name), manual: true });

/**
 * Перегрузка тяжести: −1 успех за каждую полную дополнительную единицу G сверх
 * первой. 2G — минус один, 3G — минус два. Неполная прибавка не считается:
 * 1.9G штрафа ещё не даёт.
 */
export function heavyPenalty(value) {
  const g = Math.max(0, Number(value) || 0);
  return g <= 1 ? 0 : Math.floor(g - 1);
}

/**
 * Ступени по величине G. `weightFactor` — множитель веса снаряжения;
 * в невесомости он ноль, то есть вес не учитывается вовсе.
 */
export const GRAVITY_BANDS = Object.freeze([
  {
    kind: "zero", max: 0, weightFactor: 0,
    // Одна помеха на всё телесное: не за что оттолкнуться и нечем придавить.
    effects: [dis("physical", "zeroPhysical"), gm("zeroFall"), gm("zeroWeight")]
  },
  {
    kind: "low", max: 1, weightFactor: null,
    effects: [adv("athletics", "lowAthletics"), dis("melee", "lowMelee"), gm("lowFall"), gm("lowRun")]
  },
  { kind: "normal", max: 1, weightFactor: 1, effects: [] },
  // Тяжёлые ступени не раздают помех: штраф считается от величины G и
  // добавляется в gravityEffects().
  { kind: "high", max: 2, weightFactor: null, effects: [gm("highFall"), gm("highWeight")] },
  { kind: "extreme", max: Infinity, weightFactor: null, effects: [gm("extremeFall"), gm("highWeight")] }
]);

export function gravityBand(value) {
  const g = Math.max(0, Number(value) || 0);
  if (g <= 0) return GRAVITY_BANDS[0];
  if (g < 1) return GRAVITY_BANDS[1];
  if (g === 1) return GRAVITY_BANDS[2];
  if (g <= 2) return GRAVITY_BANDS[3];
  return GRAVITY_BANDS[4];
}

/** Во сколько раз тяжелеет снаряжение. Ноль — вес не учитывается. */
export function weightFactor(value) {
  const g = Math.max(0, Number(value) || 0);
  const band = gravityBand(g);
  return band.weightFactor === null ? g : band.weightFactor;
}

export function gravityEffects(value) {
  const penalty = heavyPenalty(value);
  if (!penalty) return gravityBand(value).effects;
  // Штраф идёт первым: он и есть главное, что делает тяжесть.
  return [sl("strAg", -penalty, "heavySL"), ...gravityBand(value).effects];
}

/**
 * Эффекты → скрипты системы.
 *
 * `activateScript` включает модификатор: без него `WarhammerScript.activated()`
 * возвращает false, и строка висит в списке, но не применяется. `hideScript`
 * убирает из списка то, что к этому броску не относится, — иначе в окне броска
 * на Атлетику болтаются помехи на стрельбу и ближний бой.
 */
export function gravityScripts(value) {
  const scripts = gravityEffects(value).flatMap(effect => {
    const guard = TARGETS[effect.target];
    if (effect.manual || !guard) return [];
    // Степени успеха снимаются после броска, помехи считаются в диалоге.
    if (effect.rule === "sl") {
      const delta = Number(effect.value) || 0;
      return [{
        labelKey: effect.labelKey, value: effect.value, trigger: "rollTest",
        script: `if (${guard}) args.result.SL = (Number(args.result.SL) || 0) + (${delta});`
      }];
    }
    const counter = effect.rule === "disadvantage" ? "args.disCount++;" : "args.advCount++;";
    return [{
      labelKey: effect.labelKey, value: effect.value, trigger: "dialog", script: counter,
      options: { activateScript: `return ${guard};`, hideScript: `return !(${guard});` }
    }];
  });

  // Вес снаряжения — единственное, что правит лист, а не бросок.
  //
  // После умножения обязательно пересчитываем `state`: система считает его в
  // `computeEncumbranceState()` ещё до наших скриптов, а `_onUpdate()` по нему
  // вешает Перегрузку и Обездвижен. Без пересчёта вес растёт, а состояние
  // остаётся прежним — условия не приходят, скорость не падает.
  const factor = weightFactor(value);
  if (factor !== 1) {
    scripts.push({
      labelKey: "NAVIS.Gravity.weight", trigger: "prepareDerivedData",
      script: [
        "const enc = this.actor.system.encumbrance;",
        "if (enc) {",
        `  enc.value = Math.round((Number(enc.value) || 0) * ${factor} * 100) / 100;`,
        "  enc.state = enc.value <= enc.overburdened ? 0 : enc.value <= enc.restrained ? 1 : 2;",
        "}"
      ].join(" ")
    });
  }
  return scripts;
}
