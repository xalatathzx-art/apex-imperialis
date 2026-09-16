/**
 * Мехадендриты — DoomBC стр. 277–278, Адептус Механикус.
 *
 * Twelve mechadendrites, all mounted on the Кибер-Мантия rather than replacing
 * a body part outright. The book prints a full weapon profile
 * (Группа/S(Un)/Дл./Rng/Dmg/Pen/Свойства) for ELEVEN of them in one table on
 * стр. 277, and says in so many words that every one of them can be fought
 * with: «Хотя некоторые мехадендриты были созданы для боя, все они могут с
 * переменным успехом использоваться в бою.» Those eleven therefore carry a
 * `weapon` entry and its `weaponTrait` entries, and are no longer prose.
 *
 * Серво-Обвязка is the twelfth and the only one with no row in that table: it
 * is an interface that carries four other mechadendrites. It stays prose-only,
 * because the book prints no profile for it and inventing one would be worse
 * than the note.
 *
 * HOW THE BOOK'S PROFILE BECAME AN IMPMAL PROFILE
 *
 * `damage.base` — each die becomes its average, rounded down, by the house rule
 * already applied to the technomiracles (§3-бис of
 * docs/superpowers/specs/2026-09-15-technomiracle-conversion-doctrine.md):
 * 1d5 → 3, 1d10 → 5, 2d10 → 11. The book's flat addend rides along unchanged,
 * so «2d10+18» is 29. impmal does not roll damage dice — a weapon deals a flat
 * number, and `DamageModel#compute` (impmal.js:8015) reads the field as
 * `Number(base) || 0`, so a die expression would silently mean zero damage.
 * That is why this conversion is not optional and not cosmetic.
 *
 * `damage.characteristic` is deliberately EMPTY on every one of them. стр. 277:
 * «Мехадендриты имеют собственный показатель S … независимый от S персонажа»
 * and «Рукопашные профили мехадендритов уже учитывают их S.b». The dendrite's
 * own Strength is already inside the number; adding the wearer's Strength bonus
 * on top would pay for it twice.
 *
 * Traits, mapped only where impmal has the same rule:
 *   Pen X       → `penetrating` X — AP transfers unchanged, per the doctrine.
 *   Primitive   → `ineffective`. Book (стр. 169): high-tech armour's AP is
 *                 doubled against it. impmal's Ineffective/Бесполезное: the
 *                 target's armour is doubled. The same rule, both ways round.
 *   Toxic(0)    → `inflict` «Отравление».
 *   Flame       → `inflict` «Горение».
 *   Дл. ≥ 3м    → `reach`. The book's own length column: a three-metre limb
 *                 strikes from outside engagement, which is what impmal's
 *                 Длинное says. The 1.5–2м dendrites do not get it.
 *
 * Left in prose because impmal has no rule for them: Flexible (стр. 167 —
 * parries against it fail automatically), Razor Sharp (стр. 169 — doubles Pen
 * on 3+ successes), Power Field, Reinforced, Imprecise, Precise, Contained.
 *
 * ONE WEAPON PER MECHADENDRITE, AND WHY
 *
 * `grants-apply.js` collects an implant's `weaponTrait` entries once and puts
 * that one list on every weapon the implant grants. Two profiles with different
 * Pen on one implant would therefore both get both Pens. Фуцелиновый Факел and
 * Плазменный Резак print two rows each — the working beam and a bare bludgeon —
 * so only the beam, which is the one anyone fights with, becomes the weapon;
 * the bludgeon stays in `rules`. Дендрит Лезвие's bracketed power-field profile
 * is an optional upgrade («можно улучшить силовым полем»), not the default, and
 * stays in `rules` for the same reason.
 *
 * STILL PROSE ON IMPLANTS THAT NOW CARRY A WEAPON
 *
 * Мехатендрил's +5 to Craft per installed mechatendril has to sum ACROSS every
 * mechatendril the character owns — a per-owner count no single item's
 * mechanics can see. Баллистический Мехадендрит's las pistol is a separate
 * weapon the character supplies; its table row is the melee strike («профиль
 * атаки в таблице отображает удар в рукопашной»), and that is what is
 * converted. Both notes stay in `rules`.
 */

const COST_BY_RARITY = Object.freeze({ 1: 1200, 2: 2800, 3: 6000, 4: 12000 });
const costFor = rarity => COST_BY_RARITY[String(rarity)] ?? 12000;

/**
 * A mechadendrite's melee profile. `characteristic` is empty on purpose — see
 * the header. `spec: "brawling"` because a limb grown onto the wearer is not
 * held in a hand; `category` is impmal's melee type, `power` only where the
 * book gives the dendrite a power field.
 */
