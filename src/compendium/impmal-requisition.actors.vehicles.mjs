/**
 * Техника из «Requisition Guide» — 22 машины.
 *
 * There is no Russian edition of this book, so the words are chosen, not
 * looked up. Two things keep those choices honest:
 *
 *  - docs/rules/ru-terms.json, the 1495 pairs the core-book pass settled. Every
 *    term that exists in both books must read the same in both.
 *  - The core book's own two vehicles, Motorbike → «Мотоцикл» and Cargo Hauler
 *    → «Грузовоз», which set the convention: a generic machine gets a plain
 *    Russian noun, a named Imperial pattern keeps its name.
 *
 * The vehicle trait vocabulary is not invented either — стр. 226 of the core
 * book prints five of these traits on its own two vehicles, and those readings
 * are reused verbatim: Rugged «Простая конструкция», Cargo «Грузовик»,
 * Sluggish «Тихоходная», Manoeuvrable «Маневренный», Open «Открытый».
 *
 * Every trait and weapon here is an embedded item whose `compendiumSource`
 * points at a world document, not at a pack, so Babele cannot follow it to a
 * translation the way it does for the core NPCs. They are written out under
 * `items`, keyed by English name, which is the identity Babele can still match.
 */

export const label = "Существа (Реквизиция)";

const U = (uuid, label) => `@UUID[${uuid}]{${label}}`;
const p = (...parts) => `<p>${parts.join("")}</p>`;
const ul = (...items) => `<ul>${items.map(i => `<li><p>${i}</p></li>`).join("")}</ul>`;

/** Страницы журнала «Техника» этой же книги. */
const CRIT = "JournalEntry.fpiV4F49v3gxmipn.JournalEntryPage.g3JsX7QntVJBm2vc";
const RULES = "JournalEntry.fpiV4F49v3gxmipn.JournalEntryPage.I4mFYORL990yUAjB";
const CRIT_TABLE = U(CRIT, "таблице критических попаданий по технике");
const OUT_OF_CONTROL = U(`${RULES}#out-of-control`, "потеряет управляемость");

const ITEM = "Compendium.impmal-core.items.Item";

/* ── Свойства техники ─────────────────────────────────────────────────
 *
 * Five of these are the core book's own words (стр. 226). The rest are ours:
 * «Крепкие гусеницы» / «Крепкие колёса» keep the pair parallel the way the
 * English does, and «Хрупкая конструкция» is deliberately built to mirror
 * «Простая конструкция», because the two traits are exact opposites — one
 * rolls twice and takes the lower result, the other the worse.
 */
