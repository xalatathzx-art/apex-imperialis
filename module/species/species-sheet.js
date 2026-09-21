/**
 * The Species item sheet.
 *
 * Built on impmal's own talent sheet so the window, tabs, header, effects tab
 * and drop handling are the system's, not a parallel implementation. Only the
 * details tab is ours.
 *
 * Like the data model, the class is built inside a function: the class it
 * extends is only reachable once the system has registered its sheets.
 */

import { SPECIES_TYPE, SUBSPECIES_TYPE } from "./species-model.js";

const MODULE_ID = "apex-imperialis";

const DETAILS_TEMPLATE = `modules/${MODULE_ID}/templates/item/species.hbs`;

let sheets = null;

/**
 * impmal registers a sheet class per item type, and any of them carries the
 * system's item-sheet behaviour: the header, the tabs, the effects tab, and the
 * actions our template uses (expandRow, editDiff, listDelete). Talent is the
 * plainest of the lot.
 *
 * The registry only exists once Foundry has run `initializeSheets()`, which is
 * after the setup hook — so this must not be called earlier than `ready`.
 */
function findBaseSheet() {
  const registered = CONFIG.Item.sheetClasses?.talent ?? {};
  const cls = Object.values(registered).find(entry => entry?.cls)?.cls;

  if (!cls) {
    console.error(
      `${MODULE_ID} | no impmal item sheet is registered for "talent", so the Species sheet cannot be built on one. ` +
      "This means registerSpeciesSheet ran before Foundry initialised CONFIG.Item.sheetClasses."
    );
  }

  return cls;
}

/** Build (once) and return both sheet classes, or null if they cannot be built. */
export function defineSpeciesSheets() {
  if (sheets) return sheets;

  const Base = findBaseSheet();
  if (!Base) return null;

  /** Everything the two share; the ceilings block is the only real difference. */
  const PackageSheet = class PackageSheet extends Base {
    static type = SPECIES_TYPE;

    static DEFAULT_OPTIONS = {
      classes: ["species"],
      position: { width: 520, height: "auto" }
    };

    static PARTS = {
      header: { scrollable: [""], template: "systems/impmal/templates/item/item-header.hbs", classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: "templates/generic/tab-navigation.hbs" },
      description: { scrollable: [""], template: "systems/impmal/templates/item/item-description.hbs" },
      details: { scrollable: [""], template: DETAILS_TEMPLATE },
      effects: { scrollable: [""], template: "systems/impmal/templates/item/item-effects.hbs" }
    };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const system = this.item.system;

      context.categories = CATEGORIES;
      context.sizes = game.impmal.config.sizes;
      context.characteristics = game.impmal.config.characteristics;
      context.characteristicAbbrev = game.impmal.config.characteristicAbbrev;
      context.skills = game.impmal.config.skills;
      context.roles = game.impmal.config.roles ?? {};

      context.modifiers = system.modifierList;
      context.maximums = system.maximumList;
      context.skillAdvances = system.skillList;
      context.rolesText = (system.roles ?? []).join(", ");

      // The template hides the ceilings and the size on a subspecies: it has
      // neither, and printing empty boxes would suggest it does.
      context.isSubspecies = system.isSubspecies;

      context.traits = await system.grantedTraits.awaitDocuments();
      context.talents = await system.talents.awaitDocuments();
      context.specialisations = await system.specialisations.awaitDocuments();
      context.equipment = await system.equipment.awaitDocuments();

      return context;
    }

    /**
     * Roles are typed as one comma-separated line, because a table's roles are
     * its own items rather than a fixed list we could offer as checkboxes.
     */
    _prepareSubmitData(event, form, formData, updateData) {
      const data = super._prepareSubmitData(event, form, formData, updateData);
      const roles = foundry.utils.getProperty(data, "system.roles");

      if (typeof roles === "string") {
        foundry.utils.setProperty(
          data,
          "system.roles",
          roles.split(",").map(role => role.trim()).filter(role => role)
        );
      }

      return data;
    }

    /**
     * Drops sort themselves by what was dropped: a trait joins the traits, a
     * talent the talents, anything physical the equipment.
     */
    async _onDropItem(data) {
      const item = await Item.implementation.fromDropData(data);
      if (!item) return;

      const system = this.item.system;

      if (item.type === "trait") return this.item.update(system.grantedTraits.add(item));
      if (item.type === "talent") return this.item.update(system.talents.add(item));
      if (item.type === "specialisation") return this.item.update(system.specialisations.add(item));
      if (item.system.isPhysical) return this.item.update(system.equipment.add(item));

      ui.notifications.warn(game.i18n.format("NAVIS.Species.CannotGrant", { type: item.type }));
    }
  };

  sheets = {
    SpeciesSheet: class SpeciesSheet extends PackageSheet {
      static type = SPECIES_TYPE;
    },

    SubspeciesSheet: class SubspeciesSheet extends PackageSheet {
      static type = SUBSPECIES_TYPE;

      static DEFAULT_OPTIONS = {
        classes: ["species", "subspecies"]
      };
    }
  };

  return sheets;
}

/**
 * What kind of thing the species is. Descriptive only — it sets the subtitle on
 * the sheet and gives the compendium something to sort by.
 */
export const CATEGORIES = {
  human: "NAVIS.Species.Category.Human",
  abhuman: "NAVIS.Species.Category.Abhuman",
  mutant: "NAVIS.Species.Category.Mutant",
  xenos: "NAVIS.Species.Category.Xenos",
  transhuman: "NAVIS.Species.Category.Transhuman",
  construct: "NAVIS.Species.Category.Construct"
};
