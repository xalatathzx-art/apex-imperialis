/**
 * The Implant item sheet.
 *
 * Built on impmal's own AUGMETIC sheet rather than on the plainest one it
 * registers, because the Implant data model extends impmal's augmetic model:
 * cost, encumbrance, availability, equipped state and the availability test
 * are already rendered by that sheet, and re-implementing them beside it would
 * be a second copy to keep in step.
 *
 * Two parts are ours. `implant` is the article itself — rulebook text, level,
 * where it is fitted, and the three gates. `mechanics` is the constructor, so
 * an author can build an implant's effects without writing code. Everything
 * else on the window — the header, Описание, Детали and Эффекты — stays the
 * system's.
 *
 * As with the data model, the class is built inside a function: the class it
 * extends only exists once Foundry has run `initializeSheets()`, which is
 * after the setup hook.
 */

import { IMPLANT_TYPE } from "./state.js";
import { SLOTS, locationForSlot } from "./classify.js";
import { QUALITY_LEVELS, ORDINARY_QUALITY } from "./rules.js";
import { HIT_LOCATIONS, mechanicsContext } from "./mechanics/constructor.js";
import * as mech from "./mechanics/constructor.js";

const MODULE_ID = "navis-apexialis";

const IMPLANT_TEMPLATE = `modules/${MODULE_ID}/templates/item/implant.hbs`;
const MECHANICS_TEMPLATE = `modules/${MODULE_ID}/templates/item/implant-mechanics.hbs`;

/** Slots whose zone depends on which side the implant is fitted. */
const SIDED_SLOTS = Object.freeze(["arm", "leg", "ocular"]);

/** key → label key, the shape `{{selectOptions}}` wants. */
const SLOT_OPTIONS = Object.freeze(Object.fromEntries(SLOTS.map(slot => [slot.key, slot.label])));

const SIDE_OPTIONS = Object.freeze({
  "": "NAVIS.Implant.SideNone",
  left: "NAVIS.Implant.Side.left",
  right: "NAVIS.Implant.Side.right"
});

let sheet = null;

/**
 * The registry only exists once Foundry has run `initializeSheets()`, which is
 * after the setup hook — so this must not be called earlier than `ready`.
 */
function findBaseSheet() {
  const registered = CONFIG.Item.sheetClasses?.augmetic ?? {};
  const cls = Object.values(registered).find(entry => entry?.cls)?.cls;

  if (!cls) {
    console.error(
      `${MODULE_ID} | no impmal item sheet is registered for "augmetic", so the Implant sheet `
      + "cannot be built on one. This means registerImplantSheet ran before Foundry initialised "
      + "CONFIG.Item.sheetClasses."
    );
  }

  return cls;
}

/** The six hit locations an implant can sit in, plus "inside the body". */
function locationOptions() {
  const config = game.impmal?.config?.hitLocations ?? {};
  const out = {};
  for (const key of HIT_LOCATIONS) if (config[key]) out[key] = config[key];
  out.internal = "NAVIS.Implant.LocationInternal";
  return out;
}

/* -------------------------------------------- */
/*  One-line previews                           */
/* -------------------------------------------- */

/**
 * How much of a level note the collapsed row shows before it gives up.
 *
 * Chosen against the sheet's 560px width rather than against a round number:
 * roughly one line of the row's 11px text once the level label and the caret
 * have taken their share. Anything longer is cut, and the full note rides
 * along in the row's `data-tooltip`, so the cut never loses information — it
 * only asks for a hover.
 */
const PREVIEW_LIMIT = 88;

/** The handful of entities a rulebook note picks up from the editor. */
const NAMED_ENTITIES = Object.freeze({
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", laquo: "«", raquo: "»",
  mdash: "—", ndash: "–", hellip: "…"
});

/**
 * Enriched prose as one line of plain text.
 *
 * Done here rather than in the template because Handlebars cannot do it: it
 * has no string operations, and `{{{ }}}` would put the note's own markup —
 * paragraphs, lists, an `@UUID` link — inside a row that has to stay one line
 * tall. Stripping in JavaScript also means the same string can be both the
 * visible preview and the tooltip's full text.
 *
 * This is display only. It never touches what is stored, and the stripped
 * text is inserted as TEXT by Handlebars' own escaping, so a tag that survives
 * a malformed input cannot become markup again.
 */
