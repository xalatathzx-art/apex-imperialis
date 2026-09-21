import fs from "node:fs";
const e = JSON.parse(fs.readFileSync("compendium/navis-apexialis.navis-core-journals.json", "utf8")).entries;
const txt = Object.values(e).flatMap(j => Object.values(j.pages ?? {})).map(p => p.text ?? "").join("\n").replace(/<table[\s\S]*?<\/table>/g, "");
const w = JSON.parse(fs.readFileSync("tmp/worklists/A_coreItemDescriptions.json", "utf8")).filter(x => x.type !== "specialisation");
const out = [];
for (const x of w) {
  const stem = x.ru.replace(/[«»]/g, "").split(" ").pop().slice(0, 6);
  const hits = [...txt.matchAll(/<p>[\s\S]*?<\/p>/g)].map(m => m[0]).filter(p => p.includes(`Item.${x.id}]`) || p.replace(/[«»]/g, "").includes(x.ru.replace(/[«»]/g, "")));
  out.push(`##### ${x.id} ${x.name} | ${x.ru} (${hits.length})\n${hits.slice(0, 3).join("\n")}`);
}
fs.writeFileSync("tmp/gear-ru.txt", out.join("\n\n"));
console.log(out.map(o => o.split("\n")[0]).join("\n"));
