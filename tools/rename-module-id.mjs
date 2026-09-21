/**
 * Rewrite the module id inside the shipped LevelDB packs.
 *
 * The module was published as `navis-apexialis` up to 0.2.0; its own documents
 * carry Compendium.navis-apexialis.* links in descriptions, journal pages and
 * scripts. The packs Apex Imperialis ships are built from src/packs/ for the
 * five native ones and imported wholesale for the official books, so the
 * imported ones have to be rewritten in place.
 *
 * Reads every pack, replaces the id in every string, and writes the pack back.
 * Re-running is harmless: the old id no longer appears after the first pass.
 *
 *   node tools/rename-module-id.mjs [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPack, writePack } from "./lib/level.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FROM = "navis-apexialis";
const TO = "apex-imperialis";
const dry = process.argv.includes("--dry");

function rewrite(value, stats) {
  if (typeof value === "string") {
    if (!value.includes(FROM)) return value;
    stats.strings++;
    return value.replaceAll(FROM, TO);
  }
  if (Array.isArray(value)) return value.map(v => rewrite(v, stats));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v, stats)]));
}

const packs = fs.readdirSync(path.join(ROOT, "packs"), { withFileTypes: true })
  .filter(e => e.isDirectory()).map(e => e.name);

let total = 0;
for (const name of packs) {
  const dir = path.join(ROOT, "packs", name);
  const entries = await readPack(dir);
  const stats = { strings: 0 };
  const rewritten = Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, rewrite(v, stats)]));
  if (!stats.strings) { console.log(`${name}: clean`); continue; }
  total += stats.strings;
  console.log(`${name}: ${stats.strings} strings`);
  if (!dry) await writePack(dir, rewritten);
}
console.log(`${dry ? "would rewrite" : "rewrote"} ${total} strings across ${packs.length} packs`);
