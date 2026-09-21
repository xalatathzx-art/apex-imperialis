/**
 * Бионика — DoomBC стр. 263–264.
 *
 * Twenty-one implants: the base bionic leg and arm, their twelve variations,
 * and the seven organ replacements. The book gives each variation its own
 * Rarity, so each is its own item — impmal has no quality-of-variant axis and
 * a separate item is the only shape the system understands unaided.
 *
 * WHAT GOES INTO `mechanics` AND WHAT STAYS PROSE
 *
 * The constructor can express a modifier that is unconditional and speaks to a
 * whole skill, a characteristic, a hit location, a speed or an encumbrance
 * threshold. It cannot express "only when climbing", "only with this arm", or
 * "only against being pushed": `testMod` guards on `args.skill`, which is the
 * skill key, never the specialisation and never the situation.
 *
 * So the rule applied throughout this file is:
 *
 *   - unconditional, whole-skill or whole-characteristic  →  a mechanics entry
 *   - conditional on a specialisation, a situation, a target, or on which limb
 *     the implant was fitted to                            →  prose
 *
 * A wrong gate is worse than no gate: an implant that quietly grants Advantage
 * on every Athletics test because the book gave +30 to climbing is a bug the
 * table will not notice for months. Entries that cannot be gated are written
 * out in `rules` and in the quality ladder, where the GM reads them.
 *
 * The one deliberate exception is the base bionic limb's "+2 to effective T.b
 * for damage absorbed by that part" (стр. 263). It IS unconditional, but the
 * hit location it targets is only known once the player picks a side, and an
 * `armour` entry has to name its zone at authoring time. It stays prose.
 *
 * CONVERSION NOTES SPECIFIC TO THIS FAMILY
 *
 * `Unnatural S (4)` on the Legion arm becomes +10 Strength — the doctrine's
 * +5 per two points, the same scale tools/make-species.mjs uses.
 *
 * Characteristic PENALTIES printed by the book as "−15 к А" transfer 1:1 as
 * characteristic modifiers. The ±10 → +1 success rule governs TEST modifiers,
 * not characteristic values; impmal characteristics run on the same 0–100
 * scale DoomBC does, so there is nothing to convert.
 *
 * THE ARM VARIATIONS AND INTEGRATED WEAPONS (стр. 263)
 *
 * Two of the five arms are sockets, not weapons, and carry a `weaponMount`
 * marked `emptySocket`: Рука-Оружие, whose weapon the book says must be
 * «добыть отдельно», and Универсальный Порт, which ships with a plain forearm
 * and takes the others separately. An empty socket is their finished state —
 * the sheet gives a drop target, and a weapon dropped on it is granted equipped
 * while the arm is fitted. The audit accepts `emptySocket` for exactly this
 * reason and would otherwise call a mount with no source an unfinished mount.
 *
 * The other three stay prose, and none of them is an oversight:
 *   - Бионическая рука — every laddered effect is «этой рукой».
 *   - Монозадачная — a hand replaced by a tool. Its +10 is to using that tool,
 *     a specialisation `testMod` cannot gate on, and it is not a weapon.
 *   - Интегрированное оружие — the book prints no profile and no acquisition
 *     either; what it gives is concealment and one surprise attack, neither of
 *     which impmal expresses. It is left prose rather than given a socket,
 *     because a socket would claim the player supplies the weapon and the book
 *     says it is already built into the forearm.
 *
 * Trait and Talent grants (Crawler, Digitigrade, Sturdy, Hoverer, Sprint,
 * Preternatural Speed) stay prose. The `trait`/`talent` entry kinds want a
 * document uuid to drag in, and impmal has no items under those names.
 *
 * Vocabulary follows docs/rules/ru-glossary.md. Средняя (+0) is Challenging;
 * Сложная (−20) is Hard.
 */

/**
 * The note every bionic limb carries. Prose, not an entry — see the header.
 */
