/**
 * Repoint compendium artwork at the vendored copies.
 *
 * The consolidation rewrote document UUIDs but left image paths alone, so the
 * module's own packs still point into modules/impmal-core, which no longer
 * exists on disk. Everything they ask for lives under assets/impmal-core now.
 * Two strays reference art that was never ours to vendor; both fall back to the
 * placeholder their pack already uses everywhere else.
 *
 * Usage: node tools/fix-pack-icons.mjs [--write]
 * Foundry must be closed for --write: it holds an exclusive lock on the packs.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ClassicLevel } from "./lib/level.mjs";

const WRITE = process.argv.includes("--write");
const VENDORED = "modules/navis-apexialis/assets/impmal-core/";
const PLACEHOLDER = `${VENDORED}tokens/unknown.webp`;

const EXACT = {
  // impmal-core had a talent icon we never vendored; the other 223 talents in
  // these packs already use generic.webp.
  [`${VENDORED}icons/talent.webp`]: `${VENDORED}icons/generic.webp`,
  // A stray from an unrelated system's token pack, and a starter-set token.
  "assets/gmTokens/Monster/Geisterhund.png": PLACEHOLDER,
  "modules/impmal-starter-set/assets/tokens/macharian-vigilite.webp": PLACEHOLDER
};

const rewrite = value => {
  let out = value.startsWith("modules/impmal-core/assets/")
    ? VENDORED + value.slice("modules/impmal-core/assets/".length)
    : value;
  return EXACT[out] ?? out;
};

const mapStrings = value => {
  if (typeof value === "string") return rewrite(value);
  if (Array.isArray(value)) return value.map(mapStrings);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v)]));
};

const DATA = path.resolve("..", "..");
const missing = new Set();

let totalDocs = 0;
let totalPacks = 0;

for (const name of fs.readdirSync("packs")) {
  const dir = path.join("packs", name);
  if (!fs.statSync(dir).isDirectory()) continue;

  // A running Foundry holds an exclusive lock, so a dry run reads a throwaway
  // copy instead. Only --write needs the real directory.
  let source = dir;
  if (!WRITE) {
    source = fs.mkdtempSync(path.join(os.tmpdir(), "navis-icons-"));
    fs.cpSync(dir, source, { recursive: true, force: true, filter: s => !s.endsWith("LOCK") });
  }

  const db = new ClassicLevel(source, { valueEncoding: "json" });
  try {
    await db.open();
  } catch (e) {
    console.error(`${name}: cannot open (${e.code ?? e.message}). Close Foundry and retry.`);
    process.exit(1);
  }

  const changes = [];
  for await (const [key, value] of db.iterator()) {
    const next = mapStrings(value);
    if (JSON.stringify(value) !== JSON.stringify(next)) changes.push([key, value, next]);
  }

  if (changes.length) {
    totalPacks++;
    totalDocs += changes.length;
    console.log(`${name}: ${changes.length} document${changes.length === 1 ? "" : "s"}`);
    if (WRITE) await db.batch(changes.map(([key, , next]) => ({ type: "put", key, value: next })));
  }

  // Verify every path the pack will hold actually resolves on disk.
  for await (const [, value] of db.iterator()) {
    const check = WRITE ? value : mapStrings(value);
    for (const p of JSON.stringify(check).matchAll(/"((?:modules|systems|worlds|assets)\/[^"]*?\.(?:webp|png|jpe?g|svg|gif|webm))"/gi)) {
      const rel = decodeURIComponent(p[1]);
      if (!fs.existsSync(path.join(DATA, rel))) missing.add(rel);
    }
  }

  await db.close();
}

console.log(`\n${WRITE ? "Rewrote" : "Would rewrite"} ${totalDocs} documents across ${totalPacks} packs.`);
if (missing.size) {
  console.log(`\nStill unresolved (${missing.size}):`);
  for (const m of [...missing].sort()) console.log(`  ${m}`);
  process.exitCode = 1;
} else {
  console.log("Every pack-referenced asset resolves on disk.");
}
