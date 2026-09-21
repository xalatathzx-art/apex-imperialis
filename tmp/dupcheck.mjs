import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "../tools/lib/level.mjs";
const CYR = /[А-Яа-яЁё]/;
for (const [pack, out] of [["navis-core-actors"], ["navis-inquisition-actors"], ["navis-requisition-actors"], ["navis-voll-actors"], ["navis-bestiary"]].map(([p]) => [p, `compendium/navis-apexialis.${p}.json`])) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "dc-")); fs.cpSync(`packs/${pack}`, d, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const { primary, embedded } = partition(await readPack(d)); const by = new Map(Object.values(embedded).map(x => [x._id, x]));
  const tr = JSON.parse(fs.readFileSync(out, "utf8")).entries; let dup = 0, bad = [];
  for (const a of primary) { const its = (a.items ?? []).map(i => by.get(i)).filter(Boolean); const cnt = {}; its.forEach(i => cnt[i.name] = (cnt[i.name] ?? 0) + 1);
    for (const i of its) if (cnt[i.name] > 1) { dup++; const e = tr[a._id]?.items?.[i._id]; const nm = e?.name ?? (e ? null : tr[a._id]?.items?.[i.name]?.name); if (!CYR.test(i.name) && !nm) bad.push(`${a.name} › ${i.name} (${i._id})${e ? " [id entry w/o name]" : ""}`); } }
  console.log(pack, "repeated copies", dup, "without Russian name", bad.length, bad.slice(0, 4));
}
