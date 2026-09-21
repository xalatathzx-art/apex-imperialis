/**
 * Point talent requirement scripts at names that exist.
 *
 * The imported talents gate themselves with scripts such as
 *   this.actor.itemTypes["talent"].find(i => i.name == "Talented(Athletics)")
 * but the talent is called "Talented (Athletics)" — so the check fails in any
 * language and the talent can never be added. Babele translation makes no
 * difference to that; module/script-names.js makes the comparison accept the
 * English name Babele keeps, which only helps once the English is right.
 *
 * Only names with one certain target are corrected: a missing space, a
 * different case, a spelling slip, or the name a talent actually has in the
 * packs (Duelist → Duellist, Emperor's Aegis → Aegis of the Emperor).
 * Comparisons against a name plus a chosen specifier ("Hatred(Xenos)",
 * "Forbidden – Xenos") are left alone: whether impmal stores the specifier in
 * the name is not something to guess at here.
 *
 * Touches only strings under a key ending in "script". Run tools/build.mjs
 * afterwards (Foundry closed) to carry the change into packs/.
 *
 *   node tools/fix-source-script-names.mjs [--write]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const WRITE = process.argv.includes("--write");

const SKILLS = ["Athletics", "Awareness", "Dexterity", "Discipline", "Fortitude", "Intuition", "Linguistics",
  "Logic", "Lore", "Medicae", "Melee", "Navigation", "Piloting", "Presence", "Psychic Mastery", "Ranged",
  "Rapport", "Reflexes", "Stealth", "Tech"];

const FIX = {
  ...Object.fromEntries(SKILLS.map(s => [`Talented(${s})`, `Talented (${s})`])),
  "Condemn the Witch": "Condemn The Witch",
  "Faithful(Imperial Cult)": "Faithful (imperial Cult)",
  "Do Not Falter!": "Do not Falter!",
  "Clues from the Crowd": "Clues from the Crowds",
  "Bane of the Daemon": "Bane of Daemon",
  "Warp Discruption": "Warp Disruption",
  "Duelist": "Duellist",
  "Emperor’s Aegis": "Aegis of the Emperor"
};

const COMPARISON = /(\.name\s*(?:===|!==|==|!=)\s*")([^"]+)(")/g;
let fixes = 0;

const repair = value => {
  if (Array.isArray(value)) return value.map(repair);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, v]) => {
    if (typeof v === "string" && /script$/i.test(key)) {
      return [key, v.replace(COMPARISON, (whole, head, name, tail) => {
        if (!(name in FIX)) return whole;
        fixes++;
        return `${head}${FIX[name]}${tail}`;
      })];
    }
    return [key, repair(v)];
  }));
};

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".json")) files.push(p);
  }
})(path.join(ROOT, "src", "packs"));

let changed = 0;
for (const file of files) {
  const before = JSON.parse(fs.readFileSync(file, "utf8"));
  const after = repair(before);
  if (JSON.stringify(before) === JSON.stringify(after)) continue;
  changed++;
  if (WRITE) fs.writeFileSync(file, `${JSON.stringify(after, null, 2)}\n`);
}
console.log(`${WRITE ? "Corrected" : "Would correct"} ${fixes} comparisons in ${changed} files.`);