const LIMB =
  "<p><em>Любая бионическая конечность даёт +1 очко брони против попаданий "
  + "в неё, складываясь с носимой бронёй.</em></p>";

/**
 * The leg's and the arm's quality ladders, shared with every variation.
 *
 * The book prints Poor.Q / Good.Q / Best.Q once, under «Bionic Leg» and
 * «Bionic Arm», and then lists the variations as variations OF that limb, each
 * with its own Rarity. A Legion arm is still a bionic arm, so it is still built
 * to one of the four levels and still carries what that level does. Splitting
 * the ladder off and giving it only to the base item would mean a Best.Q
 * gusenitsa block had no quality at all, which is not what the page says.
 */
const LEG_LEVELS = Object.freeze({
  1: "Протез вял и плохо слушается: ваша <strong>скорость падает на 1</strong>, "
    + "а совершая Бег или Натиск, вы должны пройти <strong>среднюю (+0) проверку "
    + "Ловкости</strong>, иначе падаете и останавливаетесь на полпути.",
  3: "Нога несёт вас сама: вы не устаёте от долгого бега и получаете "
    + "<strong>+2 успеха</strong> на любые проверки прыжков.",
  4: "Как Уровень 3, и вдобавок <strong>+5</strong> к проверкам Ближнего боя, "
    + "Силы и Ловкости, выполняемым ногами, плюс одна из доработок: считается "
    + "легионной ногой; внутренняя полость под два ножа, пистолет, две гранаты "
    + "или предмет размера 2×1; выдвижной нож в носке или пятке; грав-подошвы; "
    + "продвинутые движители; или синтекожа, неотличимая от живой ноги на вид "
    + "и на ощупь. Каждая доработка сверх первой поднимает Редкость на 1."
});

const ARM_LEVELS = Object.freeze({
  1: "Грубая, неуклюжая и очевидно механическая конструкция: <strong>−1 успех</strong> "
    + "на тонкие манипуляции пальцами и <strong>−5</strong> к проверкам Ближнего "
    + "и Дальнего боя, выполняемым этой рукой.",
  3: "<strong>+1 успех</strong> на все тонкие манипуляции пальцами этой руки.",
  4: "Как Уровень 3, и вдобавок <strong>+5</strong> к проверкам Ближнего боя, "
    + "Дальнего боя, Силы и Ловкости, выполняемым этой рукой, плюс одна из "
    + "доработок: считается легионной рукой; снимает штраф Ловкости от легионной "
    + "руки обычному человеку; скрытая полость под нож, компактный пистолет или "
    + "гранату; встроенный ручной инструмент; магнитные сцепители на ладони; "
    + "дополнительный сенсор — визор, ультразвук или сверхчувствительный микрофон; "
    + "или синтекожа, неотличимая от живой руки на вид, ощупь и вес. Каждая "
    + "доработка сверх первой поднимает Редкость на 1."
});

/**
 * The leg ladder's one unconditional number: Уровень 1 costs a point of speed.
 * Everything else in both ladders is "этой рукой" or "ногами" and stays prose.
 */
const LEG_SPEED = Object.freeze({ kind: "speed", key: "land", value: { 1: -1, 2: 0 } });

