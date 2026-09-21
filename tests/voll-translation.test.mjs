import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { collectionSummary } from "../tools/dump-installed-pack.mjs";
import { RU, OURS } from "../src/lang/ru.mjs";
import os from "node:os";
import path from "node:path";
import { readPack, partition } from "../tools/lib/level.mjs";

const root = new URL("../", import.meta.url);
const index = JSON.parse(fs.readFileSync(new URL("src/compendium/packs-index.json", root), "utf8"));

// The Voll pack was folded into apex-imperialis, so the Babele file the build
// emits is keyed by the consolidated collection, not the official one. The
// inventory assertions still speak in official names, so translate here.
const babeleFile = collection =>
  `apex-imperialis.${collection.replace(/^impmal-([a-z]+)\.(.+)$/, "navis-$1-$2")}`;

const readTranslation = collection => {
  const target = new URL(`compendium/${babeleFile(collection)}.json`, root);
  assert.ok(fs.existsSync(target), `${babeleFile(collection)}.json has not been built`);
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


// The official modules were folded into this one, so their lang/en.json files
// are gone. What survives is their code in official/ and their templates, and
// every localisation key that code still asks for must have Russian.
const usedKeys = files => [...new Set(files.flatMap(file =>
  [...fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8").matchAll(/["'`](IMPMAL\.[A-Za-z0-9_.]+)["'`]/g)].map(m => m[1])
))];

test("every Voll interface key has a Russian translation", () => {
  const keys = usedKeys(["official/voll-initialization.js"]);
  assert.deepEqual(keys.filter(key => !RU[key] && !OURS[key]), []);
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

// The reference is the pack as it ships now, read from a copy so the test runs
// with Foundry open. An old dump of the official module would still carry its
// asset paths, which the consolidation moved under this module.
async function currentPages() {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "voll-journals-"));
  fs.cpSync(new URL("packs/navis-voll-journals", root), copy, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const { embedded } = partition(await readPack(copy));
  return new Map(Object.values(embedded).map(page => [page._id, page]));
}

test("Voll journal translation preserves protected Foundry and HTML markup", async () => {
  const translated = readTranslation("impmal-voll.journals");
  const pages = await currentPages();
  for (const [journalId, journal] of Object.entries(translated)) {
    for (const [pageId, page] of Object.entries(journal.pages ?? {})) {
      const original = pages.get(pageId)?.text?.content ?? "";
      assert.deepEqual(protectedMarkup(page.text), protectedMarkup(original), `${journalId}/${pageId}`);
    }
  }
});
