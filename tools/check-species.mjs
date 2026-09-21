/**
 * Check the generated species tree against the system's own vocabulary.
 *
 * Every reference a species makes is resolved here rather than at the table:
 * a trait uuid that points at nothing, a skill key impmal does not have, a
 * subspecies naming a species that was never written. All of those load
 * silently in Foundry and only show up as a missing grant halfway through
 * character creation.
 *
 *   node tools/check-species.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/packs/species");
const TALENTS = path.join(ROOT, "src/packs/talents");

const SPECIES_TYPE = "apex-imperialis.species";
const SUBSPECIES_TYPE = "apex-imperialis.subspecies";
const PACKAGE_TYPES = [SPECIES_TYPE, SUBSPECIES_TYPE];

// Read straight off the system rather than duplicating its enums here.
const SYSTEM = fs.readFileSync(path.join(ROOT, "../../systems/impmal/impmal.js"), "utf8");

/** Pull a flat `key : "LOCALE.Key"` config block out of the system bundle. */
function configKeys(name) {
  const start = SYSTEM.indexOf(`\n    ${name} : {`);
  if (start < 0) throw new Error(`config block ${name} not found in impmal.js`);
  const end = SYSTEM.indexOf("\n    },", start);
  return [...SYSTEM.slice(start, end).matchAll(/^\s{8}(\w+)\s*:/gm)].map(match => match[1]);
}

const SKILLS = configKeys("skills");
const CHARACTERISTICS = configKeys("characteristics");
const SIZES = configKeys("sizes");

function documents(dir) {
  const found = [];
  (function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".json") && entry.name !== "_folders.json") {
        found.push(JSON.parse(fs.readFileSync(full, "utf8")));
      }
    }
  })(dir);
  return found;
}

const all = documents(SRC);
const byId = new Map(all.map(document => [document._id, document]));
const talentIds = new Set(documents(TALENTS).map(document => document._id));
const folderIds = new Set(
  JSON.parse(fs.readFileSync(path.join(SRC, "_folders.json"), "utf8")).map(folder => folder._id)
);

const species = all.filter(document => PACKAGE_TYPES.includes(document.type));
const speciesNames = new Set(
  species.filter(document => document.type === SPECIES_TYPE).map(document => document.name)
);

const problems = [];
const note = (document, message) => problems.push(`${document.name}: ${message}`);

for (const document of all) {
  if (document._id.length !== 16) note(document, `id "${document._id}" is not 16 characters`);
  if (document.folder && !folderIds.has(document.folder)) note(document, `unknown folder ${document.folder}`);
}

for (const document of species) {
  const system = document.system;

  const isSub = document.type === SUBSPECIES_TYPE;

  // A species always has a size; a subspecies leaves it empty unless it moves it.
  if (system.size && !SIZES.includes(system.size)) note(document, `size "${system.size}" is not an impmal size`);
  if (!isSub && !system.size) note(document, "a species must state a size");

  // Ceilings belong to the Species type only.
  if (isSub && system.characteristics.maximums) note(document, "a subspecies must not carry ceilings");
  if (!isSub && !system.characteristics.maximums) note(document, "a species must state its ceilings");

  if (isSub && !system.requires) note(document, "a subspecies must name the species it attaches to");
  if (!isSub && system.requires) note(document, "a species must not name a parent");

  for (const key of Object.keys(system.characteristics.modifiers)) {
    if (!CHARACTERISTICS.includes(key)) note(document, `characteristic "${key}" does not exist`);
  }

  for (const key of system.characteristics.choice.keys) {
    if (!CHARACTERISTICS.includes(key)) note(document, `choice offers "${key}", which does not exist`);
  }

  if (system.characteristics.choice.number > system.characteristics.choice.keys.length) {
    note(document, `asks for ${system.characteristics.choice.number} choices from ${system.characteristics.choice.keys.length} options`);
  }

  for (const key of Object.keys(system.skills ?? {})) {
    if (!SKILLS.includes(key)) note(document, `skill "${key}" does not exist`);
  }

  if (system.requires && !speciesNames.has(system.requires)) {
    note(document, `attaches to "${system.requires}", which is not a species in this pack`);
  }

  for (const list of ["grantedTraits", "specialisations", "equipment"]) {
    for (const entry of system[list].list) {
      const target = byId.get(entry.id);
      if (!target) note(document, `${list} references ${entry.id}, which is not in this pack`);
      else if (target.name !== entry.name) note(document, `${list} calls ${entry.id} "${entry.name}", but it is "${target.name}"`);
    }
  }

  for (const entry of system.talents.list) {
    // Talents come either from this module's pack or, by reference only, from
    // impmal-core. The second kind cannot be resolved from here — that pack is
    // the user's paid content — so only the shape of the reference is checked.
    if (entry.uuid.startsWith("Compendium.impmal-core.")) {
      if (!entry.name) note(document, `grants an impmal-core talent with no name: ${entry.uuid}`);
      continue;
    }
    if (!talentIds.has(entry.id)) note(document, `grants talent ${entry.id}, which is not in the talents pack`);
  }

  // A `removes` entry names a trait by name, so a typo is invisible until the
  // drop quietly takes nothing away.
  for (const name of system.removes ?? []) {
    const parent = species.find(other => other.name === system.requires);
    const granted = (parent?.system.grantedTraits.list ?? []).some(entry => entry.name === name);
    if (!granted) note(document, `removes "${name}", which ${system.requires || "its species"} does not grant`);
  }

  for (const effect of document.effects ?? []) {
    for (const change of effect.changes) {
      if (!change.key.startsWith("system.")) note(document, `effect changes "${change.key}", which is not an actor path`);
      if (change.mode === 2 && !Number.isFinite(Number(change.value))) {
        note(document, `effect adds "${change.value}" to ${change.key}, which is not a number`);
      }
    }
  }
}

// A species everything else is measured against has to exist and be neutral.
const human = species.find(document => document.name === "Human");
if (!human) problems.push("there is no Human species to measure the others against");
else if (Object.values(human.system.characteristics.modifiers).some(value => value !== 0)) {
  problems.push("Human carries characteristic modifiers, so it is no longer the baseline");
}

const plain = species.filter(document => document.type === SPECIES_TYPE).length;
console.log(`${plain} species, ${species.length - plain} subspecies, ${all.length - species.length} granted documents checked`);
console.log(`against ${SKILLS.length} skills, ${CHARACTERISTICS.length} characteristics, ${SIZES.length} sizes`);

if (problems.length) {
  console.error(`\n${problems.length} problems:`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log("every reference resolves");
