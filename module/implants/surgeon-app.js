/**
 * The Chirurgeon — the window a player actually fits implants from.
 *
 * A body figure in the centre, the eleven body systems down both sides, and
 * the fit/extract actions on each. The window renders state; it decides
 * nothing. Fitting and extraction go through `surgery.js` — the roll, the
 * damage, the adaptation countdown and the chat card belong there, and this
 * file never writes `system.installed` itself. The `active` switch is the one
 * field written here, because Task 8's hook re-syncs the effect from it.
 *
 * Two things in here are load-bearing and look like padding until you know
 * what they are for.
 *
 * ONE WINDOW PER ACTOR. The instances live in a module-level Map keyed on the
 * actor id, and the DOM id is derived from the same id. Two windows sharing a
 * DOM id break each other: the second render steals the first's element and
 * both stop updating. Opening the Chirurgeon twice raises the window already
 * open.
 *
 * SLOTS COME FROM `system.slot`, never from the name at render time. An
 * implant whose slot is empty or unrecognised lands in `other` and is VISIBLE
 * there. In the system this is ported from, a whole-body kit had no slot to
 * land in, so it appeared in no slot at all, could never be fitted, and
 * everything it granted was silently rolled back — the numbers on its card
 * were right and there was nowhere to put them. Every implant on the actor is
 * reachable from this window or the window is wrong.
 */

import { SLOTS, locationForSlot } from "./classify.js";
import { IMPLANT_TYPE, actorCapState, implantsOf, isImplantActive, isImplantFitted } from "./state.js";
import { talentBonuses } from "./test-mods.js";
import { extractImplant, fitImplant } from "./surgery.js";
import { implantLocation, implantTint, BODY_ORGAN_LAYERS, BODY_SCAN_LAYERS } from "../biomonitor/biomonitor-body.js";

const MODULE_ID = "navis-apexialis";

const Base = globalThis.foundry?.applications?.api?.HandlebarsApplicationMixin?.(globalThis.foundry.applications.api.ApplicationV2) ?? class {};

/** Slots that hold two, one per side. */
const PAIRED = Object.freeze(["arm", "leg", "ocular"]);
const SIDES = Object.freeze(["left", "right"]);

const SLOT_KEYS = new Set(SLOTS.map(slot => slot.key));

const t = key => game.i18n.localize(key);

/**
 * The stored slot, or `other`. Never the name: see the file header.
 * @param {object} item an implant item or a compendium index entry
 */
export function slotOf(item) {
  const slot = item?.system?.slot;
  return SLOT_KEYS.has(slot) ? slot : "other";
}

const sideLabel = side => (side === "left" || side === "right")
  ? t(`NAVIS.Implant.Side.${side}`)
  : "";

const qualityLabel = quality => game.i18n.format("NAVIS.Implant.QualityLevel", {
  level: Number(quality) || 2
});

/**
 * Categories are free text on the item — the content pipeline writes whatever
 * the book prints. So a category is localised if someone has written a key for
 * it and shown verbatim otherwise, rather than being silently dropped.
 */
function categoryLabel(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return t("NAVIS.Surgeon.CategoryNone");
  const key = `NAVIS.Implant.Category.${raw}`;
  return game.i18n.has?.(key) ? t(key) : raw;
}

/* -------------------------------------------- */
/*  The compendium's offerings                  */
/* -------------------------------------------- */

let offersCache = null;

/**
 * Every implant in every Item compendium the user can see, as index entries.
 * `system.slot` and `system.category` are not in a default index, so they are
 * asked for by name.
 *
 * Cached for the session: the packs do not change while a world runs, and
 * re-indexing every compendium on every render of every slot would be felt.
 */
async function loadOffers() {
  const found = [];

  for (const pack of game.packs ?? []) {
    if (pack.documentName !== "Item") continue;
    if (pack.visible === false) continue;

    let index;
    try {
      index = await pack.getIndex({ fields: ["system.slot", "system.category", "system.quality"] });
    } catch (error) {
      console.error(`${MODULE_ID} | could not index the compendium "${pack.collection}" for the Chirurgeon.`, error);
      continue;
    }

    for (const entry of index) {
      if (entry.type !== IMPLANT_TYPE) continue;
      found.push({
        uuid: entry.uuid ?? `Compendium.${pack.collection}.Item.${entry._id}`,
        name: entry.name,
        img: entry.img,
        slot: slotOf(entry),
        category: entry.system?.category ?? "",
        quality: entry.system?.quality ?? 2
      });
    }
  }

  found.sort((a, b) => a.name.localeCompare(b.name));
  return found;
}

