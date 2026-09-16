/**
 * Быстрый доступ к специализациям умений.
 *
 * Система заводит их по одной: жмёшь плюс, ищешь в списке, создаёшь предмет.
 * Когда ведущий говорит «кинь Бдительность (Слух)», игрок вместо броска лезет
 * заводить специализацию.
 *
 * Класть их все на лист тоже плохо — их десятки, и лист превращается в
 * простыню. Поэтому под каждым умением прячется свёрнутый список всех
 * специализаций из компендиумов: раскрыл, ткнул, бросил. Ничего не создаётся.
 *
 * Бросок идёт через `setupSkillTest({ key, name })` — системе не нужен предмет,
 * чтобы бросить специализацию по имени. Если предмет всё же есть (куплены
 * продвижения), бросаем по нему, иначе продвижения потерялись бы.
 */

const MODULE_ID = "navis-apexialis";

export function normaliseName(name) {
  return String(name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * В список идут все специализации из компендиумов — включая особые вроде
 * Психического чутья и все ветки Техники (Безопасность, Аугметика и прочие).
 *
 * Фильтр по `restricted` и по пометкам «(Особое)» в названии был здесь раньше
 * и прятал лишнее: право взять специализацию — вопрос ведущего, а видеть, что
 * вообще бывает, полезно всегда. Нужен только сам тип и привязка к умению.
 */
export function isBaseSpecialisation(item) {
  return item?.type === "specialisation" && Boolean(item?.system?.skill);
}

/**
 * Каталог по умениям: `{ athletics: ["Бег", "Лазанье", …] }`. Одинаковые записи
 * из разных компендиумов схлопываются, порядок — алфавитный.
 */
export function groupBySkill(items = []) {
  const groups = {};
  const seen = new Set();
  for (const item of items) {
    if (!isBaseSpecialisation(item)) continue;
    const signature = `${item.system.skill}|${normaliseName(item.name)}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    (groups[item.system.skill] ??= []).push(item.name);
  }
  for (const list of Object.values(groups)) list.sort((a, b) => a.localeCompare(b));
  return groups;
}

/** Предмет специализации на листе, если он есть: в нём живут продвижения. */
export function ownedSpecialisation(actor, skill, name) {
  return [...(actor?.items ?? [])].find(item =>
    item.type === "specialisation"
    && item.system?.skill === skill
    && normaliseName(item.name) === normaliseName(name));
}

let cache = null;
export async function specialisationCatalogue() {
  if (cache) return cache;
  const find = globalThis.warhammer?.utility?.findAllItems;
  if (typeof find !== "function") return {};
  cache = groupBySkill(await find("specialisation", "", false));
  return cache;
}

export function clearCatalogueCache() { cache = null; }

/** Бросок: по предмету, если он есть, иначе по одному имени. */
export function rollSpecialisation(actor, skill, name) {
  const owned = ownedSpecialisation(actor, skill, name);
  return owned
    ? actor.setupSkillTest({ itemId: owned.id })
    : actor.setupSkillTest({ key: skill, name });
}
