import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack } from "../tools/lib/level.mjs";
const d = fs.mkdtempSync(path.join(os.tmpdir(), "j-")); fs.cpSync("packs/navis-core-journals", d, { recursive: true, filter: s => !s.endsWith("LOCK") });
const p = await readPack(d);
const tr = JSON.parse(fs.readFileSync("compendium/navis-apexialis.navis-core-journals.json", "utf8")).entries;
const names = JSON.parse(fs.readFileSync("tmp/note-names.json", "utf8"));
const map = {};
// page names + h2/h3 headings of every core journal, English vs Russian, same order
for (const [k, v] of Object.entries(p)) if (k.startsWith("!journal.pages!")) {
  const [jid, pid] = k.split("!")[2].split("."); const t = tr[jid]?.pages?.[pid]; if (!t) continue;
  if (t.name) map[v.name] = t.name;
  const hEn = [...(v.text?.content ?? "").matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
  const hRu = [...(t.text ?? "").matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
  if (hEn.length === hRu.length) hEn.forEach((h, i) => { map[h] ??= hRu[i]; });
}
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const byNorm = Object.fromEntries(Object.entries(map).map(([e, r]) => [norm(e), r]));
const found = {}, missing = [];
for (const n of names) { const r = byNorm[norm(n)]; if (r) found[n] = r; else missing.push(n); }
fs.writeFileSync("tmp/planet-map.json", JSON.stringify({ found, missing }, null, 1));
console.log("found", Object.keys(found).length, "missing", missing.length);
console.log(Object.entries(found).slice(0, 12).map(([a, b]) => `${a} → ${b}`).join("\n"));
console.log("MISSING:", missing.join(", "));
