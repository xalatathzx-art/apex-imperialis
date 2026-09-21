import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "../tools/lib/level.mjs";
const CYR = /[А-Яа-яЁё]/;
const plain = h => String(h ?? "").replace(/<[^>]*>/g, " ").replace(/@\w+\[[^\]]*\](\{[^}]*\})?/g, " ").replace(/\s+/g, " ").trim();
const en = h => { const x = plain(h); return x.length > 1 && !CYR.test(x) && /[A-Za-z]{2,}/.test(x); };
const d = fs.mkdtempSync(path.join(os.tmpdir(), "b-")); fs.cpSync("packs/navis-bestiary", d, { recursive: true, filter: s => !s.endsWith("LOCK") });
const { primary, embedded } = partition(await readPack(d)); const by = new Map(Object.values(embedded).map(x => [x._id, x]));
const tr = JSON.parse(fs.readFileSync("compendium/navis-apexialis.navis-bestiary.json", "utf8")).entries;
const actors = [], items = new Map();
for (const a of primary) {
  const t = tr[a._id] ?? {};
  const need = {};
  if (en(a.name) && !t.name) need.name = a.name;
  if (en(a.system?.notes?.gm) && !t.description) need.gm = a.system.notes.gm;
  if (en(a.system?.notes?.player) && !t.playerNotes) need.player = a.system.notes.player;
  for (const f of ["species", "role", "faction"]) if (en(a.system?.[f]) && !t[f]) need[f] = a.system[f];
  if (Object.keys(need).length) actors.push({ id: a._id, folder: a.folder, ...need });
  const cnt = {}; (a.items ?? []).map(i => by.get(i)).filter(Boolean).forEach(i => cnt[i.name] = (cnt[i.name] ?? 0) + 1);
  for (const i of (a.items ?? []).map(i => by.get(i)).filter(Boolean)) {
    const e = { ...(t.items?.[i.name] ?? {}), ...(t.items?.[i._id] ?? {}) };
    const nName = en(i.name) && !e.name, nDesc = en(i.system?.notes?.player) && !e.description;
    if (!nName && !nDesc) continue;
    const k = `${i.type}|${i.name}|${nDesc ? i.system.notes.player : ""}`;
    if (!items.has(k)) items.set(k, { type: i.type, name: i.name, needName: nName, desc: nDesc ? i.system.notes.player : undefined, actors: [] });
    items.get(k).actors.push({ actor: a._id, actorName: a.name, item: i._id, twin: cnt[i.name] > 1 });
  }
}
fs.writeFileSync("tmp/worklists/E_actors.json", JSON.stringify(actors, null, 1));
fs.writeFileSync("tmp/worklists/E_items.json", JSON.stringify([...items.values()], null, 1));
const fields = {}; for (const a of actors) for (const k of Object.keys(a)) if (!["id", "folder"].includes(k)) fields[k] = (fields[k] ?? 0) + 1;
const iv = [...items.values()];
console.log("actors needing work", actors.length, fields);
console.log("distinct items", iv.length, "names", iv.filter(x => x.needName).length, "descs", iv.filter(x => x.desc).length, "rows", iv.reduce((n, x) => n + x.actors.length, 0), "KB", (JSON.stringify(iv).length / 1024).toFixed(0), "+", (JSON.stringify(actors).length / 1024).toFixed(0));
