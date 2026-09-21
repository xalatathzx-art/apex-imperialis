/**
 * Generate the Navis Items source tree — DoomBC's implants, as
 * `apex-imperialis.implant` documents.
 *
 * Replaces tools/make-augmetics.mjs, which wrote impmal's own `augmetic` type
 * and had nowhere to put a slot, a quality ladder or a mechanics group. The
 * folder scheme, the id scheme and the split between flavour and rules are
 * carried over from it unchanged; everything else is new.
 *
 * Unlike every other generated pack in this module, the content here is in
 * **Russian**. That is deliberate and the user's call: the book's implant
 * descriptions carry most of the flavour of the Mechanicum, and translating
 * them into English to satisfy the module's usual convention would throw that
 * away. Names and rules text are the book's; only the mechanics are converted.
 *
 * Conversion to impmal, decided once and applied everywhere:
 *
 *   ±10 on a d100        → +1 / −1 успех
 *   ±20                  → +2 / −2 успеха
 *   ±30 and beyond       → Преимущество / Помеха
 *   Unnatural (X)        → +5 per two points (Unnatural S (4) = +10 Силы),
 *                          the same scale tools/make-species.mjs uses
 *   FFG Wounds           → ÷4, impmal characters run 9–14 Wounds
 *   AP                   → AP, unchanged
 *   Катушка Потенции     → **Заряд**: a pool whose capacity is the Toughness
 *                          bonus plus the `energy` entries of active implants,
 *                          and which does NOT refill on its own
 *   Haywire, Ноосфера    → prose only. Neither exists in impmal, and inventing
 *                          them would put these items outside the system.
 *
 * Quality tiers are written as **Уровень 1–4** rather than Poor/Comm/Good/Best,
 * because impmal has no quality axis at all and a level reads as what it is:
 * how good this particular implant is. Level 2 is the ordinary article, so an
 * entry only writes the levels that differ from it.
 *
 * Vocabulary follows docs/rules/ru-glossary.md — the Russian core rulebook's
 * own terms, not a translation of the English ones. Средняя (+0) is
 * Challenging; Сложная (−20) is Hard.
 *
 *   node tools/make-implants.mjs && node tools/check-implants.mjs && node tools/build.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { classifyImplant, locationForSlot } from "../module/implants/classify.js";

import { BIONICS } from "./data/implants-bionics.mjs";
import { CYBERNETICS } from "./data/implants-cybernetics.mjs";
import { PSYBERNETICS } from "./data/implants-psybernetics.mjs";
import { SKITARII } from "./data/implants-skitarii.mjs";
import { MECHADENDRITES } from "./data/implants-mechadendrites.mjs";
import { MECHANICUM } from "./data/implants-mechanicum.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/packs/items");

const MODULE_ID = "apex-imperialis";
const IMPLANT_TYPE = "apex-imperialis.implant";
const ICON = "modules/impmal-core/assets/icons/generic.webp";

/**
 * Foundry ids are exactly 16 alphanumeric characters — not 15, not 17. An id of
 * the wrong length fails validation at world launch, is migrated to `_id: null`
 * and takes the whole compendium down with it, silently, until the world will
 * not open. tools/check-implants.mjs asserts the length on every id written
 * here, including the ids generated for mechanics groups and entries.
 *
 *   navisImp    + 8 digits = 16
 *   navisImpFld + 5 digits = 16
 *   navisImpGrp + 5 digits = 16
 *   navisImpEnt + 5 digits = 16
 */
