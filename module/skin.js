/**
 * Navis Apexialis skin — runtime.
 *
 * The stylesheet (styles/navis-skin.css) does the painting; everything in it is
 * gated on body.navis-skin. This file owns that class, and the refit passes in
 * refit.js and refit-character.js that give chat cards, NPC sheets and player
 * character sheets the structure the stylesheet lays out.
 */

import { refitTestCard, refitMessageHeader, refitItemPost, refitNpcSheet, refitWarp, refitEditorSections, refitAddEffect, refitChargen, refitChargenStage, refitAdvancement, usesNpcSheet } from "./refit.js";
import { refitHordeCard, refitHordeRow } from "./horde/index.js";
import { refitCharacterSheet } from "./refit-character.js";
import { refitVehicleSheet } from "./refit-vehicle.js";
import { specialisationTotal } from "./skill-specialisations.js";
import { SPECIES_TYPE, SUBSPECIES_TYPE } from "./species/index.js";

/** Last warp bar width per actor, so a re-render can animate from it. */
const warpMemory = new Map();

const MODULE_ID = "navis-apexialis";
const SETTING = "skin";
const BODY_CLASS = "navis-skin";

let enabled = false;

export function registerSkin() {
  // Client scope: a skin is a matter of taste, and one player's preference
  // should not repaint the table for everyone else.
  //
  // requiresReload: the refit passes restructure sheets and chat cards as they
  // render. Turning the skin off live would leave that structure behind with
  // no stylesheet to lay it out, so the change takes effect on reload.
  game.settings.register(MODULE_ID, SETTING, {
    name: "Navis Apexialis skin",
    hint: "Repaints the Imperium Maledictum interface — sheets, chat, windows, sidebar and hotbar — in plate, brass and rust, and lays out roll cards and NPC sheets as readouts. Works whether or not the system's own theme is enabled.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true
  });

  enabled = Boolean(game.settings.get(MODULE_ID, SETTING));
  document.body.classList.toggle(BODY_CLASS, enabled);
}

/**
 * Every string the refit prints, in the player's language.
 *
 * The refit writes text the templates never had, so none of it can come from
 * impmal's own markup. Where the system already names a thing the key is its
 * own — so the refit follows whatever translation is loaded — and only the
 * phrases impmal has no word for carry a NAVIS key.
 *
 * Built per render rather than once, because a player can change language
 * without the world restarting.
 */
