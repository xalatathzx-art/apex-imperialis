/**
 * The Species and Subspecies item types.
 *
 * impmal prints Species on the character header as free text, so a race is a
 * word and nothing more. These models make it a package: the modifiers, grants
 * and choices a DoomBC race prints, expressed in impmal's own terms.
 *
 * They are two document types rather than one with a flag, because they are not
 * the same thing and should not be filed, filtered or edited together. A
 * Species stands alone and sets the ceilings; a Subspecies only ever attaches
 * to one, and carries no ceilings and no size of its own — it changes those
 * only where it says so.
 *
 * Body modifiers — wounds, criticals, armour — are not fields here. They ride
 * on the item as Active Effects, the way impmal's own talents carry theirs, so
 * removing the item removes them with no bookkeeping on our side. What is left
 * in the schema is everything an effect cannot express: one-time changes to
 * starting values, and the items granted or taken away.
 *
 * The classes are built inside functions because they extend a class that
 * warhammer-lib puts on the global only once its own module has evaluated.
 */

export const SPECIES_TYPE = "apex-imperialis.species";
export const SUBSPECIES_TYPE = "apex-imperialis.subspecies";

export const CHARACTERISTICS = ["ws", "bs", "str", "tgh", "ag", "int", "per", "wil", "fel"];

/** What a package was allowed to do to an actor, kept so removal can undo it. */
const APPLIED_FLAG = "applied";

const MODULE_ID = "apex-imperialis";

/**
 * Every name a document answers to.
 *
 * Three places below link packages by name rather than by id: a subspecies
 * names the species it attaches to, a species names the subspecies that cannot
 * outlive it, and a package names the traits it cancels. Translate the pack and
 * those names stop matching — the subspecies refuses to attach, and cancelled
 * traits quietly survive. Nothing throws; the sheet just comes out wrong, which
 * is the same failure impmal's own by-name scripts have (see
 * module/script-names.js).
 *
 * Babele keeps the English on a translated document at
 * `flags.babele.originalName`, so each comparison accepts either name. Where
 * Babele is not involved the second term is `undefined` and the original
 * comparison decides, unchanged.
 */
const namesOf = document => [document?.name, document?.flags?.babele?.originalName].filter(Boolean);
const answersTo = (document, name) => namesOf(document).includes(name);

let SpeciesModel = null;
let SubspeciesModel = null;

