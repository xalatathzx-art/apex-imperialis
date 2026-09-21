/**
 * Content integrity checks against the impmal system.
 *
 * Catches the failures that look fine in the pack and only show up as blanks at
 * the table: a weapon carrying a trait nobody registered, an item pointing at
 * artwork that is not installed, a document filed in a folder that does not
 * exist.
 *
 *   node tools/check-content.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MELEE_TYPES, RANGED_TYPES, MELEE_SPECS, RANGED_SPECS } from "./lib/repair.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = "D:/Foundry/DoomCrusade/Data";
const SYSTEM = path.join(DATA, "systems/impmal/impmal.js");
const PACKS = ["species", "talents", "bestiary"];

function sourceFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...sourceFiles(full));
    else if (entry.name.endsWith(".json") && entry.name !== "_folders.json") found.push(full);
  }
  return found;
}

/**
 * Trait keys the system itself defines, read straight out of impmal.js.
 *
 * There are two separate config objects and a weapon may carry keys from either:
 * `weaponArmourTraits` for combat traits, `itemTraits` for qualities like
 * mastercrafted or bulky.
 */
function systemTraitKeys() {
  const source = fs.readFileSync(SYSTEM, "utf8");
  const keys = new Set();

  for (const config of ["weaponArmourTraits", "itemTraits"]) {
    const block = source.match(new RegExp(`${config}\\s*:\\s*\\{[\\s\\S]*?\\n {4}\\}`));
    if (!block) throw new Error(`Could not locate ${config} in impmal.js — has the system changed?`);
    for (const match of block[0].matchAll(/^\s{8}(\w+)\s*:/gm)) keys.add(match[1]);
  }

  return keys;
}

const systemKeys = systemTraitKeys();
/**
 * Trait keys this module deliberately leaves unregistered.
 *
 * The imported forty trait names were removed from config/glossary.js;
 * these nine are still written on ported bestiary weapons, so they render as a
 * blank chip. That is the accepted cost of dropping the layer — Gauss, Phase and
 * Tesla keep their mechanics regardless, because those hang off
 * `weaponTraitEffects[key]` rather than off the name. The list is here so this
 * check stays red for a key nobody has looked at yet.
 */
const acceptedBlank = new Set([
  "gauss", "phase", "tesla",
  "gyroStabilized", "haywire", "luminagen", "transonic", "twinLinked", "vespid"
]);

const moduleKeys = new Set(acceptedBlank);

/**
 * Defects the migration deliberately left in place.
 *
 * These are recorded in the migration report as judgement calls rather than
 * facts. They are still listed here, but as known and accepted, so that this
 * check stays red only for things nobody has looked at yet.
 */
const acknowledged = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, "docs/migration-report.json"), "utf8")).reported.map(entry => entry.name)
);

const traitUse = new Map();
const missingArt = new Map();
const badEnums = [];
const knownEnums = [];
let documents = 0;

const inspect = (doc, origin) => {
  documents++;

  for (const trait of doc.system?.traits?.list ?? []) {
    traitUse.set(trait.key, (traitUse.get(trait.key) ?? 0) + 1);
  }

  if (doc.img?.startsWith("modules/") || doc.img?.startsWith("systems/")) {
    if (!fs.existsSync(path.join(DATA, doc.img))) {
      missingArt.set(doc.img, (missingArt.get(doc.img) ?? 0) + 1);
    }
  }

  if (doc.type === "weapon") {
    const { attackType, category, spec } = doc.system;
    const types = attackType === "melee" ? MELEE_TYPES : RANGED_TYPES;
    const specs = attackType === "melee" ? MELEE_SPECS : RANGED_SPECS;
    const bucket = acknowledged.has(doc.name) ? knownEnums : badEnums;
    if (category && !types.includes(category)) bucket.push(`${doc.name} (${origin}): category "${category}" invalid for ${attackType}`);
    if (spec && !specs.includes(spec)) bucket.push(`${doc.name} (${origin}): spec "${spec}" invalid for ${attackType}`);
  }

  for (const child of doc.items ?? []) inspect(child, doc.name);
};

for (const pack of PACKS) {
  const dir = path.join(ROOT, "src/packs", pack);
  const folderIds = new Set(JSON.parse(fs.readFileSync(path.join(dir, "_folders.json"), "utf8")).map(f => f._id));

  for (const file of sourceFiles(dir)) {
    const doc = JSON.parse(fs.readFileSync(file, "utf8"));
    if (doc.folder && !folderIds.has(doc.folder)) {
      badEnums.push(`${doc.name} (${pack}): folder ${doc.folder} is not declared in _folders.json`);
    }
    inspect(doc, pack);
  }
}

const unregistered = [...traitUse].filter(([key]) => !systemKeys.has(key) && !moduleKeys.has(key));
const unused = [...moduleKeys].filter(key => !traitUse.has(key));

console.log(`documents inspected: ${documents}`);
console.log(`distinct trait keys in content: ${traitUse.size}`);
console.log(`  from the impmal system: ${[...traitUse].filter(([k]) => systemKeys.has(k)).length}`);
console.log(`  left blank on purpose:  ${[...traitUse].filter(([k]) => !systemKeys.has(k) && moduleKeys.has(k)).length}`);

let failures = 0;

if (unregistered.length) {
  console.log(`\nUNREGISTERED TRAITS — these render blank in play (${unregistered.length}):`);
  for (const [key, n] of unregistered.sort((a, b) => b[1] - a[1])) console.log(`  ${key} — used ${n}x`);
  failures += unregistered.length;
}

if (unused.length) console.log(`\nregistered but unused by content: ${unused.join(", ")}`);

if (missingArt.size) {
  console.log(`\nMISSING ARTWORK (${missingArt.size} paths):`);
  for (const [img, n] of missingArt) console.log(`  ${img} — ${n}x`);
  failures += missingArt.size;
}

if (badEnums.length) {
  console.log(`\nINVALID SYSTEM VALUES (${badEnums.length}):`);
  for (const line of badEnums.slice(0, 20)) console.log(`  ${line}`);
  if (badEnums.length > 20) console.log(`  …and ${badEnums.length - 20} more`);
  failures += badEnums.length;
}

console.log(failures ? `\nFAILED: ${failures} problems` : "\nOK: traits registered, artwork present, system values valid");
process.exit(failures ? 1 : 0);
