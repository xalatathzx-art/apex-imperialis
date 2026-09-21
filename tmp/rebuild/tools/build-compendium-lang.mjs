/**
 * Compile the compendium translations into compendium/*.json for Babele.
 *
 * Babele rewrites a document as it leaves its pack, reading one JSON file per
 * pack named for the collection — impmal-core.items.json and so on — from a
 * directory the module registers (module/content-i18n.js). The packs themselves
 * are never touched, which is the point: three of the four are Cubicle 7's.
 *
 * The source of truth is src/compendium/<collection>.mjs, one module per pack,
 * each exporting a `label` and an `entries` map keyed by document id. Every
 * entry carries the English text beside the Russian so the file can be read on
 * its own — and so the build can check it.
 *
 * The check is the reason this is a build step rather than hand-written JSON.
 * src/compendium/packs-index.json holds every id, type and English name, dumped
 * from a running world. The build fails when an entry names an id the packs do
 * not have, or when its `en` no longer matches what the pack says — the first
 * is a typo, the second means the publisher changed the text under us and the
 * translation may no longer describe the same thing. Both fail silently at the
 * table otherwise: Babele just leaves the document in English.
 *
 * To refresh the index after a content update, with the world open, dump it
 * from the console:
 *
 *   const out = {};
 *   for (const pack of game.packs) {
 *     if (!["impmal-core","impmal-inquisition","impmal-requisition","navis-apexialis"]
 *          .includes(pack.metadata.packageName)) continue;
 *     const docs = await pack.getDocuments();
 *     out[pack.collection] = { label: …, documentName: …, entries: … };
 *   }
 *   copy(JSON.stringify(out));
 *
 * Each entry carries the document's id, type and English name; `src` when
 * Foundry recorded a compendium source (the leak below); `embedded` for an
 * actor's item names; and `rows` for a table — each row's id, range, text, and
 * the id and pack of the document it points at. The exact dump this project
 * uses is in the session notes; keep the shape, or the passes below go quiet.
 *
 *   node tools/build-compendium-lang.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

import { SPECIES } from "../src/compendium/shared/species.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/compendium");
const OUT = path.join(ROOT, "compendium");
const INDEX = path.join(SRC, "packs-index.json");
const MODULE_PACKS = "navis-apexialis";

/**
 * The fields a translation entry may carry, mirroring compendium/mappings.json.
 *
 * `results` is a roll table's rows, keyed by the row's own id; the build fills
 * in every row that points at a document it has already translated.
 *
 * `items` is for an actor whose embedded weapons, traits or talents have no
 * counterpart in the item pack — an NPC-only trait like "Stalwart", or a kit
 * line like "a pair of dog tags". Everything an NPC copied FROM the item pack
 * needs no entry: Babele follows each embedded item's compendium source back to
 * the item pack's translation on its own. Verified — an actor with no entry at
 * all still shows «Лазган» and «Фраг-граната».
 *
 * `pages` is a journal's pages. Babele's default JournalEntry mapping already
 * carries `pages`, translating each page as an embedded JournalEntryPage with
 * `name` and `text.content` — so no custom mapping is needed, only the entries.
 * Like `results`, a source file may write them as an array in the journal's own
 * order and the build keys them by page id.
 */
const FIELDS = ["name", "description", "gmNotes", "characterNotes", "patronNotes", "requirement", "powerTarget", "playerNotes", "species", "role", "faction", "items", "results", "pages", "drawings", "notes", "regions"];

