import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "../tools/lib/level.mjs";
const CYR = /[А-Яа-яЁё]/; const plain = h => String(h ?? "").replace(/<[^>]*>/g, " ").replace(/@\w+\[[^\]]*\](\{[^}]*\})?/g, " ").replace(/\s+/g, " ").trim();
const en = h => { const x = plain(h); return x.length > 2 && !CYR.test(x) && /[A-Za-z]{3,}/.test(x); };
const itemTr = {}; for (const b of ["core", "inquisition", "requisition", "voll"]) Object.assign(itemTr, JSON.parse(fs.readFileSync(`compendium/navis-apexialis.navis-${b}-items.json`, "utf8")).entries);
const all = {};
for (const b of ["core", "inquisition", "requisition", "voll"]) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "g-")); fs.cpSync(`packs/navis-${b}-actors`, d, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const { primary, embedded } = partition(await readPack(d)); const byId = new Map(Object.values(embedded).map(x => [x._id, x]));
  const t = JSON.parse(fs.readFileSync(`compendium/navis-apexialis.navis-${b}-actors.json`, "utf8")).entries;
  const rows = [];
  for (const a of primary) for (const iid of a.items ?? []) { const i = byId.get(iid); if (!i) continue;
    const src = i._stats?.compendiumSource?.split(".").pop(); const viaSrc = src && itemTr[src];
    const tr = { ...(t[a._id]?.items?.[i.name] ?? {}), ...(t[a._id]?.items?.[i._id] ?? {}) };
    const needName = en(i.name) && !tr.name && !viaSrc?.name;
    const needDesc = en(i.system?.notes?.player) && !tr.description && !viaSrc?.description;
    if (needName || needDesc) rows.push({ actor: a._id, actorName: a.name, actorRu: t[a._id]?.name, type: i.type, name: i.name, needName, needDesc, desc: needDesc ? i.system.notes.player : undefined });
  }
  all[b] = rows;
  const uniq = new Map(); for (const r of rows) { const k = `${r.type}|${r.name}|${r.desc ?? ""}`; uniq.set(k, (uniq.get(k) ?? 0) + 1); }
  console.log(b.padEnd(12), "rows", rows.length, "names", rows.filter(r => r.needName).length, "descs", rows.filter(r => r.needDesc).length, "distinct(type+name+desc)", uniq.size, "KB", (JSON.stringify(rows).length / 1024).toFixed(0));
}
fs.writeFileSync("tmp/worklists/C_gap.json", JSON.stringify(all, null, 1));
