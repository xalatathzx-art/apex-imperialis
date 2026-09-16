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
import { CONDITION_KEYS } from "./compile.js";
import { QUALITY_LEVELS, ORDINARY_QUALITY } from "../rules.js";
import { WEAPON_TRAITS_WITH_VALUE } from "../weapon-profile.js";

/**
 * Which controls each kind needs. `key` names the option list it selects from.
 *
 * The flags are the SHAPE of the form, not the meaning of the entry: several
 * kinds share `value`, and it is the extra flags beside it that decide which
 * extra row appears and which sentence the folded line gets. A kind that adds
 * nothing but a value needs no flag of its own.
 */
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
  script: { script: true },

  // Cycle B. `attack` is the attack-type narrowing both attack kinds share;
  // only attackMod also spends an advantage, so that is a second flag rather
  // than a consequence of the first.
  attackMod: { value: true, attack: true, advantage: true },
  damageBonus: { value: true, attack: true },
  weaponTrait: { weaponTrait: true },
  damageReduction: { value: true, reduction: true },
  conditionImmunity: { condition: true },
  weapon: { profile: true },
  // A mount IS a drop target — the same machinery trait and talent use, aimed
  // at impmal's own "weapon" item type — but it reads as a socket rather than
  // as a grant, so it says so in its own sentence.
  weaponMount: { drop: "weapon", mount: true }
});

/** Kind key → its label key, in ENTRY_KINDS order so the select reads the same everywhere. */
const KIND_OPTIONS = Object.freeze(Object.fromEntries(
  ENTRY_KINDS.map(kind => [kind, `NAVIS.Implant.Kind.${kind}`])
));

/**
 * The kind picker, grouped by what a kind MEANS rather than by the order the
 * data model happens to list them in.
 *
 * Twenty kinds in one flat list is a list an author reads top to bottom every
 * time; six headed groups of two to five is a list they aim at. The groups
 * are the author's own vocabulary — "what it changes about the body", "what it
 * hands out" — not the implementation's, so `armourAll` sits beside `armour`
 * and `script` beside `trait` and `talent`, which is where an author looks for
 * them.
 *
 * The same reasoning places the cycle B kinds against their meaning rather
 * than their implementation: `damageReduction` and `conditionImmunity` are
 * both live scripts, but an author looking for "takes less damage" looks under
 * Защита, not under whatever produces it; `weaponTrait` sits with the attack
 * kinds it modifies rather than with the weapon entry it is eventually written
 * onto.
 *
 * A kind that is ever added to `ENTRY_KINDS` without being named here would
 * silently vanish from the picker, so `kindGroupsFor` sweeps up the remainder
 * into the last group rather than dropping it.
 */
const KIND_GROUPS = Object.freeze([
  { label: "NAVIS.Implant.Mechanics.KindGroup.Stats", kinds: ["characteristic", "skill"] },
  { label: "NAVIS.Implant.Mechanics.KindGroup.Tests", kinds: ["testMod"] },
  {
    label: "NAVIS.Implant.Mechanics.KindGroup.Attack",
    kinds: ["attackMod", "damageBonus", "weaponTrait"]
  },
  {
    label: "NAVIS.Implant.Mechanics.KindGroup.Defence",
    kinds: ["armour", "armourAll", "damageReduction", "conditionImmunity"]
  },
  {
    label: "NAVIS.Implant.Mechanics.KindGroup.Body",
    kinds: ["wounds", "criticals", "speed", "encumbrance", "energy"]
  },
  {
    label: "NAVIS.Implant.Mechanics.KindGroup.Grants",
    kinds: ["trait", "talent", "weapon", "weaponMount", "script"]
  }
]);

/** The picker as `<optgroup>`s, with the entry's own kind marked selected. */
export function kindGroupsFor(selected) {
  const named = new Set(KIND_GROUPS.flatMap(group => group.kinds));
  const orphans = ENTRY_KINDS.filter(kind => !named.has(kind));

  return KIND_GROUPS.map((group, index) => {
    const kinds = index === KIND_GROUPS.length - 1 ? [...group.kinds, ...orphans] : group.kinds;
    return {
      label: group.label,
      options: kinds.map(kind => ({
        value: kind,
        label: KIND_OPTIONS[kind] ?? kind,
        selected: kind === selected
      }))
    };
  });
}

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

