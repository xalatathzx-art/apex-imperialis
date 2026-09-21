/**
 * What is still English, and the English it needs translating.
 *
 * Reads a copy of every pack (safe with Foundry open), applies what the Babele
 * files already cover, and writes one worklist per stage of
 * docs/superpowers/plans/2026-09-21-translation-completion.md to
 * tmp/worklists/. The printed counts double as the static leak audit: a stage
 * is done when its line reads 0.
 *
 * It is conservative about embedded items: an actor's item that carries a
 * compendium source is left to Babele, which follows the source to the item
 * pack's translation. The live audit in Foundry is the final word.
 *
 *   node tools/translation-worklist.mjs
 */
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "./lib/level.mjs";
const read = async name => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "wl-")); fs.cpSync(`packs/${name}`, d, { recursive: true, filter: s => !s.endsWith("LOCK") }); return partition(await readPack(d)); };
const tr = n => { const f = `compendium/navis-apexialis.${n}.json`; return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")).entries : {}; };
const CYR = /[А-Яа-яЁё]/;
const plain = h => String(h ?? "").replace(/<[^>]*>/g, " ").replace(/@\w+\[[^\]]*\](\{[^}]*\})?/g, " ").replace(/\s+/g, " ").trim();
const en = h => { const t = plain(h); return t.length > 2 && !CYR.test(t) && /[A-Za-z]{3,}/.test(t); };
const out = {}; const size = o => JSON.stringify(o).length;

// A: core-items descriptions
{ const { primary } = await read("navis-core-items"); const t = tr("navis-core-items");
  out.A_coreItemDescriptions = primary.filter(d => en(d.system?.notes?.player) && !t[d._id]?.description).map(d => ({ id: d._id, type: d.type, name: d.name, ru: t[d._id]?.name, player: d.system.notes.player, gm: d.system?.notes?.gm || undefined })); }
// B: voll actors player notes, core actors descriptions
{ const { primary } = await read("navis-voll-actors"); const t = tr("navis-voll-actors");
  out.B_vollPlayerNotes = primary.filter(d => (en(d.system?.notes?.player) && !t[d._id]?.playerNotes) || (en(d.system?.notes?.gm) && !t[d._id]?.description)).map(d => ({ id: d._id, name: d.name, ru: t[d._id]?.name, player: d.system.notes.player })); }
{ const { primary } = await read("navis-core-actors"); const t = tr("navis-core-actors");
  out.B_coreActorNotes = primary.filter(d => (en(d.system?.notes?.gm) && !t[d._id]?.description) || (en(d.system?.notes?.player) && !t[d._id]?.playerNotes)).map(d => ({ id: d._id, name: d.name, ru: t[d._id]?.name, gm: d.system?.notes?.gm, player: d.system?.notes?.player })); }
// C: embedded items on core + inquisition actors lacking translation (unique by name)
for (const [key, pack] of [["C_coreActorItems", "navis-core-actors"], ["C_inqActorItems", "navis-inquisition-actors"]]) {
  const { primary, embedded } = await read(pack); const t = tr(pack); const byId = new Map(Object.values(embedded).map(e => [e._id, e]));
  const rows = [];
  for (const a of primary) for (const iid of a.items ?? []) { const it = byId.get(iid); if (!it || !en(it.name)) continue; if (t[a._id]?.items?.[iid] || t[a._id]?.items?.[it.name]) continue; if (it._stats?.compendiumSource) continue; rows.push({ actor: a._id, actorName: a.name, id: iid, type: it.type, name: it.name, desc: en(it.system?.notes?.player) ? it.system.notes.player : undefined }); }
  out[key] = rows;
}
// D: talents
{ const { primary } = await read("navis-talents"); out.D_talents = primary.filter(d => en(d.name) && !tr("navis-talents")[d._id]?.name).map(d => ({ id: d._id, name: d.name, player: d.system?.notes?.player, gm: d.system?.notes?.gm || undefined, req: d.system?.requirement?.value || undefined })); }
// E: bestiary
{ const { primary, embedded } = await read("navis-bestiary"); const byId = new Map(Object.values(embedded).map(e => [`${e._id}`, e]));
  const names = new Map();
  out.E_bestiary = primary.map(a => ({ id: a._id, name: a.name, gm: a.system?.notes?.gm, player: a.system?.notes?.player, species: a.system?.species, role: a.system?.role, faction: a.system?.faction,
    items: (a.items ?? []).map(i => byId.get(i)).filter(Boolean).map(i => { names.set(`${i.type}|${i.name}`, (names.get(`${i.type}|${i.name}`) ?? 0) + 1); return { id: i._id, type: i.type, name: i.name, player: i.system?.notes?.player || undefined }; }) }));
  out.E_bestiaryDistinctItems = names.size; }
// F: journals
for (const [key, pack] of [["F_vollJournals", "navis-voll-journals"], ["G_inqJournals", "navis-inquisition-journals"]]) {
  const { primary, embedded } = await read(pack); const t = tr(pack); const byId = new Map(Object.values(embedded).map(e => [e._id, e]));
  out[key] = primary.filter(j => !t[j._id]).map(j => ({ id: j._id, name: j.name, pages: (j.pages ?? []).map(p => byId.get(p)).filter(Boolean).map(p => ({ id: p._id, name: p.name, type: p.type, text: p.text?.content ?? "" })) }));
}
// H: scenes
{ const { primary } = await read("navis-core-scenes"); const t = tr("navis-core-scenes"); out.H_scenes = primary.filter(s => !t[s._id]).map(s => ({ id: s._id, name: s.name })); }
for (const [k, v] of Object.entries(out)) { fs.mkdirSync("tmp/worklists", { recursive: true }); fs.writeFileSync(`tmp/worklists/${k}.json`, JSON.stringify(v, null, 1)); console.log(k.padEnd(26), Array.isArray(v) ? `${String(v.length).padStart(4)} записей` : v, `${(size(v)/1024).toFixed(0).padStart(5)} КБ`); }
