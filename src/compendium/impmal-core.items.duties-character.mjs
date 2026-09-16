/**
 * The 27 duties a character can hold — three per service — from the Faction
 * chapter, стр. 56–73. Twenty-six new; "Дипломат" is already translated as the
 * Rogue Trader patron duty and covers both documents.
 *
 * Two departures from the page, both forced by the compendium being one list
 * where the book is nine separate spreads:
 *
 *  - The book calls both стр. 59 and стр. 63 "Сестра-послушница". They are
 *    different duties in different services — an aspirant of the Sisters of
 *    Silence and a novice of the Adepta Sororitas — so each carries its order
 *    in brackets.
 *
 *  - стр. 69 leaves the heading "GANGER" in English; the Russian edition simply
 *    missed it. The other two duties of that service are Посредник and Ульевой
 *    курьер, and the text under the heading describes someone who does what the
 *    boss says, so it is "Боец банды".
 */

export const label = "Предметы (Основная книга)";

export const byName = {
  /* Адептус Администратум (стр. 57) */
  "Officio Medicae": { type: "duty", name: "Оффицио Медика" },
  Scrivener: { type: "duty", name: "Писарь" },
  Clerk: { type: "duty", name: "Клерк" },

  /* Адептус Астра Телепатика (стр. 59) */
  "Sanctioned Psyker": { type: "duty", name: "Санкционированный псайкер" },
  "Sister-In-Waiting": { type: "duty", name: "Сестра-послушница (Сёстры Безмолвия)" },
  "Black Ship Crewmember": { type: "duty", name: "Пустоход с Чёрного корабля" },

  /* Адептус Механикус (стр. 61) */
  "Apprentice Enginseer": { type: "duty", name: "Подмастерье машиноведа" },
  "Apprentice Genetor": { type: "duty", name: "Подмастерье генетора" },
  "Apprentice Logis": { type: "duty", name: "Подмастерье логиса" },

  /* Адептус Министорум (стр. 63) */
  Preacher: { type: "duty", name: "Проповедник" },
  "Sister Novitiate": { type: "duty", name: "Сестра-послушница (Адепта Сороритас)" },
  Missionary: { type: "duty", name: "Миссионер" },

  /* Астра Милитарум (стр. 65) */
  Scout: { type: "duty", name: "Разведчик" },
  Trooper: { type: "duty", name: "Пехотинец" },
  "Melee Specialist": { type: "duty", name: "Боец ближнего боя" },

  /* Имперские флотилии (стр. 67) */
  Armsman: { type: "duty", name: "Оруженосец" },
  "Aeronautica Pilot": { type: "duty", name: "Пилот Аэронавтики" },
  "Navis Officer": { type: "duty", name: "Флотский офицер" },

  /* Одиночки (стр. 69) */
  Ganger: { type: "duty", name: "Боец банды" },
  Fixer: { type: "duty", name: "Посредник" },
  Hiverunner: { type: "duty", name: "Ульевой курьер" },

  /* Инквизиция (стр. 71) */
  Acolyte: { type: "duty", name: "Аколит" },
  Exorcist: { type: "duty", name: "Экзорцист" },
  Sage: { type: "duty", name: "Мудрец" },

  /* Династии вольных торговцев (стр. 73) */
  Catalogist: { type: "duty", name: "Каталогизатор" },
  Adventurer: { type: "duty", name: "Искатель приключений" }
};
