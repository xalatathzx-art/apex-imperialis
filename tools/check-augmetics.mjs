/**
 * Check the generated augmetics tree.
 *
 * Every document in src/packs/items is generated, so a mistake in the data
 * tables produces an item that looks fine and is wrong. These are the
 * invariants worth asserting:
 *
 *   - every id is exactly 16 alphanumeric characters. Foundry rejects any
 *     other length at world launch, migrates the document to `_id: null` and
 *     takes the compendium down with it — silently, until the world will not
 *     open. This check exists because that has already happened once.
 *   - every item names a folder that the manifest actually declares, and every
 *     folder's parent exists;
 *   - ids are unique across the tree;
 *   - the rules text is not empty and the rarity is set;
 *   - no entry still prints Poor.Q / Comm.Q / Good.Q / Best.Q — those became
 *     "Уровень N" and a leftover would be a half-converted entry.
 *
 *   node tools/check-augmetics.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/packs/items");

const MODULE_ID = "navis-apexialis";

const problems = [];
const fail = message => problems.push(message);

/** Foundry's own rule: exactly 16 alphanumeric characters, no more, no less. */
const ID = /^[A-Za-z0-9]{16}$/;
const checkId = (id, where, what) => {
  if (!ID.test(id ?? "")) {
    fail(`${where}: ${what} id "${id}" is not 16 alphanumeric characters (it is ${(id ?? "").length})`);
  }
};

function documents(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...documents(full));
    else if (entry.name.endsWith(".json") && entry.name !== "_folders.json") {
      found.push([full, JSON.parse(fs.readFileSync(full, "utf8"))]);
    }
  }
  return found;
}

const folders = JSON.parse(fs.readFileSync(path.join(SRC, "_folders.json"), "utf8"));
const folderIds = new Set(folders.map(f => f._id));

for (const folder of folders) {
  checkId(folder._id, "_folders.json", `folder "${folder.name}"`);
  if (folder.folder !== null && !folderIds.has(folder.folder)) {
    fail(`_folders.json: folder "${folder.name}" names parent "${folder.folder}", which does not exist`);
  }
}

const seen = new Map();

for (const [file, document] of documents(SRC)) {
  const where = path.relative(ROOT, file);

  if (document.type !== "augmetic") fail(`${where}: type is "${document.type}", expected "augmetic"`);

  checkId(document._id, where, "item");
  if (seen.has(document._id)) fail(`${where}: id "${document._id}" is already used by ${seen.get(document._id)}`);
  seen.set(document._id, where);

  if (!folderIds.has(document.folder)) {
    fail(`${where}: names folder "${document.folder}", which _folders.json does not declare`);
  }

  const text = document.system?.notes?.player ?? "";
  if (text.trim().length < 80) fail(`${where}: the description is empty or barely there`);
  if (!document.system?.availability) fail(`${where}: no rarity set`);

  // Quality tiers became levels. A leftover means a half-converted entry.
  const leftover = text.match(/\b(Poor|Comm|Good|Best)\.Q\b/);
  if (leftover) fail(`${where}: still prints "${leftover[0]}" — quality tiers are written as "Уровень N"`);

  if (!document.flags?.[MODULE_ID]?.reference) fail(`${where}: no page reference back to the book`);
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(`\n${problems.length} problem${problems.length > 1 ? "s" : ""} found`);
  process.exit(1);
}

console.log(`augmetics: ${seen.size} документов, ${folders.length} папок — идентификаторы, папки и тексты в порядке`);
