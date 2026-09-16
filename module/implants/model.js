/**
 * The Implant item type.
 *
 * Declared in module.json under `documentTypes` — Foundry's own way for a
 * module to add a document sub-type. The system is not patched.
 *
 * The model EXTENDS impmal's `augmetic` model rather than building a schema
 * beside it. That gives cost, encumbrance, quantity, availability, equipped
 * state and notes in the system's own shape, and with them the availability
 * test (`setupAvailabilityTest`) for free. This is the lesson the techno-miracle
 * model records: inherit the system's surface, do not imitate it, or the copy
 * drifts from the original.
 *
 * The class is built inside a function because the model it extends only
 * reaches CONFIG once the system has been evaluated.
 */

import { IMPLANT_TYPE } from "./state.js";
import { SLOTS } from "./classify.js";

const MODULE_ID = "navis-apexialis";

let ImplantModel = null;

function augmeticModel() {
  const augmetic = CONFIG.Item.dataModels?.augmetic;

  if (typeof augmetic !== "function") {
    console.error(
      `${MODULE_ID} | impmal no longer registers an augmetic data model at `
      + "CONFIG.Item.dataModels.augmetic, which the Implant model extends. "
      + "Implants cannot be registered."
    );
    return null;
  }

  return augmetic;
}

export function defineImplantModel() {
  if (ImplantModel) return ImplantModel;

  const AugmeticModel = augmeticModel();
  if (!AugmeticModel) return null;

  const fields = foundry.data.fields;

  const qualityText = () => new fields.SchemaField({
    1: new fields.HTMLField(),
    2: new fields.HTMLField(),
    3: new fields.HTMLField(),
    4: new fields.HTMLField()
  });

  ImplantModel = class ImplantModel extends AugmeticModel {
    static defineSchema() {
      const schema = super.defineSchema();

      schema.rules = new fields.HTMLField();
      schema.page = new fields.StringField({ initial: "" });
      schema.category = new fields.StringField({ initial: "bionic" });

      // The book's Rarity, kept as its own number alongside impmal's
      // four-step `availability`. impmal's scale cannot express the book's
      // "+1 Rarity per extra Best.Q effect" without hitting its ceiling, and
      // cycle B needs the number rather than having to re-derive it.
      schema.rarity = new fields.NumberField({ initial: null, integer: true, nullable: true });

      schema.quality = new fields.NumberField({ initial: 2, integer: true, min: 1, max: 4, nullable: false });
      schema.qualityText = qualityText();

      schema.slot = new fields.StringField({
        initial: "other",
        choices: SLOTS.map(s => s.key)
      });
      schema.location = new fields.StringField({ initial: "internal" });
      schema.side = new fields.StringField({ initial: "", blank: true, choices: ["", "left", "right"] });

      // The gate. Three booleans, because the book counts fitted and switched
      // on separately (pp. 102, 269) and a damaged implant still occupies its
      // socket.
      schema.installed = new fields.BooleanField({ initial: false });
      schema.disabled = new fields.BooleanField({ initial: false });
      schema.active = new fields.BooleanField({ initial: true });

      // Constructor groups. ObjectField, not a typed schema: the entry kinds
      // are a growing set, and pinning them here would mean a schema migration
      // every time one is added.
      schema.mechanics = new fields.ArrayField(new fields.ObjectField(), { initial: [] });
      schema.chosenEffects = new fields.ObjectField({ initial: {} });

      return schema;
    }
  };

  return ImplantModel;
}

export { IMPLANT_TYPE };
