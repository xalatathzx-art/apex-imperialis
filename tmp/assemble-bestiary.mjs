import fs from "node:fs";
const dicts = fs.readFileSync("tmp/best-dicts.mjs", "utf8").replace(/^\/\*[^\n]*\*\/\n\n/, "").replace(/^export /gm, "");
const items = fs.readFileSync("tmp/best-items.mjs", "utf8").replace(/^export /gm, "");
const notes = fs.readFileSync("tmp/best-notes-en.txt", "utf8");
const actors = fs.readFileSync("tmp/best-actors-table.txt", "utf8");

const header = `/**
 * Бестиарий «Maledictum Expanded» (115 существ): русский слой.
 *
 * Пак написан по-английски (src/packs/bestiary) и переводится через Babele.
 * Переводятся имя, заметка ведущего (description), вид (species) и названия
 * вложенных трейтов и оружия. Поле role — служебный ключ системы (troop, elite,
 * leader, master), faction — объект; их Babele не трогает.
 *
 * Вложенные предметы, уже переведённые где-то ещё, дописывает
 * tools/seed-actor-items.mjs в navis-apexialis.navis-bestiary.reused-items.mjs;
 * здесь — только то, чего больше нигде нет. Предметы переводятся по имени:
 * у копий-близнецов одно английское имя, значит и русское одно.
 *
 * Написание — как в уже переведённых паках и журналах: Тау, некроны, друкхари,
 * генокрады, скитарии, крууты, Нургл, Кхорн, Тзинч, Слаанеш; «Во имя Высшего
 * блага». Имена существ, у которых нет устоявшегося русского облика, — наша
 * транслитерация. Space Marine organs (Larraman's Organ, Betcher's Gland и т. д.)
 * названы по именам открывателей, как принято в русском Warhammer 40,000.
 */

import fs from "node:fs";

export const label = "Бестиарий (Maledictum Expanded)";

`;

const tail = `
const INDEX = JSON.parse(fs.readFileSync(new URL("./packs-index.json", import.meta.url), "utf8"))["navis-apexialis.navis-bestiary"].entries;

export const entries = Object.fromEntries(ACTORS.map(([id, en, note, species]) => {
  const embedded = INDEX[id]?.embedded ?? [];
  const translated = Object.fromEntries(embedded.filter(n => ITEMS[n]).map(n => [n, { name: ITEMS[n] }]));
  const entry = { en, name: ACTOR_NAMES[en] };
  if (note !== null) entry.description = NOTES_RU[NOTES_EN.indexOf(note)];
  if (species) entry.species = SPECIES[species];
  if (Object.keys(translated).length) entry.items = translated;
  return [id, entry];
}));
`;

// ACTORS rows name notes as N<i>; resolve to the English text so the table is self-describing.
const actorsResolved = actors.replace(/, N(\d+)/g, (_, i) => `, NOTES_EN[${i}]`);
fs.writeFileSync("src/compendium/navis-apexialis.navis-bestiary.mjs", header + dicts + "\n" + items + "\n" + notes + "\n" + actorsResolved + tail);
console.log("written");