const FOLDERS = [
  { key: "root",         id: "navisImpFld00001", name: "Implants",             parent: null,   color: "#5d6b7a", sort: 100 },
  { key: "bionics",      id: "navisImpFld00002", name: "Бионика",              parent: "root", color: "#6a5a2f", sort: 100 },
  { key: "cybernetics",  id: "navisImpFld00003", name: "Кибернетика",          parent: "root", color: "#3f6b6a", sort: 200 },
  { key: "psybernetics", id: "navisImpFld00004", name: "Псибернетика",         parent: "root", color: "#5a3f7a", sort: 300 },
  { key: "skitarii",     id: "navisImpFld00005", name: "Кибернетика Скитарии", parent: "root", color: "#7a4a2f", sort: 400 },
  { key: "mechadendrites", id: "navisImpFld00006", name: "Мехадендриты",      parent: "root", color: "#4a4a4a", sort: 500 },
  { key: "mechanicum",   id: "navisImpFld00007", name: "Кибернетика Механикум", parent: "root", color: "#8a1f1f", sort: 600 }
];

const FOLDER_ID = Object.fromEntries(FOLDERS.map(f => [f.key, f.id]));

/**
 * Every section's entries, in the order they should sort inside their folder.
 *
 * Task 14 adds cybernetics, mechadendrites, Mechanicum, Skitarii and
 * psybernetics here, each as one data file and one folder. Folders are declared
 * alongside their section rather than up front, so a family that has not been
 * authored yet does not leave an empty folder in the compendium.
 */
const SECTIONS = [
  { folder: "bionics",     category: "bionic",      entries: BIONICS },
  { folder: "cybernetics", category: "cybernetic",  entries: CYBERNETICS },
  { folder: "psybernetics", category: "psybernetic", entries: PSYBERNETICS },
  { folder: "skitarii", category: "skitarii", entries: SKITARII },
  { folder: "mechadendrites", category: "mechadendrite", entries: MECHADENDRITES },
  { folder: "mechanicum", category: "mechanicum", entries: MECHANICUM }
];

/**
 * The book's Rarity number → impmal's four-step availability.
 *
 * impmal's scale cannot express the book's "+1 Rarity per extra Best.Q effect"
 * without hitting its ceiling, which is why `system.rarity` keeps the number
 * as well. R −1 and R 0 both land on Common: the difference between "issued to
 * every dock hand" and "sold on any corner" is not one impmal draws.
 */
const AVAILABILITY = Object.freeze({
  "-1": "common",
  0: "common",
  1: "scarce",
  2: "rare",
  3: "exotic"
});

const availabilityFor = entry =>
  entry.availability ?? AVAILABILITY[String(entry.rarity)] ?? "exotic";

/* ══ EMIT ══════════════════════════════════════════════════════════════════ */

const stats = () => ({
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.348",
  systemId: "impmal",
  systemVersion: "3.3.0"
});

const slug = name =>
  name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

const pad = (n, width) => String(n).padStart(width, "0");

/** navisImp + 8 digits = 16. */
const itemId = index => `navisImp${pad(index + 1, 8)}`;

/**
 * Mechanics ids, derived from the item's index rather than randomly.
 *
 * `system.chosenEffects` keys a player's OR choice off the group id, so an id
 * that changed on every regeneration would silently discard every choice in
 * every world the moment the pack was rebuilt. Deterministic ids mean a
 * regenerated pack is byte-identical unless the data actually changed.
 *
 * The arithmetic supports 999 items, 10 groups each and 10 entries per group,
 * which is comfortably past the six families the module will ever hold.
 */
const groupId = (itemIndex, groupIndex) => `navisImpGrp${pad(itemIndex * 10 + groupIndex, 5)}`;
const entryId = (itemIndex, groupIndex, entryIndex) =>
  `navisImpEnt${pad(itemIndex * 100 + groupIndex * 10 + entryIndex, 5)}`;

/** The quality ladder, as four separate HTML fields. Only the written levels are filled. */
function qualityText(entry) {
  const levels = entry.levels ?? {};
  const out = {};
  for (const level of [1, 2, 3, 4]) out[level] = levels[level] ?? "";
  return out;
}

/**
 * The stored mechanics, with an id on every group and every entry.
 *
 * An entry with no id cannot be picked in an OR group, and a group with no id
 * cannot record that a pick was made — `chosenEffects` is keyed by both. The
 * data files therefore never write ids by hand; they are assigned here.
 */
