/**
 * Build the translation term map: every English term that already has a settled
 * Russian equivalent, extracted from work that has been checked against the
 * Russian edition of the core rulebook.
 *
 * This exists because impmal-requisition has no Russian edition. Translating it
 * means choosing the words, and the only thing keeping those choices honest is
 * what the core-book pass already settled: 725 item names, 57 actors, 87 tables
 * and 883 interface strings. A term that appears in both books must read the
 * same in both, or the supplement and the core book fall out of step on the
 * same table.
 *
 * Sources, in order of authority:
 *   1. src/lang/ru.mjs        — interface terms, matched to the book
 *   2. compendium/*.json      — document names, matched to the book
 *   3. module/config/glossary.js — the trait vocabulary the code itself uses
 *
 * Output:
 *   docs/rules/ru-terms.json  — the flat EN → RU map, for lookup while writing
 *   a report on stdout of terms the supplement needs that the map does not have
 *
 *   node tools/build-glossary.mjs [--gaps <pack prefix>]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, "src/compendium/packs-index.json"), "utf8"));

/** EN → RU, plus where the pair came from so a disputed one can be traced. */
const terms = new Map();

const add = (en, ru, source) => {
  if (!en || !ru || en === ru) return;
  const existing = terms.get(en);
  // First source wins; a later disagreement is worth reporting, not silently
  // overwriting, because it means two parts of the module say different things.
  if (existing && existing.ru !== ru) {
    existing.conflicts ??= [];
    if (!existing.conflicts.some(c => c.ru === ru)) existing.conflicts.push({ ru, source });
    return;
  }
  if (!existing) terms.set(en, { ru, source });
};

/* ── 1. Interface strings ────────────────────────────────────────────── */

const ruSource = fs.readFileSync(path.join(ROOT, "src/lang/ru.mjs"), "utf8");
const enStrings = JSON.parse(
  fs.readFileSync(path.resolve(ROOT, "../../systems/impmal/lang/en.json"), "utf8")
);

for (const match of ruSource.matchAll(/"([\w.]+)":\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)) {
  const [, key, ru] = match;
  const en = enStrings[key];
  // Only single-word and short-phrase keys are vocabulary; a full sentence is
  // prose and belongs to its own context, not to a term map.
  if (!en || en.split(/\s+/).length > 4) continue;
  add(en, ru.replace(/\\"/g, '"'), `lang:${key}`);
}

/* ── 2. Document names ───────────────────────────────────────────────── */

for (const file of fs.readdirSync(path.join(ROOT, "compendium"))) {
  if (!file.endsWith(".json") || file === "mappings.json") continue;
  const collection = file.replace(/\.json$/, "");
  const pack = INDEX[collection];
  if (!pack) continue;
  const { entries } = JSON.parse(fs.readFileSync(path.join(ROOT, "compendium", file), "utf8"));
  for (const [id, translated] of Object.entries(entries)) {
    if (!translated.name) continue;
    const english = pack.entries[id]?.name;
    add(english, translated.name, collection);
  }
}

/* ── 3. The trait vocabulary the code compares against ───────────────── */

const glossaryJs = fs.readFileSync(path.join(ROOT, "module/config/glossary.js"), "utf8");
const traitNames = [...glossaryJs.matchAll(/"([A-Z][A-Za-z '()-]+)"/g)].map(m => m[1]);

const out = {};
for (const [en, { ru }] of [...terms].sort(([a], [b]) => a.localeCompare(b))) out[en] = ru;

fs.mkdirSync(path.join(ROOT, "docs/rules"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/rules/ru-terms.json"), `${JSON.stringify(out, null, 2)}\n`);

const conflicts = [...terms].filter(([, v]) => v.conflicts);

console.log(`${terms.size} terms → docs/rules/ru-terms.json`);
console.log(`  ${traitNames.length} trait names known to the code`);

if (conflicts.length) {
  console.log(`\n${conflicts.length} term(s) translated two different ways — decide and make them agree:\n`);
  for (const [en, v] of conflicts) {
    console.log(`  "${en}"`);
    console.log(`      ${v.ru}   (${v.source})`);
    for (const c of v.conflicts) console.log(`      ${c.ru}   (${c.source})`);
  }
}

/* ── Gaps: what a pack needs that the map does not have ──────────────── */

const gapArg = process.argv.indexOf("--gaps");
if (gapArg !== -1) {
  const prefix = process.argv[gapArg + 1];
  const missing = new Map();
  for (const [collection, pack] of Object.entries(INDEX)) {
    if (!collection.startsWith(prefix)) continue;
    for (const doc of Object.values(pack.entries ?? {})) {
      if (!doc.name || terms.has(doc.name)) continue;
      const key = `${doc.type ?? pack.documentName}`;
      missing.set(key, [...(missing.get(key) ?? []), doc.name]);
    }
  }
  const total = [...missing.values()].reduce((n, list) => n + list.length, 0);
  console.log(`\n${prefix}: ${total} document name(s) with no settled Russian yet`);
  for (const [type, list] of [...missing].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  ${type} (${list.length}):`);
    console.log(`    ${list.sort().join(", ")}`);
  }
}
