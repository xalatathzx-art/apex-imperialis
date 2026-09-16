/**
 * Wiring for the Implant item type.
 *
 * Model at `init`, before any document is prepared; sheet at `ready`, the first
 * moment Foundry's sheet registry exists. The same order as Species and
 * Techno-miracles.
 *
 * Because the type is declared in the manifest, it only reaches a world at
 * launch: enabling the module in a running world registers a model for a type
 * the world does not have. reportImplantState says so out loud rather than
 * leaving the player to wonder why the item will not create.
 */

import { defineImplantModel } from "./model.js";
import { registerImplantMechanicsHooks } from "./mechanics/apply.js";
import { defineImplantSheet } from "./sheet.js";
import { IMPLANT_TYPE } from "./state.js";

const MODULE_ID = "navis-apexialis";

export { IMPLANT_TYPE };

export function registerImplantModel() {
  if (!globalThis.warhammer?.models) {
    console.error(`${MODULE_ID} | warhammer-lib is unavailable; the Implant item type cannot be registered.`);
    return;
  }

  const model = defineImplantModel();
  if (!model) return;

  CONFIG.Item.dataModels[IMPLANT_TYPE] = model;
  CONFIG.Item.typeLabels ??= {};
  CONFIG.Item.typeLabels[IMPLANT_TYPE] = "NAVIS.Implant.Type";

  registerImplantMechanicsHooks();
}

export function registerImplantSheet() {
  const sheet = defineImplantSheet();
  if (!sheet) return;

  foundry.documents.collections.Items.registerSheet(MODULE_ID, sheet, {
    types: [IMPLANT_TYPE],
    makeDefault: true,
    label: "NAVIS.Implant.Sheet"
  });
}

export function reportImplantState() {
  const known = game.documentTypes?.Item ?? [];
  if (known.includes(IMPLANT_TYPE)) return;

  console.warn(
    `${MODULE_ID} | the world does not know the item type "${IMPLANT_TYPE}". `
    + "Types declared in a module manifest only reach a world at launch — restart the world."
  );
}