/**
 * An ARRAY, not an object keyed by the stored number.
 *
 * JavaScript orders integer-like keys ascending however they were written, so
 * `{1, 0, "-1"}` would render as "— / Преимущество / Помеха". The book's order
 * runs from the benefit down to the penalty, so the list has to keep the order
 * it is written in. The stored value is still the number 1, 0 or -1.
 */
const ADVANTAGE_OPTIONS = Object.freeze([
  { value: "1", label: "NAVIS.Implant.Mechanics.Advantage" },
  { value: "0", label: "NAVIS.Implant.Mechanics.Neutral" },
  { value: "-1", label: "NAVIS.Implant.Mechanics.Disadvantage" }
]);

/**
 * Which attacks an attack entry narrows to. An ARRAY for the same reason as
 * ADVANTAGE_OPTIONS: the widest case reads first, and "" would sort ahead of
 * nothing if this were an object.
 *
 * The stored value is exactly what compile.js's `attackGuardExpression` tests
 * — "" (no narrowing), "melee" or "ranged" — so an author's choice and the
 * generated guard cannot drift apart.
 */
const ATTACK_TYPE_OPTIONS = Object.freeze([
  { value: "", label: "NAVIS.Implant.Mechanics.AttackAny" },
  { value: "melee", label: "NAVIS.Implant.Mechanics.AttackMelee" },
  { value: "ranged", label: "NAVIS.Implant.Mechanics.AttackRanged" }
]);

/**
 * The 14 tiered conditions as a picker, labelled from impmal's own strings.
 *
 * impmal ships an untiered label for thirteen of them — "IMPMAL.ConditionAblaze"
 * beside the "…Minor"/"…Major" pair — which is the name an author wants here:
 * an immunity is to the condition, not to one of its tiers. `dead` is the one
 * with no such string in impmal's lang file, so it is the one word this module
 * has to translate itself.
 */
const CONDITION_OPTIONS = Object.freeze(Object.fromEntries(CONDITION_KEYS.map(key => [
  key,
  key === "dead"
    ? "NAVIS.Implant.Condition.dead"
    : `IMPMAL.Condition${key[0].toUpperCase()}${key.slice(1)}`
])));

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
    locations,
    // Read from config at render time rather than copied into this file: a
    // system update that adds a trait or a weapon category should reach the
    // author's picker without a change here.
    weaponTraits: config.weaponArmourTraits ?? {}
  };
}

/** The three advantage options in the order they are written, one marked selected. */
function advantageOptionsFor(advantage) {
  const current = String(Math.sign(Number(advantage) || 0));
  return ADVANTAGE_OPTIONS.map(option => ({ ...option, selected: option.value === current }));
}

/** The three attack-type options, one marked selected. Anything unknown reads as "any". */
function attackTypeOptionsFor(attackType) {
  const current = attackType === "melee" || attackType === "ranged" ? attackType : "";
  return ATTACK_TYPE_OPTIONS.map(option => ({ ...option, selected: option.value === current }));
}

/**
 * The weapon profile as a form.
 *
 * Which category and spec lists apply depends on the profile's own attack
 * type, exactly as impmal's weapon sheet decides it: a melee weapon's
 * categories are meleeTypes, a ranged weapon's are rangedTypes, and offering
 * both at once would let an author save a "pistol chainsword". Range is a
 * ranged-only field for the same reason.
 */
function weaponProfileFor(entry) {
  const config = game.impmal?.config ?? {};
  const profile = entry.profile ?? {};
  const damage = profile.damage ?? {};
  const attackType = profile.attackType === "ranged" ? "ranged" : "melee";
  const ranged = attackType === "ranged";

  return {
    name: profile.name ?? "",
    attackType,
    attackTypeOptions: config.weaponTypes ?? {},
    ranged,
    category: profile.category ?? "",
    categoryOptions: (ranged ? config.rangedTypes : config.meleeTypes) ?? {},
    spec: profile.spec ?? "",
    specOptions: (ranged ? config.rangedSpecs : config.meleeSpecs) ?? {},
    range: profile.range ?? "",
    rangeOptions: config.ranges ?? {},
    damageBase: damage.base ?? "",
    damageCharacteristic: damage.characteristic ?? "",
    // The abbreviations, as impmal's own damage row uses: "+ Сил" beside the
    // base, not the characteristic's full name wrapped onto a second line.
    characteristicOptions: config.characteristicAbbrev ?? config.characteristics ?? {},
    damageSL: !!damage.SL,
    damageIgnoreAP: !!damage.ignoreAP
  };
}

const groupsOf = item => foundry.utils.deepClone(item?.system?.mechanics ?? []);
const isLadder = value => !!value && typeof value === "object";