const TRAITS = {
  Rugged: {
    name: "Простая конструкция",
    description: p("Эта машина предназначена для работы в суровых условиях и особенно надёжна. ",
      "Всякий раз, когда она получает критическое попадание, бросайте дважды и выбирайте ",
      "наименьший результат.")
  },
  Frail: {
    name: "Хрупкая конструкция",
    description: p("Машина собрана из ненадёжных материалов, не рассчитанных на опасность. Когда ",
      "она получает критическое попадание, бросайте дважды по таблице критических попаданий и ",
      "выбирайте худший результат.")
  },
  Manoeuvrable: {
    name: "Маневренный",
    description: p("Эта машина особенно проворна: все проверки Пилотирования получают +1 успех.")
  },
  Sluggish: {
    name: "Тихоходная",
    description: p("Такая машина начинает движение с медленной скоростью. Её скорость возрастает ",
      "на шаг каждый ход, если она двигалась в предыдущий, вплоть до быстрой.")
  },
  Cargo: {
    name: "Грузовик",
    description: p("У этой машины есть кузов, куда влезет груза на 200 единиц веса или восемь ",
      "человек. Столько же вмещает каждый дополнительный грузовой контейнер, что тянет за собой ",
      "«Карго-8», — всего до четырёх.")
  },
  "Cargo Hauler": {
    name: "Перевозка груза",
    description: p("«Небесный коготь» может нести машину размером Большой или меньше либо ",
      "стандартный грузовой контейнер.")
  },
  "Volatile Cargo": {
    name: "Взрывоопасный груз",
    description: p("Если на таблице критических попаданий выпадет «Уничтожение», взрыв машины ",
      "накрывает всю зону.")
  },
  "Sturdy Tracks": {
    name: "Крепкие гусеницы",
    description: p("Эта машина игнорирует свойство местности «Пересечённая местность».")
  },
  "Sturdy Wheels": {
    name: "Крепкие колёса",
    description: p("Эта машина игнорирует свойство местности «Пересечённая местность».")
  },
  "Armoured Tracks": {
    name: "Бронированные гусеницы",
    description: p("Эта машина игнорирует первый результат «Повреждение ходовой части», ",
      "выпавший против неё в гусеничной ", CRIT_TABLE, ". Свойство восстанавливается, когда ",
      "машину отремонтируют.")
  },
  "Mount Options": {
    name: "Крепления для оружия",
    description: p("На эту машину можно установить стрелковое оружие весом до 3 единиц.")
  },
  "High Ground": {
    name: "Господствующая высота",
    description: p("Водитель получает преимущество в любой атаке по врагам, что находятся ниже ",
      "него.")
  },
  "Auspex Suite": {
    name: "Комплект ауспиков",
    description: p("На этой машине установлены ", U(`${ITEM}.dO7XoDXD9QYTy6zZ`, "ауспик"),
      " с запредельной дальностью, ", U(`${ITEM}.AdB3ZzAOrnREfdsv`, "мультикомпас"), " и ",
      U(`${ITEM}.co63VYiRX0HauLYN`, "вокс-вещатель"), ".")
  },
  Open: {
    name: "Открытый",
    description:
      p("Кабина водителя открыта, отчего он ничем не защищён.") +
      ul(
        "Враг может целиться и атаковать водителя напрямую.",
        `Если в ${CRIT_TABLE} выпадет результат «<em>Попадание по экипажу/пассажирам</em>», жертва не прибавляет броню машины к своей, когда определяется урон.`,
        `Если машина ${OUT_OF_CONTROL}, водитель должен пройти <strong>среднюю (+0) проверку Рефлексов</strong> или его сбросит.`,
        "Водитель может защищаться от атак в ближнем бою, что наносят по этой машине."
      )
  },
  "Open (Passengers)": {
    name: "Открытый (Пассажиры)",
    description:
      p("Пассажирский отсек этой машины открыт, отчего находящиеся в нём ничем не защищены.") +
      ul(
        "Враг может целиться и атаковать экипаж и пассажиров напрямую.",
        `Если в ${CRIT_TABLE} выпадет результат «<em>Попадание по экипажу/пассажирам</em>», пострадавший пассажир не прибавляет броню машины к своей, когда определяется урон.`,
        `Если машина ${OUT_OF_CONTROL}, пассажиры должны пройти <strong>среднюю (+0) проверку Рефлексов</strong> или их сбросит.`,
        "Пассажиры могут защищаться от атак в ближнем бою, что наносят по этой машине."
      )
  }
};

/* ── Вооружение и снаряжение техники ──────────────────────────────────
 *
 * «Парные» and «Спаренные» are kept apart on purpose: the book has both
 * Paired Autocannons and Twin-Autocannons, and collapsing them would lose a
 * distinction the profiles rely on.
 */
const GEAR = {
  "Heavy Stubber": { name: "Тяжёлый стаббер" },
  "Heavy-Bolter": { name: "Тяжёлый болтер" },
  "Heavy-Bolter (4x)": { name: "Тяжёлый болтер (4 шт.)" },
  "Hellstrike Missiles": { name: "Ракеты «Хеллстрайк»" },
  "Inferno Cannon": { name: "Инферно-пушка" },
  "Lasgun Battery (6x)": { name: "Батарея лазганов (6 шт.)" },
  "Mining Laser": { name: "Шахтёрский лазер" },
  "Multi-Laser": { name: "Мультилазер" },
  "Paired Autocannons": { name: "Парные автопушки" },
  "Twin-Autocannons": { name: "Спаренные автопушки" },
  Lascutter: { name: "Лазерный резак" },
  "Laud Hailer": { name: "Громкоговоритель" },
  "Pict Recorder": { name: "Пикт-писец" }
};