function labels() {
  const t = key => game.i18n.localize(key);

  return {
    // Chat roll cards
    sl: t("IMPMAL.SL"),
    roll: t("IMPMAL.Roll"),
    target: t("IMPMAL.Target"),
    critical: t("NAVIS.Card.Critical"),
    fumble: t("IMPMAL.Fumble"),
    noAmmo: t("NAVIS.Card.NoAmmo"),
    noAmmoLoaded: t("IMPMAL.NoAmmoLoaded"),
    more: t("NAVIS.Card.More"),
    less: t("NAVIS.Card.Less"),

    // NPC action groups
    attack: t("IMPMAL.Attack"),
    defend: t("IMPMAL.Defend"),
    other: t("IMPMAL.Other"),

    // Shared columns
    weapon: t("IMPMAL.Weapon"),
    skill: t("IMPMAL.Skill"),
    damage: t("NAVIS.Sheet.DamageAbbrev"),
    range: t("IMPMAL.Range"),
    mag: t("IMPMAL.Mag"),

    // Character sheet header and Main tab
    advancement: t("IMPMAL.Advancement"),
    total: t("IMPMAL.Total"),
    startAdv: t("NAVIS.Sheet.StartAdv"),
    rollMutation: t("NAVIS.Sheet.RollMutation"),
    crits: t("NAVIS.Sheet.Crits"),
    experience: t("IMPMAL.XP"),
    patron: t("IMPMAL.Patron"),
    noPatron: t("IMPMAL.NoPatron"),
    noPatronHint: t("NAVIS.Sheet.NoPatronHint"),
    influence: t("IMPMAL.Influence"),
    standing: t("NAVIS.Sheet.Standing"),
    group: t("NAVIS.Sheet.Group"),

    // Фамильяр: инстинкты. Полные названия — «Инстинкт самосохранения» и
    // «Боевой инстинкт» — не встают подписью над выпадашкой в треть строки,
    // поэтому над ней короткая форма, а полная остаётся подсказкой. Тот же
    // приём, что у показателей НИП и брони техники.
    preservationShort: t("NAVIS.Sheet.PreservationShort"),
    combatShort: t("NAVIS.Sheet.CombatShort"),
    preservationInstinct: t("IMPMAL.PreservationInstinct"),
    combatInstinct: t("IMPMAL.CombatInstinct"),

    // Combat tab
    armament: t("NAVIS.Sheet.Armament"),
    equipped: t("NAVIS.Sheet.Equipped"),
    grip: t("NAVIS.Sheet.Grip"),
    magazine: t("IMPMAL.Mag"),
    melee: t("IMPMAL.Melee"),
    ranged: t("IMPMAL.Ranged"),
    empty: t("NAVIS.Sheet.Empty"),
    qty: t("IMPMAL.Qty."),
    noWeapons: t("NAVIS.Sheet.NoWeapons"),
    byLocation: t("NAVIS.Sheet.ByLocation"),
    damageMarked: t("NAVIS.Sheet.DamageMarked"),
    of: t("NAVIS.Sheet.Of"),
    left: t("NAVIS.Sheet.LeftAbbrev"),
    right: t("NAVIS.Sheet.RightAbbrev"),
    leftHand: t("NAVIS.Sheet.LeftHand"),
    rightHand: t("NAVIS.Sheet.RightHand"),
    offHand: t("NAVIS.Sheet.OffHand"),
    pickAmmo: t("NAVIS.Sheet.PickAmmo"),

    // Лист техники
    // «Броня спереди» — 78 px подписи над двузначным числом. Полное название
    // остаётся подсказкой, так что ничего не теряется. Ключи по русской строке,
    // как и у показателей НИП: тогда подмена идёт на любом языке, а не только
    // на английском.
    shortVehicleCaps: {
      [t("IMPMAL.FrontArmour")]: t("NAVIS.Sheet.FrontArmourShort"),
      [t("IMPMAL.BackArmour")]: t("NAVIS.Sheet.BackArmourShort")
    },
    // Species slots and card
    species: t("IMPMAL.Species"),
    subspecies: t("IMPMAL.Subspecies"),
    removeSpecies: t("NAVIS.Species.RemoveTitle"),
    removeSubspecies: t("NAVIS.Species.RemoveSub"),
    dropSubspecies: t("NAVIS.Species.DropHere"),
    needsSpecies: t("NAVIS.Species.NeedsSpeciesFirst"),
    suggestedRoles: t("NAVIS.Species.Roles"),

    // Tabs used to be a grid of equal columns, so "Снаряжение" had to be cut
    // to "Снар." — now they are flex and size to their text, so nothing is
    // shortened. The key stays in the language files for anyone who wants it.
    shortTabs: {},

    // Подписи к показателям оружия: шапка колонок ушла, они переехали к самим
    // значениям в карточке.
    damageLabel: t("IMPMAL.Damage"),
    rangeLabel: t("IMPMAL.Range"),

    // Two more that do not fit: an action button, and the NPC vitals row.
    // Vitals are keyed by their own localized text, which is how the refit
    // finds them, so this works in any language rather than only English.
    shortActions: {
      seize: t("NAVIS.Sheet.SeizeShort"),
      twf: t("NAVIS.Sheet.TwoWeaponShort")
    },
    // A vital's box is as wide as its caption, so a long caption on a
    // one-digit value is dead space. Resolve is the worst of them in Russian —
    // "Решимость" is 74px of caption for a single figure. English needs no
    // shortening, so its key repeats the full word and the swap is a no-op.
    shortVitals: {
      [t("IMPMAL.CriticalWounds")]: t("NAVIS.Sheet.Crits"),
      [t("IMPMAL.Initiative")]: t("NAVIS.Sheet.InitAbbrev"),
      [t("IMPMAL.Resolve")]: t("NAVIS.Sheet.ResolveAbbrev")
    },
    addEffect: t("NAVIS.Sheet.AddEffect"),

    // Advancement form
    itemsHint: t("NAVIS.Adv.ItemsHint"),
    logHint: t("NAVIS.Adv.LogHint"),
    otherHint: t("NAVIS.Adv.OtherHint"),
    submit: t("NAVIS.Adv.Submit"),
    openItem: t("NAVIS.Adv.OpenItem"),
    characterCreation: t("NAVIS.Adv.CharacterCreation"),
    stageBlocked: t("NAVIS.Chargen.Blocked"),
    allocateAdvances: t("NAVIS.Chargen.AllocateAdvances"),
    chooseEquipment: t("NAVIS.Chargen.ChooseEquipment"),
    shortLocations: {
      rightArm: t("NAVIS.Location.rightArm"),
      leftArm: t("NAVIS.Location.leftArm"),
      rightLeg: t("NAVIS.Location.rightLeg"),
      leftLeg: t("NAVIS.Location.leftLeg")
    }
  };
}