export function clearSurgeonOffers() {
  offersCache = null;
}

/**
 * Drop the cache when a compendium implant is added, edited or removed, and
 * redraw whatever is open.
 *
 * The cache is what makes the window cheap, and without this a GM who authors
 * an implant in a pack keeps seeing the old catalogue until the world is
 * relaunched — the one edit most likely to happen with the Chirurgeon already
 * on screen. Only pack documents matter: an item on an actor is read live.
 */
export function registerSurgeonHooks() {
  const invalidate = document => {
    if (document?.documentName !== "Item") return;
    if (!document.pack || document.type !== IMPLANT_TYPE) return;
    clearSurgeonOffers();
    for (const app of windows.values()) app.render();
  };

  for (const hook of ["createItem", "updateItem", "deleteItem"]) Hooks.on(hook, invalidate);
}

/* -------------------------------------------- */
/*  View model                                  */
/* -------------------------------------------- */

/**
 * The three placement fields an implant carries, decided together.
 *
 * `location` is written alongside `slot` and `side`, never left behind. The
 * model initialises it and the item sheet keeps it in step, so a compendium
 * entry authored for one limb carries that limb's zone in its source data —
 * and `implantLocation` prefers a stored zone over the slot. Without this, an
 * arm fitted on the right would light the LEFT arm on both figures, and Обе
 * стороны would put both copies on the same limb.
 */
export function placementFor(slot, side = "") {
  const chosen = side ?? "";
  return { slot, side: chosen, location: locationForSlot(slot, chosen) };
}

/**
 * Which sides of a paired slot are already taken.
 *
 * A fitted implant with no side recorded still occupies the socket, so it
 * consumes the first side still free rather than being ignored: pretending it
 * takes no room would offer "both sides" over an arm that already has one.
 */
export function occupancy(fitted) {
  const taken = new Set();
  const placement = new Map();

  for (const item of fitted) {
    const declared = item.system?.side;
    const side = (SIDES.includes(declared) && !taken.has(declared))
      ? declared
      : SIDES.find(candidate => !taken.has(candidate)) ?? "";
    if (side) taken.add(side);
    placement.set(item.id, side);
  }

  return { taken, placement, free: SIDES.filter(side => !taken.has(side)) };
}

function fittedEntry(item, side) {
  return {
    id: item.id,
    name: item.name,
    img: item.img,
    quality: qualityLabel(item.system?.quality),
    side: sideLabel(item.system?.side || side),
    active: isImplantActive(item),
    damaged: !!item.system?.disabled,
    tint: implantTint(item.system?.category),
    zone: implantLocation(item)
  };
}

/**
 * The sides an implant may be offered on.
 *
 * Unpaired slots get one sideless offer. A paired slot with room offers each
 * free side. A paired slot with both sides taken still offers a sideless fit —
 * the cap is what forbids an extra implant, not this window, and an entry with
 * no button at all is the failure mode the file header describes.
 */
export function offerSides(paired, free) {
  if (!paired) return [{ side: "", label: t("NAVIS.Surgeon.Install") }];
  if (!free.length) return [{ side: "", label: t("NAVIS.Surgeon.Install") }];
  return free.map(side => ({ side, label: `${t("NAVIS.Surgeon.Install")} · ${sideLabel(side)}` }));
}

