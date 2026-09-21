import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { readPack } from "./lib/level.mjs";
const source = process.argv[2];
const out = fs.mkdtempSync(path.join(os.tmpdir(), "navis-pack-"));
fs.cpSync(source, out, { recursive: true, force: true });
for (const lock of fs.globSync(path.join(out, "**", "LOCK"))) fs.rmSync(lock, { force: true });
const pack = await readPack(out);
let docs = 0, images = [], missing = [], ids = [];
const walk = value => {
  if (typeof value === "string") {
    if (/^modules\/navis-apexialis\/.+\.(webp|png|jpg|jpeg)$/i.test(value)) {
      images.push(value);
      const local = path.join("navis-apexialis", value.slice("modules/navis-apexialis/".length));
      if (!fs.existsSync(local)) missing.push(value);
    }
    return;
  }
  if (Array.isArray(value)) return value.forEach(walk);
  if (value && typeof value === "object") Object.values(value).forEach(walk);
};
for (const [key, value] of Object.entries(pack)) { if (!key.startsWith("!folders!")) { docs++; if (value._id) ids.push(value._id); walk(value); } }
console.log(JSON.stringify({ docs, ids: ids.slice(0, 5), imageCount: images.length, missingImages: missing.length, images: images.slice(0, 15) }, null, 2));
