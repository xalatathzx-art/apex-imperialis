import { environmentForScene, EXPOSURE_FLAG, MODULE_ID } from "./environment-data.js";

/**
 * Снимок среды для показаний — и только для них.
 *
 * Автоматизации здесь больше нет: ни патча производных данных актора, ни
 * пересчёта нагрузки по гравитации, ни понижения скорости. Окружение сцены —
 * описание, которое ГМ выставляет руками, а читают биомонитор и виджет.
 */
export function environmentSnapshot(actor, scene = globalThis.canvas?.scene) {
  const exposure = actor?.getFlag?.(MODULE_ID, EXPOSURE_FLAG)
    ?? actor?.flags?.[MODULE_ID]?.[EXPOSURE_FLAG] ?? {};
  return {
    ...environmentForScene(scene),
    radiationDose: Number(exposure.radiationDose) || 0,
    nextExposure: null
  };
}
