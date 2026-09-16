import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { collectionSummary } from "../tools/dump-installed-pack.mjs";
import { RU } from "../src/lang/ru.mjs";

const root = new URL("../", import.meta.url);
const index = JSON.parse(fs.readFileSync(new URL("src/compendium/packs-index.json", root), "utf8"));

const readTranslation = collection => {
  const target = new URL(`compendium/${collection}.json`, root);
  assert.ok(fs.existsSync(target), `${collection}.json has not been built`);
  return JSON.parse(fs.readFileSync(target, "utf8")).entries;
};

test("Voll inventory contains every official top-level document", () => {
  assert.deepEqual(collectionSummary(index, "impmal-voll"), {
    "impmal-voll.actors": 46,
    "impmal-voll.items": 2,
    "impmal-voll.journals": 7,
    "impmal-voll.tables": 10,
    "impmal-voll.scenes": 1
  });
});

test("Voll inventory includes every journal page, table row, and scene label", () => {
  const journals = Object.values(index["impmal-voll.journals"].entries);
  const tables = Object.values(index["impmal-voll.tables"].entries);
  const scenes = Object.values(index["impmal-voll.scenes"].entries);
  assert.equal(journals.reduce((n, journal) => n + journal.pages.length, 0), 48);
  assert.equal(tables.reduce((n, table) => n + table.rows.length, 0), 78);
  assert.equal(scenes.reduce((n, scene) => n + scene.drawings.length + scene.regions.length, 0), 10);
});

for (const collection of ["actors", "items", "journals", "tables", "scenes"]) {
  test(`Voll ${collection} translation covers every official document ID`, () => {
    const official = Object.keys(index[`impmal-voll.${collection}`].entries).sort();
    const translated = Object.keys(readTranslation(`impmal-voll.${collection}`)).sort();
    assert.deepEqual(translated, official);
  });
}

test("every Voll interface key has a Russian translation", () => {
  const english = JSON.parse(fs.readFileSync(new URL("../impmal-voll/lang/en.json", root), "utf8"));
  assert.deepEqual(Object.keys(english).filter(key => !RU[key]), []);
});

const protectedMarkup = text => {
  const tokens = [...String(text ?? "").matchAll(
    /@(?:UUID|Check|Damage|Corruption|Fear|Table|Reward|Condition|Zone|Test)\[[^\]]*\]|\[\[[^\]]*\]\]|<\/?[a-z][^>]*>/gi
  )].map(match => match[0].replace(/>[^<]*$/, ">"));
  // Russian syntax routinely changes the order of links inside a paragraph.
  // Their targets and multiplicity are protected; HTML order remains exact.
  return {
    html: tokens.filter(token => token.startsWith("<")),
    foundry: tokens.filter(token => !token.startsWith("<")).sort()
  };
};

test("Voll journal translation preserves protected Foundry and HTML markup", () => {
  const translated = readTranslation("impmal-voll.journals");
  const sourceDump = JSON.parse(fs.readFileSync(new URL("tmp/voll-dump.json", root), "utf8"));
  const pages = new Map(Object.values(sourceDump.journal.embedded).map(page => [page._id, page]));
  for (const [journalId, journal] of Object.entries(translated)) {
    for (const [pageId, page] of Object.entries(journal.pages ?? {})) {
      const original = pages.get(pageId)?.text?.content ?? "";
      assert.deepEqual(protectedMarkup(page.text), protectedMarkup(original), `${journalId}/${pageId}`);
    }
  }
});
