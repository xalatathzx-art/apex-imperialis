import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { collectionSummary } from "../tools/dump-installed-pack.mjs";
import { RU, OURS } from "../src/lang/ru.mjs";

const index = JSON.parse(fs.readFileSync(new URL("../src/compendium/packs-index.json", import.meta.url), "utf8"));

test("Inquisition Guide inventory contains every official top-level document", () => {
  assert.deepEqual(collectionSummary(index, "impmal-inquisition"), {
    "impmal-inquisition.actors": 46,
    "impmal-inquisition.items": 227,
    "impmal-inquisition.journals": 17,
    "impmal-inquisition.tables": 41
  });
});

test("Inquisition Guide journal inventory includes every embedded page", () => {
  const journals = index["impmal-inquisition.journals"].entries;
  assert.equal(Object.values(journals).reduce((count, journal) => count + journal.pages.length, 0), 137);
});

test("Inquisition Guide item translation covers every official document ID", () => {
  const official = Object.keys(index["impmal-inquisition.items"].entries).sort();
  const translated = Object.keys(JSON.parse(fs.readFileSync(new URL("../compendium/apex-imperialis.navis-inquisition-items.json", import.meta.url), "utf8")).entries).sort();
  assert.equal(official.length, 227);
  assert.deepEqual(translated, official);
});

test("Inquisition Guide table translation covers every official document ID", () => {
  const official = Object.keys(index["impmal-inquisition.tables"].entries).sort();
  const translated = Object.keys(JSON.parse(fs.readFileSync(new URL("../compendium/apex-imperialis.navis-inquisition-tables.json", import.meta.url), "utf8")).entries).sort();
  assert.equal(official.length, 41);
  assert.deepEqual(translated, official);
});

/**
 * Most rows of the Ordo boon, liability, mutation and origin tables are not
 * text but a reference, and the build names them from the items pack. If that
 * wiring breaks, the tables still build — they just go back to English rows —
 * so the count is pinned here.
 */
test("referenced Inquisition table rows are named from the items translation", () => {
  const tables = JSON.parse(fs.readFileSync(new URL("../compendium/apex-imperialis.navis-inquisition-tables.json", import.meta.url), "utf8")).entries;
  const named = Object.values(tables).reduce(
    (count, table) => count + Object.keys(table.results ?? {}).length, 0);
  assert.ok(named >= 191, `only ${named} rows carry a translation`);
});

function flatten(object, prefix = "", result = {}) {
  for (const [key, value] of Object.entries(object)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, full, result);
    else result[full] = value;
  }
  return result;
}


// The official modules were folded into this one, so their lang/en.json files
// are gone. What survives is their code in official/ and their templates, and
// every localisation key that code still asks for must have Russian.
const usedKeys = files => [...new Set(files.flatMap(file =>
  [...fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8").matchAll(/["'`](IMPMAL\.[A-Za-z0-9_.]+)["'`]/g)].map(m => m[1])
))];

test("every Inquisition Guide interface key has a Russian translation", () => {
  const keys = usedKeys([
    "official/inquisition-initialization.js", "official/familiar-model.js", "official/familiar-sheet.js",
    "official/inquisitor-sheet.js", "templates/familiar-header.hbs", "templates/familiar-sheet.hbs",
    "templates/inquisitor-header.hbs"
  ]);
  assert.ok(keys.length > 20, "the vendored Inquisition code should still use its interface keys");
  assert.deepEqual(keys.filter(key => !RU[key] && !OURS[key]), []);
});

test("Babele maps faction and duty notes used by Inquisition Guide", () => {
  const mappings = JSON.parse(fs.readFileSync(new URL("../compendium/mappings.json", import.meta.url), "utf8"));
  assert.equal(mappings.Item.characterNotes, "system.character.notes");
  assert.equal(mappings.Item.patronNotes, "system.patron.notes");
  assert.equal(mappings.Item.powerTarget, "system.target");
});
