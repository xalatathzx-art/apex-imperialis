import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { readPack, partition } from "../tools/lib/level.mjs";
const copy = fs.mkdtempSync(path.join(os.tmpdir(), "inq-"));
fs.cpSync("packs/navis-inquisition-journals", copy, { recursive: true, filter: s => !s.endsWith("LOCK") });
const { primary, embedded } = partition(await readPack(copy));
const byId = new Map(Object.values(embedded).map(d => [d._id, d]));
const out = JSON.parse(fs.readFileSync("compendium/navis-apexialis.navis-inquisition-journals.json","utf8"));
let tot=0, done=0;
for (const j of primary) {
  const pages=(j.pages??[]).map(id=>byId.get(id)).filter(Boolean);
  const tr = out.entries?.[j._id]?.pages ?? out.entries?.[j.name]?.pages ?? {};
  const miss = pages.filter(p=>!(tr[p._id]||tr[p.name])?.text && (p.text?.content??"").replace(/<[^>]+>/g,"").trim());
  const chars = miss.reduce((a,p)=>a+(p.text?.content??"").replace(/<[^>]+>/g,"").length,0);
  tot+=pages.length; done+=pages.length-miss.length;
  console.log(j._id, j.name.padEnd(34), pages.length, "untranslated", miss.length, chars);
}
console.log("pages", tot, "done", done);