function groupByCategory(entries) {
  const groups = new Map();

  for (const entry of entries) {
    const key = String(entry.category ?? "");
    if (!groups.has(key)) groups.set(key, { key, label: categoryLabel(key), entries: [] });
    groups.get(key).entries.push(entry);
  }

  return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function buildSlot(definition, implants, offers) {
  const mine = implants.filter(item => slotOf(item) === definition.key);
  const fitted = mine.filter(isImplantFitted);
  const stock = mine.filter(item => !isImplantFitted(item));

  const paired = PAIRED.includes(definition.key);
  const { placement, free } = paired ? occupancy(fitted) : { placement: new Map(), free: [] };
  const sides = offerSides(paired, free);

  const offered = groupByCategory(offers.filter(entry => entry.slot === definition.key))
    .map(group => ({
      ...group,
      entries: group.entries.map(entry => ({
        ...entry,
        quality: qualityLabel(entry.quality),
        tint: implantTint(entry.category),
        sides
      }))
    }));

  return {
    key: definition.key,
    label: t(definition.label),
    paired,
    // The parts of the figure this body system lives in, for the hover
    // highlight. "internal" is not a part of the figure, so it drops out.
    zones: (paired ? SIDES : [""])
      .map(side => locationForSlot(definition.key, side))
      .filter(zone => zone !== "internal")
      .join(" "),
    bothSides: paired && free.length === SIDES.length,
    count: fitted.length,
    empty: fitted.length === 0,
    anything: fitted.length > 0 || stock.length > 0 || offered.length > 0,
    fitted: fitted.map(item => fittedEntry(item, placement.get(item.id))),
    stock: stock.map(item => ({
      id: item.id,
      name: item.name,
      img: item.img,
      quality: qualityLabel(item.system?.quality),
      tint: implantTint(item.system?.category),
      sides
    })),
    offers: offered
  };
}

/** The figure, lit where something is fitted. */
function buildFigure(fittedEntries) {
  const lit = new Set(fittedEntries.map(entry => entry.zone));
  return {
    layers: BODY_SCAN_LAYERS.map(layer => ({
      zone: layer.zone,
      src: layer.src,
      state: lit.has(layer.zone) ? "augmetic" : ""
    })),
    organs: BODY_ORGAN_LAYERS.map(layer => ({ key: layer.key, src: layer.src }))
  };
}

/* -------------------------------------------- */
/*  The window                                  */
/* -------------------------------------------- */

export class SurgeonWindow extends Base {
  #actor;

  constructor(options = {}) {
    // The DOM id is derived from the actor id here rather than through
    // ApplicationV2's `{id}` substitution, so it is legible in one place.
    super({ ...options, id: `navis-surgeon-${options.actor?.id ?? "unknown"}` });
    this.#actor = options.actor;
  }

  get actor() {
    return this.#actor;
  }

  static DEFAULT_OPTIONS = {
    tag: "div",
    classes: ["navis-surgeon"],
    window: { title: "NAVIS.Surgeon.Title", resizable: true, icon: "fa-solid fa-user-doctor" },
    position: { width: 940, height: 720 },
    actions: {
      navisFit: this._onFit,
      navisFitNoTest: this._onFitNoTest,
      navisInstall: this._onInstall,
      navisInstallBoth: this._onInstallBoth,
      navisExtract: this._onExtract,
      navisToggleActive: this._onToggleActive,
      navisOpenItem: this._onOpenItem
    }
  };

  static PARTS = {
    body: { template: `modules/${MODULE_ID}/templates/apps/surgeon.hbs` }
  };

  get title() {
    return `${t("NAVIS.Surgeon.Title")} — ${this.#actor?.name ?? ""}`;
  }

  /** Every write goes through here, so a spectator cannot act on someone else's body. */
  get canOperate() {
    return !!(this.#actor?.isOwner || game.user?.isGM);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.#actor;

    offersCache ??= await loadOffers();

    const implants = implantsOf(actor);
    const cap = actorCapState(actor, talentBonuses(actor));
    const slots = SLOTS.map(definition => buildSlot(definition, implants, offersCache));
    const fitted = slots.flatMap(slot => slot.fitted);

    // Eleven slots, split evenly: six down the left, five down the right.
    const half = Math.ceil(slots.length / 2);

    return {
      ...context,
      actorId: actor?.id,
      actorName: actor?.name,
      isGM: !!game.user?.isGM,
      canOperate: this.canOperate,
      figure: buildFigure(fitted),
      columns: [slots.slice(0, half), slots.slice(half)],
      cap: {
        installed: implants.filter(isImplantFitted).length,
        installedCap: cap.installedCap,
        active: implants.filter(isImplantActive).length,
        activeCap: cap.activeCap,
        over: !!cap.penalty,
        overInstalled: cap.overInstalled > 0,
        overActive: cap.overActive > 0,
        warning: t("NAVIS.Implant.OverCap")
      }
    };
  }

  /**
   * Hovering a slot lights the part of the figure it sits in. Purely a reading
   * aid: the slot columns are long, and the figure is what tells you where a
   * body system actually is.
   */
  _onRender(context, options) {
    super._onRender?.(context, options);

    // Bound to the grid, not to `this.element`: the frame outlives a re-render
    // and the listeners would pile up on it, one more set after every action.
    const grid = this.element?.querySelector(".navis-surgeon-grid");
    if (!grid) return;

    // A paired slot lights both limbs, so data-zone is a list, not one value.
    const mark = value => {
      const zones = new Set(String(value ?? "").split(/\s+/).filter(Boolean));
      grid.querySelectorAll(".navis-surgeon-figure .body-layer")
        .forEach(node => node.classList.toggle("hot", zones.has(node.dataset.layer)));
    };

    grid.addEventListener("pointerover", event => {
      mark(event.target?.closest?.("[data-zone]")?.dataset.zone ?? null);
    });
    grid.addEventListener("pointerleave", () => mark(null));
  }

  _onClose(options) {
    super._onClose?.(options);
    if (windows.get(this.#actor?.id) === this) windows.delete(this.#actor?.id);
  }

  /* ---------------------------------------- */
  /*  Actions                                 */
  /* ---------------------------------------- */

  #item(target) {
    return this.#actor?.items?.get?.(target?.closest("[data-item-id]")?.dataset.itemId);
  }

  #denied() {
    if (this.canOperate) return false;
    ui.notifications?.warn(t("NAVIS.Surgeon.NoPermission"));
    return true;
  }

  /**
   * Put a compendium implant onto the actor with its placement already
   * decided, then hand it to surgery.js. The slot is written from the slot the
   * button sits in rather than left to the source document: an entry authored
   * without one would otherwise arrive on the actor as `other` and the player
   * would have fitted it from the Руки column into Прочее.
   */
  async #create(uuid, slot, side) {
    const source = await fromUuid(uuid);
    if (!source) {
      console.error(`${MODULE_ID} | the Chirurgeon could not load ${uuid}.`);
      return null;
    }

    const data = source.toObject();
    data.system = { ...data.system, ...placementFor(slot, side) };

    const [created] = await this.#actor.createEmbeddedDocuments("Item", [data]);
    return created ?? null;
  }

  static async _onFit(event, target) {
    if (this.#denied()) return;
    const item = this.#item(target);
    if (!item) return;

    const side = target.dataset.side;
    if (side && item.system?.side !== side) await item.update({ "system.side": side });

    await fitImplant(this.#actor, item, { test: true });
    this.render();
  }

  static async _onFitNoTest(event, target) {
    // GM only. Guarded here as well as in the template: a hidden button is a
    // hint, not a permission.
    if (!game.user?.isGM) return;
    const item = this.#item(target);
    if (!item) return;

    const side = target.dataset.side;
    if (side && item.system?.side !== side) await item.update({ "system.side": side });

    await fitImplant(this.#actor, item, { test: false });
    this.render();
  }

  static async _onInstall(event, target) {
    if (this.#denied()) return;
    const { uuid, slot, side } = target.dataset;
    const item = await this.#create(uuid, slot, side);
    if (item) await fitImplant(this.#actor, item, { test: true });
    this.render();
  }

  /**
   * Both sides in one action: two separate items, one per side, fitted one
   * after the other. Sequential on purpose — each is its own operation, with
   * its own test and its own damage.
   */
  static async _onInstallBoth(event, target) {
    if (this.#denied()) return;
    const { uuid, slot } = target.dataset;

    for (const side of SIDES) {
      const item = await this.#create(uuid, slot, side);
      if (item) await fitImplant(this.#actor, item, { test: true });
    }

    this.render();
  }

  static async _onExtract(event, target) {
    if (this.#denied()) return;
    const item = this.#item(target);
    if (!item) return;

    await extractImplant(item);
    this.render();
  }

  /** Writes the field and nothing else; Task 8's hook re-syncs the effect. */
  static async _onToggleActive(event, target) {
    if (this.#denied()) return;
    const item = this.#item(target);
    if (!item) return;

    await item.update({ "system.active": !item.system?.active });
    this.render();
  }

  static _onOpenItem(event, target) {
    const { uuid } = target.dataset;
    if (uuid) return fromUuid(uuid).then(doc => doc?.sheet?.render(true));
    this.#item(target)?.sheet?.render(true);
  }
}

/* -------------------------------------------- */
/*  One window per actor                        */
/* -------------------------------------------- */

const windows = new Map();

/**
 * @param {Actor} actor
 * @returns {SurgeonWindow|null} the window for this actor — the one already
 *   open if there is one, raised rather than duplicated.
 */
export function openSurgeon(actor) {
  if (!actor?.id) return null;

  const open = windows.get(actor.id);
  if (open) {
    open.render(true);
    open.bringToFront?.();
    return open;
  }

  const app = new SurgeonWindow({ actor });
  windows.set(actor.id, app);
  app.render(true);
  return app;
}
