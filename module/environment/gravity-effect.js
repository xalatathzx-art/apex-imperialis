import { MODULE_ID, environmentForScene } from "./environment-data.js";
import { gravityScripts, gravityBand } from "./gravity-rules.js";

/**
 * Гравитация раздаётся обычным ActiveEffect со скриптами — так же, как система
 * раздаёт свои состояния. Помехи и преимущества едут на триггере `dialog`,
 * пересчёт веса — на `prepareDerivedData`. Диалог сам собирает эти скрипты с
 * актора, патчить ничего не нужно.
 */

export const GRAVITY_FLAG = "gravityEffect";

/**
 * Флаги эффектов, которые модуль когда-либо вешал на персонажей. Код погоды и
 * воздействия среды удалён, но созданные им ActiveEffect остались в мире и
 * продолжали сыпать своими модификаторами в окно броска. Их надо снимать.
 */
const STALE_FLAGS = Object.freeze(["weatherEffect", "exposureEffect"]);

/**
 * Отпечаток содержимого. Сравнивать одну лишь величину G мало: правила
 * меняются, и эффект со старым набором скриптов остаётся висеть, потому что
 * гравитация-то та же.
 */
function fingerprint(scripts) {
  return JSON.stringify(scripts.map(script => [script.trigger, script.script, script.options?.activateScript]));
}

// Подписи ступеней берём картой, а не склейкой имени: склейка молча даёт
// несуществующий ключ, и в имени эффекта оказывается сырой ключ.
const BAND_LABELS = Object.freeze({
  zero: "NAVIS.Environment.Zone.gravZero",
  low: "NAVIS.Environment.Zone.gravLow",
  normal: "NAVIS.Environment.Zone.gravNorm",
  high: "NAVIS.Environment.Zone.gravHigh",
  extreme: "NAVIS.Environment.Zone.gravHigh"
});

export function buildGravityEffect(environment = {}) {
  const gravity = Math.max(0, Number(environment.gravity ?? 1) || 0);
  const scripts = gravityScripts(gravity).map(({ labelKey, value, ...script }) => ({
    ...script,
    label: value === undefined
      ? game.i18n.localize(labelKey)
      : game.i18n.format(labelKey, { n: Math.abs(value) })
  }));
  if (!scripts.length) return null;
  const band = gravityBand(gravity);
  return {
    name: `${game.i18n.localize(BAND_LABELS[band.kind])} · ${gravity}G`,
    img: "icons/svg/down.svg",
    statuses: [],
    flags: { [MODULE_ID]: { [GRAVITY_FLAG]: { gravity, stamp: fingerprint(scripts) } } },
    system: { scriptData: scripts, transferData: { type: "other" } }
  };
}

const findEffect = actor =>
  [...(actor?.effects ?? [])].find(effect => effect.getFlag?.(MODULE_ID, GRAVITY_FLAG));

/** Снимает эффекты удалённых подсистем — погоды и воздействия среды. */
export async function clearStaleEffects(actor) {
  const stale = [...(actor?.effects ?? [])]
    .filter(effect => STALE_FLAGS.some(flag => effect.getFlag?.(MODULE_ID, flag)))
    .map(effect => effect.id);
  if (stale.length) await actor.deleteEmbeddedDocuments("ActiveEffect", stale);
  return stale.length;
}

export async function syncGravityEffect(actor, scene = globalThis.canvas?.scene) {
  if (!actor || !scene) return null;
  await clearStaleEffects(actor);
  const existing = findEffect(actor);
  const data = buildGravityEffect(environmentForScene(scene));

  if (!data) {
    if (existing) await existing.delete();
    return null;
  }
  // Пропускаем запись, только если совпало и значение, и содержимое: иначе
  // после правки правил на персонаже остаётся эффект по старым.
  const current = existing?.getFlag?.(MODULE_ID, GRAVITY_FLAG);
  const next = data.flags[MODULE_ID][GRAVITY_FLAG];
  if (existing && current?.gravity === next.gravity && current?.stamp === next.stamp) return existing;

  if (existing) {
    await existing.update({ ...data, _id: existing.id });
    return existing;
  }
  const [created] = await actor.createEmbeddedDocuments("ActiveEffect", [data]);
  return created;
}

/** Всем персонажам на сцене — по одному проходу. Работает только у ГМа. */
export async function syncSceneGravity(scene = globalThis.canvas?.scene) {
  if (!scene || !game.user?.isGM) return;
  const actors = [...new Map((scene.tokens ?? [])
    .map(token => [token.actor?.id, token.actor])
    .filter(([, actor]) => actor?.type === "character")).values()];
  for (const actor of actors) await syncGravityEffect(actor, scene);
}
