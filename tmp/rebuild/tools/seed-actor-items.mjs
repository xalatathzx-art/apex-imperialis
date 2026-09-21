/**
 * Translate NPCs' embedded items by reusing translations we already have.
 *
 * An NPC's weapons and traits are copies. Babele follows a copy back to the item
 * pack only when Foundry recorded a compendium source, and most of these copies
 * have none — so "Stalwart" on an Inquisition NPC stays English although the
 * very same trait is translated on a core NPC, and a specialisation copy keeps
 * its English rules text although stage 2 translated the original.
 *
 * This regenerates one slice per actor pack, <legacy>.actors.reused-items.mjs,
 * from two sources:
 *   - the item packs' translations, matched by type and English name;
 *   - every other NPC's already-translated copy of the same item.
 * A name is reused on a type+name match. A description is reused only when the
 * English rules text is identical — two items may share a name and differ in
 * what they do. "Identical" ignores one thing: how a link names its target. The
 * consolidation rewrote some copies' links to Compendium.navis-apexialis.… and
 * left others as JournalEntry.…; both reach the same page. The reused Russian
 * then takes this copy's own link targets, in order, so no link moves.
 *
 * Hand-written slices always win: a field any other slice of the same pack
 * already sets for that actor and item is never emitted here. That also makes
 * the output stable — this file's own previous contents are not an input.
 *
 * Reads copies of the packs, so it is safe with Foundry open.
 *
 *   node tools/seed-actor-items.mjs && node tools/build-compendium-lang.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readPack, partition } from "./lib/level.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src", "compendium");
const OUT = path.join(ROOT, "compendium");
const index = JSON.parse(fs.readFileSync(path.join(SRC, "packs-index.json"), "utf8"));

const BOOKS = {
  core: { legacy: "impmal-core", label: "Актёры (Основная книга)", rank: 4 },
  inquisition: { legacy: "impmal-inquisition", label: "Актёры (Руководство Инквизиции)", rank: 3 },
  requisition: { legacy: "impmal-requisition", label: "Актёры (Реквизиция)", rank: 2 },
  voll: { legacy: "impmal-voll", label: "Актёры (Приключения на Волле)", rank: 1 }
};
const GENERATED = legacy => `${legacy}.actors.reused-items.mjs`;

async function read(pack) {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "seed-"));
  fs.cpSync(path.join(ROOT, "packs", pack), copy, { recursive: true, filter: s => !s.endsWith("LOCK") });
  return partition(await readPack(copy));
}
const built = pack => {
  const file = path.join(OUT, `navis-apexialis.${pack}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")).entries : {};
};
const key = (type, name) => `${type}\u0000${name}`;
const text = item => item?.system?.notes?.player ?? "";

/* ── What is already translated, by type + English name ─────────────────── */

const names = new Map();         // key → { name, rank }
const descriptions = new Map();  // key + "\u0001" + English text → Russian text

const offer = (k, name, rank) => {
  if (!name) return;
  const previous = names.get(k);
  if (!previous || rank > previous.rank) names.set(k, { name, rank });
};
/** Link targets reduced to the document they reach, whichever form names it. */
const LINK = /@UUID\[([^\]]+)\]/g;
const canonTarget = t => t.replace(/^Compendium\.navis-apexialis\.navis-[a-z]+-(?:journals|items|actors|tables)\./, "");
const canonical = s => String(s ?? "").replace(LINK, (_, t) => `@UUID[${canonTarget(t)}]`)
  .replace(/&nbsp;| /g, " ").replace(/\s+/g, " ").trim();
const targets = s => [...String(s ?? "").matchAll(LINK)].map(m => m[1]);

const exact = new Map();  // key + English exactly as written → Russian, used as is

const offerText = (k, english, russian) => {
  if (!english || !russian) return;
  exact.set(`${k}\u0001${english}`, russian);
  // The link-insensitive match needs the Russian to carry the same links as the
  // English, in the same order — otherwise targets cannot be carried across.
  if (targets(russian).map(canonTarget).join("\n") !== targets(english).map(canonTarget).join("\n")) return;
  descriptions.set(`${k}\u0001${canonical(english)}`, russian);
};

/** The reused Russian, with each link pointing where this copy's English does. */
const retarget = (russian, english) => {
  const mine = targets(english);
  let i = 0;
  return russian.replace(LINK, () => `@UUID[${mine[i++]}]`);
};