export function plainLine(html) {
  return String(html ?? "")
    // A `<script>`'s body is not prose; dropping the tags alone would print it.
    .replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (whole, name) => NAMED_ENTITIES[name.toLowerCase()] ?? whole)
    .replace(/\s+/g, " ")
    .trim();
}

/** The same line, cut at a word boundary with an ellipsis if it is too long. */
export function truncateLine(line, limit = PREVIEW_LIMIT) {
  if (line.length <= limit) return line;
  const cut = line.slice(0, limit);
  const space = cut.lastIndexOf(" ");
  // A single unbroken word longer than the limit has no boundary to cut at.
  return `${(space > limit * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

async function enrich(item, html) {
  return foundry.applications.ux.TextEditor.enrichHTML(html, {
    async: true,
    secrets: item.isOwner,
    relativeTo: item
  });
}

/** Build (once) and return the sheet class, or null if it cannot be built. */
export function defineImplantSheet() {
  if (sheet) return sheet;

  const Base = findBaseSheet();
  if (!Base) return null;

  sheet = class ImplantSheet extends Base {
    static type = IMPLANT_TYPE;

    /**
     * Has the author touched the location select by hand?
     *
     * Kept on the open window rather than on the document: it is a fact about
     * this editing session, not about the implant. While it is true, changing
     * the slot or the side no longer rewrites the zone — silently overwriting
     * a deliberate choice is worse than leaving a stale default.
     */
    locationTouched = false;

    /**
     * Which quality level's editor is unfolded, or null.
     *
     * One at a time, and on the window rather than on the document: the four
     * levels are read as a ladder, so all four rows stay on screen and only
     * the one being written to takes an editor's height. Which one that is is
     * a fact about this editing session — reopening the sheet starts folded.
     */
    openQualityLevel = null;

    /**
     * The ids of the mechanics entries whose fields are unfolded.
     *
     * Same reasoning, but a set rather than a single value: an author
     * comparing two entries in one group has a reason to hold both open,
     * while the four quality levels are one choice being made once.
     */
    #openEntries = new Set();

    /**
     * Constructor writes, one at a time.
     *
     * Every editing helper in `mechanics/constructor.js` is a read-modify-write:
     * it clones `system.mechanics`, changes one field and updates the item. Two
     * change events landing closer together than one update round-trip — a
     * designer tabbing quickly between fields — would have the second clone a
     * snapshot taken before the first write landed, and the first edit would be
     * lost with nothing on screen to say so.
     */
    #queue = Promise.resolve();

    /**
     * The same callback is passed as both handlers on purpose: a rejected write
     * must not wedge the chain, or one failure would freeze the constructor for
     * the rest of the session.
     */
    #enqueue(work) {
      this.#queue = this.#queue.then(work, work);
      return this.#queue.catch(error => {
        console.error(`${MODULE_ID} | an implant mechanics edit failed to save.`, error);
        ui.notifications?.error(game.i18n.localize("NAVIS.Implant.Mechanics.SaveFailed"));
      });
    }

    static DEFAULT_OPTIONS = {
      classes: ["navis-implant"],
      position: { width: 560, height: 700 },
      actions: {
        navisAddGroup: this._onAddGroup,
        navisDeleteGroup: this._onDeleteGroup,
        navisToggleOperator: this._onToggleOperator,
        navisAddEntry: this._onAddEntry,
        navisDeleteEntry: this._onDeleteEntry,
        navisToggleLadder: this._onToggleLadder,
        navisClearSource: this._onClearSource,
        navisOpenSource: this._onOpenSource,
        navisToggleQuality: this._onToggleQuality,
        navisToggleEntry: this._onToggleEntry
      }
    };

    static PARTS = {
      header: {
        scrollable: [""],
        template: "systems/impmal/templates/item/item-header.hbs",
        classes: ["sheet-header"]
      },
      tabs: { scrollable: [""], template: "templates/generic/tab-navigation.hbs" },
      description: { scrollable: [""], template: "systems/impmal/templates/item/item-description.hbs" },
      implant: { scrollable: [""], template: IMPLANT_TEMPLATE },
      details: { scrollable: [""], template: "systems/impmal/templates/item/types/augmetic.hbs" },
      mechanics: { scrollable: [""], template: MECHANICS_TEMPLATE },
      effects: { scrollable: [""], template: "systems/impmal/templates/item/item-effects.hbs" }
    };

    static TABS = {
      description: { id: "description", group: "primary", label: "IMPMAL.Description" },
      implant: { id: "implant", group: "primary", label: "NAVIS.Implant.Tab.Details" },
      details: { id: "details", group: "primary", label: "IMPMAL.Details" },
      mechanics: { id: "mechanics", group: "primary", label: "NAVIS.Implant.Tab.Mechanics" },
      effects: { id: "effects", group: "primary", label: "IMPMAL.Effects" }
    };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const system = this.item.system;

      context.qualityLevels = QUALITY_LEVELS.map(level => ({
        level,
        label: game.i18n.format("NAVIS.Implant.QualityLevel", { level }),
        ordinary: level === ORDINARY_QUALITY,
        selected: level === system.quality
      }));

      // Four rows, always all four, whether or not the book prints a note for
      // the level. A ladder with a gap in it is a deliberate ladder; a ladder
      // with the gap hidden is one an author cannot tell from an unfinished
      // one, and would re-check against the book every time.
      context.qualityRows = QUALITY_LEVELS.map(level => {
        const line = plainLine(system.qualityText?.[level]);
        return {
          level,
          label: game.i18n.format("NAVIS.Implant.QualityLevel", { level }),
          ordinary: level === ORDINARY_QUALITY,
          filled: !!line,
          preview: truncateLine(line),
          full: line,
          open: level === this.openQualityLevel
        };
      });

      // The window's own id, so a row's `aria-controls` names the panel on THIS
      // sheet. Two implant sheets open at once would otherwise both claim the
      // same element ids and the second would steer a screen reader to the
      // first one's editor.
      context.sheetId = this.id;

      context.slotOptions = SLOT_OPTIONS;
      context.sideOptions = SIDE_OPTIONS;
      context.locationOptions = locationOptions();
      context.showSide = SIDED_SLOTS.includes(system.slot);
      context.locationTouched = this.locationTouched;

      context.mechanics = mechanicsContext(this.item, this.#openEntries);

      // What the surgery recorded on this implant. Shown beside the gate so the
      // adaptation period is a fact on the sheet rather than a number that only
      // ever appeared once in a chat card. There is no clock here on purpose:
      // the stored day count is what the operation produced, and advancing it
      // is a time system this cycle does not have.
      const days = this.item.getFlag(MODULE_ID, "adaptation")?.days;
      context.adaptationDays = Number.isFinite(days) ? days : null;

      return context;
    }

    /** The rulebook text and the four level notes are prose, so they are enriched like prose. */
    async _handleEnrichment() {
      const base = await super._handleEnrichment();
      const system = this.item.system;

      const flat = { "system.rules": await enrich(this.item, system.rules) };
      for (const level of QUALITY_LEVELS) {
        flat[`system.qualityText.${level}`] = await enrich(this.item, system.qualityText?.[level]);
      }

      return foundry.utils.mergeObject(base, foundry.utils.expandObject(flat));
    }

    /**
     * Fill the zone in from the slot and the side — unless the author has
     * already said what the zone is.
     *
     * Done here rather than by writing into the select, because the form is
     * submitted before any re-render: changing the value in the DOM would
     * race the submission that caused it.
     */
    _prepareSubmitData(event, form, formData, updateData) {
      const data = super._prepareSubmitData(event, form, formData, updateData);
      if (this.locationTouched) return data;

      const system = this.item.system;
      const slot = foundry.utils.getProperty(data, "system.slot");
      const side = foundry.utils.getProperty(data, "system.side");

      const slotChanged = slot !== undefined && slot !== system.slot;
      const sideChanged = side !== undefined && side !== system.side;
      if (!slotChanged && !sideChanged) return data;

      foundry.utils.setProperty(
        data,
        "system.location",
        locationForSlot(slot ?? system.slot, side ?? system.side)
      );

      return data;
    }

    async _onRender(context, options) {
      await super._onRender(context, options);

      // The moment the author picks a zone by hand, the classifier stops
      // having an opinion for the rest of this window's life.
      const location = this.element.querySelector('[name="system.location"]');
      location?.addEventListener("change", () => {
        this.locationTouched = true;
        location.dataset.touched = "true";
      });

      // One listener for the whole constructor: the sheet re-renders on every
      // change, so per-input handlers would have to be re-attached each time.
      const mechanics = this.element.querySelector('[data-navis-mechanics]');
      mechanics?.addEventListener("change", this.#onMechanicsChange.bind(this));
    }

    #onMechanicsChange(event) {
      const input = event.target.closest("[data-navis-field]");
      if (!input) return;

      // Ours alone — never let it reach the sheet's own form submission.
      event.stopPropagation();

      const { navisField: field, groupId, entryId, level } = input.dataset;
      const value = input.value;
      this.#enqueue(() => mech.setField(this.item, { groupId, entryId, field, level, value }));
    }

    /**
     * A trait or a talent dropped on an entry is recorded by reference. Any
     * other drop falls through to impmal, which knows what to do with it.
     */
    async _onDropItem(data, event) {
      const target = event?.target?.closest?.("[data-navis-drop]");
      if (!target) return super._onDropItem(data, event);

      const dropped = await Item.implementation.fromDropData(data);
      if (!dropped) return;

      const accepts = target.dataset.navisDrop;
      if (dropped.type !== accepts) {
        return ui.notifications.warn(game.i18n.localize("NAVIS.Implant.Mechanics.WrongDrop"));
      }

      return this.#enqueue(() => mech.setSource(this.item, target.dataset.groupId, target.dataset.entryId, dropped));
    }

    /* ---------------------------------------- */
    /*  Constructor actions                     */
    /* ---------------------------------------- */

    // Every one of these is a read-modify-write on the same array as the field
    // edits, so they share the same queue rather than racing them.

    /* ---------------------------------------- */
    /*  Folding                                 */
    /* ---------------------------------------- */

    /*
     * Both toggles change the DOM in place and do NOT re-render.
     *
     * A re-render would replace the element mid-transition, so the fold would
     * snap rather than move; it would also throw away the caret position of
     * whatever the author was typing in. The state is still written to the
     * window, so the next render — the one a field edit causes — puts the same
     * rows back open.
     */

    static _onToggleQuality(event, target) {
      const level = Number(target.dataset.level);
      this.openQualityLevel = this.openQualityLevel === level ? null : level;

      for (const row of this.element.querySelectorAll(".navis-quality-item")) {
        const open = Number(row.dataset.level) === this.openQualityLevel;
        row.classList.toggle("open", open);
        row.querySelector(".navis-quality-row")?.setAttribute("aria-expanded", String(open));
      }
    }

    static _onToggleEntry(event, target) {
      const id = target.dataset.entryId;
      if (!this.#openEntries.delete(id)) this.#openEntries.add(id);

      const open = this.#openEntries.has(id);
      target.closest(".navis-mech-entry")?.classList.toggle("open", open);
      target.setAttribute("aria-expanded", String(open));
    }

    /* ---------------------------------------- */

    static _onAddGroup() {
      // Unfolded on arrival: a new entry's summary says only "Характеристика
      // +0", which is not what the author came to add.
      return this.#enqueue(async () => {
        const id = await mech.addGroup(this.item);
        if (id) this.#openEntries.add(id);
      });
    }

    static _onDeleteGroup(event, target) {
      return this.#enqueue(() => mech.deleteGroup(this.item, target.dataset.groupId));
    }

    static _onToggleOperator(event, target) {
      return this.#enqueue(() => mech.toggleOperator(this.item, target.dataset.groupId));
    }

    static _onAddEntry(event, target) {
      const groupId = target.dataset.groupId;
      return this.#enqueue(async () => {
        const id = await mech.addEntry(this.item, groupId);
        if (id) this.#openEntries.add(id);
      });
    }

    static _onDeleteEntry(event, target) {
      const { groupId, entryId } = target.dataset;
      this.#openEntries.delete(entryId);
      return this.#enqueue(() => mech.deleteEntry(this.item, groupId, entryId));
    }

    static _onToggleLadder(event, target) {
      return this.#enqueue(() => mech.toggleLadder(this.item, target.dataset.groupId, target.dataset.entryId));
    }

    static _onClearSource(event, target) {
      return this.#enqueue(() => mech.clearSource(this.item, target.dataset.groupId, target.dataset.entryId));
    }

    static async _onOpenSource(event, target) {
      const doc = await fromUuid(target.dataset.uuid);
      doc?.sheet?.render(true);
    }
  };

  return sheet;
}
