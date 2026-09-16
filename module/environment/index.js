import { openEnvironmentApp } from "./environment-app.js";
import { refreshEnvironmentUI, registerEnvironmentWidget } from "./environment-widget.js";
import { syncSceneGravity, syncGravityEffect } from "./gravity-effect.js";
import { registerRadiationEffect, syncRadiationEffect } from "./radiation-effect.js";
export { environmentSnapshot } from "./environment-derived.js";

/**
 * Окружение сцены.
 *
 * Погода — подпись, которую ГМ вписывает руками. Температура, радиация и
 * атмосфера — показания, которые он же отыгрывает. Автоматизирована только
 * **гравитация**: она пересчитывает вес снаряжения в листе и раздаёт помехи
 * тем броскам, где тяжесть мешает телу.
 */
let registered = false;
export function registerEnvironment() {
  if (registered) return;
  registered = true;
  registerEnvironmentWidget();
  registerRadiationEffect();
  Hooks.on("getSceneControlButtons", controls => {
    const token = controls.tokens ?? controls.find?.(control => control.name === "tokens");
    if (!token || !game.user.isGM) return;
    const tool = { name: "navisEnvironment", title: "NAVIS.Environment.Title", icon: "fa-solid fa-cloud-bolt", button: true, onClick: openEnvironmentApp };
    token.tools ??= {};
    Array.isArray(token.tools) ? token.tools.push(tool) : token.tools.navisEnvironment ??= tool;
  });
  Hooks.on("updateScene", scene => {
    refreshEnvironmentUI();
    syncSceneGravity(scene);
  });
  Hooks.on("canvasReady", () => syncSceneGravity());
  Hooks.on("createToken", token => {
    if (token.actor?.type !== "character") return;
    syncGravityEffect(token.actor, token.parent);
    syncRadiationEffect(token.actor);
  });
}