/**
 * Chat.
 *
 * impmal's roll card (templates/chat/rolls/roll.hbs) prints the result as text
 * and never records it in the markup, so the outcome, roll, target and SL are
 * read from the message's data model: messages of type "test" store the saved
 * test under system.result, where impmal sets outcome to exactly "success" or
 * "failure".
 *
 * warhammer-lib fires this hook before impmal's onRender, which only adds the
 * speaker's token and trims the breakdown link — it does not rebuild the card —
 * so the refit survives.
 */
Hooks.on("renderChatMessageHTML", (message, html) => {
  if (!html) return;
  // The casualty line is a rules readout, not decoration, so it is added whether
  // or not the skin is switched on.
  refitHordeCard(message, html);
  if (!enabled) return;

  refitMessageHeader(html);

  if (message.type === "test") {
    for (const card of html.querySelectorAll(".impmal.test")) {
      refitTestCard(card, message.system?.result ?? {}, labels());
    }
  }

  if (message.type === "item") {
    const type = message.system?.itemData?.type;
    const label = type ? game.i18n.localize(CONFIG.Item.typeLabels?.[type] ?? type) : null;
    refitItemPost(html, label);
  }
});

/**
 * The few figures the character refit prints that the markup does not carry,
 * read from the actor.
 */
/**
 * Which figure an effect change moves, in the words the sheet already uses.
 * Anything not listed falls back to the last readable part of the path, so an
 * unmapped change still reads as something rather than disappearing.
 */
const EFFECT_LABELS = {
  "system.combat.wounds.max": "IMPMAL.Wounds",
  "system.combat.criticals.max": "IMPMAL.CriticalWounds",
  "system.combat.armourModifier": "IMPMAL.Armour",
  "system.combat.initiative": "IMPMAL.Initiative",
  "system.combat.size": "IMPMAL.Size",
  "system.encumbrance.overburdened": "IMPMAL.Encumbrance",
  "system.corruption.max": "IMPMAL.Corruption"
};

const ADD_MODES = [CONST.ACTIVE_EFFECT_MODES.ADD];

/** The figures a species moves, read off the effects riding on its item. */
function speciesEffects(item) {
  const seen = new Map();

  for (const effect of item.effects) {
    if (effect.disabled) continue;

    for (const change of effect.changes) {
      const key = EFFECT_LABELS[change.key];
      const label = key ? game.i18n.localize(key) : change.key.split(".").pop();
      const numeric = Number(change.value);

      if (ADD_MODES.includes(change.mode) && Number.isFinite(numeric)) {
        const running = (seen.get(label) ?? 0) + numeric;
        seen.set(label, running);
      }
      else if (!seen.has(label)) {
        seen.set(label, change.value);
      }
    }
  }

  return [...seen].map(([label, value]) => ({
    label,
    value: typeof value === "number" ? (value > 0 ? `+${value}` : String(value)) : String(value)
  }));
}

/** The species slot and card, or null when the character has no species item. */
function speciesData(actor) {
  const species = actor.items.find(item => item.type === SPECIES_TYPE);
  if (!species) return null;

  const subspecies = actor.items.find(item => item.type === SUBSPECIES_TYPE);
  const items = [species, subspecies].filter(item => item);
  const granted = actor.items.filter(
    item => item.type === "trait" && items.some(s => item.getFlag("navis-apexialis", "grantedBy") === s.id)
  );

  // A subspecies moves the size only when it states one; otherwise the species
  // keeps it, which is the order the actor applied them in.
  //
  // The word comes from our own key rather than impmal's config: the system
  // spends one key on both a size and a weapon range, and the two take
  // different genders in Russian.
  const size = subspecies?.system.size || species.system.size;

  return {
    id: species.id,
    name: species.name,
    size: size ? game.i18n.localize(`NAVIS.Size.${size}`) : "",
    restricted: species.system.restricted,
    // A subspecies narrows what its species suggests, so when it names roles of
    // its own those are the ones worth showing.
    roles: (subspecies?.system.roles?.length ? subspecies.system.roles : species.system.roles) ?? [],
    traits: granted.map(trait => ({ id: trait.id, name: trait.name })),
    effects: items.flatMap(speciesEffects),
    sub: subspecies
      ? { id: subspecies.id, name: subspecies.name, restricted: subspecies.system.restricted }
      : null
  };
}

