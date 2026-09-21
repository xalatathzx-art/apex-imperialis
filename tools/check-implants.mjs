/**
 * Audit the generated implant tree.
 *
 * Every document in src/packs/items is generated, so a mistake in the data
 * tables produces an item that looks fine and is wrong. These are the
 * invariants worth asserting:
 *
 *   - every id is exactly 16 alphanumeric characters — item ids, folder ids,
 *     and the ids generated for every mechanics group and every entry inside
 *     it. Foundry rejects any other length at world launch, migrates the
 *     document to `_id: null` and takes the compendium down with it, silently,
 *     until the world will not open. This check exists because that has
 *     already happened once.
 *   - `slot` is one of the eleven, and `location` is exactly what
 *     `locationForSlot(slot, side)` gives. They are written together and must
 *     stay together: the Surgeon reads the slot, the biomonitor reads the
 *     location, and a disagreement paints an implant into the wrong body.
 *   - the book's rarity is a number and impmal's availability is one of its
 *     four, because the availability test rolls against it.
 *   - at least one quality level carries text. An implant with an empty ladder
 *     renders four blank tabs on the sheet.
 *   - every entry kind is one `targets.js` knows, and no entry is a `script` —
 *     nothing executes one, so one in the pack is a rule that silently does
 *     nothing. `trait` and `talent` used to be listed here too; Task 6 built
 *     the grant machinery they needed, so they are ordinary entries now.
 *   - a `weaponTrait` entry's `traitKey` is one of impmal's 21 weapon traits,
 *     and it carries a `traitValue` only if that trait is one of the eight
 *     that take one — a value on any other trait is dropped silently at
 *     runtime by weapon-profile.js, so the audit is the only place that
 *     catches an author who typed one anyway.
 *   - a `conditionImmunity` entry's `condition` is one of impmal's 14 tiered
 *     conditions.
 *   - a `weapon` entry's `profile` has a name and an `attackType` of `melee`
 *     or `ranged`.
 *   - a `weaponMount` entry has either a `sourceUuid` or `emptySocket: true`.
 *     An unfinished mount that says nothing is exactly the silent-inert case
 *     this audit exists to catch; a declared empty socket is a finished state
 *     the rulebook describes.
 *   - an implant either carries mechanics or is marked prose-only, and every
 *     prose-only implant is LISTED BY NAME rather than passed over. Prose-only
 *     is a legitimate outcome — the book is full of effects impmal cannot
 *     express — but it must be a decision on the page, not an omission.
 *   - the talents `module/implants/test-mods.js` matches by name exist in the
 *     talent pack. They move both implant ceilings; a talent that is not there
 *     is a mechanic that can never fire, and this is the only place that
 *     catches it before the table does.
 *
 *   node tools/check-implants.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SLOTS, locationForSlot } from "../module/implants/classify.js";
import { ENTRY_KINDS } from "../module/implants/mechanics/targets.js";
import { CONDITION_KEYS } from "../module/implants/mechanics/compile.js";
import { WEAPON_TRAITS_WITH_VALUE } from "../module/implants/weapon-profile.js";
import { TALENT_NAMES } from "../module/implants/test-mods.js";
import { IMPLANT_TYPE } from "../module/implants/state.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/packs/items");
const TALENTS = path.join(ROOT, "src/packs/talents");

const MODULE_ID = "apex-imperialis";

/** impmal's own four, plus the empty string it allows and this pack never uses. */
const AVAILABILITY = new Set(["common", "scarce", "rare", "exotic"]);

const SLOT_KEYS = new Set(SLOTS.map(slot => slot.key));
const KNOWN_KINDS = new Set(ENTRY_KINDS);

/**
 * Kinds nothing executes. An entry of this kind is a silent no-op.
 *
 * `trait` and `talent` used to be here too, but Task 6 built the grant
 * machinery (grants.js, grants-apply.js) they always needed, so they moved out.
 * `script` stays: it is decided at roll time and nothing on this cycle runs one.
 */
const UNSUPPORTED_KINDS = new Set(["script"]);

/**
 * impmal's 21 weapon/armour traits, keyed exactly as `traitKey` stores them.
 *
 * Read from `game.impmal.config.weaponArmourTraits` in a running world
 * (systems/impmal/impmal.js), because this audit runs under plain node with no
 * Foundry to import that config from. Kept as a checked list here rather than
 * re-derived at every run: a system update that adds a 22nd trait would need
 * this list refreshed by hand, same as WEAPON_TRAITS_WITH_VALUE already is.
 */
export const WEAPON_TRAIT_KEYS = new Set([
  "blast", "burst", "close", "defensive", "flamer", "heavy", "ineffective",
  "inflict", "loud", "penetrating", "rapidFire", "reach", "reliable", "rend",
  "shield", "spread", "subtle", "supercharge", "thrown", "twohanded", "unstable"
]);

const problems = [];
const fail = message => problems.push(message);

/** Foundry's own rule: exactly 16 alphanumeric characters, no more, no less. */
const ID = /^[A-Za-z0-9]{16}$/;
const checkId = (id, where, what) => {
  if (!ID.test(id ?? "")) {
    fail(`${where}: ${what} id "${id}" is not 16 alphanumeric characters (it is ${String(id ?? "").length})`);
    return false;
  }
  return true;
};