/* -------------------------------------------- */
/*  The one-line summary                        */
/*  (see the density note above `summaryFor`)   */
/* -------------------------------------------- */

const localize = key => game.i18n?.localize?.(key) ?? String(key ?? "");
const format = (key, data) => game.i18n?.format?.(key, data) ?? String(key);

/** A modifier reads as a modifier: the sign is part of the number. */
const signed = n => (n > 0 ? `+${n}` : String(n));

/** A reduction is always a subtraction, whichever sign the author typed. U+2212. */
const reduced = n => `−${Math.abs(n)}`;

/** A number, or a ladder printed as its four readings: "+1/+2/+3/+4". */
function valueText(value, render = signed) {
  if (!isLadder(value)) return render(Number(value) || 0);
  return QUALITY_LEVELS.map(level => render(levelValue(value, level))).join("/");
}

/** Does this entry's value say anything at all? A ladder always does. */
const hasValue = value => isLadder(value) || !!Number(value);

const kindLabelOf = kind => localize(KIND_OPTIONS[kind] ?? kind);

/**
 * The noun the number applies to.
 *
 * A characteristic or a skill names itself — "Выносливость +2" needs no word
 * "Характеристика" in front of it. Every other keyed kind does: "Броня" alone
 * would not say which location, and "Голова" alone would not say armour.
 */
function whatFor(kind, key, keyOptions) {
  const kindLabel = kindLabelOf(kind);
  if (!key || !keyOptions?.[key]) return kindLabel;

  const keyLabel = localize(keyOptions[key]);
  if (kind === "characteristic" || kind === "skill") return keyLabel;
  return format("NAVIS.Implant.Mechanics.Summary.Paren", { a: kindLabel, b: keyLabel });
}

/** "Помеха на Скрытность" — the advantage, the flat modifier, or both. */
function testModSummary(entry, skills) {
  const advantage = Math.sign(Number(entry.advantage) || 0);
  const value = Number(entry.value) || 0;

  const parts = [];
  if (advantage > 0) parts.push(localize("NAVIS.Implant.Mechanics.Advantage"));
  if (advantage < 0) parts.push(localize("NAVIS.Implant.Mechanics.Disadvantage"));
  if (value) parts.push(signed(value));

  const effect = parts.length ? parts.join(" ") : localize("NAVIS.Implant.Mechanics.Summary.Empty");

  // Two sentences, not one with a blank in it: Russian puts the named skill in
  // the accusative after "на" ("Помеха на Скрытность") and "any test" in the
  // prepositional ("Помеха на любой проверке"). Nothing here can decline a
  // label that came out of impmal's config, so each case is its own string and
  // the translator writes the ending.
  if (entry.skill && skills?.[entry.skill]) {
    return format("NAVIS.Implant.Mechanics.Summary.TestMod", {
      effect,
      skill: localize(skills[entry.skill])
    });
  }

  return format("NAVIS.Implant.Mechanics.Summary.TestModAny", { effect });
}

/* ---- the cycle B sentences ---- */

/**
 * "…на атаки ближнего боя".
 *
 * Three whole strings rather than one with the weapon type dropped into it,
 * for the reason `testModSummary` gives at length: Russian declines the phrase
 * after "на", and nothing here can decline a word it was handed. `wideKey` is
 * what an unnarrowed entry reads as — attackMod still says "на атаки", while a
 * damage bonus is already a whole sentence without it.
 */
function narrowedToAttack(effect, attackType, wideKey) {
  if (attackType === "melee") return format("NAVIS.Implant.Mechanics.Summary.AttackMelee", { effect });
  if (attackType === "ranged") return format("NAVIS.Implant.Mechanics.Summary.AttackRanged", { effect });
  return wideKey ? format(wideKey, { effect }) : effect;
}

/** "+2 к успехам, Преимущество" — whichever of the two the entry actually spends. */
function attackModSummary(entry) {
  const parts = [];
  if (hasValue(entry.value)) {
    parts.push(format("NAVIS.Implant.Mechanics.Summary.Successes", { value: valueText(entry.value) }));
  }

  const advantage = Math.sign(Number(entry.advantage) || 0);
  if (advantage > 0) parts.push(localize("NAVIS.Implant.Mechanics.Advantage"));
  if (advantage < 0) parts.push(localize("NAVIS.Implant.Mechanics.Disadvantage"));

  const effect = parts.length ? parts.join(", ") : localize("NAVIS.Implant.Mechanics.Summary.Empty");
  return narrowedToAttack(effect, entry.attackType, "NAVIS.Implant.Mechanics.Summary.AttackAny");
}

