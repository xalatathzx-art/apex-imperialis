/**
 * The 77 specialisations, from the Skills chapter of the Russian edition
 * (стр. 93–101). Keyed by English name rather than id: the book gives them as a
 * flat list under each skill, and three of them ("Forbidden (Various)") ship
 * once per skill and take the same word in all three.
 *
 * Twenty-nine of these names are compared as strings inside impmal's effect
 * scripts. They are only safe to translate because module/script-names.js
 * widens those comparisons to accept the English that Babele keeps on the
 * document — see that file before adding a name here.
 */

export const label = "Предметы (Основная книга)";

export const byName = {
  /* Бдительность (стр. 93) */
  Sight: { type: "specialisation", name: "Зрение" },
  Smell: { type: "specialisation", name: "Обоняние" },
  Hearing: { type: "specialisation", name: "Слух" },
  Taste: { type: "specialisation", name: "Вкус" },
  Touch: { type: "specialisation", name: "Осязание" },
  Psyniscience: { type: "specialisation", name: "Психическое чутьё" },

  /* Атлетика (стр. 93) */
  Climbing: { type: "specialisation", name: "Лазанье" },
  Might: { type: "specialisation", name: "Мощь" },
  Riding: { type: "specialisation", name: "Верховая езда" },
  Running: { type: "specialisation", name: "Бег" },
  Swimming: { type: "specialisation", name: "Плаванье" },

  /* Ловкость рук (стр. 94) */
  "Lock Picking": { type: "specialisation", name: "Взлом замков" },
  Pickpocket: { type: "specialisation", name: "Карманные кражи" },
  // The book's own joke, kept: "И никакого мошенничества".
  "Sleight of Hand": { type: "specialisation", name: "И никакого мошенничества" },
  Defuse: { type: "specialisation", name: "Разминирование" },

  /* Дисциплина (стр. 94) */
  Composure: { type: "specialisation", name: "Самообладание" },
  Fear: { type: "specialisation", name: "Страх" },
  Psychic: { type: "specialisation", name: "Психосилы" },

  /* Стойкость (стр. 95) */
  Endurance: { type: "specialisation", name: "Неустанность" },
  Pain: { type: "specialisation", name: "Боль" },
  Poison: { type: "specialisation", name: "Яды" },

  /* Языки (стр. 95) */
  Cipher: { type: "specialisation", name: "Шифры" },
  "High Gothic": { type: "specialisation", name: "Высокий готический" },
  Forbidden: { type: "specialisation", name: "Запретное" },
  // Three documents, one per skill that can take a forbidden specialisation.
  "Forbidden (Various)": { type: "specialisation", name: "Запретное (Разное)" },

  /* Чутьё (стр. 95) */
  "Group (Various)": { type: "specialisation", name: "Определённая группа (Разное)" },
  People: { type: "specialisation", name: "Люди" },
  Surroundings: { type: "specialisation", name: "Окружение" },

  /* Логика (стр. 96) */
  Evaluation: { type: "specialisation", name: "Оценка" },
  Investigation: { type: "specialisation", name: "Следствие" },

  /* Знания (стр. 96) */
  Academics: { type: "specialisation", name: "Схоластика" },
  "Adeptus Terra": { type: "specialisation", name: "Адептус Терра" },
  Planet: { type: "specialisation", name: "Планета" },
  Sector: { type: "specialisation", name: "Сектор" },
  Theology: { type: "specialisation", name: "Богословие" },

  /* Бой (стр. 97) */
  Brawling: { type: "specialisation", name: "Кулачный бой" },
  "One-handed": { type: "specialisation", name: "Одноручное оружие" },
  "Two-handed": { type: "specialisation", name: "Двуручное оружие" },

  /* Медика (стр. 97) — "Люди" twice over, once here and once under Чутьё,
     exactly as the book prints it. */
  Animals: { type: "specialisation", name: "Животные" },
  Human: { type: "specialisation", name: "Люди" },

  /* Ориентирование (стр. 97) */
  Surface: { type: "specialisation", name: "Поверхность" },
  Tracking: { type: "specialisation", name: "Следы" },
  Void: { type: "specialisation", name: "Пустота" },
  Warp: { type: "specialisation", name: "Варп" },

  /* Командование (стр. 98) */
  Interrogation: { type: "specialisation", name: "Допрос" },
  Intimidation: { type: "specialisation", name: "Запугивание" },
  Leadership: { type: "specialisation", name: "Лидерство" },

  /* Пилотирование (стр. 98) */
  Aeronautica: { type: "specialisation", name: "Аэронавтика" },
  Civilian: { type: "specialisation", name: "Гражданская техника" },
  Military: { type: "specialisation", name: "Военная техника" },
  "Minor Voidship": { type: "specialisation", name: "Малые пустотные корабли" },
  "Major Voidship": { type: "specialisation", name: "Крупные пустотные корабли" },

  /* Психическое мастерство (стр. 98, дисциплины — стр. 160) */
  Biomancy: { type: "specialisation", name: "Биомантия" },
  Divination: { type: "specialisation", name: "Прорицания" },
  Pyromancy: { type: "specialisation", name: "Пиромантия" },
  Telekinesis: { type: "specialisation", name: "Телекинез" },
  Telepathy: { type: "specialisation", name: "Телепатия" },

  /* Взаимопонимание (стр. 99) */
  Animal: { type: "specialisation", name: "Животные" },
  Charm: { type: "specialisation", name: "Обаяние" },
  Deception: { type: "specialisation", name: "Обман" },
  Haggle: { type: "specialisation", name: "Торг" },
  Inquiry: { type: "specialisation", name: "Сбор сведений" },

  /* Стрельба (стр. 99) */
  "Long Guns": { type: "specialisation", name: "Лёгкое оружие" },
  Ordnance: { type: "specialisation", name: "Тяжёлое оружие" },
  Pistols: { type: "specialisation", name: "Пистолеты" },
  Thrown: { type: "specialisation", name: "Метательное оружие" },

  /* Скрытность (стр. 100) */
  Conceal: { type: "specialisation", name: "Маскировка" },
  Hide: { type: "specialisation", name: "Невидимка" },
  "Move Silently": { type: "specialisation", name: "Бесшумное движение" },

  /* Рефлексы (стр. 100) */
  Acrobatics: { type: "specialisation", name: "Акробатика" },
  Balance: { type: "specialisation", name: "Равновесие" },
  Dodge: { type: "specialisation", name: "Уклонение" },

  /* Техника (стр. 101) */
  Augmetics: { type: "specialisation", name: "Аугметика" },
  Engineering: { type: "specialisation", name: "Инженерное дело" },
  Security: { type: "specialisation", name: "Безопасность" }
};
