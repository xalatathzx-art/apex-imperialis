/**
 * Apex Imperialis — entry point.
 *
 * Everything here extends the impmal system config rather than replacing any of
 * it, so the module layers cleanly over a stock install and over impmal-core.
 */

import { DISCIPLINES, NPC_ROLES } from "./config/glossary.js";
import { WEAPON_TRAIT_EFFECTS } from "./config/weapon-trait-effects.js";
import { registerVehicleActionRules } from "./config/vehicle-actions.js";
import { registerContentStrings, registerCompendiumTranslations } from "./content-i18n.js";
import { registerHorde } from "./horde/index.js";
import { registerImplantModel, registerImplantSheet, reportImplantState } from "./implants/index.js";
import { registerEnvironment } from "./environment/index.js";
import { registerSheetBars } from "./sheet-bars.js";
import { registerBiomonitor } from "./biomonitor/index.js";
import { registerRetarget } from "./retarget.js";
import { registerScriptNames } from "./script-names.js";
import { registerSkin } from "./skin.js";
import { registerSpecialisationLanguageCompatibility } from "./specialisation-language-compatibility.js";
import { registerSpeciesModel, registerSpeciesSheet } from "./species/index.js";
import { registerTerminology } from "./terminology.js";

const MODULE_ID = "apex-imperialis";

// Babele announces itself from its own `init` hook, and module order decides
// whether that lands before or after ours — so this one is armed as the module
// is evaluated, before any init hook runs at all.
registerCompendiumTranslations();
registerContentStrings();
registerScriptNames();

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "uuidMigrationComplete", {
    name: "Navis UUID migration complete",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
  registerSkin();
  registerEnvironment();
  registerSheetBars();

  // impmal spends one string, IMPMAL.Normal, on three things: the speed
  // "normal", the Rapid Fire dropdown's "normal" fire mode, and a dialog state.
  // Russian cannot: скорость is feminine and режим is masculine, and the other
  // four speeds are already translated feminine ("Медленная", "Быстрая",
  // "Стремительная"). Pointing this one config entry at our own key gives the
  // speed its "Обычная" and leaves the fire mode its "Обычный".
  //
  // Before registerTerminology, which snapshots the config while its values are
  // still i18n keys and rebuilds it from that snapshot after i18nInit — a key
  // set afterwards would be overwritten by impmal's on the way back.
  if (game.impmal?.config?.speeds) game.impmal.config.speeds.normal = "NAVIS.Speed.normal";

  registerTerminology();
  registerSpeciesModel();
  registerImplantModel();

  const config = game.impmal?.config;

  if (!config) {
    console.error(`${MODULE_ID} | game.impmal.config is unavailable; the Imperium Maledictum system is required.`);
    return;
  }

  foundry.utils.mergeObject(config.disciplines, DISCIPLINES);
  foundry.utils.mergeObject(config.npcRoles, NPC_ROLES);

  // The system only defines this when something has already registered a
  // scripted trait, so it may legitimately be missing.
  config.weaponTraitEffects ??= {};
  foundry.utils.mergeObject(config.weaponTraitEffects, WEAPON_TRAIT_EFFECTS);

  console.log(`${MODULE_ID} | ${Object.keys(WEAPON_TRAIT_EFFECTS).length} scripted weapon traits registered`);
});

// The horde patch wraps a method on impmal's own actor data model, so it has to
// wait until the system has put that model into CONFIG — which impmal does from
// its own init hook, and module order decides whether that lands before ours.
// `setup` is the first moment it is certainly there, and still early enough that
// no attack can have resolved.
Hooks.once("setup", () => {
  if (game.system.id !== "impmal") return;
  registerHorde();
  registerRetarget();
  registerSpecialisationLanguageCompatibility();

  // Тексты правил для действий техники дописывают в конфиг impmal-core и
  // impmal-requisition, оба на init. Чей init последний — решает порядок
  // модулей, поэтому перевод кладём на setup: он заведомо позже обоих.
  registerVehicleActionRules();
});

Hooks.once("ready", () => {
  registerBiomonitor();
  // Foundry fills CONFIG.Item.sheetClasses after the setup hook, and the Species
  // sheet is built on top of one of impmal's, so this cannot run any earlier.
  registerSpeciesSheet();
  registerImplantSheet();
  reportImplantState();

  // Both modules ship the same content under different ids, so running them
  // together means every talent, weapon and NPC appears twice.
  if (game.modules.get("impmal-malexp")?.active) {
    ui.notifications.warn(
      "Apex Imperialis already contains everything from impmal-malexp. " +
      "Disable impmal-malexp to avoid duplicate compendium entries.",
      { permanent: true }
    );
  }
});