/**
 * The new cycle-B entry kinds, each checked in isolation and pure — no
 * filesystem, no shared state — so a test can hand one entry object in and
 * read the problems back out. `where` is prefixed by the caller, not here.
 */

/** @returns {string[]} problems with a weaponTrait entry, or [] if it is fine. */
export function weaponTraitProblems(entry) {
  const problems = [];
  const key = entry.traitKey;

  if (!WEAPON_TRAIT_KEYS.has(key)) {
    problems.push(`weaponTrait entry "${entry.id}" has traitKey "${key}", which is not one of impmal's 21 weapon traits`);
    return problems;
  }

  const hasTraitValue = entry.traitValue !== undefined && entry.traitValue !== null && entry.traitValue !== "";
  if (hasTraitValue && !WEAPON_TRAITS_WITH_VALUE.includes(key)) {
    problems.push(
      `weaponTrait entry "${entry.id}" carries traitValue "${entry.traitValue}" on trait "${key}", `
      + "which does not take one — weapon-profile.js drops it silently at runtime"
    );
  }

  return problems;
}

/** @returns {string[]} problems with a conditionImmunity entry, or [] if it is fine. */
export function conditionImmunityProblems(entry) {
  if (CONDITION_KEYS.includes(entry.condition)) return [];
  return [`conditionImmunity entry "${entry.id}" has condition "${entry.condition}", which is not one of impmal's tiered conditions`];
}

/** @returns {string[]} problems with a weapon entry, or [] if it is fine. */
export function weaponProblems(entry) {
  const problems = [];
  const profile = entry.profile;

  if (!profile?.name) {
    problems.push(`weapon entry "${entry.id}" has no profile name`);
  }
  if (profile?.attackType !== "melee" && profile?.attackType !== "ranged") {
    problems.push(`weapon entry "${entry.id}" has profile attackType "${profile?.attackType}", expected "melee" or "ranged"`);
  }

  return problems;
}

/** @returns {string[]} problems with a weaponMount entry, or [] if it is fine. */
export function weaponMountProblems(entry) {
  if (entry.sourceUuid || entry.emptySocket === true) return [];
  return [
    `weaponMount entry "${entry.id}" has no sourceUuid and is not marked emptySocket — `
    + "an unfinished mount must say so"
  ];
}

const KIND_PROBLEM_CHECKS = Object.freeze({
  weaponTrait: weaponTraitProblems,
  conditionImmunity: conditionImmunityProblems,
  weapon: weaponProblems,
  weaponMount: weaponMountProblems
});

function documents(dir) {
  const found = [];
  if (!fs.existsSync(dir)) return found;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...documents(full));
    else if (entry.name.endsWith(".json") && entry.name !== "_folders.json") {
      found.push([full, JSON.parse(fs.readFileSync(full, "utf8"))]);
    }
  }
  return found;
}

/**
 * The scan itself, run only when this file is executed directly.
 *
 * Everything above this point is pure and side-effect-free, so
 * tests/implants-audit.test.mjs can import the per-kind checkers without
 * walking src/packs/items or risking a `process.exit(1)` inside the test
 * runner. Guarding the scan behind this check is what makes that safe.
 */
