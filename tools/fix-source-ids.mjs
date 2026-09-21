/**
 * Give every bestiary source document a Foundry-legal _id.
 *
 * The packs under packs/ are built from src/packs/, so repairing the built
 * pack alone is undone by the next build. The Necron batch was authored with
 * readable ids ("ApprentekLeader001", "ATTrait1"), which Foundry rejects: it
 * requires exactly 16 alphanumeric characters.
 *
 * Replacements use the same hash derivation as fix-pack-ids.mjs, so the source
 * and the already-repaired pack agree, and --verify checks exactly that.
 *
 * Usage: node tools/fix-source-ids.mjs [--write] [--verify]
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ClassicLevel } from "./lib/level.mjs";

const WRITE = process.argv.includes("--write");
const VERIFY = process.argv.includes("--verify");
const VALID = /^[a-zA-Z0-9]{16}$/;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const ROOT = "src/packs/bestiary";

function deriveId(old, taken) {
  for (let salt = 0; salt < 1000; salt++) {
    const digest = crypto.createHash("sha256").update(salt ? `${old}#${salt}` : old).digest();
    let out = "";
    for (let i = 0; i < 16; i++) out += ALPHABET[digest[i] % ALPHABET.length];
    if (!taken.has(out)) return out;
  }
  throw new Error(`could not derive a free id for ${old}`);
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".json") && e.name !== "_folders.json") files.push(p);
  }
})(ROOT);

// Every id already in use, so a derived one never lands on a live document.
const taken = new Set();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  if (d._id) taken.add(d._id);
  for (const it of d.items ?? []) if (it?._id) taken.add(it._id);
}

let changedFiles = 0;
let changedIds = 0;
let renamed = 0;
const produced = new Set();

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  let touched = false;

  const fix = doc => {
    if (!doc?._id || VALID.test(doc._id)) return;
    const next = deriveId(doc._id, taken);
    taken.add(next);
    doc._id = next;
    produced.add(next);
    changedIds++;
    touched = true;
  };

  fix(d);
  for (const it of d.items ?? []) fix(it);
  if (!touched) continue;

  changedFiles++;
  // The filename carries the id as "<slug>_<id>.json"; keep the two in step.
  const base = path.basename(f, ".json");
  const slug = base.includes("_") ? base.slice(0, base.lastIndexOf("_")) : base;
  const target = path.join(path.dirname(f), `${slug}_${d._id}.json`);

  if (WRITE) {
    fs.writeFileSync(f, `${JSON.stringify(d, null, 2)}\n`);
    if (target !== f) { fs.renameSync(f, target); renamed++; }
  } else if (target !== f) renamed++;
}

console.log(`${WRITE ? "Rewrote" : "Would rewrite"} ${changedIds} ids in ${changedFiles} files (${renamed} renamed).`);

if (VERIFY) {
  const db = new ClassicLevel("packs/navis-bestiary", { valueEncoding: "json" });
  await db.open();
  const inPack = new Set();
  for await (const [, v] of db.iterator()) if (v?._id) inPack.add(v._id);
  await db.close();
  const missing = [...produced].filter(id => !inPack.has(id));
  console.log(`\nDerived ids present in the repaired pack: ${produced.size - missing.length}/${produced.size}`);
  if (missing.length) {
    console.log("Source and pack disagree on:", missing.slice(0, 8));
    process.exitCode = 1;
  } else console.log("Source ids match the repaired pack exactly.");
}
