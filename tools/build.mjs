/**
 * Compile the Apex Imperialis source tree into Foundry LevelDB packs.
 *
 * Inverse of extract.mjs: reads src/packs/<pack>/**.json plus the folder
 * manifest beside them, splits embedded documents back into their own keys the
 * way Foundry stores them, and writes packs/<pack>.
 *
 * Safe to re-run; each pack directory is rebuilt from scratch.
 *
 *   node tools/build.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writePack } from "./lib/level.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PACKS = [
  { dir: "species", pack: "navis-species", primary: "items" },
  { dir: "items", pack: "navis-items", primary: "items" },
  { dir: "talents", pack: "navis-talents", primary: "items" },
  { dir: "bestiary", pack: "navis-bestiary", primary: "actors" },
  { dir: "rules", pack: "navis-rules", primary: "journal" }
];

/** Every .json file under dir, except the folder manifest. */
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
 * Split embedded collections out of a document into their own pack keys.
 *
 * Foundry keeps a parent's embedded documents under sibling keys and leaves
 * only their ids on the parent, so that is what we write back.
 */
function flatten(doc, namespace, idPath, entries) {
  const out = { ...doc };

  for (const collection of ["items", "effects", "pages"]) {
    const children = out[collection];
    if (!Array.isArray(children) || !children.length) continue;

    const documents = children.filter(child => child && typeof child === "object");
    if (!documents.length) continue;

    // The parent keeps ids; each child becomes a key of its own.
    out[collection] = children.map(child => (typeof child === "object" ? child._id : child));
    for (const child of documents) {
      flatten(child, `${namespace}.${collection}`, `${idPath}.${child._id}`, entries);
    }
  }

  entries[`!${namespace}!${idPath}`] = out;
}

const only = process.argv.slice(2);
const selected = only.length ? PACKS.filter(spec => only.includes(spec.dir) || only.includes(spec.pack)) : PACKS;

if (only.length && !selected.length) {
  console.error(`no pack matches ${only.join(", ")}; known: ${PACKS.map(p => p.dir).join(", ")}`);
  process.exit(1);
}

let total = 0;

for (const spec of selected) {
  const dir = path.join(ROOT, "src/packs", spec.dir);
  const entries = {};

  for (const folder of JSON.parse(fs.readFileSync(path.join(dir, "_folders.json"), "utf8"))) {
    entries[`!folders!${folder._id}`] = folder;
  }

  const files = sourceFiles(dir);
  for (const file of files) {
    const doc = JSON.parse(fs.readFileSync(file, "utf8"));
    flatten(doc, spec.primary, doc._id, entries);
  }

  const target = path.join(ROOT, "packs", spec.pack);
  await writePack(target, entries);

  console.log(`${spec.pack}: ${files.length} documents, ${Object.keys(entries).length} keys`);
  total += files.length;
}

console.log(`\n${total} documents compiled into ${selected.length} packs`);
