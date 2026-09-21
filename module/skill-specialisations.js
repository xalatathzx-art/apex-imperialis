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

import { byName as RUSSIAN_SPECIALISATIONS } from "../src/compendium/impmal-core.items.specialisations.mjs";

const MODULE_ID = "navis-apexialis";

const SPECIALISATION_ALIASES = new Map();
for (const [english, data] of Object.entries(RUSSIAN_SPECIALISATIONS)) {
  SPECIALISATION_ALIASES.set(normaliseName(english), english);
  SPECIALISATION_ALIASES.set(normaliseName(data.name), english);
}

export function normaliseName(name) {
  return String(name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** A client-language-independent identity for a core specialisation label. */
export function canonicalSpecialisationName(name) {
  const normalised = normaliseName(name);
  return SPECIALISATION_ALIASES.get(normalised) ?? normalised;
}

/** Show core specialisations in the current client's language without mutating data. */
export function displaySpecialisationName(name, language = globalThis.game?.i18n?.lang) {
  const canonical = canonicalSpecialisationName(name);
  return language?.startsWith("ru")
    ? RUSSIAN_SPECIALISATIONS[canonical]?.name ?? name
    : canonical;
}

/**
 * В каталог идут только доступные специализации. Особые (`restricted`) система
 * уже отмечает сама; они появляются на листе лишь когда выданы персонажу.
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
    if (!isBaseSpecialisation(item) || item.system?.restricted) continue;
    const signature = `${item.system.skill}|${canonicalSpecialisationName(item.name)}`;
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
    && canonicalSpecialisationName(item.name) === canonicalSpecialisationName(name));
}

/** The effective specialisation total, falling back to the parent skill. */
export function specialisationTotal(actor, skill, name) {
  const specialisation = ownedSpecialisation(actor, skill, name);
  return specialisation?.system?.total ?? actor?.system?.skills?.[skill]?.total;
}

let cache = null;
export async function specialisationCatalogue() {
  if (cache) return cache;
  const find = globalThis.warhammer?.utility?.findAllItems;
  if (typeof find !== "function") return {};
  cache = find("specialisation", "", false).then(groupBySkill);
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
