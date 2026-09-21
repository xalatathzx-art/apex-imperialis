/**
 * Обвязка типа предмета «Техночудо».
 *
 * Модель попадает в CONFIG на `init`, до того как готовится хоть один документ;
 * лист — на `ready`, потому что реестр листов Foundry заполняет позже, внутри
 * initializeSheets().
 *
 * Тип объявлен в module.json, а значит доходит до мира только при его запуске:
 * включение модуля в уже открытом мире зарегистрирует модель для типа, которого
 * в мире нет. Поэтому reportState говорит об этом вслух, а не оставляет игрока
 * гадать, почему предмет не создаётся.
 */

import { defineTechnoMiracleModel, TECHNOMIRACLE_TYPE } from "./model.js";
import { registerProcessUpkeep } from "./processes.js";
import { registerShieldField } from "./shield.js";
import { defineTechnoMiracleSheet } from "./sheet.js";
import { registerTechnoMiracleTab } from "./tab.js";

const MODULE_ID = "apex-imperialis";

export { TECHNOMIRACLE_TYPE };

export function registerTechnoMiracleModel() {
  if (!globalThis.warhammer?.models) {
    console.error(
      `${MODULE_ID} | warhammer-lib is unavailable; the Techno-miracle item type cannot be registered.`
    );
    return;
  }

  const model = defineTechnoMiracleModel();
  if (!model) return;

  // `computeBase` у оружия читает config[`${attackType}Specs`]. Для нашего
  // «none» такой таблицы нет, и обращение к её полю роняло подготовку данных
  // предмета, а за ним и всего актёра. Пустая таблица делает поиск безобидным.
  game.impmal ??= {};
  game.impmal.config ??= {};
  game.impmal.config.noneSpecs ??= {};

  CONFIG.Item.dataModels[TECHNOMIRACLE_TYPE] = model;
  CONFIG.Item.typeLabels ??= {};
  CONFIG.Item.typeLabels[TECHNOMIRACLE_TYPE] = "NAVIS.Techno.Type";

  // Счёт за Процессы висит на хуке боя, а не на реестре листов, поэтому init —
  // достаточно рано.
  registerProcessUpkeep();
  registerShieldField();
}

export function registerTechnoMiracleSheet() {
  if (!CONFIG.Item.dataModels[TECHNOMIRACLE_TYPE]) {
    console.error(
      `${MODULE_ID} | the Techno-miracle data model is not registered; the sheet cannot be either.`
    );
    return;
  }

  const cls = defineTechnoMiracleSheet();
  if (!cls) return;

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, MODULE_ID, cls, {
    types: [TECHNOMIRACLE_TYPE],
    makeDefault: true,
    label: "NAVIS.Techno.Sheet"
  });

  registerTechnoMiracleTab();
  reportState();
}

function reportState() {
  if (!game.documentTypes?.Item?.includes(TECHNOMIRACLE_TYPE)) {
    const message = game.i18n.localize("NAVIS.Techno.RelaunchNeeded");
    console.error(`${MODULE_ID} | ${message}`);
    ui.notifications.error(message, { permanent: true });
    return;
  }

  console.log(`${MODULE_ID} | Techno-miracle item type ready, sheet registered`);
}
