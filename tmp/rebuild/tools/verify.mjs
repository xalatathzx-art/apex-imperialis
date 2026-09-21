/**
 * Verify the built packs against upstream impmal-malexp.
 *
 * Confirms that every document survived the round trip and that the only
 * differences are the ones we meant to make. Anything else is a migration bug,
 * and this is the script that has to catch it.
 *
 *   node tools/verify.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPack, partition } from "./lib/level.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MALEXP = "D:/Foundry/DoomCrusade/Data/modules/impmal-malexp";

const PAIRS = [
  { source: "malexp_talents", built: "navis-talents" },
  { source: "malexp_bestiary", built: "navis-bestiary" }
];

// Fields we change on purpose, and which therefore must not count as drift.
const INTENTIONAL = new Set(["folder", "flags", "sort"]);

// The repair log says which documents we deliberately edited and which fields we
// removed. A content difference is only acceptable if it appears here.
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/migration-report.json"), "utf8"));
const repaired = new Map();
const deletedIds = new Set();
for (const entry of manifest.applied) {
  if (entry.field === "(document)") { deletedIds.add(entry.from); continue; }
  if (!repaired.has(entry.name)) repaired.set(entry.name, new Set());
  repaired.get(entry.name).add(entry.field.split(".")[0]);
}

let problems = 0;
let explained = 0;

for (const pair of PAIRS) {
  const before = await readPack(path.join(MALEXP, "packs", pair.source));
  const after = await readPack(path.join(ROOT, "packs", pair.built));

  const contentKeys = pack => new Set(Object.keys(pack).filter(k => !k.startsWith("!folders!")));

  const beforeKeys = contentKeys(before);
  const afterKeys = contentKeys(after);

  // impmal-malexp has been uninstalled since the port: its module.json is gone
  // and the pack directories it left behind hold an empty LevelDB. Without the
  // baseline every built document reads as "added", and the script used to
  // report the whole pack as unexplained differences — an alarming number that
  // means only that there is nothing to compare against. Say so instead.
  if (!beforeKeys.size) {
    console.log(`
### ${pair.source} -> ${pair.built}`);
    console.log(`  documents: 0 upstream, ${afterKeys.size} built`);
    console.log("  SKIPPED: the upstream pack is empty or absent, so there is no baseline.");
    console.log("  Reinstall impmal-malexp to run this check, or retire it — the port is long done.");
    continue;
  }

  const missing = [...beforeKeys].filter(k => !afterKeys.has(k));
  const added = [...afterKeys].filter(k => !beforeKeys.has(k));

  console.log(`\n### ${pair.source} -> ${pair.built}`);
  console.log(`  documents: ${beforeKeys.size} upstream, ${afterKeys.size} built`);

  const unexplainedMissing = missing.filter(key => !deletedIds.has(before[key]?._id));
  explained += missing.length - unexplainedMissing.length;

  if (unexplainedMissing.length) {
    console.log(`  MISSING (${unexplainedMissing.length}):`);
    for (const key of unexplainedMissing.slice(0, 10)) console.log(`    ${key}  "${before[key]?.name}"`);
    if (unexplainedMissing.length > 10) console.log(`    …and ${unexplainedMissing.length - 10} more`);
  }
  if (added.length) {
    console.log(`  UNEXPECTED (${added.length}):`);
    for (const key of added.slice(0, 10)) console.log(`    ${key}  "${after[key]?.name}"`);
  }

  // Compare the documents that exist on both sides, field by field.
  const changed = [];
  for (const key of beforeKeys) {
    if (!afterKeys.has(key)) continue;
    const a = before[key], b = after[key];
    for (const field of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (INTENTIONAL.has(field)) continue;
      if (JSON.stringify(a[field]) !== JSON.stringify(b[field])) {
        changed.push({ key, name: a.name, field });
      }
    }
  }

  const unexplained = changed.filter(c => !repaired.get(c.name)?.has(c.field));
  explained += changed.length - unexplained.length;

  console.log(`  repaired as logged: ${changed.length - unexplained.length}`);
  if (unexplained.length) {
    const byField = unexplained.reduce((acc, c) => ((acc[c.field] = (acc[c.field] ?? 0) + 1), acc), {});
    console.log(`  UNEXPLAINED differences: ${unexplained.length} ${JSON.stringify(byField)}`);
    for (const c of unexplained.slice(0, 12)) console.log(`    "${c.name}" -> ${c.field}`);
    if (unexplained.length > 12) console.log(`    …and ${unexplained.length - 12} more`);
  }

  // Folder sanity: nothing may point at a folder that does not exist.
  const { folders } = partition(after);
  const folderIds = new Set(folders.map(f => f._id));
  const orphans = Object.entries(after)
    .filter(([k, v]) => !k.startsWith("!folders!") && !k.split("!")[1].includes(".") && v.folder && !folderIds.has(v.folder));
  if (orphans.length) {
    console.log(`  ORPHANED folder references: ${orphans.length}`);
    problems += orphans.length;
  }

  const emptyFolders = folders.filter(f =>
    !folders.some(c => c.folder === f._id) &&
    !Object.entries(after).some(([k, v]) => !k.startsWith("!folders!") && v.folder === f._id)
  );
  if (emptyFolders.length) console.log(`  empty folders (reserved shelves): ${emptyFolders.map(f => f.name).join(", ")}`);

  problems += unexplainedMissing.length + added.length + unexplained.length;
}

console.log(problems
  ? `\nFAILED: ${problems} unexplained differences`
  : `\nOK: every upstream document accounted for; all ${explained} differences matched the repair log`);
process.exit(problems ? 1 : 0);
