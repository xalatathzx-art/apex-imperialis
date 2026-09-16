/**
 * The factions impmal hard-codes, in the Russian rulebook's words.
 *
 * `game.impmal.config.factions` holds literal English strings rather than i18n
 * keys, so no language file can reach them — the Influence panel on every
 * character sheet prints them as written. These are the names the book uses,
 * from the contents page and the Service chapter (стр. 56–73).
 *
 * The three Ordos and the Departmento are not services a character can belong
 * to; impmal lists them because a patron can. "Ордо Еретикус" is the book's
 * own spelling (стр. 287, 334); the other two follow it.
 */
export const FACTIONS_RU = {
  "adeptus-administratum": "Адептус Администратум",
  "adeptus-astra-telepathica": "Адептус Астра Телепатика",
  "adeptus-mechanicus": "Адептус Механикус",
  "adeptus-ministorum": "Адептус Министорум",
  "astra-militarum": "Астра Милитарум",
  "imperial-fleet": "Имперские флотилии",
  "infractionists": "Одиночки",
  "rogue-trader-dynasty": "Династии вольных торговцев",
  "the-inquisition": "Инквизиция",
  "inquisition-xenos": "Инквизиция (Ордо Ксенос)",
  "inquisition-malleus": "Инквизиция (Ордо Маллеус)",
  "inquisition-hereticus": "Инквизиция (Ордо Еретикус)",
  "departmento-munitorum": "Департаменто Муниторум"
};
