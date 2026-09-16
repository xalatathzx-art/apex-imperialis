import { environmentForScene, normaliseEnvironment, MODULE_ID, ENVIRONMENT_FLAG } from "./environment-data.js";
import { temperatureReadout, radiationReadout, gravityReadout, atmosphereReadout } from "./environment-readout.js";
import { gravityEffects, weightFactor } from "./gravity-rules.js";

const Base = globalThis.foundry?.applications?.api?.HandlebarsApplicationMixin?.(globalThis.foundry.applications.api.ApplicationV2) ?? class {};

export class EnvironmentApp extends Base {
  static DEFAULT_OPTIONS = {
    id: "navis-environment-app", tag: "form", classes: ["navis-environment-app"],
    window: { title: "NAVIS.Environment.Title", resizable: true }, position: { width: 680, height: "auto" },
    form: { closeOnSubmit: false, submitOnChange: true, handler: this.submit }
  };
  static PARTS = { form: { template: "modules/navis-apexialis/templates/apps/environment.hbs" } };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const environment = environmentForScene(canvas.scene);
    const t = key => game.i18n.localize(key);
    // Пояснение — только подпись зоны: механики за ним больше нет.
    const explain = readout => ({ ...readout, label: t(readout.labelKey) });
    const factor = weightFactor(environment.gravity);
    return {
      ...context, environment,
      weatherTone: environment.weather.tone || "#c49337",
      temperature: explain(temperatureReadout(environment.temperature)),
      radiation: explain(radiationReadout(environment.radiation)),
      gravity: explain(gravityReadout(environment.gravity)),
      atmosphere: explain(atmosphereReadout(environment.atmosphere)),
      // Вес снаряжения — то единственное, что гравитация правит прямо в листе.
      weightNote: factor === 0
        ? t("NAVIS.Gravity.weightZero")
        : game.i18n.format("NAVIS.Gravity.weightFactor", { factor }),
      gravityEffects: gravityEffects(environment.gravity).map(effect => ({
        text: effect.value === undefined
          ? t(effect.labelKey)
          : game.i18n.format(effect.labelKey, { n: Math.abs(effect.value) }),
        manual: Boolean(effect.manual), rule: effect.rule
      }))
    };
  }

  static async submit(event, _form, formData) {
    if (!game.user.isGM || !canvas.scene) return;
    const data = foundry.utils.expandObject(formData.object);
    await canvas.scene.setFlag(MODULE_ID, ENVIRONMENT_FLAG, normaliseEnvironment(data));
    this.render();
  }
}

let app;
export function openEnvironmentApp() {
  if (!game.user.isGM) return;
  app ??= new EnvironmentApp();
  app.render(true);
}
