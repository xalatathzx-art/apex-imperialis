import fs from "node:fs"; import path from "node:path";
import { ClassicLevel } from "../tools/lib/level.mjs";
for (const name of fs.readdirSync("packs")) {
  const db = new ClassicLevel(path.join("packs", name), { valueEncoding: "json" });
  await db.open();
  const types = new Map();
  for await (const [k, v] of db.iterator()) {
    if (k.startsWith("!folders!") || !v?.type) continue;
    if (k.split("!")[1]?.includes(".")) continue; // embedded
    types.set(v.type, (types.get(v.type) ?? 0) + 1);
  }
  await db.close();
  console.log(name.padEnd(28), [...types].sort((a,b)=>b[1]-a[1]).map(([t,n])=>`${t}:${n}`).join(" "));
}
