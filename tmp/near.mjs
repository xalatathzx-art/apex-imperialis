import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "../tools/lib/level.mjs";
const gap = JSON.parse(fs.readFileSync("tmp/worklists/C_gap.json", "utf8"));
// every known English→Russian description pair, by type+name
const known = new Map();
const add = (type, name, en, ru) => { if (!en || !ru) return; const k = type + "|" + name; (known.get(k) ?? known.set(k, []).get(k)).push({ en, ru }); };
for (const b of ["core", "inquisition", "requisition", "voll"]) {
  for (const kind of ["items", "actors"]) {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "n-")); fs.cpSync(`packs/navis-${b}-${kind}`, d, { recursive: true, filter: s => !s.endsWith("LOCK") });
    const { primary, embedded } = partition(await readPack(d)); const t = JSON.parse(fs.readFileSync(`compendium/navis-apexialis.navis-${b}-${kind}.json`, "utf8")).entries;
    if (kind === "items") for (const i of primary) add(i.type, i.name, i.system?.notes?.player, t[i._id]?.description);
    else { const byId = new Map(Object.values(embedded).map(x => [x._id, x])); for (const a of primary) for (const iid of a.items ?? []) { const i = byId.get(iid); if (i) add(i.type, i.name, i.system?.notes?.player, t[a._id]?.items?.[i.name]?.description); } }
  }
}
const norm = s => String(s).replace(/<[^>]+>/g, " ").replace(/&nbsp;|\u00a0/g, " ").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
let same = 0, similar = 0, none = 0; const out = [];
for (const [b, rows] of Object.entries(gap)) for (const r of rows.filter(r => r.needDesc)) {
  const cands = known.get(r.type + "|" + r.name) ?? [];
  const exact = cands.find(c => norm(c.en) === norm(r.desc));
  if (exact) { same++; out.push({ b, ...r, match: "normalized", ru: exact.ru }); }
  else if (cands.length) { similar++; out.push({ b, ...r, match: "name-only", candEn: cands[0].en, ru: cands[0].ru }); }
  else { none++; out.push({ b, ...r, match: "none" }); }
}
fs.writeFileSync("tmp/worklists/C_near.json", JSON.stringify(out, null, 1));
console.log({ normalizedSame: same, sameNameDifferentText: similar, noTranslation: none });