function damageBonusSummary(entry) {
  const effect = format("NAVIS.Implant.Mechanics.Summary.DamageBonus", { value: valueText(entry.value) });
  return narrowedToAttack(effect, entry.attackType, null);
}

/** "Оружие: Пробивающее (4)" — the value only when the trait is one that takes one. */
function weaponTraitSummary(entry, traitOptions) {
  const key = entry.traitKey;
  if (!key || !traitOptions?.[key]) {
    return format("NAVIS.Implant.Mechanics.Summary.WeaponTrait", {
      trait: localize("NAVIS.Implant.Mechanics.Summary.None")
    });
  }

  const label = localize(traitOptions[key]);
  const value = entry.traitValue;
  const trait = WEAPON_TRAITS_WITH_VALUE.includes(key) && value !== undefined && value !== null && value !== ""
    ? format("NAVIS.Implant.Mechanics.Summary.Paren", { a: label, b: value })
    : label;

  return format("NAVIS.Implant.Mechanics.Summary.WeaponTrait", { trait });
}

/**
 * What the entry does, in one sentence.
 *
 * The collapsed row has to say enough that an author never opens an entry just
 * to remember what it was, so the summary is built from the SAME fields the
 * open entry edits — kind, key, value or ladder, source, advantage — rather
 * than from a stored description that could drift out of step with them.
 *
 * Built here, not in the template: only this file knows which of an entry's
 * fields the kind makes meaningful, and Handlebars cannot ask.
 */
function summaryFor(entry, kind, shape, keyLists, options) {
  const skills = options.skills;
  if (shape.testMod) return testModSummary(entry, skills);

  // Before the generic `shape.value` branch below: all three of these carry a
  // value, and "Модификатор атаки +2" is not what any of them mean.
  if (shape.attack) return kind === "attackMod" ? attackModSummary(entry) : damageBonusSummary(entry);
  if (shape.weaponTrait) return weaponTraitSummary(entry, options.weaponTraits);

  if (shape.reduction) {
    return format("NAVIS.Implant.Mechanics.Summary.DamageReduction", {
      value: valueText(entry.value, reduced)
    });
  }

  if (shape.condition) {
    const label = CONDITION_OPTIONS[entry.condition];
    return format("NAVIS.Implant.Mechanics.Summary.Immunity", {
      condition: localize(label ?? "NAVIS.Implant.Mechanics.Summary.None")
    });
  }

  // A weapon names itself, so "Оружие: Когти Птераксии" is the grant sentence
  // with the profile's own name where a dropped document's would be.
  if (shape.profile) {
    return format("NAVIS.Implant.Mechanics.Summary.Grant", {
      kind: kindLabelOf(kind),
      name: entry.profile?.name || localize("NAVIS.Implant.Mechanics.Summary.None")
    });
  }

  if (shape.mount) {
    return format("NAVIS.Implant.Mechanics.Summary.Mount", {
      name: entry.sourceName || localize("NAVIS.Implant.Mechanics.Summary.MountEmpty")
    });
  }

  if (shape.drop) {
    return format("NAVIS.Implant.Mechanics.Summary.Grant", {
      kind: kindLabelOf(kind),
      name: entry.sourceName || localize("NAVIS.Implant.Mechanics.Summary.None")
    });
  }

  if (shape.script) {
    const label = kindLabelOf(kind);
    return entry.throttle
      ? format("NAVIS.Implant.Mechanics.Summary.Paren", { a: label, b: entry.throttle })
      : label;
  }

  if (shape.value) {
    const what = whatFor(kind, entry.key, shape.key ? keyLists[shape.key] : null);
    // A ladder is four readings, so it prints as four: "+1/+2/+3/+4".
    return format("NAVIS.Implant.Mechanics.Summary.Value", { what, value: valueText(entry.value) });
  }

  return kindLabelOf(kind);
}

/** A ladder's reading at one level, falling back to the ordinary article. */
function levelValue(value, level) {
  if (!isLadder(value)) return Number(value) || 0;
  const exact = value[level];
  if (Number.isFinite(exact)) return exact;
  return Number(value[ORDINARY_QUALITY]) || 0;
}

