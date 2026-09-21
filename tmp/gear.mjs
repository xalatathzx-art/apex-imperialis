import fs from "node:fs";
const e = JSON.parse(fs.readFileSync("compendium/navis-apexialis.navis-core-journals.json", "utf8")).entries;
const txt = Object.values(e).flatMap(j => Object.values(j.pages ?? {})).map(p => p.text ?? "").join("\n");
const w = JSON.parse(fs.readFileSync("tmp/worklists/A_coreItemDescriptions.json", "utf8")).filter(x => x.type !== "specialisation");
const norm = s => s.replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/<[^>]+>/g, "").replace(/[«»"]/g, "").trim().toLowerCase();
const heads = [...txt.matchAll(/<h(\d)[^>]*>([\s\S]*?)<\/h\1>/g)];
const out = [];
for (const x of w) {
  const hs = heads.filter(m => m[2].includes(`Item.${x.id}]`) || norm(m[2]) === norm(x.ru));
  let body = "NOT FOUND";
  if (hs.length) { const m = hs[0]; const rest = txt.slice(m.index + m[0].length); const end = rest.search(/<h\d/); body = rest.slice(0, end < 0 ? undefined : end).trim(); }
  out.push(`##### ${x.id} ${x.name} | ${x.ru} (headings: ${hs.length})\n${body}`);
}
fs.writeFileSync("tmp/gear-ru.txt", out.join("\n\n"));
console.log(out.filter(o => o.includes("headings: 0")).map(o => o.split("\n")[0]).join("\n"));
console.log("--- all headings mentioning key words:");
for (const k of ["гранат", "ракет", "патрон", "заряд", "бомб", "прицел", "штык", "сошк", "глушит", "переключат", "ранец", "моноклин", "омнисп", "экстермин"]) console.log(k, "=>", heads.filter(m => norm(m[2]).includes(k)).map(m => norm(m[2])).slice(0, 8).join(" | "));
