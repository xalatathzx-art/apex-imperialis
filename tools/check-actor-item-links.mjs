/**
 * Every link in a translated embedded item must reach what the English reaches.
 *
 * For each NPC's embedded item that the Babele output describes — by the item's
 * _id first, then its name, the order Babele itself uses — the set of @UUID
 * targets in the Russian must equal the set in the English. A missing target is
 * a link the translation dropped; an extra one points somewhere new.
 *
 * Reads copies of the packs, so it is safe with Foundry open. Exits non-zero on
 * any mismatch.
 *
 *   node tools/check-actor-item-links.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readPack, partition } from "./lib/level.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const targets = s => [...String(s ?? "").matchAll(/@UUID\[([^\]]+)\]/g)].map(m => m[1]).sort().join("\n");
let checked = 0;
const bad = [];

for (const book of ["core", "inquisition", "requisition", "voll"]) {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "links-"));
  fs.cpSync(path.join(ROOT, "packs", `navis-${book}-actors`), copy, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const { primary, embedded } = partition(await readPack(copy));
  const byId = new Map(Object.values(embedded).map(doc => [doc._id, doc]));
  const tr = JSON.parse(fs.readFileSync(path.join(ROOT, "compendium", `navis-apexialis.navis-${book}-actors.json`), "utf8")).entries;

  for (const actor of primary) {
    for (const id of actor.items ?? []) {
      const item = byId.get(id);
      const t = tr[actor._id]?.items?.[item?._id] ?? tr[actor._id]?.items?.[item?.name];
      if (!item || !t?.description) continue;
      checked++;
      if (targets(t.description) !== targets(item.system?.notes?.player)) {
        bad.push(`${book}: ${actor.name} › ${item.name} (${item.type})`);
      }
    }
  }
}

console.log(`${checked} translated embedded descriptions checked, ${bad.length} with different link targets`);
for (const line of bad) console.log(`  ${line}`);
process.exitCode = bad.length ? 1 : 0;
