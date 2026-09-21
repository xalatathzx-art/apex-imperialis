import fs from "node:fs"; import path from "node:path";
const idx = JSON.parse(fs.readFileSync("src/compendium/packs-index.json", "utf8"));
const all = new Set(); for (const p of Object.values(idx)) for (const d of Object.values(p.entries)) all.add(d.name);
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const RE = /\.name\s*(?:===|==)\s*"([^"]+)"/g;
const norm = s => s.toLowerCase().replace(/[\s’']/g, "");
const byNorm = new Map([...all].map(n => [norm(n), n]));
const scriptsOf = (v, out = []) => {
  if (Array.isArray(v)) v.forEach(x => scriptsOf(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { if (typeof x === "string" && /script$/i.test(k)) out.push(x); else scriptsOf(x, out); }
  return out;
};
const bad = new Map();
for (const f of walk("src/packs").filter(f => f.endsWith(".json"))) {
  for (const t of scriptsOf(JSON.parse(fs.readFileSync(f, "utf8")))) for (const m of t.matchAll(RE)) {
    if (all.has(m[1])) continue;
    if (!bad.has(m[1])) bad.set(m[1], { fix: byNorm.get(norm(m[1])), files: new Set() });
    bad.get(m[1]).files.add(path.relative("src/packs", f));
  }
}
for (const [k, v] of bad) console.log(JSON.stringify(k).padEnd(34), "→", v.fix ? JSON.stringify(v.fix) : "(no match)", "|", [...v.files].slice(0, 2).join(", "), v.files.size > 2 ? `+${v.files.size - 2}` : "");
fs.writeFileSync("tmp/badnames.json", JSON.stringify(Object.fromEntries([...bad].map(([k, v]) => [k, v.fix ?? null])), null, 1));