export const BIONICS = [
  /* ── Основания ───────────────────────────────────────────────────────── */

  {
    name: "Бионическая нога",
    rarity: 0,
    cost: 800,
    page: "DoomBC стр. 263",
    text:
      "<p>Бионический протез ноги, дублирующий функции обычной. Самая обыденная "
      + "аугметика Империума: её носят докеры, гвардейцы-ветераны и всякий, кому "
      + "не повезло оказаться слишком близко к чему-то взрывающемуся.</p>"
      + LIMB,
    rules:
      "<p>Нога работает как живая. Вариации ноги — гусеницы, двусоставные, "
      + "вездеходные и прочие — это отдельные предметы со своей Редкостью; "
      + "при замене обеих ног вариация считается одним предметом.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      { operator: "AND", entries: [LEG_SPEED] }
    ]
  },

  {
    name: "Бионическая рука",
    rarity: 0,
    cost: 800,
    page: "DoomBC стр. 263",
    text:
      "<p>Бионический протез руки, дублирующий функции обычной. Механикум ставит "
      + "такие тысячами, и по качеству отделки кисти в улье читают положение "
      + "человека вернее, чем по одежде.</p>"
      + LIMB,
    rules:
      "<p>Рука работает как живая. Вариации руки — монозадачная, рука-оружие, "
      + "интегрированное оружие, универсальный порт и легионная — это отдельные "
      + "предметы со своей Редкостью.</p>",
    levels: ARM_LEVELS,
    // Every laddered effect is "этой рукой" — the schema cannot gate on that.
    proseOnly: true
  },

  /* ── Вариации бионической ноги ───────────────────────────────────────── */

  {
    name: "Бионические ноги: гусеницы",
    rarity: -1,
    cost: 600,
    page: "DoomBC стр. 263",
    text:
      "<p>Дешёвый и широко доступный гусеничный блок вместо ног. Такие ставят "
      + "рабочим мануфакторумов и сервиторам-погрузчикам: тем, кому не нужно бегать, "
      + "но нужно тащить. Владелец передвигается с ровным механическим лязгом, "
      + "который слышно за поворот.</p>"
      + LIMB,
    rules:
      "<p>Вы не можете прыгать, карабкаться и пользоваться вертикальными лестницами, "
      + "и получаете <strong>Помеху</strong> на проверки Рефлексов (Акробатика).</p>"
      + "<p>Взамен ваш порог перегрузки растёт на <strong>+2</strong>, а порог "
      + "обездвиживания — на <strong>+4</strong>: гусеницы несут и толкают то, "
      + "что человеку не поднять.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          LEG_SPEED,
          // Reflexes as a whole, not Reflexes (Acrobatics): see the file header.
          { kind: "testMod", skill: "reflexes", advantage: -1 },
          { kind: "encumbrance", key: "overburdened", value: 2 },
          { kind: "encumbrance", key: "restrained", value: 4 }
        ]
      }
    ]
  },

  {
    name: "Бионические ноги: двусоставные",
    rarity: 1,
    cost: 1800,
    page: "DoomBC стр. 263",
    text:
      "<p>Пара бионических ног с дополнительными суставами, обеспечивающими "
      + "подвижность и пружинность, невозможные для человеческого скелета. Колено "
      + "сгибается назад, как у птицы, и владелец при ходьбе слегка покачивается, "
      + "словно готовый в любой миг прыгнуть.</p>"
      + LIMB,
    rules:
      "<p>Вы получаете <strong>+1 успех</strong> на проверки Рефлексов (Акробатика), "
      + "а при падении считаете количество успехов на проверку группировки удвоенным.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          LEG_SPEED,
          { kind: "testMod", skill: "reflexes", value: 1 }
        ]
      }
    ]
  },

  {
    name: "Бионические ноги: вездеходные",
    rarity: 1,
    cost: 1800,
    page: "DoomBC стр. 263",
    text:
      "<p>Ступни заменены четырёхпалыми крестовидными опорами, сходными со ступнями "
      + "шагоходов вроде Стража или Дредноута. По грязи, осыпи и битому рокриту такой "
      + "боец идёт так же ровно, как по палубе — и так же громко.</p>"
      + LIMB,
    rules:
      "<p>Вы получаете <strong>Преимущество</strong> на проверки, чтобы пересечь "
      + "труднопроходимую местность, и на встречные проверки против попыток сдвинуть "
      + "вас с места.</p>"
      + "<p>Вы получаете <strong>−2 успеха</strong> на проверки Скрытности.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          LEG_SPEED,
          { kind: "testMod", skill: "stealth", value: -2 }
        ]
      }
    ]
  },

  {
    name: "Бионические ноги: арахнид-шасси",
    rarity: 2,
    cost: 4000,
    page: "DoomBC стр. 263",
    text:
      "<p>Восемь насекомовидных конечностей вместо ног. Шасси излюблено генеторами "
      + "и скульпторами плоти, которым нужно одновременно стоять у трёх столов, и "
      + "внушает непосвящённым безотчётный ужас, который те редко могут объяснить.</p>"
      + LIMB,
    rules:
      "<p>Вы полностью игнорируете труднопроходимую местность и получаете "
      + "<strong>Преимущество</strong> на проверки Атлетики — восемь точек опоры "
      + "держат вас там, где человек уже сорвался бы, — и на встречные проверки "
      + "против попыток сдвинуть вас с места.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          LEG_SPEED,
          { kind: "testMod", skill: "athletics", advantage: 1 }
        ]
      }
    ]
  },

  {
    name: "Бионические ноги: серпентин-шасси",
    rarity: 3,
    cost: 7000,
    page: "DoomBC стр. 263",
    text:
      "<p>Сегментированный металлический змеиный хвост вместо ног. Шасси не столько "
      + "заменяет ноги, сколько отменяет саму идею ходьбы: владелец течёт по полу, "
      + "и звук этот ни с чем не спутать.</p>"
      + LIMB,
    rules:
      "<p>Ваша скорость возрастает на <strong>1</strong>, и вы не устаёте от долгого бега.</p>"
      + "<p>Хвостом можно захватывать и удерживать противника, считая его "
      + "дополнительной парой рук в борьбе.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          // The shasi's +1, and the ladder's −1 at Уровень 1, in one entry:
          // two speed entries would both target the same path and the second
          // would not cancel the first.
          { kind: "speed", key: "land", value: { 1: 0, 2: 1 } }
        ]
      }
    ]
  },

  {
    name: "Бионические ноги: репульсоры",
    rarity: 3,
    cost: 7000,
    page: "DoomBC стр. 263",
    text:
      "<p>Компактный комплект антиграв-репульсоров вместо ног. Владелец не касается "
      + "пола — он висит над ним на ладонь, и в тишине слышно ровное гудение поля. "
      + "Среди высших чинов Механикум это столь же знак ранга, сколь и средство "
      + "передвижения.</p>"
      + LIMB,
    rules:
      "<p>Вас нельзя сбить с ног. Попадания, которые пришлись бы вам в ноги, "
      + "приходятся в торс.</p>"
      + "<p>Не имея надёжной опоры, вы получаете <strong>−2 успеха</strong> на "
      + "проверки Атлетики, связанные с упором: удержаться на месте или сдвинуть "
      + "с места кого-то грубой силой.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          LEG_SPEED,
          { kind: "testMod", skill: "athletics", value: -2 }
        ]
      }
    ]
  },

  {
    name: "Бионические ноги: легионные",
    rarity: 2,
    cost: 5000,
    page: "DoomBC стр. 263",
    // "легионные" is four characters from the respiratory pattern's bare `легк`.
    // It does not match, but the slot is written out rather than left to a regex
    // whose weakness is a recorded finding.
    slot: "leg",
    text:
      "<p>Ноги, собранные под вес и размеры Астартес. Космодесантник не может "
      + "пользоваться бионическими ногами другого масштаба — они попросту сломаются "
      + "под ним на первом же шаге.</p>"
      + LIMB,
    rules:
      "<p>Космодесантнику эти ноги заменяют утраченные без потерь. Обычному человеку "
      + "они велики: носить их он сможет только после подгонки, а Ловкость его "
      + "упадёт на <strong>−10</strong>.</p>",
    levels: LEG_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          LEG_SPEED,
          { kind: "characteristic", key: "ag", value: -10 }
        ]
      }
    ]
  },

  /* ── Вариации бионической руки ───────────────────────────────────────── */

  {
    name: "Бионическая рука: монозадачная",
    rarity: -1,
    cost: 600,
    page: "DoomBC стр. 263",
    text:
      "<p>Предплечье и ладонь заменены определённым ручным инструментом — сварочной "
      + "горелкой, ключом, шлифовальным кругом. Так вооружают рабочих, которым доверено "
      + "одно дело и не доверено ничего другого.</p>"
      + LIMB,
    rules:
      "<p>Эта рука не может делать ничего, кроме работы своим инструментом, — но "
      + "делает её хорошо: <strong>+1 успех</strong> на все проверки с его использованием.</p>",
    levels: ARM_LEVELS,
    proseOnly: true
  },

  {
    name: "Бионическая рука: рука-оружие",
    rarity: 1,
    cost: 2000,
    slots: 1,
    page: "DoomBC стр. 263",
    text:
      "<p>Предплечье и ладонь заменены интегрированным оружием, которое приходится "
      + "добывать отдельно. Рука эта уже не рука, и владелец её — уже не совсем "
      + "человек: он не носит оружие, он им является.</p>"
      + LIMB,
    rules:
      "<p>Эта рука не может делать ничего, кроме стрельбы или ударов своим оружием, "
      + "зато даёт с ним <strong>+1 успех</strong>. Двуручное оружие вы держите одной рукой.</p>"
      + "<p>Оружие нельзя выбить у вас из рук, ему не нужна опора для закрепления, "
      + "а его запас боеприпасов утраивается (тяжёлое оружие — удваивается).</p>"
      + "<p><em>Перетащите оружие на гнездо этой руки, и оно появится у вас "
      + "надетым, пока рука установлена. Пустое гнездо — это законченное "
      + "состояние: книга говорит, что оружие добывается отдельно.</em></p>",
    levels: ARM_LEVELS,
    // стр. 263: «интегрированным стрелковым или рукопашным оружием (которые
    // нужно добыть отдельно)». The book prints no profile because the weapon is
    // whatever the character bought, so this is a socket, not a weapon.
    mechanics: [
      { operator: "AND", entries: [{ kind: "weaponMount", emptySocket: true }] }
    ]
  },

  {
    name: "Бионическая рука: интегрированное оружие",
    rarity: 1,
    cost: 1800,
    slots: 1,
    page: "DoomBC стр. 263",
    text:
      "<p>В предплечье встроен выдвижной нож или компактный пистолет. Когда оружие "
      + "втянуто, его не видно и не нащупать — именно поэтому такую руку любят и "
      + "убийцы, и те, кто их боится.</p>"
      + LIMB,
    rules:
      "<p>Встроенное оружие невозможно обнаружить обыском, а при обыске с помощью "
      + "ауспекса его находят только на <strong>сложную (−20) проверку</strong>.</p>"
      + "<p>Первый выстрел или удар по противнику, который не знает об оружии, "
      + "застаёт его врасплох.</p>",
    levels: ARM_LEVELS,
    proseOnly: true
  },

  {
    name: "Бионическая рука: универсальный порт",
    rarity: 2,
    cost: 3000,
    slots: 1,
    page: "DoomBC стр. 263",
    text:
      "<p>На уровне локтя рука заканчивается универсальным портом, к которому "
      + "подсоединяется обычное предплечье с кистью, монозадачная рука или рука-оружие. "
      + "Техножрецы держат при себе набор предплечий, как иные держат набор отвёрток.</p>"
      + LIMB,
    rules:
      "<p>Обычное предплечье с кистью идёт в комплекте; прочие добываются отдельно. "
      + "Смена предплечья занимает <strong>действие</strong>.</p>"
      + "<p><em>Если в порт вставлена рука-оружие, перетащите это оружие на гнездо "
      + "порта. Пустое гнездо — это обычное предплечье с кистью, то есть "
      + "законченное состояние, а не недоделанное.</em></p>",
    levels: ARM_LEVELS,
    // стр. 263: обычное предплечье «идёт в комплекте», монозадачная рука и
    // рука-оружие «добываемые отдельно». A socket with nothing printed in it.
    mechanics: [
      { operator: "AND", entries: [{ kind: "weaponMount", emptySocket: true }] }
    ]
  },

  {
    name: "Бионическая рука: легионная",
    rarity: 2,
    cost: 5000,
    page: "DoomBC стр. 263",
    text:
      "<p>Рука, собранная под Астартес. На обычном человеке она смотрится чудовищно — "
      + "плечо перекошено, походка испорчена, — но и бьёт она соответственно.</p>"
      + LIMB,
    rules:
      "<p>Обычный человек получает от этой руки <strong>+10 к Силе</strong>, но её вес "
      + "и размер стоят ему <strong>−15 к Ловкости</strong>.</p>"
      + "<p>Космодесантник, которому поставили руку любой другой вариации, теряет "
      + "в ней всю свою сверхчеловеческую силу.</p>",
    levels: ARM_LEVELS,
    mechanics: [
      {
        operator: "AND",
        entries: [
          // Unnatural S (4) → +10 under the doctrine's +5 per two points.
          { kind: "characteristic", key: "str", value: 10 },
          { kind: "characteristic", key: "ag", value: -15 }
        ]
      }
    ]
  },

  /* ── Органы ──────────────────────────────────────────────────────────── */

  {
    name: "Бионический глаз",
    rarity: 1,
    cost: 1200,
    page: "DoomBC стр. 264",
    text:
      "<p>Бионический протез глаза, дублирующий функции обычного. Дешёвые модели "
      + "светятся тускло-красным и выдают владельца в темноте; дорогие не отличить "
      + "от живого, пока он не моргнёт не в такт.</p>",
    rules:
      "<p>Глаз видит как живой. Установить можно два глаза — по одному на сторону, — "
      + "а Уровень 4 позволяет подключить и больше.</p>",
    levels: {
      1: "Не различает цветов и выдаёт зернистое изображение.",
      3: "Работает как фото-визор наилучшего исполнения, ретинальный дисплей "
        + "и пикт-кастер одновременно.",
      4: "Как Уровень 3, и вдобавок <strong>+1 успех</strong> на все проверки зрения "
        + "плюс одна из доработок: интегрированный компактный лаз-, хотшот-лаз- или "
        + "бласт-пистолет; охотничий визор; магнокуляр; подсветка силуэтов (+2 успеха "
        + "на поиск существ и машин, −2 на прочие проверки зрения); зрение мельчайших "
        + "деталей; широкоугольный обзор в 270°; видимость вокс-сигналов, радиации и "
        + "магнитных полей; размытие иконографии Хаоса, защищающее разум от Порчи; "
        + "или полная неотличимость от живого глаза. Каждая доработка сверх первой "
        + "поднимает Редкость на 1."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          { kind: "testMod", skill: "awareness", value: { 2: 0, 4: 1 } }
        ]
      }
    ]
  },

  {
    name: "Бионический слух",
    rarity: 1,
    cost: 1200,
    page: "DoomBC стр. 263",
    // No slot pattern covers hearing: the eleven slots have no auditory socket.
    // `other` is where the Surgeon shows it, which is better than a wrong zone.
    slot: "other",
    text:
      "<p>Бионический протез органов слуха, заменяющий разрушенное внутреннее ухо. "
      + "Ставится после декомпрессии, близкого разрыва или слишком долгой службы "
      + "при орудийной палубе.</p>",
    rules:
      "<p>Имплант заменяет слух полностью. Его качество читается прямо в проверках "
      + "Бдительности, которыми игрок слушает.</p>",
    levels: {
      1: "Искажает слух статикой и хаотичной сменой громкости: <strong>−2 успеха</strong> "
        + "на проверки Бдительности, опирающиеся на слух.",
      3: "<strong>+1 успех</strong> на проверки Бдительности, опирающиеся на слух, "
        + "и встроенная вокс-бусина.",
      4: "Как Уровень 3, и вдобавок работает как глушащие беруши наилучшего исполнения: "
        + "оглушающий грохот вам не страшен."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          { kind: "testMod", skill: "awareness", value: { 1: -2, 2: 0, 3: 1, 4: 1 } }
        ]
      }
    ]
  },

  {
    name: "Бионический нюх",
    rarity: 1,
    cost: 1200,
    page: "DoomBC стр. 264",
    // Same as hearing: no olfactory slot exists, and `other` is visible.
    slot: "other",
    text:
      "<p>Бионический протез обонятельных рецепторов, выжженных ядовитым газом. "
      + "Владелец описывает запахи цифрами и потом долго не может объяснить, "
      + "чем пахнет дом.</p>",
    rules:
      "<p>Имплант заменяет обоняние. Проверки Бдительности, опирающиеся на нюх, "
      + "идут по его уровню.</p>",
    levels: {
      1: "Регистрирует только запахи опасных ядов — всё прочее для вас без запаха.",
      3: "<strong>+1 успех</strong> на проверки Бдительности, опирающиеся на нюх.",
      4: "Как Уровень 3, и вдобавок позволяет различать людей по запаху и идти по следу, "
        + "словно ищейка: <strong>+2 успеха</strong> на выслеживание при наличии образца "
        + "запаха цели. Блокирует запахи, от которых обычно рвёт."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          { kind: "testMod", skill: "awareness", value: { 2: 0, 3: 1, 4: 1 } }
        ]
      }
    ]
  },

  {
    name: "Бионическое сердце",
    rarity: 1,
    cost: 1200,
    page: "DoomBC стр. 263",
    text:
      "<p>Бионический протез сердца — замена необратимо повреждённому человеческому "
      + "или компенсация одного из двух сердец Астартес. В тишине его слышно: ровный "
      + "щелчок вместо удара.</p>",
    rules:
      "<p>Если это сердце у вас единственное и его отключают, вы теряете сознание, "
      + "получаете <strong>1d10+5 урона Выносливости</strong> и через число раундов, "
      + "равное бонусу Выносливости, умираете от кислородного голодания мозга — "
      + "если сердце не запустят раньше.</p>",
    levels: {
      1: "Работает всего 1d5+3 года, после чего ломается.",
      3: "<strong>+1 успех</strong> на проверки Стойкости против Усталости и "
        + "<strong>+1 очко брони</strong> торса.",
      4: "Как Уровень 3, и вдобавок экранировано от ЭМИ. Долгий форсированный бег "
        + "больше не выматывает вас."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          { kind: "testMod", skill: "fortitude", value: { 2: 0, 3: 1, 4: 1 } },
          { kind: "armour", key: "body", value: { 2: 0, 3: 1, 4: 1 } }
        ]
      }
    ]
  },

  {
    name: "Бионические лёгкие",
    rarity: 1,
    cost: 1200,
    page: "DoomBC стр. 264",
    // classify.js's respiratory pattern carries a bare `легк` that also matches
    // "лёгкий" in the sense of lightweight — a recorded finding. Written out.
    slot: "respiratory",
    text:
      "<p>Бионический протез лёгких: замена тому, что выжег ядовитый газ, съела "
      + "болезнь или разорвала декомпрессия. Грудь владельца при вдохе поднимается "
      + "чуть позже, чем следовало бы.</p>",
    rules:
      "<p>Лёгкие дышат за вас. На высоких уровнях они дышат лучше вас.</p>",
    levels: {
      1: "Работают со слышимым шипением и дают ощутимую одышку: <strong>−1 успех</strong> "
        + "на проверки Скрытности и <strong>−1 успех</strong> на проверки Стойкости "
        + "при длительной тяжёлой работе.",
      3: "Работают как респиратор наилучшего исполнения.",
      4: "Работают как ребризер наилучшего исполнения: вам хватает воздуха там, "
        + "где его нет."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          { kind: "testMod", skill: "stealth", value: { 1: -1, 2: 0 } },
          { kind: "testMod", skill: "fortitude", value: { 1: -1, 2: 0 } }
        ]
      }
    ]
  },

  {
    name: "Гастральная бионика",
    rarity: 1,
    cost: 1200,
    page: "DoomBC стр. 264",
    // "Гастральная бионика" matches no pattern and would land in `other` anyway;
    // written out so the intent is on the page rather than in a regex's silence.
    slot: "other",
    text:
      "<p>Бионический протез желудочно-кишечного тракта. Одна из тех аугметик, "
      + "о которых не говорят вслух: её ставят тем, чьи внутренности выжгло химическим "
      + "оружием, испорченной водой подульев или слишком усердным дознавателем. "
      + "Снаружи она незаметна, и владелец узнаётся лишь по тому, что ест он что "
      + "угодно и никогда не жалуется.</p>",
    rules:
      "<p>Протез заменяет пищеварение. Что именно вы после этого способны съесть "
      + "без вреда, решает его уровень.</p>",
    levels: {
      1: "Протез собран небрежно и усваивает пищу скверно. Вы получаете "
        + "<strong>−10 к Выносливости</strong>, становитесь болезненно худым, "
        + "а кожа идёт бледными желтоватыми пятнами — пока имплант не заменят на лучший.",
      3: "Вы не страдаете от пищевых отравлений и можете без вреда переваривать "
        + "испорченную и гниющую пищу. Вкуса это ей не добавляет.",
      4: "Как Уровень 3, и вдобавок вы полностью невосприимчивы ко всем съеденным "
        + "и выпитым ядам, а <strong>средняя (+0) проверка Бдительности</strong> "
        + "позволяет определить химический состав любого проглоченного вещества "
        + "по одному вкусу."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          // The book prints −1d5+10 Toughness; the fixed part, on impmal's
          // five-point Advance step.
          { kind: "characteristic", key: "tgh", value: { 1: -10, 2: 0 } }
        ]
      }
    ]
  },

  {
    name: "Кортикальный имплант",
    rarity: 2,
    cost: 2500,
    page: "DoomBC стр. 264",
    text:
      "<p>Кибернетический мозговой имплант, возвращающий часть функций мозга после "
      + "травмы, отправившей человека в вегетативное состояние. Техножрецы зовут его "
      + "милосердием; те, кто видел неудачные установки, зовут иначе.</p>",
    rules:
      "<p>Если имплант отключают, вы Оглушены на всё время его простоя.</p>",
    levels: {
      1: "Уничтожает личность и волю: персонаж превращается в сервитора, послушного "
        + "программам импланта.",
      3: "<strong>+5 к Интеллекту</strong> и <strong>+2 успеха</strong> на проверки "
        + "Логики и Знаний, когда вы вспоминаете важные сведения.",
      4: "Как Уровень 3, и вдобавок одна из доработок: два дополнительных бионических "
        + "глаза или визора, видимых одновременно; дополнительное ментальное "
        + "полудействие в начале Хода ценой проверки Ловкости −10 или 1 Усталости; "
        + "нечеловеческие паттерны мышления — Преимущество против контроля разума "
        + "и иллюзий, Помеха на Логику в социальных сценах; или экранирование от ЭМИ. "
        + "Каждая доработка сверх первой поднимает Редкость на 1."
    },
    mechanics: [
      {
        operator: "AND",
        entries: [
          // Unnatural I (+2) → +5 under the doctrine's +5 per two points.
          { kind: "characteristic", key: "int", value: { 2: 0, 3: 5, 4: 5 } },
          { kind: "testMod", skill: "logic", value: { 2: 0, 3: 2, 4: 2 } },
          { kind: "testMod", skill: "lore", value: { 2: 0, 3: 2, 4: 2 } }
        ]
      }
    ]
  }
];
