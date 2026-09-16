/**
 * The mechanics constructor: `system.mechanics` seen and edited as a form.
 *
 * `system.mechanics` is a list of groups, each `{ id, operator, entries }`,
 * and each entry an object whose useful fields depend on its `kind`. The
 * shape is read back by `mechanics/entries.js` and turned into an Active
 * Effect by `mechanics/apply.js`; nothing here decides what an entry MEANS,
 * only how an author types it.
 *
 * Two rules this file exists to enforce.
 *
 * Every group and every entry is given a `foundry.utils.randomID()` at the
 * moment it is created. `system.chosenEffects` keys a player's OR choice off
 * the group id and the entry id, so an array index would re-point a recorded
 * choice at a different effect the first time an entry above it is deleted.
 * Deleting a group or the entry a choice names therefore also clears the
 * stale choice rather than leaving it dangling.
 *
 * The fields are edited OUT OF BAND, not through the sheet's form: the inputs
 * carry `data-navis-field` and no `name`, and a delegated change listener
 * rewrites the whole array. A named input would submit as
 * `system.mechanics.0.entries.1.value`, which `expandObject` turns into an
 * object keyed "0" rather than an array, and which would carry only the
 * fields that happen to be on screen for the current kind.
 */

import { ENTRY_KINDS, LIVE_KINDS } from "./targets.js";
import { QUALITY_LEVELS, ORDINARY_QUALITY } from "../rules.js";

/** Which controls each kind needs. `key` names the option list it selects from. */
const KIND_FIELDS = Object.freeze({
  characteristic: { key: "characteristics", value: true },
  skill: { key: "skills", value: true },
  armour: { key: "locations", value: true },
  armourAll: { value: true },
  wounds: { value: true },
  criticals: { value: true },
  energy: { value: true },
  speed: { key: "speeds", value: true },
  encumbrance: { key: "encumbrances", value: true },
  trait: { drop: "trait" },
  talent: { drop: "talent" },
  testMod: { value: true, testMod: true },
  script: { script: true }
});

/** Kind key → its label key, in ENTRY_KINDS order so the select reads the same everywhere. */
const KIND_OPTIONS = Object.freeze(Object.fromEntries(
  ENTRY_KINDS.map(kind => [kind, `NAVIS.Implant.Kind.${kind}`])
));

const SPEED_OPTIONS = Object.freeze({
  land: "NAVIS.Implant.Speed.land",
  fly: "NAVIS.Implant.Speed.fly"
});

const ENCUMBRANCE_OPTIONS = Object.freeze({
  overburdened: "NAVIS.Implant.Encumbrance.overburdened",
  restrained: "NAVIS.Implant.Encumbrance.restrained"
});

/** The six real hit locations. impmal's own list leads with "roll", which is not a place. */
export const HIT_LOCATIONS = Object.freeze([
  "head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg"
]);

const ADVANTAGE_OPTIONS = Object.freeze({
  1: "NAVIS.Implant.Mechanics.Advantage",
  0: "NAVIS.Implant.Mechanics.Neutral",
  "-1": "NAVIS.Implant.Mechanics.Disadvantage"
});

/** impmal's own config, narrowed to what a select needs. Empty if the system is absent. */
function systemOptions() {
  const config = game.impmal?.config ?? {};
  const locations = {};
  for (const key of HIT_LOCATIONS) {
    if (config.hitLocations?.[key]) locations[key] = config.hitLocations[key];
  }

  return {
    characteristics: config.characteristics ?? {},
    skills: config.skills ?? {},
    locations
  };
}

const groupsOf = item => foundry.utils.deepClone(item?.system?.mechanics ?? []);
const isLadder = value => !!value && typeof value === "object";

/** A ladder's reading at one level, falling back to the ordinary article. */
function levelValue(value, level) {
  if (!isLadder(value)) return Number(value) || 0;
  const exact = value[level];
  if (Number.isFinite(exact)) return exact;
  return Number(value[ORDINARY_QUALITY]) || 0;
}

/**
 * Everything `templates/item/implant-mechanics.hbs` renders.
 * @param {Item} item an implant
 */
export function mechanicsContext(item) {
  const options = systemOptions();
  const keyLists = {
    characteristics: options.characteristics,
    skills: options.skills,
    locations: options.locations,
    speeds: SPEED_OPTIONS,
    encumbrances: ENCUMBRANCE_OPTIONS
  };

  const groups = groupsOf(item).map(group => {
    const isOr = group.operator === "OR";

    return {
      id: group.id,
      isOr,
      operatorLabel: isOr ? "NAVIS.Implant.Mechanics.Or" : "NAVIS.Implant.Mechanics.And",
      entries: (Array.isArray(group.entries) ? group.entries : []).map(entry => {
        const kind = entry.kind ?? "characteristic";
        const shape = KIND_FIELDS[kind] ?? {};
        const ladder = isLadder(entry.value);

        return {
          id: entry.id,
          groupId: group.id,
          kind,
          live: LIVE_KINDS.includes(kind),

          keyOptions: shape.key ? keyLists[shape.key] : null,
          key: entry.key ?? "",

          hasValue: !!shape.value,
          ladder,
          value: ladder ? "" : (Number(entry.value) || 0),
          levels: QUALITY_LEVELS.map(level => ({
            level,
            value: levelValue(entry.value, level),
            ordinary: level === ORDINARY_QUALITY
          })),

          isDrop: !!shape.drop,
          dropType: shape.drop ?? "",
          sourceUuid: entry.sourceUuid ?? "",
          sourceName: entry.sourceName ?? "",
          sourceImg: entry.sourceImg ?? "",

          isTestMod: !!shape.testMod,
          skill: entry.skill ?? "",
          advantage: String(Math.sign(Number(entry.advantage) || 0)),

          isScript: !!shape.script,
          script: entry.script ?? "",
          throttle: entry.throttle ?? ""
        };
      })
    };
  });

  return {
    groups,
    kindOptions: KIND_OPTIONS,
    skillOptions: options.skills,
    advantageOptions: ADVANTAGE_OPTIONS,
    empty: groups.length === 0
  };
}

