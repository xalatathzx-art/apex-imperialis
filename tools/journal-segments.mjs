/**
 * Translate journal pages without touching their markup.
 *
 * A journal page is HTML with Foundry enrichers inside the text. Translating it
 * whole by hand risks a changed tag, attribute or link target — and those break
 * anchors and links silently. This splits a page into tags and text runs; only
 * the runs are translated, and the page is rebuilt from the original tags with
 * the translated runs put back in the same places.
 *
 * The translations live in src/compendium/journal-runs/<pack>/<pageId>.json:
 *   { journal, journalName, page, pageName, name, runs: { "<i>": { en, ru } } }
 * `name` is the page's Russian title; each run carries its English beside the
 * Russian, so a publisher's change to the text is caught instead of silently
 * pasted over. The Babele slice is generated from these files — never edit it.
 *
 *   extract <pack> <journalId>            — write run files for every page of a
 *                                           journal (existing files are kept)
 *   build   <pack> <collection> <slice> [label] — check every run file against the
 *                                           pack and write the slice
 *
 * A run keeps its enrichers (@UUID[target]{label}, [[/r 1d10]] …) inline, so a
 * label is translated in place; `build` refuses a page whose enricher targets
 * or roll formulas differ from the English, or whose runs are incomplete.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readPack, partition } from "./lib/level.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const RUNS = path.join(ROOT, "src", "compendium", "journal-runs");

async function journals(pack) {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "seg-"));
  fs.cpSync(path.join(ROOT, "packs", pack), copy, { recursive: true, filter: s => !s.endsWith("LOCK") });
  const { primary, embedded } = partition(await readPack(copy));
  const byId = new Map(Object.values(embedded).map(d => [d._id, d]));
  return primary.map(j => ({ journal: j, pages: (j.pages ?? []).map(id => byId.get(id)).filter(Boolean) }));
}

/** Tags and text, alternating; the text parts are what gets translated. */
export const split = html => String(html).split(/(<[^>]+>)/);
const WORDS = /[A-Za-zА-Яа-яЁё0-9]/;
const bare = s => s.replace(/@\w+\[[^\]]*\]/g, "").replace(/\[\[[^\]]*\]\]/g, "");
export const isRun = (part, i) => i % 2 === 0 && WORDS.test(bare(part));

/** Enricher targets and inline rolls: must be identical before and after. */
export const protectedTokens = text => [
  ...[...String(text).matchAll(/@(\w+)\[([^\]]*)\]/g)].map(m => `@${m[1]}[${m[2]}]`),
  ...[...String(text).matchAll(/\[\[[^\]]*\]\]/g)].map(m => m[0])
].sort();

export function rebuild(english, runs) {
  const parts = split(english);
  const problems = [];
  parts.forEach((part, i) => {
    if (!isRun(part, i)) return;
    const r = runs[i];
    if (!r) problems.push(`run ${i} missing`);
    else if (r.en !== part) problems.push(`run ${i} English changed`);
    else if (!r.ru) problems.push(`run ${i} untranslated`);
  });
  for (const i of Object.keys(runs)) if (!isRun(parts[i] ?? "", Number(i))) problems.push(`run ${i} no longer exists`);
  if (problems.length) return { problems };
  const text = parts.map((p, i) => (runs[i] ? runs[i].ru : p)).join("");
  const a = protectedTokens(english), b = protectedTokens(text);
  if (a.join("\n") !== b.join("\n")) {
    problems.push(`enricher targets changed — lost: ${a.filter(t => !b.includes(t)).join(" ")} | added: ${b.filter(t => !a.includes(t)).join(" ")}`);
    return { problems };
  }
  return { text };
}

const [mode, pack, arg2, arg3] = process.argv.slice(2);

if (mode === "extract") {
  const found = (await journals(pack)).find(j => j.journal._id === arg2);
  if (!found) throw new Error(`no journal ${arg2} in ${pack}`);
  const dir = path.join(RUNS, pack);
  fs.mkdirSync(dir, { recursive: true });
  let made = 0, chars = 0;
  for (const pg of found.pages) {
    const file = path.join(dir, `${pg._id}.json`);
    if (fs.existsSync(file)) continue;
    const runs = {};
    split(pg.text?.content ?? "").forEach((part, i) => { if (isRun(part, i)) { runs[i] = { en: part, ru: "" }; chars += part.length; } });
    fs.writeFileSync(file, `${JSON.stringify({ journal: found.journal._id, journalName: found.journal.name, page: pg._id, pageName: pg.name, name: "", runs }, null, 1)}\n`);
    made++;
  }
  console.log(`${found.journal.name}: ${made} new run files, ${chars} characters to translate`);
} else if (mode === "build") {
  const [collection, slice, label = "Журналы"] = [arg2, arg3, process.argv[6]];
  const dir = path.join(RUNS, pack);
  const all = await journals(pack);
  const entries = {};
  const problems = [];
  const pending = [];
  let pages = 0;
  for (const { journal, pages: list } of all) {
    for (const pg of list) {
      const file = path.join(dir, `${pg._id}.json`);
      if (!fs.existsSync(file)) continue;
      const src = JSON.parse(fs.readFileSync(file, "utf8"));
      // A page still being translated is left out and stays English; only a
      // page that is finished but wrong stops the build.
      const unfinished = !src.name || Object.values(src.runs).some(r => !r.ru);
      if (unfinished) { pending.push(`${journal.name} / ${pg.name}`); continue; }
      const { text, problems: p } = rebuild(pg.text?.content ?? "", src.runs);
      if (p) { problems.push(...p.map(x => `${journal.name} / ${pg.name}: ${x}`)); continue; }
      entries[journal._id] ??= { en: journal.name, pages: {} };
      entries[journal._id].pages[pg._id] = { name: src.name, text };
      if (src.journalRu && pg._id === list[0]._id) entries[journal._id].name = src.journalRu;
      pages++;
    }
  }
  if (problems.length) {
    console.error(`${problems.length} problem(s):`);
    for (const p of problems.slice(0, 30)) console.error(`  ${p}`);
    process.exit(1);
  }
  const js = `// Generated by tools/journal-segments.mjs from src/compendium/journal-runs/${pack}/ — do not edit.\n`
    + `export const label = ${JSON.stringify(label)};\n`
    + `export const entries = ${JSON.stringify(entries, null, 1)};\n`;
  fs.writeFileSync(path.join(ROOT, "src", "compendium", slice), js);
  console.log(`${slice}: ${Object.keys(entries).length} journals, ${pages} pages translated, ${pending.length} pending`);
} else {
  console.error("usage: journal-segments.mjs extract <pack> <journalId> | build <pack> <collection> <slice.mjs>");
  process.exit(2);
}
