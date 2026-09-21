/**
 * The source-tree half of tools/fix-pack-icons.mjs.
 *
 * tools/build.mjs rebuilds packs/ from src/packs/ from scratch, so repairing the
 * built packs alone is undone by the next build. This applies the same rewrite
 * to the JSON sources: modules/impmal-core/assets/… → the vendored copy under
 * modules/navis-apexialis/assets/impmal-core/…, plus the three strays that have
 * no source of their own.
 *
 *   node tools/fix-source-icons.mjs [--write]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = path.resolve(ROOT, "..", "..");
const WRITE = process.argv.includes("--write");
const VENDORED = "modules/navis-apexialis/assets/impmal-core/";
const PLACEHOLDER = `${VENDORED}tokens/unknown.webp`;
const EXACT = {
  [`${VENDORED}icons/talent.webp`]: `${VENDORED}icons/generic.webp`,
  "assets/gmTokens/Monster/Geisterhund.png": PLACEHOLDER,
  "modules/impmal-starter-set/assets/tokens/macharian-vigilite.webp": PLACEHOLDER
};

const rewrite = value => {
  const out = value.startsWith("modules/impmal-core/assets/")
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

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".json")) files.push(p);
  }
})(path.join(ROOT, "src", "packs"));

let changed = 0;
const missing = new Set();
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const before = JSON.parse(text);
  const after = mapStrings(before);
  for (const m of JSON.stringify(after).matchAll(/"((?:modules|systems|worlds|assets)\/[^"]*?\.(?:webp|png|jpe?g|svg|gif|webm))"/gi)) {
    if (!fs.existsSync(path.join(DATA, decodeURIComponent(m[1])))) missing.add(m[1]);
  }
  if (JSON.stringify(before) === JSON.stringify(after)) continue;
  changed++;
  if (WRITE) fs.writeFileSync(file, `${JSON.stringify(after, null, 2)}\n`);
}

console.log(`${WRITE ? "Rewrote" : "Would rewrite"} ${changed} of ${files.length} source files.`);
if (missing.size) {
  console.log(`Unresolved after rewrite (${missing.size}):`);
  for (const m of [...missing].sort()) console.log(`  ${m}`);
  process.exitCode = 1;
} else console.log("Every source-referenced asset resolves on disk.");
