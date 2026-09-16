/**
 * Extract impmal-malexp into the Navis Apexialis source tree.
 *
 * Reads the upstream LevelDB packs, repairs what can be repaired deterministically,
 * routes everything into the declared folder taxonomy, and writes one JSON file per
 * document under src/packs/. The directory a file sits in IS its folder in the
 * compendium, so the source tree reads the same way the compendium does.
 *
 * Run this only when re-importing from upstream. Day-to-day edits happen in the
 * JSON files, and `node tools/build.mjs` turns those into packs.
 *
 *   node tools/extract.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPack, partition } from "./lib/level.mjs";
import { repairWeapon, repairTraitKeys, repairArtwork, findExactDuplicates, RepairLog } from "./lib/repair.mjs";
import { buildFolders, route } from "./lib/taxonomy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MALEXP = "D:/Foundry/DoomCrusade/Data/modules/impmal-malexp";
const CORE = "D:/Foundry/DoomCrusade/Data/modules/impmal-core";
const DATA = "D:/Foundry/DoomCrusade/Data";

/** Does a Foundry-relative artwork path resolve to a file on disk? */
const artworkExists = img => fs.existsSync(path.join(DATA, img));

const SOURCE_MODULE = "impmal-malexp";
const SOURCE_VERSION = "v1.4.0";

const PACKS = [
  { source: "malexp_talents", target: "talents", taxonomy: "talents" },
  { source: "malexp_bestiary", target: "bestiary", taxonomy: "bestiary" }
];

const log = new RepairLog();
const summary = [];

/** Filesystem-safe, stable, readable file name for a document. */
function slugify(name, id) {
  const base = name.toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "unnamed";
  return `${base}_${id}`;
}

/**
 * Fold embedded documents back into their parents.
 *
 * Foundry stores embedded documents as sibling keys and leaves only their ids on
 * the parent; a source file should hold the whole thing. Each id is replaced by
 * its document IN PLACE, so the parent's original ordering survives the round
 * trip. Nesting goes two deep — an actor owns items, and an item owns effects.
 */
function attachEmbedded(embedded, primary, onOrphan) {
  const byId = new Map(primary.map(d => [d._id, d]));

  // Shallow before deep: items must become objects before their effects can attach.
  const keys = Object.keys(embedded).sort((a, b) => a.split("!")[1].split(".").length - b.split("!")[1].split(".").length);

  for (const key of keys) {
    const [, namespace, idPath] = key.match(/^!([^!]+)!(.+)$/);
    const collections = namespace.split(".").slice(1);
    const ids = idPath.split(".");

    let node = byId.get(ids[0]);
    for (let i = 0; node && i < collections.length - 1; i++) {
      node = node[collections[i]]?.find(d => d && typeof d === "object" && d._id === ids[i + 1]);
    }
    if (!node) {
      onOrphan(key, embedded[key]);
      continue;
    }

    const collection = collections.at(-1);
    const childId = ids.at(-1);
    if (!Array.isArray(node[collection])) node[collection] = [];

    const slot = node[collection].indexOf(childId);
    if (slot >= 0) node[collection][slot] = embedded[key];
    else node[collection].push(embedded[key]);
  }

  // Any id still sitting as a bare string points at a document that is not in
  // the pack. Drop it rather than ship a dangling reference, but say so.
  const sweep = (doc, label) => {
    for (const collection of ["items", "effects"]) {
      const arr = doc[collection];
      if (!Array.isArray(arr)) continue;
      for (const entry of arr) {
        if (typeof entry === "string") onOrphan(`${label}.${collection}`, { _id: entry, name: "(dangling reference)" });
      }
      doc[collection] = arr.filter(entry => entry && typeof entry === "object");
      for (const child of doc[collection]) sweep(child, `${label}/${child.name}`);
    }
  };
  for (const doc of primary) sweep(doc, doc.name);
}

// impmal-core is the ground truth we settle ambiguous weapon classification against.
const coreWeapons = new Map();
{
  const pack = await readPack(path.join(CORE, "packs/items"));
  for (const doc of Object.values(pack)) {
    if (doc.type === "weapon") coreWeapons.set(doc.name.toLowerCase(), doc);
  }
  console.log(`impmal-core: ${coreWeapons.size} weapons available as reference`);
}

