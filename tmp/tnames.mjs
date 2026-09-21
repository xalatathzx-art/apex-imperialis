import fs from "node:fs"; import path from "node:path";
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const found = new Map(); const where = new Map();
const Q = "[\"'`]";
const re = new RegExp("name\\s*={2,3}\\s*\\\\?" + Q + "([^\"'`\\\\]+)", "g");
const reGet = new RegExp("getName\\(\\s*\\\\?" + Q + "([^\"'`\\\\]+)", "g");
for (const f of walk("src/packs/talents")) {
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(re)) { found.set(m[1], (found.get(m[1]) ?? 0) + 1); where.set(m[1], path.basename(f)); }
  for (const m of s.matchAll(reGet)) { const k = "getName:" + m[1]; found.set(k, (found.get(k) ?? 0) + 1); where.set(k, path.basename(f)); }
}
for (const [k, v] of found) console.log(k.padEnd(44), "x" + v, where.get(k) ?? "");
const j = JSON.parse(fs.readFileSync("src/packs/talents/General/mastery-athletics_malExpTal0000008.json", "utf8"));
console.log("\nSAMPLE:", JSON.stringify(j).match(/"script":"[^"]{0,300}/g)?.slice(0, 3));
