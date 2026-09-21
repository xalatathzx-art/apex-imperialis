import fs from "node:fs"; import path from "node:path"; import os from "node:os";
import { readPack } from "../tools/lib/level.mjs";
const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-")); fs.cpSync("packs/navis-core-scenes", d, { recursive: true, filter: s => !s.endsWith("LOCK") });
const p = await readPack(d); const c = {};
for (const [k, v] of Object.entries(p)) { const t = k.split("!")[1]; c[t] = (c[t] ?? 0) + 1; if (t === "scenes.notes") console.log("note:", v.text, "|", v.entryId); }
console.log(c);
