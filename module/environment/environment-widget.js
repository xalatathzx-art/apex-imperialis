import { environmentForScene } from "./environment-data.js";
import { temperatureReadout, radiationReadout, gravityReadout, atmosphereReadout } from "./environment-readout.js";
import { makeDraggable, restorePosition } from "./widget-dock.js";

export const WIDGET_ID = "navis-environment-widget";
const label = key => game.i18n.localize(key.startsWith("NAVIS.") ? key : `NAVIS.Environment.${key}`);
const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

// Показатель в строке виджета красится своим тоном, чтобы опасность читалась
// без открытия окна — как в warhammer-dbc.
// Ячейка приборной панели: мелкая подпись сверху, значение крупно снизу.
const reading = (readout, name, text) =>
  `<span class="reading${readout.idle ? " idle" : ""}" style="--tone:${readout.tone}">`
  + `<i>${escape(label(`NAVIS.Environment.Widget${name}`))}</i>`
  + `<b>${escape(text)}</b></span>`;

export function refreshEnvironmentUI() {
  document.getElementById(WIDGET_ID)?.remove();
  if (!canvas?.scene) return;

  const env = environmentForScene(canvas.scene);
  const temperature = temperatureReadout(env.temperature);
  const radiation = radiationReadout(env.radiation);
  const gravity = gravityReadout(env.gravity);
  const atmosphere = atmosphereReadout(env.atmosphere);

  const root = document.createElement("aside");
  root.id = WIDGET_ID;
  root.className = radiation.level >= 7 || atmosphere.type === "vacuum" ? "danger" : "";
  const name = env.weather.label || label("NAVIS.Environment.WeatherUnset");

  root.innerHTML = `<div class="env-head">`
    + `<span class="env-name" style="${env.weather.tone ? `--tone:${escape(env.weather.tone)}` : ""}">${escape(name)}</span>`
    + reading(temperature, "Temperature", `${env.temperature}°C`)
    + reading(gravity, "Gravity", `${env.gravity}G`)
    + reading(radiation, "Radiation", `${env.radiation}/${label("NAVIS.Environment.RadiationUnit")}`)
    + reading(atmosphere, "Atmosphere", label(atmosphere.labelKey))
    + `</div>`;

  document.body.append(root);
  restorePosition(root, "navis.environment", { left: 12, top: 76 });
  makeDraggable(root, root.querySelector(".env-head"), "navis.environment");
}

export function registerEnvironmentWidget() {
  Hooks.on("canvasReady", refreshEnvironmentUI);
  Hooks.on("updateScene", refreshEnvironmentUI);
}
