import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack } from "../tools/lib/level.mjs";
const names = JSON.parse(fs.readFileSync("tmp/note-names.json", "utf8"));
const out = {};
for (const pack of ["navis-core-journals", "navis-requisition-journals", "navis-inquisition-journals", "navis-voll-journals"]) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "a-")); fs.cpSync(`packs/${pack}`, d, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const p = await readPack(d);
  const tr = JSON.parse(fs.readFileSync(`compendium/navis-apexialis.${pack}.json`, "utf8")).entries;
  for (const [k, v] of Object.entries(p)) if (k.startsWith("!journal.pages!")) {
    const [jid, pid] = k.split("!")[2].split("."); const t = tr[jid]?.pages?.[pid]?.text; if (!t) continue;
    const blocks = s => (s.match(/<(p|h\d|li|td|th)[^>]*>[\s\S]*?<\/\1>/g) ?? []).map(b => b.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
    const en = blocks(v.text?.content ?? ""), ru = blocks(t);
    if (en.length !== ru.length) continue;
    en.forEach((b, i) => { for (const n of names) { const bare = n.replace(/ \(.*\)$/, ""); if (b.includes(bare) && (out[n]?.length ?? 0) < 2) (out[n] ??= []).push({ en: b.slice(Math.max(0, b.indexOf(bare) - 60), b.indexOf(bare) + bare.length + 60), ru: ru[i].slice(0, 400) }); } });
  }
}
fs.writeFileSync("tmp/planet-context.json", JSON.stringify(out, null, 1));
console.log("names with context:", Object.keys(out).length, "/", names.length);
console.log("no context:", names.filter(n => !out[n]).join(", "));
