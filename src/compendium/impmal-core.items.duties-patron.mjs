/**
 * The eighteen patron duties — two per service — from the Patron chapter,
 * стр. 18–27.
 *
 * impmal ships duties with no text at all: the document is its name, and the
 * rules for it live in the patron's own boons and liabilities. So this file
 * carries names only.
 *
 * "Diplomat" exists twice in the pack, once as this patron duty of a
 * Rogue Trader dynasty and once as a duty a character can hold. Both are
 * "Дипломат", so both are translated by the one entry.
 *
 * The two inquisitors are written the way стр. 45 writes them, "инквизитор
 * Ордо Ксенос", capitalised here because it is a title in a list.
 */

export const label = "Предметы (Основная книга)";

export const byName = {
  /* Адептус Администратум (стр. 18) */
  "Departmento Munitorum Ordinate": { type: "duty", name: "Ординат Департаменто Муниторум" },
  "Tithe Prefectus": { type: "duty", name: "Десятинный префект" },

  /* Адептус Астра Телепатика (стр. 19) */
  Astropath: { type: "duty", name: "Астропат" },
  "Sister of Silence": { type: "duty", name: "Сестра Безмолвия" },

  /* Адептус Механикус (стр. 20) */
  "Forge Lord": { type: "duty", name: "Владыка кузницы" },
  "Magos Biologis": { type: "duty", name: "Магос Биологис" },

  /* Адептус Министорум (стр. 21) */
  "Arch-Confessor": { type: "duty", name: "Архиисповедник" },
  Canoness: { type: "duty", name: "Канонисса" },

  /* Астра Милитарум (стр. 22) */
  "Lord-Commissar": { type: "duty", name: "Лорд-комиссар" },
  "Senior Officer": { type: "duty", name: "Старший офицер" },

  /* Имперские флотилии (стр. 23) */
  "Voidship Captain": { type: "duty", name: "Капитан пустотного корабля" },
  "Port Commander": { type: "duty", name: "Комендант порта" },

  /* Одиночки (стр. 24) */
  "Criminal Mastermind": { type: "duty", name: "Преступный гений" },
  Guildmaster: { type: "duty", name: "Гильдмейстер" },

  /* Инквизиция (стр. 25) */
  "Ordo Xenos Inquisitor": { type: "duty", name: "Инквизитор Ордо Ксенос" },
  "Ordo Hereticus Inquisitor": { type: "duty", name: "Инквизитор Ордо Еретикус" },

  /* Династии вольных торговцев (стр. 26) */
  Diplomat: { type: "duty", name: "Дипломат" },
  "Trader Militant": { type: "duty", name: "Торговец-милитант" }
};
