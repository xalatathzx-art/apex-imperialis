import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "../tools/lib/level.mjs";
const d = fs.mkdtempSync(path.join(os.tmpdir(), "v-")); fs.cpSync("packs/navis-voll-actors", d, { recursive: true, filter: s => !s.endsWith("LOCK") });
const { primary } = partition(await readPack(d));
const t = JSON.parse(fs.readFileSync("compendium/navis-apexialis.navis-voll-actors.json", "utf8")).entries;
const CYR = /[А-Яа-яЁё]/; const plain = h => String(h ?? "").replace(/<[^>]*>/g, " ").replace(/@\w+\[[^\]]*\](\{[^}]*\})?/g, " ").replace(/\s+/g, " ").trim();
const en = h => { const x = plain(h); return x.length > 2 && !CYR.test(x) && /[A-Za-z]{3,}/.test(x); };
const out = []; let gm = 0, pl = 0;
for (const a of primary) {
  const needG = en(a.system?.notes?.gm) && !t[a._id]?.description, needP = en(a.system?.notes?.player) && !t[a._id]?.playerNotes;
  if (!needG && !needP) continue; gm += needG; pl += needP;
  out.push(`##### ${a._id} | ${a.name} | ${t[a._id]?.name}\n${needG ? "GM: " + a.system.notes.gm + "\n" : ""}${needP ? "PL: " + a.system.notes.player : ""}`);
}
fs.writeFileSync("tmp/voll-notes.txt", out.join("\n\n")); console.log("actors", out.length, "gm", gm, "player", pl, "bytes", out.join("").length);