function main() {

/* ── folders ───────────────────────────────────────────────────────────── */

const folders = JSON.parse(fs.readFileSync(path.join(SRC, "_folders.json"), "utf8"));
const folderIds = new Set(folders.map(f => f._id));

for (const folder of folders) {
  checkId(folder._id, "_folders.json", `folder "${folder.name}"`);
  if (folder.folder !== null && !folderIds.has(folder.folder)) {
    fail(`_folders.json: folder "${folder.name}" names parent "${folder.folder}", which does not exist`);
  }
}

/* ── documents ─────────────────────────────────────────────────────────── */

const seen = new Map();
const mechanicsIds = new Map();
const proseOnly = [];

for (const [file, document] of documents(SRC)) {
  const where = path.relative(ROOT, file);
  const system = document.system ?? {};

  if (document.type !== IMPLANT_TYPE) {
    fail(`${where}: type is "${document.type}", expected "${IMPLANT_TYPE}"`);
  }

  checkId(document._id, where, "item");
  if (seen.has(document._id)) fail(`${where}: id "${document._id}" is already used by ${seen.get(document._id)}`);
  seen.set(document._id, where);

  if (!folderIds.has(document.folder)) {
    fail(`${where}: names folder "${document.folder}", which _folders.json does not declare`);
  }

  /* placement */

  if (!SLOT_KEYS.has(system.slot)) {
    fail(`${where}: slot "${system.slot}" is not one of ${[...SLOT_KEYS].join(", ")}`);
  } else {
    const expected = locationForSlot(system.slot, system.side ?? "");
    if (system.location !== expected) {
      fail(`${where}: slot "${system.slot}" + side "${system.side ?? ""}" means location "${expected}", but the item says "${system.location}"`);
    }
  }

  if (!["", "left", "right"].includes(system.side ?? "")) {
    fail(`${where}: side "${system.side}" is not "", "left" or "right"`);
  }

  /* price and provenance */

  if (typeof system.rarity !== "number" || !Number.isFinite(system.rarity)) {
    fail(`${where}: rarity is "${system.rarity}", which is not the book's number`);
  }
  if (!AVAILABILITY.has(system.availability)) {
    fail(`${where}: availability "${system.availability}" is not one of ${[...AVAILABILITY].join(", ")}`);
  }

  if (!document.flags?.[MODULE_ID]?.reference) fail(`${where}: no page reference back to the book`);
  if (!system.page) fail(`${where}: system.page is empty — the sheet shows the reference from there`);

  /* text */

  const flavour = system.notes?.player ?? "";
  if (flavour.trim().length < 80) fail(`${where}: the description is empty or barely there`);
  if (!String(system.rules ?? "").trim()) fail(`${where}: system.rules is empty`);

  const ladder = system.qualityText ?? {};
  const filled = [1, 2, 3, 4].filter(level => String(ladder[level] ?? "").trim());
  if (!filled.length) fail(`${where}: no quality level carries any text`);

  // Quality tiers became levels. A leftover means a half-converted entry.
  const everything = [flavour, system.rules, ...[1, 2, 3, 4].map(n => ladder[n] ?? "")].join(" ");
  const leftover = everything.match(/\b(Poor|Comm|Good|Best)\.Q\b/);
  if (leftover) fail(`${where}: still prints "${leftover[0]}" — quality tiers are written as "Уровень N"`);

  /* mechanics */

  const groups = Array.isArray(system.mechanics) ? system.mechanics : [];
  const isProseOnly = !!document.flags?.[MODULE_ID]?.proseOnly;

  if (!groups.length && !isProseOnly) {
    fail(`${where}: no mechanics and no proseOnly marker — say which it is`);
  }
  if (groups.length && isProseOnly) {
    fail(`${where}: marked proseOnly but carries ${groups.length} mechanics group(s)`);
  }
  if (isProseOnly) proseOnly.push(document.name);

  for (const group of groups) {
    if (checkId(group.id, where, "mechanics group") && mechanicsIds.has(group.id)) {
      fail(`${where}: mechanics group id "${group.id}" is already used by ${mechanicsIds.get(group.id)}`);
    }
    mechanicsIds.set(group.id, where);

    if (!["AND", "OR"].includes(group.operator)) {
      fail(`${where}: mechanics group "${group.id}" has operator "${group.operator}", expected AND or OR`);
    }

    const entries = Array.isArray(group.entries) ? group.entries : [];
    if (!entries.length) fail(`${where}: mechanics group "${group.id}" is empty`);

    for (const entry of entries) {
      if (checkId(entry.id, where, "mechanics entry") && mechanicsIds.has(entry.id)) {
        fail(`${where}: mechanics entry id "${entry.id}" is already used by ${mechanicsIds.get(entry.id)}`);
      }
      mechanicsIds.set(entry.id, where);

      if (!KNOWN_KINDS.has(entry.kind)) {
        fail(`${where}: entry "${entry.id}" has kind "${entry.kind}", which targets.js does not know`);
      }
      if (UNSUPPORTED_KINDS.has(entry.kind)) {
        fail(`${where}: entry "${entry.id}" is a "${entry.kind}" entry, and nothing executes one`);
      }

      const kindCheck = KIND_PROBLEM_CHECKS[entry.kind];
      if (kindCheck) {
        for (const problem of kindCheck(entry)) fail(`${where}: ${problem}`);
      }
    }
  }
}

/* ── the talents the caps depend on ────────────────────────────────────── */

function talentNames(dir) {
  const names = new Set();
  for (const [, document] of documents(dir)) {
    if (document.type === "talent") names.add(String(document.name ?? "").toLowerCase());
  }
  return names;
}

const talents = talentNames(TALENTS);

// Each TALENT_NAMES group is one talent under its aliases in both languages, so
// the pack can only ever hold one of them. Requiring all would fail by design.
for (const [key, aliases] of Object.entries(TALENT_NAMES)) {
  const found = aliases.filter(name => talents.has(String(name).toLowerCase()));
  if (!found.length) {
    fail(
      `src/packs/talents: no talent named ${aliases.map(n => `"${n}"`).join(" or ")}, `
      + `which module/implants/test-mods.js matches for "${key}" — that ceiling can never move`
    );
  }
}

/* ── report ────────────────────────────────────────────────────────────── */

if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(`\n${problems.length} problem${problems.length > 1 ? "s" : ""} found`);
  process.exit(1);
}

console.log(
  `implants: ${seen.size} документов, ${folders.length} папок, ${mechanicsIds.size} идентификаторов механики — `
  + "идентификаторы, слоты, редкость, качество и механика в порядке"
);

if (proseOnly.length) {
  console.log(`\nтолько текстом — ${proseOnly.length} из ${seen.size}, механика в impmal невыразима:`);
  for (const name of proseOnly) console.log(`  • ${name}`);
} else {
  console.log("\nтолько текстом: ни одного");
}

}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
