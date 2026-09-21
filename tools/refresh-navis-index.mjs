/**
 * Refresh src/compendium/packs-index.json for Apex Imperialis' own packs.
 *
 * The official packs were indexed from a running world; ours are built here, so
 * they can be indexed straight from packs/. Reads a copy of each pack, so it is
 * safe with Foundry open.
 *
 *   node tools/refresh-navis-index.mjs navis-talents navis-bestiary
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readPack, partition } from "./lib/level.mjs";
import { actorIndex, itemIndex, journalIndex, tableIndex, sceneIndex } from "./dump-installed-pack.mjs";

const INDEX = "src/compendium/packs-index.json";
const manifest = JSON.parse(fs.readFileSync("module.json", "utf8"));
const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));
const BUILD = { Actor: actorIndex, Item: itemIndex, JournalEntry: journalIndex, RollTable: tableIndex, Scene: sceneIndex };

for (const name of process.argv.slice(2)) {
  const def = manifest.packs.find(p => p.name === name);
  if (!def) throw new Error(`no pack ${name} in module.json`);
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "idx-"));
  fs.cpSync(def.path, copy, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const { primary, embedded } = partition(await readPack(copy));
  const key = `apex-imperialis.${name}`;
  index[key] = { label: def.label, documentName: def.type, entries: BUILD[def.type](primary, embedded) };
  console.log(`${key}: ${Object.keys(index[key].entries).length} entries`);
}
fs.writeFileSync(INDEX, `${JSON.stringify(index, null, 2)}\n`);