/**
 * Names that are also code.
 *
 * impmal runs 634 effect scripts, and 36 of them find their subject by English
 * name — `i.name == "Composure"`, `i.name == "Multi-melta"`. Translating such a
 * document does not just rename it: the script stops finding it, and a talent
 * quietly does nothing. These are the names that dump reports, refreshed from a
 * running world the same way as the index.
 *
 * Our own code used to do the same in three places — a subspecies is gated on
 * `system.requires === species.name`, a species names the subspecies that
 * cannot outlive it, and a package names the traits it cancels — so those names
 * were reserved here. They are not any more: all three comparisons in
 * module/species/species-model.js now accept Babele's stored English name
 * alongside the translated one, the same widening module/script-names.js
 * performs on impmal's own scripts. The species pack links by exactly four
 * names (Human and Beastman through `requires`, Horns and Hooves and Aversion
 * to Order through `removes`), and all four go through those comparisons.
 *
 * The list stays, empty, because the next name-linked field will want it back.
 */
const RESERVED_OURS = [];

if (!fs.existsSync(INDEX)) {
  console.error(`Missing ${path.relative(ROOT, INDEX)} — dump it from a running world first (see the header).`);
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));

// Both sides are handled at runtime now: module/script-names.js widens impmal's
// 57 comparisons, and species-model.js widens our three, so translating any of
// these documents is safe. src/compendium/reserved-names.json is the dump that
// impmal pass is measured against — kept for the audit, not as a block.
const reserved = new Set(RESERVED_OURS);
const sources = fs.readdirSync(SRC).filter(file => file.endsWith(".mjs")).sort();

if (!sources.length) {
  console.error(`No translation sources in ${path.relative(ROOT, SRC)}.`);
  process.exit(1);
}

const referenced = {};
const speciesGaps = new Set();
const problems = [];
const written = [];
let totalTranslated = 0;

/**
 * One pack may be translated by several sources — the Core Rulebook's items run
 * to 725 documents across eighteen types, and the book covers them in chapters.
 * A file is named `<collection>.<slice>.mjs`; everything before the slice is the
 * pack, and the slices are merged.
 */
const byCollection = new Map();

for (const file of sources) {
  const stem = file.replace(/\.mjs$/, "");
  const collection = Object.keys(index).find(id => stem === id || stem.startsWith(`${id}.`));

  if (!collection) {
    problems.push(`${file} names a pack the index does not have`);
    continue;
  }
  if (!byCollection.has(collection)) byCollection.set(collection, []);
  byCollection.get(collection).push(file);
}

/**
 * An actor's embedded items are a map, and two slices routinely describe
 * different items of the same actor — one the book's traits, another its kit.
 * A plain spread keeps whichever slice came last and drops the other's items.
 */
function mergeItems(a, b) {
  if (!a?.items && !b?.items) return {};
  const items = { ...(a?.items ?? {}) };
  for (const [name, item] of Object.entries(b?.items ?? {})) items[name] = { ...(items[name] ?? {}), ...item };
  return { items };
}