function mechanics(entry, itemIndex) {
  const groups = Array.isArray(entry.mechanics) ? entry.mechanics : [];

  return groups.map((group, groupIndex) => ({
    id: groupId(itemIndex, groupIndex),
    operator: group.operator === "OR" ? "OR" : "AND",
    entries: (Array.isArray(group.entries) ? group.entries : []).map((item, entryIndex) => ({
      id: entryId(itemIndex, groupIndex, entryIndex),
      ...item
    }))
  }));
}

function itemDocument(entry, section, index) {
  // The classifier is a DEFAULT at authoring time, never a runtime authority:
  // an entry that writes its own slot wins, and the sheet can override both.
  const slot = entry.slot ?? classifyImplant(entry.name, entry.category ?? section.category, "");
  const side = entry.side ?? "";

  return {
    name: entry.name,
    type: IMPLANT_TYPE,
    _id: itemId(index),
    img: entry.img ?? ICON,
    folder: FOLDER_ID[entry.folder ?? section.folder],
    sort: (index + 1) * 100,
    system: {
      notes: {
        player: entry.text ?? "",
        gm: entry.gm ?? ""
      },
      rules: entry.rules ?? "",
      page: entry.page ?? "",
      category: entry.category ?? section.category,

      rarity: entry.rarity ?? null,
      availability: availabilityFor(entry),

      encumbrance: { value: entry.encumbrance ?? 0 },
      cost: entry.cost ?? 0,
      quantity: 1,
      equipped: { value: false, hand: "" },
      slots: { value: entry.slots ?? 0, list: [] },
      traits: { list: [] },

      quality: entry.quality ?? 2,
      qualityText: qualityText(entry),

      slot,
      side,
      location: locationForSlot(slot, side),

      installed: false,
      disabled: false,
      active: true,

      mechanics: mechanics(entry, index),
      chosenEffects: {}
    },
    effects: [],
    flags: {
      [MODULE_ID]: {
        source: "DoomBC_Core",
        generated: "tools/make-implants.mjs",
        reference: entry.page,
        // Read by tools/check-implants.mjs, which lists every prose-only
        // implant by name rather than passing over it silently.
        proseOnly: !!entry.proseOnly
      }
    },
    _stats: stats(),
    ownership: { default: 0 }
  };
}

/* ══ WRITE ═════════════════════════════════════════════════════════════════ */

fs.rmSync(OUT, { recursive: true, force: true });

const folderDir = folder => {
  const chain = [];
  let current = folder;
  while (current) {
    chain.unshift(current.name);
    current = FOLDERS.find(f => f.key === current.parent);
  }
  return path.join(OUT, ...chain);
};

for (const folder of FOLDERS) fs.mkdirSync(folderDir(folder), { recursive: true });

fs.writeFileSync(
  path.join(OUT, "_folders.json"),
  JSON.stringify(
    FOLDERS.map(folder => ({
      _id: folder.id,
      name: folder.name,
      type: "Item",
      folder: folder.parent ? FOLDER_ID[folder.parent] : null,
      description: "",
      color: folder.color,
      sorting: "m",
      sort: folder.sort,
      flags: {},
      _stats: stats()
    })),
    null,
    2
  ) + "\n"
);

let index = 0;
let written = 0;
let proseOnly = 0;

for (const section of SECTIONS) {
  for (const entry of section.entries) {
    const document = itemDocument(entry, section, index);
    const folder = FOLDERS.find(f => f.id === document.folder);
    const file = path.join(folderDir(folder), `${slug(entry.name)}_${document._id}.json`);
    fs.writeFileSync(file, JSON.stringify(document, null, 2) + "\n");
    index++;
    written++;
    if (entry.proseOnly) proseOnly++;
  }
}

console.log(`${written} имплантов записано в src/packs/items (${proseOnly} только текстом)`);
for (const section of SECTIONS) {
  const folder = FOLDERS.find(f => f.key === section.folder);
  console.log(`  ${String(section.entries.length).padStart(3)}  ${folder.name}`);
}
