/**
 * An AUTHORING AID. It is not part of the content pipeline and writes nothing.
 *
 * ── Read this before using anything it prints ──────────────────────────────
 *
 * `tools/data/implants-*.mjs` is written fresh from DoomBC, by hand, in
 * Russian, under the conversion doctrine in `tools/make-implants.mjs`. This
 * script does NOT produce that file and must never be made to. It reads
 * Batonrain's `warhammer-dbc` pack sources and prints the MACHINE-READABLE
 * residue each implant carries — `system.effects` numbers and the `changes` of
 * its Active Effects — so that an author writing an entry can check their
 * reading of the book against somebody else's, and notice a bonus they missed.
 *
 * The prose in those files is that system's, not ours, and is not copied. The
 * numbers are the book's, and the book is the source.
 *
 * If a later session finds this file and wonders whether the pack could just be
 * generated from it: no. Most of what DoomBC's implants do is not expressible
 * as a number at all — it is a sentence — and `warhammer-dbc` records only the
 * fraction that is. Fourteen implants out of 269 is what
 * the whole corpus yields.
 *
 *   node tools/import-dbc.mjs                 # the six in-scope families
 *   node tools/import-dbc.mjs --all           # including the cycle B families
 *   node tools/import-dbc.mjs Бионика         # only folders/names matching
 */

import fs from "node:fs";
import path from "node:path";

const SOURCE = "D:/Foundry/DoomCrusade/Data/dumbc/warhammer-dbc/packs-src/implants";

/**
 * Drukhari bio-implants and Astartes gene-seed organs are a later cycle and
 * carry their own subsystems. They are skipped unless asked for by name, so a
 * routine run cannot tempt anyone into authoring them early.
 */
const CYCLE_B = ["Биоимпланты", "Астартес"];

/* ── the mapping table ─────────────────────────────────────────────────── */

/** warhammer-dbc characteristic abbreviations → impmal's keys. */
const CHARACTERISTIC = Object.freeze({
  ws: "ws", bs: "bs",
  s: "str", str: "str",
  t: "tgh", tgh: "tgh",
  a: "ag", ag: "ag",
  i: "int", int: "int",
  per: "per", p: "per",
  wp: "wil", wil: "wil",
  fel: "fel"
});

/** warhammer-dbc hit zones → impmal's. They happen to agree; stated anyway. */
const ZONE = Object.freeze({
  head: "head", body: "body",
  leftArm: "leftArm", rightArm: "rightArm",
  leftLeg: "leftLeg", rightLeg: "rightLeg"
});

/**
 * An Active Effect change key → the entry this module would write.
 * Returns null where there is no obvious mapping; the caller prints those as
 * unmapped rather than guessing.
 */
function mapChange(key, value) {
  const armour = /^system\.armorBonus\.(\w+)$/.exec(key ?? "");
  if (armour && ZONE[armour[1]]) return { kind: "armour", key: ZONE[armour[1]], value };

  const characteristic = /^system\.characteristics\.(\w+)\.(?:bonusFx|totalFx)$/.exec(key ?? "");
  if (characteristic && CHARACTERISTIC[characteristic[1]]) {
    // bonusFx is a BONUS (characteristic ÷ 10), so the book's Unnatural scale
    // applies: +5 per two points, per the doctrine. totalFx is already a value.
    const bonus = key.endsWith("bonusFx");
    return {
      kind: "characteristic",
      key: CHARACTERISTIC[characteristic[1]],
      value: bonus ? Number(value) * 5 / 2 : Number(value),
      note: bonus ? `from bonusFx ${value} — доктрина: +5 за два пункта` : "from totalFx"
    };
  }

  return null;
}

/** A `system.effects` field → the entry this module would write. */
const EFFECT_FIELD = Object.freeze({
  armourAll: value => ({ kind: "armourAll", value }),
  apHead: value => ({ kind: "armour", key: "head", value }),
  apBody: value => ({ kind: "armour", key: "body", value }),
  apArms: value => ({ kind: "armour", key: "leftArm/rightArm", value, note: "impmal splits arms by side" }),
  apLegs: value => ({ kind: "armour", key: "leftLeg/rightLeg", value, note: "impmal splits legs by side" }),
  speedMod: value => ({ kind: "speed", key: "land", value }),
  woundsMod: value => ({ kind: "wounds", value, note: "FFG Wounds ÷4" }),
  charBonusValue: value => ({ kind: "characteristic", value: Number(value) * 5 / 2, note: "see charBonusStat" })
});

/** Fields that carry a hint but have no target in impmal at all. */
const NO_TARGET = new Set(["fearRating", "sizeMod", "initMod"]);

/* ── walk ──────────────────────────────────────────────────────────────── */

function files(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...files(full));
    else if (entry.name.endsWith(".json") && entry.name !== "_Folder.json") found.push(full);
  }
  return found;
}

const args = process.argv.slice(2);
const all = args.includes("--all");
const filters = args.filter(arg => !arg.startsWith("--"));

if (!fs.existsSync(SOURCE)) {
  console.error(`warhammer-dbc is not installed at ${SOURCE}; nothing to read`);
  process.exit(1);
}

let shown = 0;
let withHints = 0;

for (const file of files(SOURCE).sort()) {
  const relative = path.relative(SOURCE, file).replace(/\\/g, "/");

  if (!all && CYCLE_B.some(name => relative.includes(name))) continue;
  if (filters.length && !filters.some(f => relative.includes(f))) continue;

  let document;
  try {
    document = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`${relative}: unreadable — ${error.message}`);
    continue;
  }

  const system = document.system ?? {};
  const lines = [];

  for (const [field, raw] of Object.entries(system.effects ?? {})) {
    if (raw === 0 || raw === null || raw === "" || (Array.isArray(raw) && !raw.length)) continue;

    if (NO_TARGET.has(field)) {
      lines.push(`    ${field} = ${JSON.stringify(raw)}  →  impmal has no target for this`);
      continue;
    }

    const build = EFFECT_FIELD[field];
    if (!build) {
      lines.push(`    ${field} = ${JSON.stringify(raw)}  →  unmapped, read the book`);
      continue;
    }

    const entry = build(raw);
    lines.push(`    ${field} = ${JSON.stringify(raw)}  →  ${JSON.stringify(entry)}`);
  }

  for (const effect of document.effects ?? []) {
    for (const change of effect.system?.changes ?? []) {
      const entry = mapChange(change.key, change.value);
      lines.push(
        entry
          ? `    ${change.key} = ${change.value}  →  ${JSON.stringify(entry)}`
          : `    ${change.key} = ${change.value}  →  unmapped, read the book`
      );
    }
  }

  shown += 1;
  if (!lines.length) continue;

  withHints += 1;
  console.log(`${document.name}`);
  console.log(`  ${relative}`);
  console.log(`  category: ${system.category ?? "—"}   ${system.bookSource ?? ""}`);
  for (const line of lines) console.log(line);
  console.log("");
}

console.log(`${withHints} of ${shown} implants carry machine-readable hints.`);
console.log("The prose is written fresh from DoomBC. This script writes nothing.");