/**
 * Everything `templates/item/implant-mechanics.hbs` renders.
 *
 * @param {Item} item an implant
 * @param {Set<string>} [open] the ids of the entries whose fields are unfolded.
 *   Held by the open window rather than by the document: which entry an author
 *   is looking at is a fact about this editing session, and every field change
 *   re-renders the tab, so without it every edit would fold the entry shut
 *   under the author's hands.
 */
export function mechanicsContext(item, open = null) {
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

          summary: summaryFor(entry, kind, shape, keyLists, options),
          open: !!open?.has(entry.id),
          kindGroups: kindGroupsFor(kind),

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
          // An empty socket has to say what fits in it; "предмет" would leave
          // an author dragging a talent onto a weapon mount to find out.
          dropHint: shape.mount ? "NAVIS.Implant.Mechanics.DropWeapon" : "NAVIS.Implant.Mechanics.Drop",
          sourceUuid: entry.sourceUuid ?? "",
          sourceName: entry.sourceName ?? "",
          sourceImg: entry.sourceImg ?? "",

          isTestMod: !!shape.testMod,
          skill: entry.skill ?? "",
          advantageOptions: advantageOptionsFor(entry.advantage),

          isScript: !!shape.script,
          script: entry.script ?? "",
          throttle: entry.throttle ?? "",

          // Which attacks it narrows to, and — attackMod only — the advantage
          // it also spends. `advantageOptions` above is shared with testMod.
          isAttack: !!shape.attack,
          hasAdvantage: !!shape.advantage,
          attackTypeOptions: attackTypeOptionsFor(entry.attackType),

          isWeaponTrait: !!shape.weaponTrait,
          traitOptions: options.weaponTraits,
          traitKey: entry.traitKey ?? "",
          // impmal's eight valued traits and nothing else: a value typed
          // against "Громкое" would be dropped on the floor by
          // weapon-profile.js, so the field is not offered.
          traitHasValue: WEAPON_TRAITS_WITH_VALUE.includes(entry.traitKey),
          traitValue: entry.traitValue ?? "",

          isCondition: !!shape.condition,
          conditionOptions: CONDITION_OPTIONS,
          condition: entry.condition ?? "",

          isProfile: !!shape.profile,
          profile: shape.profile ? weaponProfileFor(entry) : null
        };
      })
    };
  });

  return {
    groups,
    kindOptions: KIND_OPTIONS,
    skillOptions: options.skills,
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

/**
 * A brand-new AND group with one characteristic entry, so the row is never empty.
 * @returns {Promise<string>} the new entry's id, so the caller can unfold it —
 *   a freshly added entry that arrives collapsed says nothing about itself.
 */
export async function addGroup(item) {
  const groups = groupsOf(item);
  const entry = newEntry();
  groups.push({ id: foundry.utils.randomID(), operator: "AND", entries: [entry] });
  await write(item, groups);
  return entry.id;
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

/**
 * One more entry on an existing group.
 * @returns {Promise<string|undefined>} the new entry's id, so the caller can
 *   unfold it — as with `addGroup`, an entry that arrives collapsed says
 *   nothing about itself and the author would have to open it to begin.
 */
export async function addEntry(item, groupId) {
  const groups = groupsOf(item);
  const group = findGroup(groups, groupId);
  if (!group) return;

  group.entries = Array.isArray(group.entries) ? group.entries : [];
  const entry = newEntry();
  group.entries.push(entry);
  await write(item, groups);
  return entry.id;
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
 * a stale one would silently target a path that does not exist. Changing the
 * weapon trait drops `traitValue` for the same reason — carrying a 4 from
 * Пробивающее over to Тяжёлое would quietly make it "Тяжёлое (4)".
 *
 * A `profile.*` field writes into the entry's weapon profile rather than onto
 * the entry: `weapon-profile.js` reads one nested object, and flattening it
 * here would make the constructor and the compiler disagree about the shape.
 */
const PROFILE_PREFIX = "profile.";

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
  } else if (field === "traitKey") {
    entry.traitKey = value;
    delete entry.traitValue;
  } else if (field.startsWith(PROFILE_PREFIX)) {
    entry.profile = entry.profile ?? {};
    const path = field.slice(PROFILE_PREFIX.length);
    foundry.utils.setProperty(entry.profile, path, value);
    // Melee and ranged draw their categories, specs and ranges from different
    // config lists, so a category kept across the switch would be a value no
    // picker on screen can show — a melee weapon silently filed as "болтерное".
    if (path === "attackType") {
      entry.profile.category = "";
      entry.profile.spec = "";
      entry.profile.range = "";
    }
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