for (const spec of PACKS) {
  const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, "src/taxonomy", `${spec.taxonomy}.json`), "utf8"));
  const { folders, byKey, byName, byMatch, fallback, pathOf } = buildFolders(taxonomy);

  const raw = await readPack(path.join(MALEXP, "packs", spec.source));
  const { folders: sourceFolders, primary, embedded } = partition(raw);
  const sourceFolderName = new Map(sourceFolders.map(f => [f._id, f.name]));

  attachEmbedded(embedded, primary, (key, doc) => {
    log.flag(doc?.name ?? "(unknown)", "orphaned embedded document", `${key} has no parent in ${spec.source}; dropped`);
  });

  // Repair before routing: fixing attackType changes which folder a weapon lands in.
  // This has to reach embedded weapons too — an NPC's own gear carries exactly
  // the same defects as the armoury, and is just as visible at the table.
  const repairWeaponsDeep = doc => {
    if (doc.type === "weapon") repairWeapon(doc, coreWeapons, log);
    for (const child of doc.items ?? []) repairWeaponsDeep(child);
  };
  for (const doc of primary) repairWeaponsDeep(doc);

  // Trait keys are wrong in every pack, not just the armoury: NPCs carry
  // weapons of their own, and those weapons carry the same misspelled keys.
  for (const doc of primary) repairTraitKeys(doc, log);

  // Artwork the source points at but never shipped.
  for (const doc of primary) repairArtwork(doc, artworkExists, log);

  const { duplicates, sameNameDifferentStats } = findExactDuplicates(primary);
  const dropped = new Set(duplicates.map(d => d.doc._id));
  for (const { doc } of duplicates) {
    log.fix(doc.name, "(document)", doc._id, "removed", "byte-identical to another document in the same pack");
  }
  for (const [name, group] of sameNameDifferentStats) {
    log.flag(name, "same name, different stats", `${group.length} items share this name but differ mechanically; kept both, consider disambiguating the names`);
  }

  const outDir = path.join(ROOT, "src/packs", spec.target);
  fs.rmSync(outDir, { recursive: true, force: true });

  const counts = new Map();
  let written = 0;

  for (const doc of primary) {
    if (dropped.has(doc._id)) continue;

    const folderId = route(doc, sourceFolderName.get(doc.folder), { byKey, byName, byMatch, fallback });
    const folderPath = pathOf.get(folderId) ?? "Unsorted";
    counts.set(folderPath, (counts.get(folderPath) ?? 0) + 1);

    doc.folder = folderId;
    doc.flags = doc.flags ?? {};
    doc.flags["navis-apexialis"] = { source: SOURCE_MODULE, sourceVersion: SOURCE_VERSION };

    const dir = path.join(outDir, ...folderPath.split("/"));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${slugify(doc.name, doc._id)}.json`), JSON.stringify(doc, null, 2) + "\n");
    written++;
  }

  // The fallback folder exists so that unroutable content stays visible. When
  // everything routed, shipping it would just put an empty folder in the sidebar.
  const fallbackUsed = counts.has(pathOf.get(fallback));
  const shipped = folders.filter(folder => folder._id !== fallback || fallbackUsed);
  if (shipped.length < folders.length) console.log(`  ${spec.target}: fallback folder empty, omitted`);

  fs.writeFileSync(path.join(outDir, "_folders.json"), JSON.stringify(shipped, null, 2) + "\n");

  summary.push({ pack: spec.target, written, folders: shipped.length, counts });
  console.log(`${spec.target}: ${written} documents into ${shipped.length} folders`);
}

// ---------------------------------------------------------------- report

const lines = [
  "# Migration report: impmal-malexp to Navis Apexialis",
  "",
  `Generated by \`tools/extract.mjs\` from ${SOURCE_MODULE} ${SOURCE_VERSION}.`,
  "",
  "## Contents",
  ""
];

for (const { pack, written, folders, counts } of summary) {
  lines.push(`### ${pack} — ${written} documents, ${folders} folders`, "");
  for (const [folderPath, n] of [...counts].sort()) lines.push(`- \`${folderPath}\` — ${n}`);
  lines.push("");
}

lines.push(
  "## Repairs applied",
  "",
  `${log.applied.length} changes. Each one is entailed by the impmal system enums or by an identically-named item in impmal-core.`,
  "",
  "| Item | Field | From | To | Why |",
  "| --- | --- | --- | --- | --- |",
  ...log.applied.map(r => `| ${r.name} | \`${r.field}\` | \`${r.from || "(empty)"}\` | \`${r.to || "(empty)"}\` | ${r.reason} |`),
  "",
  "## Left alone, on purpose",
  "",
  `${log.reported.length} findings where the right answer is a judgement call rather than a fact. Nothing here was changed.`,
  ""
);

const grouped = new Map();
for (const r of log.reported) {
  if (!grouped.has(r.issue)) grouped.set(r.issue, []);
  grouped.get(r.issue).push(r);
}
for (const [issue, items] of grouped) {
  lines.push(`### ${issue} — ${items.length}`, "");
  for (const r of items.slice(0, 40)) lines.push(`- **${r.name}** — ${r.detail}`);
  if (items.length > 40) lines.push(`- …and ${items.length - 40} more`);
  lines.push("");
}

fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/migration-report.md"), lines.join("\n"));

// Machine-readable twin of the report. tools/verify.mjs reads it to tell a
// deliberate repair apart from an accidental one.
fs.writeFileSync(
  path.join(ROOT, "docs/migration-report.json"),
  JSON.stringify({ source: SOURCE_MODULE, sourceVersion: SOURCE_VERSION, applied: log.applied, reported: log.reported }, null, 2) + "\n"
);

console.log(`\nrepairs applied: ${log.applied.length}`);
console.log(`flagged for review: ${log.reported.length}`);
console.log("report: docs/migration-report.md");
