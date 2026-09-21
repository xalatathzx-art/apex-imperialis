/**
 * Repair compendium documents that Foundry refuses to validate.
 *
 * Three faults, all in hand-authored bestiary content:
 *
 *  1. Readable _id values ("ApprentekLeader001", "ATTrait1"). Foundry requires
 *     exactly 16 alphanumeric characters; anything else fails SchemaField
 *     validation, so the document is marked invalid and its sheet will not open.
 *  2. Embedded item keys written as "!actors.items!<childId>" instead of
 *     "!actors.items!<parentId>.<childId>", so the parent cannot find the item.
 *  3. Debris from a Foundry v14 migration that could not finish. Where an actor
 *     had an illegal _id, v14 wrote fresh v14-format children but could not
 *     write the parent, leaving the children with no parent in their key; for
 *     one actor it wrote the parent itself under _id null. The 182 orphans are
 *     an exact name-and-type duplicate of the originals those actors still
 *     carry, and the null actor duplicates a record that survives intact, so
 *     both are removed.
 *
 * An id lives in three places — the document's _id, the LevelDB key that
 * encodes it (plus its parent's id, for an embedded item), and the parent's
 * `items` array. All three move together.
 *
 * Replacements are derived from a hash of the old id, so a re-run is a no-op
 * and an interrupted run can simply be repeated.
 *
 * Usage: node tools/fix-pack-ids.mjs [--write]
 * Foundry must be closed for --write; a dry run reads a copy and is always safe.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ClassicLevel } from "./lib/level.mjs";

const WRITE = process.argv.includes("--write");
const VALID = /^[a-zA-Z0-9]{16}$/;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const EMBED = "!actors.items!";

/** A stable 16-character id derived from the old one, nudged on collision. */
function deriveId(old, taken) {
  for (let salt = 0; salt < 1000; salt++) {
    const digest = crypto.createHash("sha256").update(salt ? `${old}#${salt}` : old).digest();
    let out = "";
    for (let i = 0; i < 16; i++) out += ALPHABET[digest[i] % ALPHABET.length];
    if (!taken.has(out)) return out;
  }
  throw new Error(`could not derive a free id for ${old}`);
}

async function openPack(dir) {
  let source = dir;
  if (!WRITE) {
    source = fs.mkdtempSync(path.join(os.tmpdir(), "navis-ids-"));
    fs.cpSync(dir, source, { recursive: true, force: true, filter: s => !s.endsWith("LOCK") });
  }
  const db = new ClassicLevel(source, { valueEncoding: "json" });
  try {
    await db.open();
  } catch (e) {
    console.error(`${dir}: cannot open (${e.code ?? e.message}). Close Foundry and retry.`);
    process.exit(1);
  }
  return db;
}

let touchedPacks = 0;
let totalOps = 0;
const orphanReport = [];

for (const name of fs.readdirSync("packs")) {
  const dir = path.join("packs", name);
  if (!fs.statSync(dir).isDirectory()) continue;

  const db = await openPack(dir);
  const entries = [];
  const taken = new Set();
  for await (const [key, value] of db.iterator()) {
    entries.push([key, value]);
    if (value?._id) taken.add(value._id);
  }

  // Which actor, if any, claims each embedded item.
  const parentOf = new Map();
  for (const [key, value] of entries) {
    if (!key.startsWith("!actors!")) continue;
    for (const item of value?.items ?? []) parentOf.set(item, value._id);
  }

  const idMap = new Map();
  for (const [, value] of entries) {
    const id = value?._id;
    if (!id || VALID.test(id) || idMap.has(id)) continue;
    const next = deriveId(id, taken);
    taken.add(next);
    idMap.set(id, next);
  }

  const remap = id => idMap.get(id) ?? id;
  const ops = [];
  const pruned = [];

  // v14 wrote these when it could not produce a legal _id. A document whose id
  // is a string is repairable and gets renamed; one with no id at all is the
  // half-written copy and goes.
  const discardedActors = new Set();
  for (const [key, value] of entries) {
    if (!key.startsWith("!actors!")) continue;
    if (typeof value?._id === "string" && value._id) continue;
    discardedActors.add(key);
    for (const item of value?.items ?? []) parentOf.delete(item);
    pruned.push(`${name}: actor ${value?.name ?? key} (_id ${JSON.stringify(value?._id)})`);
  }

  for (const [key, value] of entries) {
    let nextKey = key;

    if (discardedActors.has(key)) {
      ops.push({ type: "del", key });
      continue;
    }

    if (key.startsWith(EMBED)) {
      const tail = key.slice(EMBED.length);
      const [a, b] = tail.includes(".") ? tail.split(".") : [null, tail];
      const child = b;
      const parent = a ?? parentOf.get(child) ?? null;
      if (!parent) {
        pruned.push(`${name}: ${value?.name ?? child} (${value?.type ?? "?"})`);
        ops.push({ type: "del", key });
        continue;
      }
      nextKey = `${EMBED}${remap(parent)}.${remap(child)}`;
    } else {
      const parts = key.split("!");
      parts[parts.length - 1] = remap(parts[parts.length - 1]);
      nextKey = parts.join("!");
    }

    const next = structuredClone(value);
    if (next?._id) next._id = remap(next._id);
    if (Array.isArray(next?.items)) next.items = next.items.map(i => (typeof i === "string" ? remap(i) : i));

    if (nextKey === key && JSON.stringify(next) === JSON.stringify(value)) continue;
    if (nextKey !== key) ops.push({ type: "del", key });
    ops.push({ type: "put", key: nextKey, value: next });
  }

  orphanReport.push(...pruned);

  if (ops.length) {
    touchedPacks++;
    totalOps += ops.filter(o => o.type === "put").length;
    console.log(`${name}: ${idMap.size} invalid ids, ${ops.filter(o => o.type === "put").length} entries rewritten`);
    if (WRITE) await db.batch(ops);
  }
  await db.close();
}

if (orphanReport.length) {
  console.log(`\n${orphanReport.length} unreferenced v14 migration records ${WRITE ? "removed" : "to remove"}:`);
  for (const o of orphanReport.slice(0, 5)) console.log(`   ${o}`);
  if (orphanReport.length > 5) console.log(`   ... +${orphanReport.length - 5}`);
}

console.log(`\n${WRITE ? "Rewrote" : "Would rewrite"} ${totalOps} entries across ${touchedPacks} pack(s).`);
