/**
 * Wiring for the Species and Subspecies item types.
 *
 * Both are declared in module.json under `documentTypes`, which is Foundry's own
 * mechanism for a module adding a document sub-type. Nothing here patches the
 * system: the data models go into CONFIG at init, and the sheets at `ready`,
 * which is the first moment Foundry's sheet registry exists.
 *
 * Because the types are declared in the manifest, they only reach a world at
 * launch. Enabling the module in a running world registers models for types the
 * world does not have, so `reportSpeciesState` says so out loud.
 */

import { defineSpeciesModels, SPECIES_TYPE, SUBSPECIES_TYPE } from "./species-model.js";
import { defineSpeciesSheets } from "./species-sheet.js";

const MODULE_ID = "apex-imperialis";

export { SPECIES_TYPE, SUBSPECIES_TYPE };

/** Register the data models. Must happen at init, before any document is prepared. */
export function registerSpeciesModel() {
  if (!globalThis.warhammer?.models) {
    console.error(`${MODULE_ID} | warhammer-lib is unavailable; the Species item types cannot be registered.`);
    return;
  }

  const { SpeciesModel, SubspeciesModel } = defineSpeciesModels();

  CONFIG.Item.dataModels[SPECIES_TYPE] = SpeciesModel;
  CONFIG.Item.dataModels[SUBSPECIES_TYPE] = SubspeciesModel;

  CONFIG.Item.typeLabels ??= {};
  CONFIG.Item.typeLabels[SPECIES_TYPE] = "NAVIS.Species.Type";
  CONFIG.Item.typeLabels[SUBSPECIES_TYPE] = "NAVIS.Species.SubType";
}

/**
 * Register the sheets.
 *
 * This runs at `ready`, not at `init` or `setup`, and the reason is exact:
 * Foundry builds `CONFIG.Item.sheetClasses` inside `initializeSheets()`, which
 * runs *after* the setup hook (client/game.mjs). Before that the registry is
 * empty, so a sheet built on top of one of impmal's own classes would silently
 * fall back to the bare library sheet and fail to render.
 */
export function registerSpeciesSheet() {
  if (!CONFIG.Item.dataModels[SPECIES_TYPE]) {
    console.error(`${MODULE_ID} | the Species data models are not registered; the sheets cannot be either.`);
    return;
  }

  const sheets = defineSpeciesSheets();
  if (!sheets) return;

  const register = (cls, type, label) =>
    foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, MODULE_ID, cls, {
      types: [type],
      makeDefault: true,
      label
    });

  register(sheets.SpeciesSheet, SPECIES_TYPE, "NAVIS.Species.Sheet");
  register(sheets.SubspeciesSheet, SUBSPECIES_TYPE, "NAVIS.Species.SubSheet");

  reportSpeciesState();
}

/**
 * Say plainly whether the item types actually took.
 *
 * A sub-type only exists once Foundry has read the manifest at world launch, so
 * a module enabled mid-session registers models for types nothing can create.
 * That failure is otherwise silent: the items sit in the compendium looking
 * fine, refuse to open, and ignore every drop.
 */
function reportSpeciesState() {
  const missing = [SPECIES_TYPE, SUBSPECIES_TYPE].filter(type => !game.documentTypes?.Item?.includes(type));

  if (missing.length) {
    const message =
      `Apex Imperialis: ${missing.join(" and ")} ${missing.length > 1 ? "are" : "is"} not registered with this ` +
      "world. Return to Setup and launch the world again — enabling a module mid-session does not add its " +
      "document types.";
    console.error(`${MODULE_ID} | ${message}`);
    ui.notifications.error(message, { permanent: true });
    return;
  }

  console.log(`${MODULE_ID} | Species and Subspecies item types ready, sheets registered`);
}
