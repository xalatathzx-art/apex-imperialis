/**
 * Compile the Russian translation into lang/ru.json.
 *
 * Foundry merges translations in the order core → system → modules → world
 * (client/helpers/localization.mjs), so a module file overrides the system's
 * keys. This is how the translation lies on top of impmal without a single
 * change to the system, and why it has to mirror impmal's key structure exactly
 * — including the nesting, which mergeObject walks.
 *
 * The source of truth is src/lang/ru.mjs: one flat map of key to Russian, read
 * against the Russian edition of the core rulebook. See docs/rules/ru-glossary.md.
 *
 * The build reports coverage and refuses to write a file that translates a key
 * impmal does not have, because that is either a typo or a key the system
 * renamed — both of which fail silently at the table.
 *
 *   node tools/build-lang.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { RU, OURS } from "../src/lang/ru.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SYSTEM = path.join(ROOT, "../../systems/impmal/lang/en.json");
const LIB = path.join(ROOT, "../warhammer-lib/lang/en.json");

/**
 * C7's paid modules ship strings of their own — the Inquisition's instincts and
 * xenos weapon types, the faction labels, Departmento Munitorum. They are keys
 * like any other, so they count as a valid English source; they just live
 * outside the system. Any that is not installed simply contributes nothing,
 * which means a key from it then fails the check like a typo would.
 */
const PAID = ["impmal-core", "impmal-inquisition", "impmal-requisition"]
  .map(id => path.join(ROOT, `../${id}/lang/en.json`));
const OUT = path.join(ROOT, "lang/ru.json");

/** Flatten a translation file to dotted keys, the way Foundry looks them up. */
function flatten(object, prefix = "", into = {}) {
  for (const [key, value] of Object.entries(object)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, full, into);
    else into[full] = value;
  }
  return into;
}

const read = file => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {});

const paid = Object.assign({}, ...PAID.map(read));
const english = { ...read(LIB), ...paid, ...read(SYSTEM) };
const flatEnglish = flatten(english);

/**
 * Which top-level keys hold an object in the source. Foundry's mergeObject
 * walks into these, so the output must nest them the same way or the override
 * replaces the whole group and wipes its untranslated members.
 */
const nestedGroups = Object.entries(english)
  .filter(([, value]) => value && typeof value === "object")
  .map(([key]) => key);

const problems = [];
const translated = {};

// The official modules were folded into this one, and the IMPMAL.* strings their
// code still uses now have their English in our own lang/en.json. Those are
// translated in RU like any other impmal key, so they count as a source here.
const ownEnglish = flatten(read(path.join(ROOT, "lang/en.json")));
for (const [key, value] of Object.entries(ownEnglish)) {
  if (key in RU && !(key in flatEnglish)) flatEnglish[key] = value;
}

for (const [key, value] of Object.entries(RU)) {
  if (!(key in flatEnglish)) {
    problems.push(`${key} — not a key impmal, warhammer-lib or an installed C7 module defines`);
    continue;
  }
  if (!value || !value.trim()) {
    problems.push(`${key} — empty translation`);
    continue;
  }
  translated[key] = value;
}

// Ours: keys this module defines itself. There is no English source to check
// them against for typos, but there is one to check them for *coverage*:
// lang/en.json is the module's own English, so a key that lives there and not
// in OURS is a string the Russian table sees in English. That is how the whole
// environment, biomonitor and gravity UI ended up untranslated — the features
// were built, their English went into en.json, and nobody came back here.
for (const [key, value] of Object.entries(OURS)) translated[key] = value;

const untranslatedOwn = Object.keys(ownEnglish).filter(key => !(key in OURS) && !(key in RU));
for (const key of untranslatedOwn) {
  problems.push(`${key} — in lang/en.json but not translated in OURS`);
}

// Rebuild the nesting the source uses.
const output = {};
for (const [key, value] of Object.entries(translated)) {
  const group = nestedGroups.find(g => key.startsWith(`${g}.`));
  if (!group) {
    output[key] = value;
    continue;
  }
  const rest = key.slice(group.length + 1);
  output[group] ??= {};
  foundrySet(output[group], rest, value);
}

function foundrySet(object, dotted, value) {
  const parts = dotted.split(".");
  let cursor = object;
  while (parts.length > 1) {
    const part = parts.shift();
    cursor[part] ??= {};
    cursor = cursor[part];
  }
  cursor[parts[0]] = value;
}

const total = Object.keys(flatEnglish).length;
const done = Object.keys(RU).length;
// A key the system itself leaves blank has nothing to translate.
const missing = Object.keys(flatEnglish).filter(key => !(key in RU) && String(flatEnglish[key]).trim());

console.log(`source strings: ${total} (impmal + warhammer-lib)`);
console.log(`translated:     ${done} (${Math.round((done / total) * 100)}%)`);
console.log(`module's own:   ${Object.keys(OURS).length}`);

if (problems.length) {
  console.error(`\n${problems.length} problems:`);
  for (const problem of problems.slice(0, 20)) console.error(`  ${problem}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);
console.log(`\nwritten ${path.relative(ROOT, OUT)}`);

// The same strings as an ES module, so the runtime can re-apply them over a
// second Russian translation that loads after this one. Foundry merges module
// translations in module order, and the loser is whoever loads first — which
// the install decides, not us. See module/terminology.js.
const TERMS = path.join(ROOT, "lang/ru-terms.mjs");
fs.writeFileSync(
  TERMS,
  `/** Generated by tools/build-lang.mjs — do not edit. */\nexport const RU_TERMS = ${JSON.stringify(output, null, 2)};\n`
);
console.log(`written ${path.relative(ROOT, TERMS)}`);

if (missing.length) {
  fs.writeFileSync(
    path.join(ROOT, "src/lang/untranslated.txt"),
    missing.map(key => `${key}\t${flatEnglish[key]}`).join("\n") + "\n"
  );
  console.log(`${missing.length} still English — listed in src/lang/untranslated.txt`);
} else {
  // Otherwise a list from an earlier run outlives the gaps it describes.
  fs.rmSync(path.join(ROOT, "src/lang/untranslated.txt"), { force: true });
}