/** Both models, built once. */
export function defineSpeciesModels() {
  if (SpeciesModel && SubspeciesModel) return { SpeciesModel, SubspeciesModel };

  const fields = foundry.data.fields;
  const { BaseWarhammerItemModel, DiffReferenceListModel } = warhammer.models;

  const characteristicFields = options =>
    new fields.SchemaField(Object.fromEntries(CHARACTERISTICS.map(key => [key, new fields.NumberField(options)])));

  /**
   * The characteristics block. Both types carry modifiers and the player's
   * choice; only a Species carries ceilings, so the field is built in rather
   * than bolted onto an already-constructed schema.
   */
  const characteristicsField = ({ maximums = false } = {}) => {
    const schema = {
      modifiers: characteristicFields({ initial: 0, integer: true }),
      choice: new fields.SchemaField({
        value: new fields.NumberField({ initial: 5, integer: true }),
        number: new fields.NumberField({ initial: 0, min: 0, integer: true }),
        keys: new fields.ArrayField(new fields.StringField())
      })
    };

    // impmal caps a human at 60 "unless stated" (core rules p.51), so every
    // species states it. Nothing in the system enforces these — impmal has no
    // characteristic maximum in code. They are a figure the sheet shows.
    if (maximums) schema.maximums = characteristicFields({ initial: 60, min: 0, integer: true });

    return new fields.SchemaField(schema);
  };

  /**
   * Everything a Species and a Subspecies share: what they change on the actor
   * and what they hand it. Applying and undoing live here too, because the two
   * differ in what they carry, not in what they do with it.
   */
  const PackageModel = class PackageModel extends BaseWarhammerItemModel {
    static defineSchema() {
      const schema = super.defineSchema();

      schema.notes = new fields.SchemaField({
        player: new fields.HTMLField(),
        gm: new fields.HTMLField()
      });

      // Abhuman, mutant, xenos, transhuman… purely descriptive, drives the sheet subtitle.
      schema.category = new fields.StringField({ initial: "abhuman" });

      // Where the race is printed. NOT `source`: warhammer-lib's base model
      // already defines `get source()` with no setter, and a schema field of
      // that name throws while the model is being initialised, which takes the
      // whole item down — it will not open and cannot be created on an actor.
      schema.reference = new fields.StringField();

      // Marks a package the GM is expected to allow on purpose. It warns; it never blocks.
      schema.restricted = new fields.BooleanField({ initial: false });

      schema.characteristics = characteristicsField();

      // { athletics: 1, fortitude: 1 } — advances added to the actor's own.
      schema.skills = new fields.ObjectField();

      schema.corruption = new fields.NumberField({ initial: 0, min: 0, integer: true });

      // impmal role names. Advisory: the sheet says so, nothing enforces it.
      schema.roles = new fields.ArrayField(new fields.StringField());

      // Trait names this package takes away. A Tzaangor is a Beastman that lost
      // its horns and its hatred of order, so a package has to be able to
      // remove what another granted, not only add to it.
      schema.removes = new fields.ArrayField(new fields.StringField());

      schema.grantedTraits = new fields.EmbeddedDataField(DiffReferenceListModel);
      schema.talents = new fields.EmbeddedDataField(DiffReferenceListModel);
      schema.specialisations = new fields.EmbeddedDataField(DiffReferenceListModel);
      schema.equipment = new fields.EmbeddedDataField(DiffReferenceListModel);

      return schema;
    }

    get isSubspecies() {
      return this.parent.type === SUBSPECIES_TYPE;
    }

    /** The characteristic modifiers that are actually set, in impmal's own order. */
    get modifierList() {
      return CHARACTERISTICS
        .filter(key => this.characteristics.modifiers[key])
        .map(key => ({
          key,
          label: game.impmal.config.characteristicAbbrev[key],
          value: this.characteristics.modifiers[key]
        }));
    }

    /** A Species states its ceilings; a Subspecies has none to state. */
    get maximumList() {
      if (!this.characteristics.maximums) return [];

      return CHARACTERISTICS
        .filter(key => this.characteristics.maximums[key])
        .map(key => ({
          key,
          label: game.impmal.config.characteristicAbbrev[key],
          value: this.characteristics.maximums[key]
        }));
    }

    get skillList() {
      return Object.entries(this.skills ?? {})
        .filter(([key, advances]) => game.impmal.config.skills[key] && advances)
        .map(([key, advances]) => ({ key, label: game.impmal.config.skills[key], advances }));
    }

    /** Used by sheet dropdowns, chat posting and test details. */
    async summaryData() {
      const enrich = html =>
        foundry.applications.ux.TextEditor.implementation.enrichHTML(html, { async: true, relativeTo: this.parent });

      return {
        notes: await enrich(this.notes.player),
        gmnotes: await enrich(this.notes.gm),
        details: { physical: "", item: {} },
        tags: [],
        summaryLabel: game.i18n.localize("IMPMAL.Description")
      };
    }

    /* ------------------------------------------------------------------ */
    /*  Applying the package                                              */
    /* ------------------------------------------------------------------ */

    async _onCreate(data, options, user) {
      await super._onCreate(data, options, user);

      // _onCreate fires on every connected client; only the one that made the
      // item may act, or the package is applied once per player in the game.
      if (game.user.id !== user) return;

      const actor = this.parent.actor;
      if (!actor || options.skipSpecies) return;
      if (!["character", "npc"].includes(actor.type)) return;
      if (this.parent.getFlag(MODULE_ID, APPLIED_FLAG)) return;

      if (!(await this._claimSlot(actor))) return;

      if (this.restricted) {
        ui.notifications.warn(game.i18n.format("NAVIS.Species.RestrictedWarning", { name: this.parent.name }));
      }

      await this.applyTo(actor);
    }

    /** Subclasses decide whether the actor may take this package. */
    async _claimSlot() {
      return true;
    }

    /** Refuse the drop, taking the item back off the actor. */
    async _refuse(message) {
      ui.notifications.error(message);
      await this.parent.delete({ skipSpeciesRevert: true });
      return false;
    }

    /** What this package does to the actor's size, if anything. */
    get sizeChange() {
      return null;
    }

    /**
     * Fold the package into the actor: characteristics, skills, size, corruption,
     * the items granted and the traits cancelled. Everything changed is written
     * to a flag on the item so that removing it can put the actor back.
     */
    async applyTo(actor) {
      const chosen = await this.#askChoice();
      if (chosen === null) {
        // The dialog was dismissed; leave the actor untouched rather than
        // applying half a package the player did not agree to.
        await this.parent.delete({ skipSpeciesRevert: true });
        return;
      }

      const record = { characteristics: {}, skills: {}, items: [], removed: [], size: null, corruption: 0 };
      const update = {};

      const characteristics = actor.toObject().system.characteristics;
      const add = (key, value) => {
        if (!value || !characteristics[key]) return;
        characteristics[key].starting = Math.max(0, characteristics[key].starting + value);
        record.characteristics[key] = (record.characteristics[key] ?? 0) + value;
      };

      for (const key of CHARACTERISTICS) add(key, this.characteristics.modifiers[key]);
      for (const choice of chosen) add(choice.id, this.characteristics.choice.value);

      if (Object.keys(record.characteristics).length) {
        update["system.characteristics"] = characteristics;
      }

      const skills = actor.toObject().system.skills;
      for (const { key, advances } of this.skillList) {
        if (!skills[key]) continue;
        skills[key].advances += advances;
        record.skills[key] = advances;
      }
      if (Object.keys(record.skills).length) {
        update["system.skills"] = skills;
      }

      const size = this.sizeChange;
      if (size && foundry.utils.hasProperty(actor, "system.combat.size") && actor.system.combat.size !== size) {
        record.size = actor.system.combat.size;
        update["system.combat.size"] = size;
      }

      if (this.corruption && foundry.utils.hasProperty(actor, "system.corruption.value")) {
        record.corruption = this.corruption;
        update["system.corruption.value"] = actor.system.corruption.value + this.corruption;
      }

      if (Object.keys(update).length) await actor.update(update);

      record.removed = await this.#removeItems(actor);

      const created = await this.#grantItems(actor);
      record.items = created.map(item => item.id);

      await this.parent.setFlag(MODULE_ID, APPLIED_FLAG, record);

      ui.notifications.notify(game.i18n.format("NAVIS.Species.Applied", { name: this.parent.name }));
    }

    /**
     * Ask for the characteristics the book leaves to the player.
     * Returns [] when the package asks nothing, null when the player backed out.
     */
    async #askChoice() {
      const { number, value, keys } = this.characteristics.choice;
      if (!number || !keys.length) return [];

      const options = keys
        .filter(key => game.impmal.config.characteristics[key])
        .map(key => ({ id: key, name: game.impmal.config.characteristics[key] }));

      if (!options.length) return [];

      const chosen = await warhammer.apps.ItemDialog.create(options, number, {
        title: this.parent.name,
        text: game.i18n.format("NAVIS.Species.ChoosePrompt", { value: value > 0 ? `+${value}` : value, number })
      });

      return chosen?.length === number ? chosen : null;
    }

    /**
     * Take away the traits this package cancels, keeping a full copy of each so
     * that removing the package can put them back exactly as they were.
     */
    async #removeItems(actor) {
      if (!this.removes.length) return [];

      const doomed = actor.items.filter(
        item => item.type === "trait" && this.removes.some(name => answersTo(item, name))
      );
      if (!doomed.length) return [];

      const copies = doomed.map(item => item.toObject());
      await actor.deleteEmbeddedDocuments("Item", doomed.map(item => item.id));
      return copies;
    }

    /** Create the traits, talents, specialisations and equipment this package grants. */
    async #grantItems(actor) {
      const lists = [this.grantedTraits, this.talents, this.specialisations, this.equipment];
      const documents = (await Promise.all(lists.map(list => list.awaitDocuments()))).flat().filter(doc => doc);

      if (!documents.length) return [];

      const data = documents.map(document => {
        const object = document.toObject();
        foundry.utils.setProperty(object, `flags.${MODULE_ID}.grantedBy`, this.parent.id);
        return object;
      });

      return actor.createEmbeddedDocuments("Item", data, { skipSpecies: true });
    }

    /* ------------------------------------------------------------------ */
    /*  Taking it back off                                                */
    /* ------------------------------------------------------------------ */

    /** Packages that cannot survive this one being removed. */
    _dependants() {
      return [];
    }

    async _onDelete(options, user) {
      await super._onDelete(options, user);
      if (game.user.id !== user) return;

      const actor = this.parent.actor;
      const record = this.parent.getFlag(MODULE_ID, APPLIED_FLAG);
      if (!actor || !record || options.skipSpeciesRevert) return;

      const granted = (record.items ?? []).map(id => actor.items.get(id)).filter(item => item);
      const dependants = this._dependants(actor);

      // By now the player may have spent XP on top of this, so putting the
      // characteristics back is a question rather than something we just do.
      const revert = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize("NAVIS.Species.RemoveTitle") },
        content: `<p>${game.i18n.format("NAVIS.Species.RemovePrompt", {
          name: this.parent.name,
          count: granted.length
        })}</p>`,
        rejectClose: false
      });

      if (!revert) return;

      const update = {};

      if (Object.keys(record.characteristics ?? {}).length) {
        const characteristics = actor.toObject().system.characteristics;
        for (const [key, value] of Object.entries(record.characteristics)) {
          if (!characteristics[key]) continue;
          characteristics[key].starting = Math.max(0, characteristics[key].starting - value);
        }
        update["system.characteristics"] = characteristics;
      }

      if (Object.keys(record.skills ?? {}).length) {
        const skills = actor.toObject().system.skills;
        for (const [key, advances] of Object.entries(record.skills)) {
          if (!skills[key]) continue;
          skills[key].advances = Math.max(0, skills[key].advances - advances);
        }
        update["system.skills"] = skills;
      }

      if (record.size) update["system.combat.size"] = record.size;

      if (record.corruption && foundry.utils.hasProperty(actor, "system.corruption.value")) {
        update["system.corruption.value"] = Math.max(0, actor.system.corruption.value - record.corruption);
      }

      if (Object.keys(update).length) await actor.update(update);
      if (granted.length) await actor.deleteEmbeddedDocuments("Item", granted.map(item => item.id));

      if (record.removed?.length) {
        await actor.createEmbeddedDocuments("Item", record.removed, { keepId: true, skipSpecies: true });
      }

      // Deleted last, so each dependant runs its own revert against an actor
      // whose species has already been undone.
      for (const dependant of dependants) await dependant.delete();
    }

    async toEmbed(config, options) {
      const html = `
        <h4>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h4>
        ${this.notes.player}
        ${game.user.isGM ? this.notes.gm : ""}
      `;

      const div = document.createElement("div");
      div.style = config.style;
      div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {
        relativeTo: this.parent,
        async: true,
        secrets: options.secrets
      });
      return div;
    }
  };

  /**
   * A species: one per character, states the ceilings, sets the size.
   */
  SpeciesModel = class SpeciesModel extends PackageModel {
    static defineSchema() {
      const schema = super.defineSchema();

      schema.characteristics = characteristicsField({ maximums: true });
      schema.size = new fields.StringField({ initial: "medium" });

      return schema;
    }

    get sizeChange() {
      return this.size || null;
    }

    /** One species per actor. */
    async _claimSlot(actor) {
      const existing = actor.items.find(item => item.type === SPECIES_TYPE && item.id !== this.parent.id);
      if (!existing) return true;

      return this._refuse(game.i18n.format("NAVIS.Species.AlreadyHas", { name: existing.name }));
    }

    /** Its subspecies cannot outlive it. */
    _dependants(actor) {
      return actor.items.filter(
        item => item.type === SUBSPECIES_TYPE && answersTo(this.parent, item.system.requires)
      );
    }
  };

  /**
   * A subspecies: attaches to one named species, and changes only what it says.
   * No ceilings of its own, and no size unless it states one.
   */
  SubspeciesModel = class SubspeciesModel extends PackageModel {
    static defineSchema() {
      const schema = super.defineSchema();

      // The species this attaches to, by name.
      schema.requires = new fields.StringField();

      // Empty means "whatever the species set" — a Slaangor does not shrink its
      // Ogryn back to medium just by existing.
      schema.size = new fields.StringField({ initial: "" });

      return schema;
    }

    get sizeChange() {
      return this.size || null;
    }

    /** Only on top of its own species, and only one at a time. */
    async _claimSlot(actor) {
      const base = actor.items.find(item => item.type === SPECIES_TYPE);

      if (!answersTo(base, this.requires)) {
        return this._refuse(game.i18n.format("NAVIS.Species.NeedsParent", {
          name: this.parent.name,
          requires: this.requires || game.i18n.localize("NAVIS.Species.Label")
        }));
      }

      const existing = actor.items.find(
        item => item.type === SUBSPECIES_TYPE && item.id !== this.parent.id
      );
      if (!existing) return true;

      return this._refuse(game.i18n.format("NAVIS.Species.AlreadyHasSub", { name: existing.name }));
    }
  };

  return { SpeciesModel, SubspeciesModel };
}