const melee = (name, base, category = "mundane") => ({
  kind: "weapon",
  profile: {
    name,
    attackType: "melee",
    category,
    spec: "brawling",
    range: "",
    damage: { base: String(base), characteristic: "", SL: false, ignoreAP: false }
  }
});

const trait = (traitKey, traitValue) =>
  traitValue === undefined ? { kind: "weaponTrait", traitKey } : { kind: "weaponTrait", traitKey, traitValue };

/** The line every converted mechadendrite carries, so the sheet says where the number came from. */
const OWN_STRENGTH =
  "<p><em>Бонус Силы владельца к этому урону не прибавляется: собственная Сила "
  + "мехадендрита уже учтена в числе.</em></p>";

export const MECHADENDRITES = [
  {
    name: "Мехатендрил",
    rarity: 1,
    cost: costFor(1),
    slots: 1,
    page: "DoomBC стр. 277",
    slot: "mechadendrite",
    text:
      "<p>Простейший мехадендрит с четырёхпалым манипулятором на конце — "
      + "дополнительная рука без специализированных свойств, способная на "
      + "любую работу, посильную человеческой руке, и пользующаяся "
      + "инструментами, но не оружием.</p>",
    rules:
      "<p>Даёт бонус на любые проверки Крафта за каждый установленный "
      + "мехатендрил. Эту сумму механика предмета не видит — она считается по "
      + "всем вашим мехатендрилам сразу, а предмет знает только себя. "
      + "Мехадендриты несут собственный показатель Силы, независимый от Силы "
      + "владельца, и используют его при подъёме и переноске.</p>"
      + "<p>Рукопашная атака мехатендрилом: <strong>урон 11</strong>, "
      + "<em>Бесполезное</em>, <em>Длинное</em> (стебель 3 м).</p>"
      + OWN_STRENGTH,
    levels: { 2: "Функционал не меняется ни на одном уровне качества — разнится только отделка." },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Мехатендрил", 11),
          trait("ineffective"),
          trait("reach")
        ]
      }
    ]
  },

  {
    name: "Дендрит Лезвие",
    rarity: 1,
    cost: costFor(1),
    slots: 1,
    page: "DoomBC стр. 277",
    slot: "mechadendrite",
    text:
      "<p>Подвижный мехадендрит с бритвенно острым лезвием на конце, "
      + "извивающийся вокруг владельца в хаотичном танце — на деле "
      + "управляемом полуавтономным духом машины, отводящим удары в сторону.</p>",
    rules:
      "<p>Даёт штраф всем рукопашным атакам против владельца за каждое "
      + "установленное лезвие (до предела) и может само нанести ответное "
      + "попадание при крупном провале атакующего.</p>"
      + "<p>Рукопашная атака лезвием: <strong>урон 13</strong>, "
      + "<em>Бронебойное 3</em>, <em>Длинное</em> (стебель 4 м). Книжное "
      + "<em>Razor Sharp</em> — удвоение пробития при 3+ успехах — в impmal не "
      + "выражается и остаётся на усмотрение ГМа.</p>"
      + "<p>Лезвие принимает модификации рукопашного оружия, считаясь ножом. "
      + "Доработка силовым полем поднимает его до <strong>урона 17</strong> и "
      + "<em>Бронебойного 7</em>, но это отдельная покупка, а не стандартный "
      + "дендрит.</p>"
      + OWN_STRENGTH,
    levels: {
      1: "Урон снижен до 5, пробитие 0.",
      3: "Выдвижные механизмы заставляют лезвие вибрировать: свойство Tearing.",
      4: "Как Уровень 3, и вдобавок железа с ядом даёт свойство Toxic(0)."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Дендрит Лезвие", 13),
          trait("penetrating", 3),
          trait("reach")
        ]
      }
    ]
  },

  {
    name: "Баллистический Мехадендрит",
    rarity: 2,
    cost: costFor(2),
    slots: 1,
    page: "DoomBC стр. 277",
    slot: "mechadendrite",
    text:
      "<p>Распространённый среди воинственных Механикум мехадендрит, по "
      + "умолчанию снабжённый компактным лазпистолетом.</p>",
    rules:
      "<p>Пистолет можно заменить любым другим компактным пистолетом или "
      + "оружием со свойством Combi; питающееся от батарей оружие не "
      + "расходует боеприпасы. При перегреве урон приходится в торс, а сам "
      + "мехадендрит бесполезен до починки. Сам пистолет — отдельный предмет, "
      + "который вы добываете и вешаете на мехадендрит.</p>"
      + "<p>Табличный профиль мехадендрита — это удар в рукопашной, и он "
      + "вынесен в оружие: <strong>урон 4</strong>, <em>Бесполезное</em>.</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Баллистический Мехадендрит", 4),
          trait("ineffective")
        ]
      }
    ]
  },

  {
    name: "Манипулятор Мехадендрит",
    rarity: 2,
    cost: costFor(2),
    slots: 1,
    page: "DoomBC стр. 277",
    slot: "mechadendrite",
    text:
      "<p>Тяжёлый и мощный манипулятор для подъёма и переноски тяжестей; "
      + "имплантация включает опорные штифты в позвоночник и ноги.</p>",
    rules:
      "<p>Если несёт больше двойного веса подъёма владельца, тот должен "
      + "зафиксировать зажимы в штифтах и не может двигаться. Клещи могут "
      + "свободным действием уцепиться за опору против попыток сдвинуть "
      + "владельца с места, а также помогать в Карабканье. Совершенно не "
      + "годится для тонких манипуляций.</p>"
      + "<p>Рукопашная атака манипулятором: <strong>урон 13</strong>, "
      + "<em>Бесполезное</em>. Книжное <em>Imprecise</em> impmal не выражает: "
      + "манипулятор бьёт с 1 м и дальше и не достаёт вплотную.</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Манипулятор Мехадендрит", 13),
          trait("ineffective")
        ]
      }
    ]
  },

  {
    name: "Медицинский Мехадендрит",
    rarity: 2,
    cost: costFor(2),
    slots: 1,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Снабжённый арсеналом лезвий, шприцов, сенсоров и пил мехадендрит, "
      + "равно полезный медикам для лечения и палачам для допроса.</p>",
    rules:
      "<p>Даёт бонус к практическим проверкам Медики и допросам болью, "
      + "позволяет делать инъекции как рукопашные атаки по дружественным "
      + "целям, а полудействием — вылечить Кровотечение или автоматически "
      + "преуспеть в фиксации или ампутации бесполезной конечности.</p>"
      + "<p>Рукопашная атака мехадендритом: <strong>урон 6</strong>, "
      + "<em>Бронебойное 4</em>, <em>Отравление</em>, <em>Длинное</em> "
      + "(стебель 3 м).</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Медицинский Мехадендрит", 6),
          trait("penetrating", 4),
          trait("inflict", "Отравление"),
          trait("reach")
        ]
      }
    ]
  },

  {
    name: "Оптический Мехадендрит",
    rarity: 2,
    cost: costFor(2),
    slots: 1,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Крайне гибкий, но физически слабый мехадендрит с визорами и "
      + "пикт-фидами для наблюдения; стебель сжимается до 5мм, чтобы "
      + "пролезать в узкие щели.</p>",
    rules:
      "<p>Даёт ночное и тепловое зрение, работает как хороший магнокуляр и "
      + "собственная лампа-светосфера, а также бонус на проверки зрения и "
      + "на тонкие проверки Крафта.</p>"
      + "<p>Драться им можно, но незачем: <strong>урон 4</strong>, "
      + "<em>Бесполезное</em>, <em>Длинное</em> (стебель 3 м).</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Оптический Мехадендрит", 4),
          trait("ineffective"),
          trait("reach")
        ]
      }
    ]
  },

  {
    name: "Технический Мехадендрит",
    rarity: 2,
    cost: costFor(2),
    slots: 1,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Многозадачный мехадендрит для ремонта, обслуживания и "
      + "конструкции, оборудованный набором пил, дрелей, зажимов, резаков и "
      + "паяльников.</p>",
    rules:
      "<p>Оборудован Комби-Инструментом и даёт бонус на проверки Техники для "
      + "физического ремонта и запуска устройств, а встроенная модификация "
      + "Кадило штрафует Ближний и Дальний бой цели на Раунд.</p>"
      + "<p>Рукопашная атака пилами и резаками: <strong>урон 6</strong>, "
      + "<em>Бронебойное 2</em>, <em>Длинное</em> (стебель 3 м).</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Технический Мехадендрит", 6),
          trait("penetrating", 2),
          trait("reach")
        ]
      }
    ]
  },

  {
    name: "Фуцелиновый Факел",
    rarity: 3,
    cost: costFor(3),
    slots: 1,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Специализированный мехадендрит для термической и химической "
      + "обработки поверхностей — резки, сварки, перекраски.</p>",
    rules:
      "<p>Даёт бонус на проверки Техники и Ремесла для ремонта и заметно "
      + "выше — для косметических модификаций. Может стрелять, как "
      + "Легион-Огнемёт, из двух баков альтернативного топлива.</p>"
      + "<p>Пламя факела вынесено в оружие: <strong>урон 14</strong>, "
      + "<em>Бронебойное 4</em>, <em>Горение</em>. Второй книжный профиль — "
      + "голый удар стволом на <strong>урон 8</strong> без пробития и с "
      + "<em>Бесполезным</em> — оставлен текстом: одно свойство пробития на "
      + "имплант, и оно принадлежит пламени.</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Фуцелиновый Факел", 14),
          trait("penetrating", 4),
          trait("inflict", "Горение")
        ]
      }
    ]
  },

  {
    name: "Плазменный Резак",
    rarity: 3,
    cost: costFor(3),
    slots: 1,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Специализированный мехадендрит для резки и сварки корабельных "
      + "корпусов и тяжёлой техники.</p>",
    rules:
      "<p>Даёт бонус на проверки Техники и Ремесла, связанные с резкой или "
      + "сваркой. Может стрелять, как Легион-Плазменный Пистолет, без "
      + "свойства Maximal и без расхода боеприпасов.</p>"
      + "<p>Плазменная струя вынесена в оружие: <strong>урон 15</strong>, "
      + "<em>Бронебойное 8</em>. Второй книжный профиль — голый удар стволом "
      + "на <strong>урон 8</strong> без пробития и с <em>Бесполезным</em> — "
      + "оставлен текстом: одно свойство пробития на имплант, и оно "
      + "принадлежит струе.</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Плазменный Резак", 15),
          trait("penetrating", 8)
        ]
      }
    ]
  },

  {
    name: "Серво-Рука",
    rarity: 3,
    cost: costFor(3),
    slots: 2,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Массивный серво-манипулятор для подъёма огромных тяжестей — вроде "
      + "приподнятия танка на бок для полевого ремонта. Занимает два порта "
      + "для мехадендритов.</p>",
    rules:
      "<p>Повышает вес ношения владельца до собственного, если тот не выше; "
      + "клещи могут закрепиться против попыток сдвинуть владельца с места и "
      + "помогают в Карабканье, но не годятся для тонких манипуляций.</p>"
      + "<p>Удар серво-рукой: <strong>урон 25</strong>, <em>Бесполезное</em>. "
      + "Книжные <em>Imprecise</em> и <em>Reinforced</em> impmal не "
      + "выражает.</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Серво-Рука", 25),
          trait("ineffective")
        ]
      }
    ]
  },

  {
    name: "Серво-Коготь",
    rarity: 4,
    cost: costFor(4),
    slots: 2,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Боевая версия Серво-Руки, высоко ценимая Варп-Кузнецами и "
      + "Секуторами, оборудованная генератором силового поля. Занимает два "
      + "порта для мехадендритов.</p>",
    rules:
      "<p>Имеет тот же функционал, что Серво-Рука, но лучше приспособлена к "
      + "бою и защищена от силового оружия.</p>"
      + "<p>Удар серво-когтем: <strong>урон 29</strong>, "
      + "<em>Бронебойное 10</em>. Это верхний край шкалы impmal, и книга "
      + "печатает его именно таким: 2d10+18 при пробитии 10. Книжное "
      + "<em>Power Field</em> — уничтожение парирующего клинка — impmal не "
      + "выражает.</p>"
      + OWN_STRENGTH,
    levels: {
      1: "−1 успех на связанные проверки, S −10.",
      3: "+1 успех на связанные проверки, S +5.",
      4: "+1 успех на связанные проверки, S +10."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          melee("Серво-Коготь", 29, "power"),
          trait("penetrating", 10)
        ]
      }
    ]
  },

  {
    name: "Серво-Обвязка",
    rarity: 4,
    cost: costFor(4),
    slots: 4,
    page: "DoomBC стр. 278",
    slot: "mechadendrite",
    text:
      "<p>Продвинутый интерфейс для интеграции мехадендритов, "
      + "устанавливаемый на спину как рюкзак и снабжённый четырьмя "
      + "мехадендритами: манипуляторным, техническим, плазменным резаком и "
      + "фуцелиновым факелом.</p>",
    rules:
      "<p>Занимает 4 порта для мехадендритов и эффективно даёт черту "
      + "Дополнительные Руки (+4); подключённые мехадендриты (кроме "
      + "серво-руки и серво-когтя) можно менять без операции. Собственные "
      + "репульсорные двигатели работают как хороший гравишют, увеличивая "
      + "скорость в невесомости с 4 до 6.</p>"
      + "<p>Собственного оружия обвязка не несёт: бьют мехадендриты, которые "
      + "в неё вставлены, каждый своим предметом.</p>",
    levels: { 2: "Функционал не меняется ни на одном уровне качества — разнится только отделка." },
    // The only mechadendrite with no row in the стр. 277 profile table. It
    // grants the Multiple Arms trait and a locomotion bonus tied to a state
    // (zero gravity) the schema has no field for — see the file header.
    proseOnly: true
  }
];