/** Собирает карту встроенных предметов машины из общих словарей. */
const carried = (...names) =>
  Object.fromEntries(names.map(n => [n, TRAITS[n] ?? GEAR[n]]));

export const byName = {
  /* ── Наземная техника ────────────────────────────────────────────── */

  "Ground Car": {
    name: "Легковая машина",
    items: carried("Cargo", "Frail")
  },

  Quadbike: {
    name: "Квадроцикл",
    items: carried("Manoeuvrable", "Mount Options", "Rugged")
  },

  "Jet Bike": {
    name: "Реактивный мотоцикл",
    items: carried("Open", "Mount Options", "Manoeuvrable", "High Ground")
  },

  Ridgerunner: {
    name: "Скалоход",
    items: carried("Mining Laser", "Heavy Stubber", "Auspex Suite", "Rugged", "Sturdy Wheels")
  },

  "Goliath Truck": {
    name: "Грузовик «Голиаф»",
    items: carried("Heavy Stubber", "Twin-Autocannons", "Rugged", "Open (Passengers)")
  },

  "Cargo-8": {
    name: "Карго-8",
    items: carried("Cargo", "Rugged", "Sluggish", "Paired Autocannons")
  },

  "Haulage Robot": {
    name: "Погрузочный робот"
  },

  Taurox: {
    name: "Таурокс",
    items: carried("Paired Autocannons", "Manoeuvrable", "Rugged", "Sturdy Tracks")
  },

  Chimera: {
    name: "Химера",
    items: carried("Armoured Tracks", "Rugged", "Sturdy Tracks", "Heavy-Bolter", "Multi-Laser", "Lasgun Battery (6x)")
  },

  Crassus: {
    name: "Крассус",
    items: carried("Armoured Tracks", "Rugged", "Sturdy Tracks", "Heavy-Bolter (4x)")
  },

  Hellhound: {
    name: "Адский пёс",
    items: carried("Heavy-Bolter", "Inferno Cannon", "Armoured Tracks", "Rugged", "Sturdy Tracks", "Volatile Cargo")
  },

  "Cyclops Demolition Vehicle": {
    name: "Подрывная машина «Циклоп»"
  },

  /* ── Шагающие ────────────────────────────────────────────────────── */

  Sentinel: {
    name: "Часовой",
    items: carried("High Ground", "Manoeuvrable", "Mount Options", "Open", "Rugged")
  },

  Strider: {
    name: "Ходок",
    items: carried("High Ground", "Manoeuvrable", "Open")
  },

  /* ── Летающая техника ────────────────────────────────────────────── */

  Landspeeder: {
    name: "Лендспидер",
    items: carried("Manoeuvrable", "Open")
  },

  "Arvus Lighter": {
    name: "Лихтер «Арв»",
    items: carried("Cargo", "Rugged")
  },

  "Aquila Lander": {
    name: "Челнок «Аквила»",
    items: carried("Heavy-Bolter", "Cargo", "Manoeuvrable", "Rugged")
  },

  Valkyrie: {
    name: "Валькирия",
    items: carried("Multi-Laser", "Heavy-Bolter", "Hellstrike Missiles", "Rugged")
  },

  "Valkyrie Sky Talon": {
    name: "«Валькирия» Небесный коготь",
    items: carried("Cargo Hauler", "Rugged", "Heavy-Bolter", "Hellstrike Missiles")
  },

  /* ── Малые самоходные модули ─────────────────────────────────────── */

  "Breacher Unit": {
    name: "Проходческий модуль",
    items: carried("Lascutter")
  },

  "C.A.T Unit": {
    name: "Модуль «КАТ»",
    items: carried("Pict Recorder")
  },

  "Nuncio-Aquila": {
    name: "Нунций-аквила",
    items: carried("Laud Hailer")
  }
};
