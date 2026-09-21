import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "../tools/lib/level.mjs";
const T = s => [...String(s ?? "").matchAll(/@UUID\[([^\]]+)\]/g)].map(m => m[1]).join("\n");
const legacy = { core: "impmal-core", inquisition: "impmal-inquisition", requisition: "impmal-requisition", voll: "impmal-voll" };
let checked = 0, bad = 0, exactDiff = 0;
for (const [b, l] of Object.entries(legacy)) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "r-")); fs.cpSync(`packs/navis-${b}-actors`, d, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const { primary, embedded } = partition(await readPack(d)); const byId = new Map(Object.values(embedded).map(x => [x._id, x]));
  const { entries } = await import(`../src/compendium/${l}.actors.reused-items.mjs`);
  for (const a of primary) for (const iid of a.items ?? []) { const i = byId.get(iid); const e = entries[a._id]?.items?.[i?.name]; if (!e?.description) continue; checked++;
    if (T(e.description) !== T(i.system?.notes?.player)) { const sameSet = T(e.description).split("\n").sort().join() === T(i.system?.notes?.player).split("\n").sort().join(); if (sameSet) exactDiff++; else { bad++; if (bad < 4) console.log("MISMATCH", b, a.name, i.name, "\n EN", T(i.system.notes.player), "\n RU", T(e.description)); } } }
}
console.log({ checked, orderOnlyDifferences: exactDiff, targetMismatches: bad });
