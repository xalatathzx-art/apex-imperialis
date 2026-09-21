import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack, partition } from "../tools/lib/level.mjs";
const d = fs.mkdtempSync(path.join(os.tmpdir(), "v-")); fs.cpSync("packs/navis-voll-actors", d, { recursive: true, filter: s => !s.endsWith("LOCK") });
const { primary } = partition(await readPack(d));
const { entries } = await import("../src/compendium/impmal-voll.actors.notes.mjs");
const tgt = s => [...String(s ?? "").matchAll(/@UUID\[([^\]]+)\]/g)].map(m => m[1]).sort().join("\n  ");
let bad = 0, n = 0;
for (const a of primary) { const e = entries[a._id]; if (!e) continue; n++;
  for (const [f, src] of [["playerNotes", a.system.notes.player], ["description", a.system.notes.gm]]) if (e[f] && tgt(e[f]) !== tgt(src)) { bad++; console.log(a.name, f, "\n EN\n  " + tgt(src), "\n RU\n  " + tgt(e[f])); } }
console.log("checked", n, "mismatches", bad);
