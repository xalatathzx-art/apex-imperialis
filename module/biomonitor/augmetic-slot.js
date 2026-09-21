import { BODY_ZONES } from "./biomonitor-body.js";

/**
 * Imperium Maledictum не хранит место установки аугметики: шаблон типа
 * `augmetic` — это notes + physical + equipped, а `system.slots` считает слоты
 * экипировки, а не часть тела. Поэтому augmeticLocation() всегда приходила к
 * фоллбэку "internal", и имплант не попадал ни в одну зону биомонитора.
 *
 * Здесь лист аугметики получает выбор участка тела, который пишется во флаг
 * модуля — тот самый источник, который augmeticLocation() читает последним.
 */
const MODULE_ID = "apex-imperialis";
export const LOCATION_FLAG = "location";
const FIELD_CLASS = "navis-augmetic-location";

export function augmeticLocationOptions() {
  return [{ value: "internal", label: "NAVIS.Biomonitor.Internal" },
    ...BODY_ZONES.map(zone => ({ value: zone.key, label: `NAVIS.Location.${zone.key}` }))];
}

export function renderAugmeticLocation(item, element) {
  if (item?.type !== "augmetic" || !element) return;
  if (element.querySelector(`.${FIELD_CLASS}`)) return;
  const tab = element.querySelector('section.tab[data-group="primary"]') ?? element.querySelector("section.tab");
  if (!tab) return;

  const current = item.getFlag(MODULE_ID, LOCATION_FLAG) ?? "internal";
  const options = augmeticLocationOptions()
    .map(option => `<option value="${option.value}"${option.value === current ? " selected" : ""}>${game.i18n.localize(option.label)}</option>`)
    .join("");
  const field = document.createElement("fieldset");
  field.className = FIELD_CLASS;
  field.innerHTML = `<legend>${game.i18n.localize("NAVIS.Biomonitor.BodyZone")}</legend>
    <div class="form-group"><label>${game.i18n.localize("NAVIS.Biomonitor.Location")}</label>
    <div class="form-fields"><select name="navis-location">${options}</select></div></div>`;
  tab.prepend(field);

  field.querySelector("select").addEventListener("change", event => {
    const value = event.currentTarget.value;
    if (value === "internal") return item.unsetFlag(MODULE_ID, LOCATION_FLAG);
    return item.setFlag(MODULE_ID, LOCATION_FLAG, value);
  });
}

let registered = false;
export function registerAugmeticLocation() {
  if (registered) return;
  registered = true;
  Hooks.on("renderItemSheetV2", (app, element) => renderAugmeticLocation(app.document, element));
}
