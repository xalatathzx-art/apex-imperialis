// show <pageId>            — print runs as "i: text" for translating
// merge <pageId> <tr.json> — fill ru from {name, journalRu?, runs:{i: ru}}
import fs from "node:fs"; import path from "node:path";
const [mode, id, trFile] = process.argv.slice(2);
const dir = "src/compendium/journal-runs";
const file = fs.readdirSync(dir).map(p => path.join(dir, p, `${id}.json`)).find(f => fs.existsSync(f));
if (!file) throw new Error(`no run file for ${id}`);
const src = JSON.parse(fs.readFileSync(file, "utf8"));
if (mode === "show") {
  console.log(`# ${src.journalName} / ${src.pageName} (${Object.keys(src.runs).length} runs)`);
  for (const [i, r] of Object.entries(src.runs)) console.log(`${i}: ${r.en}`);
} else if (mode === "merge") {
  const tr = JSON.parse(fs.readFileSync(trFile, "utf8"));
  if (tr.name) src.name = tr.name;
  if (tr.journalRu) src.journalRu = tr.journalRu;
  let n = 0; const extra = [];
  for (const [i, ru] of Object.entries(tr.runs ?? {})) { if (!src.runs[i]) { extra.push(i); continue; } src.runs[i].ru = ru; n++; }
  const left = Object.entries(src.runs).filter(([, r]) => !r.ru).map(([i]) => i);
  fs.writeFileSync(file, `${JSON.stringify(src, null, 1)}\n`);
  console.log(`${src.pageName}: merged ${n}, unknown ${extra.join(",") || "-"}, still empty ${left.length}${left.length ? ": " + left.slice(0, 20).join(",") : ""}`);
}