function characterData(actor) {
  const locationLabel = key => {
    const label = actor.system.combat?.hitLocations?.[key]?.label;
    return label ? game.i18n.localize(label) : "";
  };
  return {
    criticals: actor.system.combat?.criticals,
    dodge: specialisationTotal(actor, "reflexes", "Dodge"),
    species: speciesData(actor),
    armour: id => Number(actor.items.get(id)?.system?.armour),
    location: uuid => {
      const item = actor.items.find(i => i.uuid === uuid);
      const key = item?.system?.location?.value;
      return key ? locationLabel(key) : "";
    }
  };
}

/**
 * Actor sheets. The hook fires for every render, including partial re-renders
 * of a single tab; each refit pass marks what it has done, so running twice on
 * the same markup is a no-op, and freshly rendered markup gets the pass again.
 */
/**
 * Advancement.
 *
 * impmal's form hardcodes three English hints and renders the Items tab as
 * disabled inputs. The pass translates the first and makes the second readable
 * and clickable; the actor is taken from the form so a row can open its item.
 */
Hooks.on("renderAdvancementForm", (app, element) => {
  if (!enabled) return;
  const actor = app.document ?? app.object ?? app.actor;
  refitAdvancement(element, labels(), id => actor?.items?.get(id)?.sheet?.render(true));
});

Hooks.on("renderActorSheetV2", (app, element) => {
  if (!enabled || game.system.id !== "impmal") return;
  const actor = app.document;
  // Every actor with a Powers tab gets the warp bar; the stat-block Main tab
  // is the NPC sheet's, the player refit the character sheet's.
  refitWarp(element, warpMemory, actor?.id ?? app.id);
  refitAddEffect(element, labels());
  // Пустые «Заметки ведущего» — те же секции, что и на листе предмета, и вкладка
  // заметок есть у персонажа, НИП, покровителя и машины. Пас общий, поэтому
  // стоит до разбора типа: свернуть пустую секцию нужно на любом листе.
  refitEditorSections(element);
  // Фамильяр из impmal-inquisition — отдельный тип актёра на анкете НИП, так
  // что пас выбирается по разметке, а не по типу. Орда — исключение: это
  // механика НИП, у фамильяра такого поля нет.
  if (usesNpcSheet(element)) {
    refitNpcSheet(element, labels());
    if (actor?.type === "npc") refitHordeRow(element, actor);
  }
  else if (actor?.type === "character") refitCharacterSheet(element, labels(), characterData(actor));
  else if (actor?.type === "vehicle") refitVehicleSheet(element, labels());
});

/**
 * Item sheets. impmal opens every item at a fixed 700px, so a boon with two
 * lines of text is mostly empty window and a long power scrolls. The first
 * render switches the window to Foundry's automatic height: it takes the
 * height of its content and follows it on every re-render and tab change.
 * Resizing the window by hand ends that for the window, because Foundry
 * records the dragged height in place of "auto". The stylesheet caps the
 * height to the screen.
 */
Hooks.on("renderItemSheetV2", (app, element, context, options) => {
  if (!enabled || game.system.id !== "impmal") return;
  refitEditorSections(element);
  if (options?.isFirstRender && app.options.position.height !== "auto") {
    app.options.position.height = "auto";
    app.setPosition({ height: "auto" });
  }
});

/**
 * impmal's character generator is an ApplicationV1, so it fires its own render
 * hook by class name rather than the V2 `renderApplicationV2`. The summary is
 * the only one that needs DOM work; the stage windows are painted by CSS alone.
 */
Hooks.on("renderCharGenIM", (app, html) => {
  if (!enabled || game.system.id !== "impmal") return;
  refitChargen(app, html, labels());
});

// Each stage is its own V1 application, so each fires its own render hook by
// class name. They share one pass; only the strings differ per stage.
for (const stage of ["CharacteristicsStage", "OriginStage", "FactionStage", "RoleStage", "DetailsStage"]) {
  Hooks.on(`render${stage}`, (app, html) => {
    if (!enabled || game.system.id !== "impmal") return;
    refitChargenStage(html, labels());
  });
}
