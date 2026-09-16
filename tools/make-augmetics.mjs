/**
 * Generate the Navis Items source tree — the augmetics DoomBC has and
 * Imperium Maledictum does not.
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
 *   Катушка Потенции     → impmal has no charge economy, so the book's charges
 *                          are introduced under the book's own name, **Заряд**:
 *                          a pool whose capacity is the Toughness bonus and
 *                          which does NOT refill on its own — power systems and
 *                          Electoo inductors refill it, which is what those six
 *                          implants are for. Defined once, in the preamble of
 *                          data/augmetics-mechanicum.mjs, so that the
 *                          techno-miracles can spend that same resource rather
 *                          than a second counter meaning the same thing.
 *   Haywire, Ноосфера    → prose only. Neither exists in impmal, and inventing
 *                          them would put these items outside the system.
 *
 * Quality tiers are written as **Уровень 1–4** rather than Poor/Comm/Good/Best,
 * because impmal has no quality axis at all and a level reads as what it is:
 * how good this particular implant is. Level 2 is the ordinary article, so an
 * entry only prints the levels that differ from it.
 *
 * Vocabulary follows docs/rules/ru-glossary.md — the Russian core rulebook's
 * own terms, not a translation of the English ones. Средняя (+0) is
 * Challenging; Сложная (−20) is Hard.
 *
 *   node tools/make-augmetics.mjs && node tools/build.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BIONICS } from "./data/augmetics-bionics.mjs";
import { CYBERNETICS } from "./data/augmetics-cybernetics.mjs";
import { PSYBERNETICS } from "./data/augmetics-psybernetics.mjs";
import { MECHADENDRITES } from "./data/augmetics-mechadendrites.mjs";
import { SKITARII } from "./data/augmetics-skitarii.mjs";
import { MECHANICUM_CYBERNETICS } from "./data/augmetics-mechanicum.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/packs/items");

const MODULE_ID = "navis-apexialis";
const ICON = "modules/impmal-core/assets/icons/generic.webp";

/**
 * Foundry ids are exactly 16 alphanumeric characters — not 15, not 17. An id of
 * the wrong length fails validation at world launch, is migrated to `_id: null`
 * and takes the whole compendium down with it, silently, until the world will
 * not open. tools/check-augmetics.mjs asserts the length on every id here.
 */
const FOLDERS = [
  { key: "root",        id: "navisAugFld00001", name: "Augmetics",              parent: null,     color: "#5d6b7a", sort: 100 },
  { key: "bionics",     id: "navisAugFld00002", name: "Бионика",                parent: "root",   color: "#6a5a2f", sort: 100 },
  { key: "cybernetics", id: "navisAugFld00003", name: "Кибернетика",            parent: "root",   color: "#4f5a6a", sort: 200 },
  { key: "psyber",      id: "navisAugFld00004", name: "Псибернетика",           parent: "root",   color: "#5a3f6a", sort: 300 },
  { key: "skitarii",    id: "navisAugFld00005", name: "Кибернетика Скитарии",   parent: "root",   color: "#6a4a2f", sort: 400 },
  { key: "mechanicum",  id: "navisAugFld00006", name: "Кибернетика Механикум",  parent: "root",   color: "#7a2f2f", sort: 500 },
  { key: "power",       id: "navisAugFld00007", name: "Энергосистемы",          parent: "mechanicum", color: "#7a3f2f", sort: 100 },
  { key: "focus",       id: "navisAugFld00008", name: "Технофокусы",            parent: "mechanicum", color: "#7a3f2f", sort: 200 },
  { key: "frames",      id: "navisAugFld00009", name: "Фреймы",                 parent: "mechanicum", color: "#7a3f2f", sort: 300 },
  { key: "misc",        id: "navisAugFld00010", name: "Прочие",                 parent: "mechanicum", color: "#7a3f2f", sort: 400 },
  { key: "dendrites",   id: "navisAugFld00011", name: "Мехадендриты",           parent: "root",   color: "#3f5a5a", sort: 600 }
];

const FOLDER_ID = Object.fromEntries(FOLDERS.map(f => [f.key, f.id]));

/** Every section's entries, in the order they should sort inside their folder. */
const SECTIONS = [
  ["bionics", BIONICS],
  ["cybernetics", CYBERNETICS],
  ["psyber", PSYBERNETICS],
  ["skitarii", SKITARII],
  ["mechanicum", MECHANICUM_CYBERNETICS],
  ["dendrites", MECHADENDRITES]
];

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

/** navisAug + 8 digits = 16. */
const itemId = index => `navisAug${String(index + 1).padStart(8, "0")}`;

/**
 * The rules text, assembled from the entry's parts.
 *
 * `text` is the book's description. `rules` is what the implant does in
 * impmal's terms. `levels` is the quality ladder, and only the levels that
 * differ from the ordinary article are printed.
 */
function describe(entry) {
  const parts = [entry.text, entry.rules];

  if (entry.levels && Object.keys(entry.levels).length) {
    const ladder = [1, 2, 3, 4]
      .filter(n => entry.levels[n])
      .map(n => `<p><strong>Уровень ${n}:</strong> ${entry.levels[n]}</p>`)
      .join("");
    parts.push(`<hr>${ladder}`);
  }

  return parts.filter(Boolean).join("");
}

function itemDocument(entry, folderKey, index) {
  return {
    name: entry.name,
    type: "augmetic",
    _id: itemId(index),
    img: entry.img ?? ICON,
    folder: FOLDER_ID[entry.folder ?? folderKey],
    sort: (index + 1) * 100,
    system: {
      notes: {
        player: describe(entry),
        gm: entry.gm ?? ""
      },
      encumbrance: { value: entry.encumbrance ?? 0 },
      cost: entry.cost ?? 0,
      availability: entry.rarity,
      quantity: 1,
      equipped: { value: false, hand: "" },
      slots: { value: entry.slots ?? 0, list: [] },
      traits: { list: [] }
    },
    effects: [],
    flags: {
      [MODULE_ID]: {
        source: "DoomBC_Core",
        generated: "tools/make-augmetics.mjs",
        reference: entry.page
      }
    },
    _stats: stats(),
    ownership: { default: 0 }
  };
}

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

for (const [folderKey, entries] of SECTIONS) {
  for (const entry of entries) {
    const document = itemDocument(entry, folderKey, index);
    const folder = FOLDERS.find(f => f.id === document.folder);
    const file = path.join(folderDir(folder), `${slug(entry.name)}_${document._id}.json`);
    fs.writeFileSync(file, JSON.stringify(document, null, 2) + "\n");
    index++;
    written++;
  }
}

console.log(`${written} имплантов записано в src/packs/items`);
for (const [key, entries] of SECTIONS) {
  const folder = FOLDERS.find(f => f.key === key);
  console.log(`  ${String(entries.length).padStart(3)}  ${folder.name}`);
}
