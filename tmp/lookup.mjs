import fs from "node:fs";
const idx = JSON.parse(fs.readFileSync("src/compendium/packs-index.json", "utf8"));
const terms = JSON.parse(fs.readFileSync("docs/rules/ru-terms.json", "utf8"));
const map = new Map();
const add = (en, ru, where) => { if (!en || !ru) return; if (!map.has(en)) map.set(en, new Set()); map.get(en).add(`${ru} [${where}]`); };
for (const [coll, pack] of Object.entries(idx)) {
  const b = coll.replace(/^impmal-(\w+)\.(\w+)$/, "navis-apexialis.navis-$1-$2"); const f = `compendium/${b}.json`;
  if (!fs.existsSync(f)) continue; const tr = JSON.parse(fs.readFileSync(f, "utf8")).entries;
  for (const [id, doc] of Object.entries(pack.entries)) { add(doc.name, tr[id]?.name, coll); for (const [n, it] of Object.entries(tr[id]?.items ?? {})) add(n, it.name, coll + " actor"); }
}
for (const [en, ru] of Object.entries(terms)) add(en, ru, "terms");
const want = process.argv.slice(2).join(" ").split("|").map(s => s.trim()).filter(Boolean);
for (const w of want) console.log(w.padEnd(34), "=>", [...(map.get(w) ?? ["—"])].slice(0, 3).join(" ; "));
