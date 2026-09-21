import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack } from "../tools/lib/level.mjs";
const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-")); fs.cpSync("packs/navis-core-scenes", d, { recursive: true, filter: s => !s.endsWith("LOCK") });
const p = await readPack(d); const names = new Set(); let withText = 0, perScene = {};
for (const [k, v] of Object.entries(p)) if (k.startsWith("!scenes.notes!")) { const sc = k.split("!")[2].split(".")[0]; perScene[sc] = (perScene[sc] ?? 0) + 1; if (v.text) { withText++; names.add(v.text); } }
console.log({ perScene, withText, distinct: names.size });
fs.writeFileSync("tmp/note-names.json", JSON.stringify([...names].sort(), null, 1));
