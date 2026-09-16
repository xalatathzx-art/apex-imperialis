import { MODULE_ID, EXPOSURE_FLAG } from "./environment-data.js";

/**
 * Лучевая болезнь: каждая единица накопленной дозы отнимает 5 очков
 * Стойкости, Силы и Ловкости.
 *
 * Правим `modifier`, а не `total`: в impmal характеристика считается как
 * `starting + modifier + advances`, и `computeTotal()` пересчитает её сам.
 * Поэтому это обычные `changes` ActiveEffect — Foundry применяет их между
 * базовыми и производными данными, ровно до пересчёта.
 *
 * Дозу ведёт биомонитор: кнопки под шкалой пишут её во флаг актора.
 */

export const RADIATION_FLAG = "radiationEffect";
export const PENALTY_PER_DOSE = 5;
const AFFECTED = Object.freeze(["tgh", "str", "ag"]);

export function actorDose(actor) {
  const exposure = actor?.getFlag?.(MODULE_ID, EXPOSURE_FLAG)
    ?? actor?.flags?.[MODULE_ID]?.[EXPOSURE_FLAG] ?? {};
  return Math.max(0, Math.round(Number(exposure.radiationDose) || 0));
}

export function buildRadiationEffect(dose) {
  const level = Math.max(0, Math.round(Number(dose) || 0));
  if (!level) return null;
  const penalty = -PENALTY_PER_DOSE * level;
  return {
    name: `${game.i18n.localize("NAVIS.Radiation.Title")} · ${level}`,
    img: "icons/svg/radiation.svg",
    statuses: [],
    flags: { [MODULE_ID]: { [RADIATION_FLAG]: { dose: level } } },
    changes: AFFECTED.map(key => ({
      key: `system.characteristics.${key}.modifier`,
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: String(penalty)
    }))
  };
}

const findEffect = actor =>
  [...(actor?.effects ?? [])].find(effect => effect.getFlag?.(MODULE_ID, RADIATION_FLAG));

export async function syncRadiationEffect(actor) {
  if (!actor) return null;
  const existing = findEffect(actor);
  const dose = actorDose(actor);
  const data = buildRadiationEffect(dose);

  if (!data) {
    if (existing) await existing.delete();
    return null;
  }
  if (existing?.getFlag?.(MODULE_ID, RADIATION_FLAG)?.dose === dose) return existing;
  if (existing) {
    await existing.update({ ...data, _id: existing.id });
    return existing;
  }
  const [created] = await actor.createEmbeddedDocuments("ActiveEffect", [data]);
  return created;
}

let registered = false;
export function registerRadiationEffect() {
  if (registered) return;
  registered = true;
  // Доза живёт во флаге, поэтому слушаем его изменение, а не сцену.
  Hooks.on("updateActor", (actor, changed) => {
    if (!game.user?.isGM) return;
    if (changed?.flags?.[MODULE_ID]?.[EXPOSURE_FLAG] === undefined) return;
    syncRadiationEffect(actor);
  });
}
