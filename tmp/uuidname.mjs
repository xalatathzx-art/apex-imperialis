// node tmp/uuidname.mjs <pageId> — print "i: ru-label" for runs that are a single @UUID link,
// using the Russian names in compendium/apex-imperialis.<pack>.json.
import fs from "node:fs"; import path from "node:path";
const [id] = process.argv.slice(2);
const dir = "src/compendium/journal-runs";
const file = fs.readdirSync(dir).map(p => path.join(dir, p, `${id}.json`)).find(f => fs.existsSync(f));
const src = JSON.parse(fs.readFileSync(file, "utf8"));
const cache = {};
const pack = p => (cache[p] ??= (() => { try { return JSON.parse(fs.readFileSync(`compendium/apex-imperialis.${p}.json`, "utf8")).entries ?? {}; } catch { return {}; } })());
export function ruName(uuid) {
  const m = uuid.match(/Compendium\.apex-imperialis\.([\w-]+)\.(?:Item|Actor|RollTable|JournalEntry)\.(\w+)/);
  if (!m) return null;
  const e = pack(m[1])[m[2]];
  return e?.name ?? null;
}
const out = {};
for (const [i, r] of Object.entries(src.runs)) {
  const m = r.en.match(/^@UUID\[([^\]]+)\]\{([^}]*)\}$/);
  if (m) { const n = ruName(m[1]); out[i] = n ? `@UUID[${m[1]}]{${n}}` : null; if (!n) console.error("no name", i, m[2]); }
}
console.log(JSON.stringify(out, null, 1));
