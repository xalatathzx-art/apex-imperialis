/**
 * Лист предмета «Техночудо».
 *
 * Построен на родном листе таланта impmal, поэтому окно, шапка, вкладка
 * эффектов и приём перетаскиваний достаются от системы, а не пишутся заново.
 * Нашей остаётся только вкладка подробностей.
 *
 * Как и модель данных, класс собирается внутри функции: тот класс, который он
 * наследует, существует лишь после того, как Foundry выполнит
 * initializeSheets(), а это происходит уже после хука setup.
 */

import { TECHNOMIRACLE_TYPE } from "./model.js";

/**
 * Варианты списков: ключ → ключ локализации. impmal подаёт свои так же, и
 * {{selectOptions ... localize=true}} их сам переводит. Через устаревший
 * {{#select}} с готовыми <option> это работало бы, но в v14 helper уберут.
 */
const ACTIONS = {
  free: "NAVIS.Techno.ActionFree",
  half: "NAVIS.Techno.ActionHalf",
  full: "NAVIS.Techno.ActionFull",
  reaction: "NAVIS.Techno.ActionReaction",
  none: "NAVIS.Techno.ActionNone"
};

const REACHES = {
  self: "NAVIS.Techno.RangeSelf",
  touch: "NAVIS.Techno.RangeTouch",
  formula: "NAVIS.Techno.RangeFormula"
};

const ATTACKS = {
  none: "NAVIS.Techno.AttackNone",
  ranged: "NAVIS.Techno.AttackRanged",
  melee: "NAVIS.Techno.AttackMelee"
};

const MODULE_ID = "apex-imperialis";
const DETAILS_TEMPLATE = `modules/${MODULE_ID}/templates/item/technomiracle.hbs`;

let sheet = null;

function findBaseSheet() {
  const registered = CONFIG.Item.sheetClasses?.talent ?? {};
  const cls = Object.values(registered).find(entry => entry?.cls)?.cls;

  if (!cls) {
    console.error(
      `${MODULE_ID} | no impmal item sheet is registered for "talent", so the Techno-miracle sheet cannot `
      + "be built on one. This means registerTechnoMiracleSheet ran before Foundry initialised "
      + "CONFIG.Item.sheetClasses."
    );
  }

  return cls;
}

export function defineTechnoMiracleSheet() {
  if (sheet) return sheet;

  const Base = findBaseSheet();
  if (!Base) return null;

  sheet = class TechnoMiracleSheet extends Base {
    static type = TECHNOMIRACLE_TYPE;

    static DEFAULT_OPTIONS = {
      classes: ["technomiracle"],
      position: { width: 520, height: "auto" }
    };

    static PARTS = {
      header: {
        scrollable: [""],
        template: "systems/impmal/templates/item/item-header.hbs",
        classes: ["sheet-header"]
      },
      tabs: { scrollable: [""], template: "templates/generic/tab-navigation.hbs" },
      description: {
        scrollable: [""],
        template: "systems/impmal/templates/item/item-description.hbs"
      },
      details: { scrollable: [""], template: DETAILS_TEMPLATE },
      effects: { scrollable: [""], template: "systems/impmal/templates/item/item-effects.hbs" }
    };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      context.actions = ACTIONS;
      context.reaches = REACHES;
      context.attacks = ATTACKS;
      return context;
    }
  };

  return sheet;
}