/* -------------------------------------------- */
/*  Writing                                     */
/* -------------------------------------------- */

const findGroup = (groups, id) => groups.find(group => group?.id === id);

function findEntry(groups, groupId, entryId) {
  const group = findGroup(groups, groupId);
  if (!group) return null;
  return (group.entries ?? []).find(entry => entry?.id === entryId) ?? null;
}

/** A choice naming a group or an entry that no longer exists is worse than no choice. */
function clearChoice(item, groupId) {
  const chosen = item.system.chosenEffects ?? {};
  if (!(groupId in chosen)) return {};
  return { [`system.chosenEffects.-=${groupId}`]: null };
}

async function write(item, groups, extra = {}) {
  return item.update({ "system.mechanics": groups, ...extra });
}

/** A brand-new AND group with one characteristic entry, so the row is never empty. */
export async function addGroup(item) {
  const groups = groupsOf(item);
  groups.push({ id: foundry.utils.randomID(), operator: "AND", entries: [newEntry()] });
  return write(item, groups);
}

export async function deleteGroup(item, groupId) {
  const groups = groupsOf(item).filter(group => group?.id !== groupId);
  return write(item, groups, clearChoice(item, groupId));
}

export async function toggleOperator(item, groupId) {
  const groups = groupsOf(item);
  const group = findGroup(groups, groupId);
  if (!group) return;

  group.operator = group.operator === "OR" ? "AND" : "OR";
  // An AND group applies everything, so a recorded pick means nothing there;
  // leaving it would quietly come back the next time the group is set to OR.
  const extra = group.operator === "AND" ? clearChoice(item, groupId) : {};
  return write(item, groups, extra);
}

function newEntry() {
  return { id: foundry.utils.randomID(), kind: "characteristic", key: "", value: 0 };
}

export async function addEntry(item, groupId) {
  const groups = groupsOf(item);
  const group = findGroup(groups, groupId);
  if (!group) return;

  group.entries = Array.isArray(group.entries) ? group.entries : [];
  group.entries.push(newEntry());
  return write(item, groups);
}

export async function deleteEntry(item, groupId, entryId) {
  const groups = groupsOf(item);
  const group = findGroup(groups, groupId);
  if (!group) return;

  group.entries = (group.entries ?? []).filter(entry => entry?.id !== entryId);

  const chosen = item.system.chosenEffects ?? {};
  const extra = chosen[groupId] === entryId ? clearChoice(item, groupId) : {};
  return write(item, groups, extra);
}

/**
 * Flip a value between one number and a 1..4 ladder.
 *
 * Turning the ladder on seeds every level with the number that was there, so
 * the entry means exactly what it meant a moment ago; turning it off keeps
 * the ordinary article's reading, which is the level the book prints.
 */
export async function toggleLadder(item, groupId, entryId) {
  const groups = groupsOf(item);
  const entry = findEntry(groups, groupId, entryId);
  if (!entry) return;

  if (isLadder(entry.value)) {
    entry.value = levelValue(entry.value, ORDINARY_QUALITY);
  } else {
    const flat = Number(entry.value) || 0;
    entry.value = Object.fromEntries(QUALITY_LEVELS.map(level => [level, flat]));
  }

  return write(item, groups);
}

/**
 * One field of one entry.
 *
 * Changing the kind drops `key`: a characteristic key is not a skill key, and
 * a stale one would silently target a path that does not exist.
 */
export async function setField(item, { groupId, entryId, field, level, value }) {
  const groups = groupsOf(item);
  const entry = findEntry(groups, groupId, entryId);
  if (!entry) return;

  if (field === "value" && level) {
    if (!isLadder(entry.value)) entry.value = {};
    entry.value[level] = Number(value) || 0;
  } else if (field === "value") {
    entry.value = Number(value) || 0;
  } else if (field === "advantage") {
    entry.advantage = Math.sign(Number(value) || 0);
  } else if (field === "kind") {
    entry.kind = value;
    delete entry.key;
  } else {
    entry[field] = value;
  }

  return write(item, groups);
}

/** A dropped trait or talent, recorded by reference rather than copied. */
export async function setSource(item, groupId, entryId, dropped) {
  const groups = groupsOf(item);
  const entry = findEntry(groups, groupId, entryId);
  if (!entry) return;

  entry.sourceUuid = dropped?.uuid ?? "";
  entry.sourceName = dropped?.name ?? "";
  entry.sourceImg = dropped?.img ?? "";

  return write(item, groups);
}

export async function clearSource(item, groupId, entryId) {
  return setSource(item, groupId, entryId, null);
}
