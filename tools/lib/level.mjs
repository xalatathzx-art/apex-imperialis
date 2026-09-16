/**
 * Locating classic-level.
 *
 * The pack format Foundry uses from v11 on is a LevelDB directory, and the only
 * binding that reads it is classic-level. Rather than vendor a copy or require a
 * network install, we borrow the one that ships inside the Foundry application,
 * which is guaranteed to match the format the packs were written in.
 *
 * Override with NAVIS_CLASSIC_LEVEL if Foundry lives somewhere unusual.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CANDIDATES = [
  process.env.NAVIS_CLASSIC_LEVEL,
  "D:/Foundry/Foundry13/Foundry Virtual Tabletop/resources/app/node_modules/classic-level",
  "D:/Foundry/Foundry14/Foundry Virtual Tabletop/resources/app/node_modules/classic-level",
  "C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level"
].filter(Boolean);

let ClassicLevel;

for (const dir of CANDIDATES) {
  const entry = path.join(dir, "index.js");
  if (!fs.existsSync(entry)) continue;
  ({ ClassicLevel } = await import(pathToFileURL(entry).href));
  break;
}

if (!ClassicLevel) {
  throw new Error(
    "classic-level not found. Set NAVIS_CLASSIC_LEVEL to the classic-level directory " +
    "inside your Foundry install (…/resources/app/node_modules/classic-level). Looked in:\n  " +
    CANDIDATES.join("\n  ")
  );
}

export { ClassicLevel };

/** Read a whole pack into a plain {key: document} map. */
export async function readPack(dir) {
  const db = new ClassicLevel(dir, { valueEncoding: "json" });
  try {
    await db.open();
  } catch (err) {
    if (fs.existsSync(path.join(dir, "LOCK"))) {
      throw new Error(`Cannot open ${dir} — close Foundry first (the pack is locked).`);
    }
    throw err;
  }
  const out = {};
  for await (const [key, value] of db.iterator()) out[key] = value;
  await db.close();
  return out;
}

/** Write a {key: document} map to a pack directory, replacing whatever was there. */
export async function writePack(dir, entries) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const db = new ClassicLevel(dir, { valueEncoding: "json" });
  await db.open();
  const batch = db.batch();
  for (const [key, value] of Object.entries(entries)) batch.put(key, value);
  await batch.write();
  await db.close();
}

/** Split a raw pack map into top-level documents, embedded docs, and folders. */
export function partition(pack) {
  const folders = [];
  const primary = [];
  const embedded = {};
  for (const [key, value] of Object.entries(pack)) {
    if (key.startsWith("!folders!")) folders.push(value);
    else if (key.split("!")[1].includes(".")) embedded[key] = value;
    else primary.push(value);
  }
  return { folders, primary, embedded };
}