for (const [collection, files] of byCollection) {
  const pack = index[collection];
  const out = {};
  const source = { entries: {}, byName: {}, label: null };

  // Merged per key, not per slice: names come from the chapter that lists them
  // and the rules text from the chapter that prints it, so two slices routinely
  // describe the same document and each contributes different fields.
  for (const file of files) {
    const slice = await import(pathToFileURL(path.join(SRC, file)).href);
    for (const [key, entry] of Object.entries(slice.entries ?? {})) {
      const previous = source.entries[key] ?? {};
      const mergedItems = { ...(previous.items ?? {}) };
      for (const [itemName, item] of Object.entries(entry.items ?? {})) {
        mergedItems[itemName] = { ...(mergedItems[itemName] ?? {}), ...item };
      }
      source.entries[key] = {
        ...previous,
        ...entry,
        ...((previous.items || entry.items) ? { items: mergedItems } : {})
      };
    }
    // Keyed by type as well as name. impmal ships "Sanctioned Psyker" twice,
    // once as a talent and once as a duty, and the book gives each its own
    // section — so two slices legitimately use the same English name for
    // different documents. Merging them on the name alone silently threw one
    // away and left its document untranslated.
    for (const [english, entry] of Object.entries(slice.byName ?? {})) {
      const key = `${entry.type ?? "*"} :: ${english}`;
      const before = source.byName[key]?.entry ?? {};
      source.byName[key] = { english, entry: { ...before, ...entry, ...mergeItems(before, entry) } };
    }
    source.label ??= slice.label ?? null;
  }

  // A source may key by document id, or — where the book gives a flat list and
  // the English name is unambiguous enough to look up — by English name. The
  // second is resolved here, and deliberately applies to every document of that
  // name: impmal ships "Forbidden (Various)" three times, once per skill, and
  // the book gives all three the same word.
  const entries = { ...(source.entries ?? {}) };

  for (const { english, entry } of Object.values(source.byName ?? {})) {
    const ids = Object.entries(pack.entries)
      .filter(([, doc]) => doc.name === english && (!entry.type || doc.type === entry.type))
      .map(([id]) => id);

    if (!ids.length) {
      problems.push(`${collection}: no document named "${english}"${entry.type ? ` of type ${entry.type}` : ""}`);
      continue;
    }
    // A document may be described once by id (long rules text) and once by
    // name (chapter index/name). Keep both: the name slice must not erase
    // fields such as characterNotes or patronNotes from the id slice.
    for (const id of ids) entries[id] = { ...(entries[id] ?? {}), ...entry, ...mergeItems(entries[id] ?? {}, entry), en: english };
  }

  for (const [id, entry] of Object.entries(entries)) {
    const actual = pack.entries[id];

    if (!actual) {
      problems.push(`${collection}: no document with id ${id} (${entry.en ?? entry.name})`);
      continue;
    }
    if (entry.en && entry.en !== actual.name) {
      problems.push(
        `${collection}: ${id} is "${actual.name}" in the pack but the source says "${entry.en}" — ` +
        `the publisher renamed it, so check the translation still fits`
      );
      continue;
    }

    // Only our own packs: the names our code compares are our species and
    // traits. impmal-core ships a "Human" specialisation that has nothing to do
    // with the Human species a subspecies requires.
    if (entry.name != null && collection.startsWith(`${MODULE_PACKS}.`) && reserved.has(actual.name)) {
      problems.push(
        `${collection}: "${actual.name}" is matched by name in code, so translating its name ` +
        `would stop that code finding it — translate its text but leave the name off`
      );
      continue;
    }

    // Older source slices used Actor's `playerNotes` alias for Item prose.
    // Normalize it according to the actual Item subtype before emitting the
    // Babele fields, so specialisations reach system.notes.player while duties
    // and factions reach their separate character block.
    if (pack.documentName === "Item" && entry.playerNotes != null) {
      if (["duty", "faction"].includes(actual.type)) entry.characterNotes ??= entry.playerNotes;
      else entry.description ??= entry.playerNotes;
      delete entry.playerNotes;
    }
    // Вид НИП — короткая строка из десятка повторяющихся значений, поэтому она
    // живёт одной общей таблицей, а не в записи каждого существа. Babele умеет
    // её переводить, но до сих пор её никто не заполнял, и в шапке любого НИП
    // стояло английское «Human» рядом с переведённой ролью.
    if (pack.documentName === "Actor" && entry.species == null) {
      const english = actual.species;
      if (english) {
        const russian = SPECIES[english];
        if (russian) entry.species = russian;
        else speciesGaps.add(english);
      }
    }

    const translated = Object.fromEntries(FIELDS.filter(f => entry[f] != null).map(f => [f, entry[f]]));
    if (!Object.keys(translated).length) continue;

    out[id] = translated;
    totalTranslated++;
  }

  // ── Name the rows that point at a document ────────────────────────────
  //
  // Most rows of a roll table are not text but a reference: the boon tables
  // point at boon items, the critical tables at criticals. Babele has a
  // converter for exactly this — it follows the row's uuid into the referenced
  // pack and asks that document's translation for a name — but it asks BY NAME,
  // and our entries are keyed by id, so the lookup finds nothing. Verified
  // twice: naming a table translated its title and left all ten rows English.
  //
  // So the rows are filled here, from the translation the referenced pack
  // already has. They are keyed by the row's own `_id`, because that is the
  // only identity Babele can actually match on — the TableResult mapping also
  // lists `range`, but no extractor is registered for it, so a range-keyed row
  // is silently dropped. A row the source file wrote by hand wins; a row whose
  // reference is untranslated is left out and stays English.
  let rows = 0;

  if (pack.documentName === "RollTable") {
    const nameFor = (refPack, id) => {
      const [refModule, refName] = refPack.split(".");
      const refPrefix = {
        "impmal-core": "navis-core",
        "impmal-inquisition": "navis-inquisition",
        "impmal-requisition": "navis-requisition",
        "impmal-voll": "navis-voll"
      }[refModule];
      // The consolidated packs are written as navis-apexialis.<pack>.json. An
      // unprefixed name here once read a stale copy from an earlier layout,
      // which worked only as long as nobody cleaned the directory.
      if (refPrefix) refPack = `navis-apexialis.${refPrefix}-${refName}`;
      const target = path.join(OUT, `${refPack}.json`);
      if (!fs.existsSync(target)) return null;
      referenced[refPack] ??= JSON.parse(fs.readFileSync(target, "utf8")).entries;
      return referenced[refPack][id]?.name ?? null;
    };

    for (const [id, translated] of Object.entries(out)) {
      const source = pack.entries[id]?.rows;
      if (!source?.length || !Object.keys(translated).length) continue;

      // A source file writes rows as an array in the table's own order, which
      // is how the book prints them and the only way they are readable. Babele
      // needs them keyed by row id, so the array is mapped onto the rows here.
      const authored = translated.results ?? {};
      const hand = Array.isArray(authored)
        ? Object.fromEntries(authored.map((row, i) => [source[i]?.id, row]).filter(([id]) => id))
        : authored;

      if (Array.isArray(authored) && authored.length !== source.length) {
        problems.push(
          `${collection}: ${pack.entries[id].name} has ${source.length} rows but the source writes ${authored.length}`
        );
        continue;
      }

      const results = {};

      for (const row of source) {
        const written = hand[row.id];
        if (written) { results[row.id] = written; continue; }
        const name = row.ref && row.refPack ? nameFor(row.refPack, row.ref) : null;
        if (!name) continue;
        results[row.id] = { name };
        rows++;
      }

      if (Object.keys(results).length) translated.results = results;
      else delete translated.results;
    }
  }

  // ── Key a journal's pages by page id ──────────────────────────────────
  //
  // A journal is a chapter and its pages are the sections, so a source file
  // writes them keyed by the page's English name — «Conditions», «Talents» —
  // which is how the book's contents page reads and how you find the section
  // to check a translation against. Babele matches an embedded page by `_id`
  // first and `name` second, and once the name is translated the second match
  // is gone, so the ids are resolved here while the English names still hold.
  //
  // A page named in the source but absent from the journal is a build failure
  // for the same reason a missing document id is: the section was renamed or
  // moved, and a page-name typo otherwise just leaves the chapter in English.
  let pages = 0;

  if (pack.documentName === "JournalEntry") {
    for (const [id, translated] of Object.entries(out)) {
      const source = pack.entries[id]?.pages;
      const authored = translated.pages;
      if (!authored || !source?.length) continue;

      const hand = Array.isArray(authored)
        ? Object.fromEntries(authored.map((page, i) => [source[i]?.name, page]).filter(([name]) => name))
        : authored;

      if (Array.isArray(authored) && authored.length !== source.length) {
        problems.push(
          `${collection}: ${pack.entries[id].name} has ${source.length} pages but the source writes ${authored.length}`
        );
        continue;
      }

      const keyed = {};

      for (const [key, page] of Object.entries(hand)) {
        // A page is named by its English title, which reads like the book's
        // contents page. Where a journal repeats a title — Psychic Powers has
        // a chapter opener and a power list, both called "Psychic Powers" — the
        // title is not an address, so the page id is accepted too, and an
        // ambiguous title fails the build rather than silently taking the
        // first page and leaving the other one English.
        const byId = source.find(p => p.id === key);
        const named = source.filter(p => p.name === key);

        if (!byId && named.length > 1) {
          problems.push(
            `${collection}: ${pack.entries[id].name} has ${named.length} pages named "${key}" — ` +
            `key them by page id instead (${named.map(p => p.id).join(", ")})`
          );
          continue;
        }

        const match = byId ?? named[0];
        if (!match) {
          problems.push(`${collection}: ${pack.entries[id].name} has no page named "${key}"`);
          continue;
        }
        keyed[match.id] = page;
        pages++;
      }

      if (Object.keys(keyed).length) translated.pages = keyed;
      else delete translated.pages;
    }
  }

  // ── Block the duplicate-source leak ───────────────────────────────────
  //
  // Babele matches a document to a translation by `_id`, then by `name`, then
  // by the id in `_stats.compendiumSource`. That last one is a trap here:
  // Cubicle 7 built many of these documents by duplicating one of their
  // siblings, and Foundry recorded it. 42 items in the Core Rulebook alone
  // point at another item in the same pack — 27 duties all point at
  // Arch-Confessor. So translating one document silently renamed the other
  // twenty-six.
  //
  // The fix is a no-op entry keyed by the untranslated document's own id.
  // Babele tries `_id` first, finds an entry, and stops — and because the entry
  // names no mapped field, nothing is rewritten. The document stays English,
  // which is what "not translated yet" is supposed to look like.
  let shielded = 0;
  for (const [id, doc] of Object.entries(pack.entries)) {
    if (out[id] || !doc.src || !out[doc.src]) continue;
    out[id] = {};
    shielded++;
  }

  if (problems.length) continue;

  fs.mkdirSync(OUT, { recursive: true });
  const [moduleId, packName] = collection.split(".");
  const migratedModule = {
    "impmal-core": "navis-core",
    "impmal-inquisition": "navis-inquisition",
    "impmal-requisition": "navis-requisition",
    "impmal-voll": "navis-voll"
  }[moduleId];
  const outputCollection = migratedModule ? `navis-apexialis.${migratedModule}-${packName}` : collection;
  const target = path.join(OUT, `${outputCollection}.json`);
  fs.writeFileSync(target, `${JSON.stringify({ label: source.label ?? pack.label, entries: out }, null, 2)}\n`);

  const total = Object.keys(pack.entries).length;
  written.push({ collection: outputCollection, done: Object.keys(out).length - shielded, total, shielded, rows, pages });
}

if (problems.length) {
  console.error(`Compendium translation build FAILED — ${problems.length} problem(s):\n`);
  problems.forEach(p => console.error(`  - ${p}`));
  process.exit(1);
}

// Вид, которого нет в общей таблице, оставил бы английскую строку в шапке
// НИП — ровно то, что эта таблица и чинит. Сообщаем вслух.
if (speciesGaps.size) {
  console.warn(`
${speciesGaps.size} species have no Russian in src/compendium/shared/species.mjs:`);
  for (const name of [...speciesGaps].sort()) console.warn(`  ${name}`);
}

for (const { collection, done, total, shielded, rows, pages } of written) {
  const percent = ((done / total) * 100).toFixed(1);
  const guard = shielded ? `, ${shielded} shielded from the duplicate-source leak` : "";
  const filled = rows ? `, ${rows} referenced rows named` : "";
  const paged = pages ? `, ${pages} pages` : "";
  console.log(`${collection}: ${done} of ${total} documents (${percent}%)${guard}${filled}${paged}`);
}

const packCount = Object.keys(index).length;
console.log(`\n${totalTranslated} documents translated across ${written.length} of ${packCount} packs`);
