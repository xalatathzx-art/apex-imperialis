/**
 * Locating postcss.
 *
 * Same approach as level.mjs: Foundry ships postcss inside its application
 * bundle, so the tools borrow that copy instead of requiring a network install.
 * Override with NAVIS_POSTCSS if Foundry lives somewhere unusual.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const CANDIDATES = [
  process.env.NAVIS_POSTCSS,
  "D:/Foundry/Foundry13/Foundry Virtual Tabletop/resources/app/node_modules/postcss",
  "D:/Foundry/Foundry14/Foundry Virtual Tabletop/resources/app/node_modules/postcss",
  "C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/postcss"
].filter(Boolean);

const dir = CANDIDATES.find(candidate => fs.existsSync(path.join(candidate, "package.json")));

if (!dir) {
  throw new Error(
    "postcss not found. Set NAVIS_POSTCSS to the postcss directory inside your Foundry install " +
    "(…/resources/app/node_modules/postcss). Looked in:\n  " + CANDIDATES.join("\n  ")
  );
}

const postcss = createRequire(import.meta.url)(dir);

export default postcss;
