export const MODULE_ID = "navis-apexialis";
export const ENVIRONMENT_FLAG = "environment";
export const EXPOSURE_FLAG = "exposure";

/**
 * Погода — подпись, которую ГМ вписывает руками, и цвет для виджета. Никаких
 * пресетов и механики: автоматизирована только гравитация (gravity-effect.js),
 * остальные показатели ГМ выставляет и отыгрывает сам.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export function normaliseEnvironment(value = {}) {
  return {
    weather: {
      label: String(value.weather?.label ?? value.weather?.customLabel ?? "").slice(0, 80),
      tone: String(value.weather?.tone ?? value.weather?.customTone ?? "").slice(0, 30)
    },
    temperature: clamp(value.temperature ?? 20, -273, 1000),
    gravity: Math.max(0, Number(value.gravity ?? 1) || 0),
    radiation: clamp(value.radiation ?? 0, 0, 10),
    atmosphere: {
      type: ["normal", "thin", "unbreathable", "toxic", "vacuum"].includes(value.atmosphere?.type) ? value.atmosphere.type : "normal",
      intensity: clamp(value.atmosphere?.intensity ?? 0, 0, 10)
    },
    isolatedFromWeather: Boolean(value.isolatedFromWeather),
    note: String(value.note ?? "").slice(0, 1000)
  };
}

export function environmentForScene(scene) {
  return normaliseEnvironment(scene?.getFlag?.(MODULE_ID, ENVIRONMENT_FLAG) ?? scene?.flags?.[MODULE_ID]?.[ENVIRONMENT_FLAG]);
}

function capability(item, key) {
  const value = item?.flags?.[MODULE_ID]?.environment?.[key] ?? item?.getFlag?.(MODULE_ID, "environment")?.[key];
  return Number(value) || 0;
}

export function actorProtection(actor) {
  const equipped = [...(actor?.items ?? [])].filter(item => item.system?.equipped !== false);
  const total = key => equipped.reduce((sum, item) => sum + capability(item, key), 0);
  return {
    heat: total("heat"), cold: total("cold"), radiation: total("radiation"),
    gravity: total("gravity"), atmosphere: total("atmosphere"),
    sealed: equipped.some(item => capability(item, "sealed") > 0),
    breathing: equipped.some(item => capability(item, "breathing") > 0),
    immuneRadiation: equipped.some(item => capability(item, "immuneRadiation") > 0)
  };
}