const actorsOf = {};
for (const [book, { rank }] of Object.entries(BOOKS)) {
  const items = await read(`navis-${book}-items`);
  const tr = built(`navis-${book}-items`);
  for (const item of items.primary) {
    const k = key(item.type, item.name);
    offer(k, tr[item._id]?.name, rank + 10);
    offerText(k, text(item), tr[item._id]?.description);
  }
  actorsOf[book] = await read(`navis-${book}-actors`);
}

const embeddedOf = ({ primary, embedded }) => {
  const byId = new Map(Object.values(embedded).map(doc => [doc._id, doc]));
  return primary.map(actor => ({ actor, items: (actor.items ?? []).map(id => byId.get(id)).filter(Boolean) }));
};

for (const [book, { rank }] of Object.entries(BOOKS)) {
  const tr = built(`navis-${book}-actors`);
  for (const { actor, items } of embeddedOf(actorsOf[book])) {
    for (const item of items) {
      const t = tr[actor._id]?.items?.[item.name];
      const k = key(item.type, item.name);
      offer(k, t?.name, rank);
      offerText(k, text(item), t?.description);
    }
  }
}

/* ── What the hand-written slices already set ────────────────────────────── */

async function authored(legacy) {
  const collection = `${legacy}.actors`;
  const byEnglish = new Map(Object.entries(index[collection]?.entries ?? {}).map(([id, doc]) => [doc.name, id]));
  const set = new Map();  // actorId → Map(itemName → Set(fields))
  const mark = (actorId, items) => {
    for (const [name, fields] of Object.entries(items ?? {})) {
      if (!set.has(actorId)) set.set(actorId, new Map());
      const m = set.get(actorId);
      m.set(name, new Set([...(m.get(name) ?? []), ...Object.keys(fields)]));
    }
  };
  for (const file of fs.readdirSync(SRC)) {
    if (!file.startsWith(`${collection}.`) || file === GENERATED(legacy)) continue;
    const slice = await import(pathToFileURL(path.join(SRC, file)).href);
    for (const [id, entry] of Object.entries(slice.entries ?? {})) mark(id, entry.items);
    for (const [english, entry] of Object.entries(slice.byName ?? {})) {
      const id = byEnglish.get(english);
      if (id) mark(id, entry.items);
    }
  }
  return set;
}

/* ── Emit ────────────────────────────────────────────────────────────────── */

const cyrillic = /[А-Яа-яЁё]/;
const english = s => /[A-Za-z]{3,}/.test(String(s ?? "").replace(/<[^>]*>/g, " ").replace(/@\w+\[[^\]]*\]/g, " "))
  && !cyrillic.test(String(s ?? "").replace(/<[^>]*>/g, " ").replace(/@\w+\[[^\]]*\]/g, " "));

for (const [book, { legacy, label }] of Object.entries(BOOKS)) {
  const done = await authored(legacy);
  const entries = {};
  let n = 0, d = 0;
  for (const { actor, items } of embeddedOf(actorsOf[book])) {
    const out = {};
    for (const item of items) {
      const have = done.get(actor._id)?.get(item.name) ?? new Set();
      const k = key(item.type, item.name);
      const entry = {};
      if (!have.has("name") && english(item.name) && names.has(k)) { entry.name = names.get(k).name; n++; }
      const same = exact.get(`${k}\u0001${text(item)}`);
      const alike = descriptions.get(`${k}\u0001${canonical(text(item))}`);
      const ru = same ?? (alike && retarget(alike, text(item)));
      if (!have.has("description") && english(text(item)) && ru) { entry.description = ru; d++; }
      if (Object.keys(entry).length) out[item.name] = entry;
    }
    if (Object.keys(out).length) entries[actor._id] = { items: out };
  }
  const js = `// Generated by tools/seed-actor-items.mjs — do not edit; re-run it instead.\n`
    + `// Embedded items translated by reusing existing translations (see the tool).\n`
    + `export const label = ${JSON.stringify(label)};\n`
    + `export const entries = ${JSON.stringify(entries, null, 2)};\n`;
  fs.writeFileSync(path.join(SRC, GENERATED(legacy)), js);
  console.log(`${legacy}: ${n} names, ${d} descriptions reused across ${Object.keys(entries).length} actors`);
}
