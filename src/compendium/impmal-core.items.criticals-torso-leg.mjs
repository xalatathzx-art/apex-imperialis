/**
 * Critical wounds of the torso and the leg, стр. 360–361.
 *
 * Conventions as in impmal-core.items.criticals-head-arm.mjs.
 *
 * One deliberate departure from the page. The book names result 6 of the leg
 * table "Отсечённый палец", the same words it gives result 6 of the arm table.
 * On the page they sit in different tables and cannot be confused; in a
 * compendium they are two rows of one list. The leg one is therefore
 * "Отсечённый палец ноги", which is also what its own injury line calls it.
 */

export const label = "Предметы (Основная книга)";

const U = (uuid, label) => `@UUID[${uuid}]{${label}}`;

const C = "JournalEntry.DjxnvYJajGflu7IY.JournalEntryPage.Tu0sU1bo9eZI6qoe";
const BLEEDING = U(`${C}#bleeding`, "Кровотечение");
const BLEEDING_MINOR = U(`${C}#bleeding`, "Кровотечение (Малое)");
const BLEEDING_MAJOR = U(`${C}#bleeding`, "Кровотечение (Серьёзное)");
const FATIGUED = U(`${C}#fatigued`, "Усталость");
const PRONE = U(`${C}#prone`, "Сбит с ног");
const STUNNED = U(`${C}#stunned`, "Оглушение");

const SPEED = U("JournalEntry.hdElQAwiBr5AyoRf.JournalEntryPage.zQYkbNcsJmGintdL#speed", "скорость");

const I = "Compendium.apex-imperialis.navis-core-items.Item";
const BONE_MINOR = U(`${I}.BUjBUUB42vTh3aKD`, "Перелом (Малый)");
const BONE_MAJOR = U(`${I}.b2oWmRETjNtrzEij`, "Перелом (Серьёзный)");
const CHIRURGEON = U(`${I}.au8V1ieKIHkTeA8l`, "Хирургеон");
const CHIRURGEONS_KIT = U(`${I}.qjjlckQ3WvF4KLxO`, "инструменты хирургеона");
const AMP_TOE = U(`${I}.wBFH7XeivMbTrjhF`, "Ампутация (Палец ноги)");
const AMP_TOES = U(`${I}.wBFH7XeivMbTrjhF`, "Ампутация (Пальцы ног)");
const AMP_FOOT = U(`${I}.thpflWusy6pFGmig`, "Ампутация (Стопа)");
const AMP_LEG = U(`${I}.Vnvx1LZfkLx3elkQ`, "Ампутация (Нога)");
const DISMEMBER_LEG = U(`${I}.wNFLqC7pKqBgFwps`, "Жестокое расчленение");

const heal = text => `<p><strong>Лечение:</strong> ${text}</p>`;
const injury = text => `<p><strong>Увечье</strong>: ${text}</p>`;

const BANDAGE_ROUTINE =
  "<strong>рутинная (+20) проверка Медики</strong> остановит кровотечение; необходимо наложить повязку, или рана сама закроется через час.";
const BANDAGE_CHALLENGING =
  "<strong>средняя (+0) проверка Медики</strong> остановит кровотечение; необходимо наложить повязку, или рана сама закроется через час.";
const SHOCK_DIFFICULT = "<strong>трудная (−10) проверка Медики</strong> избавит от шока, но не от перелома.";
const SHOCK_HARD = "<strong>сложная (−20) проверка Медики</strong> избавит от шока, но не от перелома.";
const ARTERY_HEAL = `чтобы прекратить кровотечение, потребуется <strong>сложная (−20) проверка Медики</strong> и ${CHIRURGEONS_KIT}.`;
const ARTERY_INJURY = `кровопотеря вызывает у вас ${FATIGUED} на [[/r 1d10]] дней, от которой не помогает отдых.`;
const ARTERY_TEXT =
  `<p>Удар рассекает одну из важных артерий. Вы получаете состояния ${BLEEDING_MAJOR}, ${FATIGUED} и ${PRONE}. Ваша ${SPEED} падает на один шаг, а все проверки, связанные с подвижностью, бросаются с помехой.</p>`;

export const byName = {
  /* ── Критические раны торса (стр. 360) ───────────────────────────────── */

  Winded: {
    type: "critical",
    name: "Сбитое дыхание",
    description: `<p>Удар вышибает у вас воздух из лёгких. Вы получаете состояние ${STUNNED} до конца вашего следующего хода.</p>`
  },

  "Low Blow": {
    type: "critical",
    name: "Прямо под дых",
    description: `<p>Вы получаете удар в чувствительное место. Пройдите <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или получите состояние ${PRONE}.</p>`
  },

  "Gut Shot": {
    type: "critical",
    name: "Удар в живот",
    description:
      `<p>Тяжёлый удар приходится вам прямо в живот, вызывает состояние ${BLEEDING} и ${PRONE}.</p>` +
      heal(BANDAGE_CHALLENGING)
  },

  "Cracked Rib": {
    type: "critical",
    name: "Треснувшее ребро",
    description:
      `<p>Удар ломает вам одно из рёбер. Вы получаете помеху в проверках Силы и Ловкости. Ваша ${SPEED} падает на один шаг.</p>` +
      injury(`у вас сломано ребро. Вы получаете ${BONE_MINOR} в торсе.`)
  },

  "Hammering Blow": {
    type: "critical",
    name: "Сокрушительный удар",
    description:
      `<p>Сила удара отбрасывает вас назад и вызывает состояние ${BLEEDING}. Вы получаете состояние ${STUNNED} на минуту.</p>` +
      heal(`<strong>средняя (+0) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}.`)
  },

  "Broken Collarbone": {
    type: "critical",
    name: "Сломанная ключица",
    description:
      `<p>От удара у вас с хрустом ломается ключица — определите случайно, левая или правая. Вы роняете то, что держите в соответствующей руке, и получаете помеху на все проверки, задействующие эту руку. Также вы должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(`у вас сломана ключица. Она получает ${BONE_MINOR}, что считается сломанной рукой.`) +
      heal(SHOCK_DIFFICULT)
  },

  "Fractured Hip": {
    type: "critical",
    name: "Треснувшее бедро",
    description:
      `<p>От удара в бедро ваши кости трескаются. Вы получаете состояние ${PRONE} и помеху во всех проверках, связанных с подвижностью, а ваша ${SPEED} падает на один шаг. Также вы должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(`у вас расколото бедро. Оно получает ${BONE_MINOR}, что считается сломанной ногой.`) +
      heal(SHOCK_DIFFICULT)
  },

  "Shattered Ribs": {
    type: "critical",
    name: "Сломанные рёбра",
    description:
      `<p>Удар раскалывает несколько рёбер, а их осколки вонзаются в вашу плоть. Вы получаете помеху во всех физических проверках, а ваша ${SPEED} падает на два шага (вплоть до медленной).</p>` +
      injury(`вы получаете ${BONE_MAJOR} в торсе.`) +
      heal(SHOCK_DIFFICULT)
  },

  "Punctured Lung": {
    type: "critical",
    name: "Пробитые лёгкие",
    description:
      `<p>В ваши лёгкие попадает пуля, осколок или даже часть вашей собственной кости. Вы получаете состояния ${BLEEDING_MINOR} и ${FATIGUED}.</p>` +
      injury(
        `ваше лёгкое серьёзно повреждено и частично наполнено жидкостью. <strong>Трудная (−10) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}, восстановит повреждённые ткани и снимет ${FATIGUED}.`
      ) +
      heal("чтобы прекратить кровотечение и зашить раны, потребуется <strong>трудная (−10) проверка Медики</strong>.")
  },

  "Flayed Flesh": {
    type: "critical",
    name: "Свежевание",
    description:
      `<p>С вашего торса сдирает часть кожи и плоти, оставляя уродливую открытую рану, в которой видны кости и внутренние органы. Вы получаете состояния ${PRONE} и ${BLEEDING_MAJOR}. Также вы получаете состояние ${STUNNED} на час.</p>` +
      injury(
        `<strong>трудная (−10) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}, восстановит повреждённые ткани.`
      ) +
      heal(`<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Injured Spine": {
    type: "critical",
    name: "Сломанный позвоночник",
    description:
      `<p>Вы получаете серьёзную травму позвоночника, что вызывает чудовищную боль и почти не позволяет стоять. Вы получаете состояния ${PRONE} и ${BLEEDING_MAJOR}.</p>` +
      injury(`ваш позвоночник повреждён или сломан. Вы получаете ${BONE_MAJOR} в торсе.`) +
      heal(`<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Torn Apart": {
    type: "critical",
    name: "Четвертование",
    description:
      "<p>Ваше тело разваливается надвое или иным образом расчленяется. Существ в пределах ближней дистанции окатывает волной крови. Вы мертвы.</p>"
  },

  /* ── Критические раны ноги (стр. 361) ────────────────────────────────── */

  "Twisted Ankle": {
    type: "critical",
    name: "Подвёрнутая лодыжка",
    description: `<p>Вы неудачно спотыкаетесь и подворачиваете лодыжку. Вы получаете состояние ${PRONE}.</p>`
  },

  "Dead Leg": {
    type: "critical",
    name: "Омертвевшая нога",
    description: `<p>От сильного удара ваша нога временно немеет. На минуту ваша ${SPEED} падает на один шаг.</p>`
  },

  "Sliced Calf": {
    type: "critical",
    name: "Раненая икра",
    description:
      `<p>Боль от раны, оставшейся у вас на икре, отдаётся по всей ноге и вызывает состояние ${BLEEDING}. Вы получаете состояние ${PRONE}.</p>` +
      heal(BANDAGE_CHALLENGING)
  },

  "Dislocated Knee": {
    type: "critical",
    name: "Выбитое колено",
    description:
      `<p>Удар приходится в коленную чашечку. Вы получаете помеху в проверках, связанных с подвижностью, а ваша ${SPEED} падает на один шаг. Пока колено не вправлено, в начале каждого хода вы должны предпринимать <strong>среднюю (+0) проверку Стойкости (Боль)</strong>. В случае провала вы получите состояние ${STUNNED} до начала вашего следующего хода.</p>` +
      heal("<strong>средняя (+0) проверка Медики</strong> позволит вправить колено на место.")
  },

  "Severed Toe": {
    type: "critical",
    name: "Отсечённый палец ноги",
    description:
      `<p>Удар лишает вас пальца ноги и вызывает состояние ${BLEEDING_MAJOR}.</p>` +
      injury(`вы теряете один палец ноги и получаете увечье ${AMP_TOE}.`) +
      heal(`<strong>средняя (+0) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}.`)
  },

  "Mangled Foot": {
    type: "critical",
    name: "Изуродованная стопа",
    description:
      `<p>Удар уродует вашу стопу, ломает кости или даже отсекает пальцы ноги и вызывает состояние ${BLEEDING_MAJOR}. Вы получаете состояние ${PRONE}, а ваша ${SPEED} падает на один шаг.</p>` +
      injury(
        `у вас страшная рана в стопе. Она получает ${BONE_MAJOR}. Также вы теряете [[/r 1d10-5]] пальцев ноги. Если в итоге получился 0, вам удалось сохранить все. В противном случае вы получаете увечье ${AMP_TOES}.`
      ) +
      heal(`<strong>трудная (−10) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}.`)
  },

  "Shattered Knee": {
    type: "critical",
    name: "Разбитое колено",
    description:
      `<p>Удар разбивает коленную чашечку. Нога совершенно бесполезна. Вы получаете состояние ${PRONE} и помеху во всех проверках, связанных с подвижностью, а ваша ${SPEED} падает на один шаг. Кроме того, вы должны пройти <strong>трудную (−10) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(`ваша нога сломана. Она получает увечье ${BONE_MAJOR}.`) +
      heal(SHOCK_HARD)
  },

  "Cleft Foot": {
    type: "critical",
    name: "Рассечённая стопа",
    description:
      `<p>Удар разрубает стопу, отрезает пальцы и вызывает состояние ${BLEEDING_MAJOR}. Вы получаете состояние ${PRONE}. Кроме того, вы должны пройти <strong>трудную (−10) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(
        `вы теряете палец ноги и получаете увечье ${AMP_TOE}. Каждую минуту, за которую об этой критической ране не позаботились, вы теряете ещё один палец ноги. Если вы потеряете все пальцы, то получите увечье ${AMP_FOOT}.`
      ) +
      heal(`<strong>сложная (−20) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Severed Foot": {
    type: "critical",
    name: "Отсечённая стопа",
    description:
      `<p>Вы теряете стопу. Вы получаете состояния ${PRONE}, ${BLEEDING_MAJOR} и ${STUNNED} на один час.</p>` +
      injury(`у вас больше нет стопы. Вы получаете увечье ${AMP_FOOT}.`) +
      heal(`<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}.`)
  },

  "Ruined Leg": {
    type: "critical",
    name: "Оторванная нога",
    description:
      `<p>Ваша нога отрывается и повисает на тонком лоскутке плоти. Нога совершенно бесполезна. Вы получаете состояние ${PRONE}, ваша ${SPEED} падает на один шаг, а все проверки, связанные с подвижностью, бросаются с помехой. Вы получаете состояние ${STUNNED} на один час и состояние ${BLEEDING_MAJOR}. Если вы получите ещё какой-то урон в эту ногу, то немедленно сработает результат ${DISMEMBER_LEG}, и вы умрёте.</p>` +
      injury(`ваша нога почти не связана с телом — её нужно полностью отрезать. Вы получаете увечье ${AMP_LEG}.`) +
      heal(
        `<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком, позволит ампутировать ногу.`
      )
  }
};

export const entries = {
  /* Рваная рана — торс, нога */
  FVTpV7oQOhq9MhEM: {
    en: "Laceration",
    name: "Рваная рана",
    description: `<p>Удар оставляет на торсе рваную рану и вызывает состояние ${BLEEDING}.</p>` + heal(BANDAGE_ROUTINE)
  },
  tQB2q7pjkFyQpm0p: {
    en: "Laceration",
    name: "Рваная рана",
    description: `<p>Удар оставляет на ноге рваную рану и вызывает состояние ${BLEEDING}.</p>` + heal(BANDAGE_ROUTINE)
  },

  /* Глубокая рана — торс, нога */
  "2ReoFIOhyWzeaFtg": {
    en: "Deep Cut",
    name: "Глубокая рана",
    description:
      `<p>Глубокая рана в живот лишает вас подвижности. Вы получаете состояние ${BLEEDING_MAJOR}, а ваша ${SPEED} падает на один шаг.</p>` +
      heal(`чтобы прекратить кровотечение, потребуется <strong>трудная (−10) проверка Медики</strong> и ${CHIRURGEONS_KIT}.`)
  },
  TSh63CQawIen5HS2: {
    en: "Deep Cut",
    name: "Глубокая рана",
    description:
      `<p>Глубокая рана в ногу лишает вас подвижности и ловкости. Вы получаете состояние ${BLEEDING_MAJOR}, а на все связанные с этой ногой проверки (вроде прыжков или лазанья) получаете помеху.</p>` +
      heal(`потребуется <strong>трудная (−10) проверка Медики</strong> и ${CHIRURGEONS_KIT}.`)
  },

  /* Чистый перелом — нога */
  TVBJ14jGNotUyBBu: {
    en: "Clean Break",
    name: "Чистый перелом",
    description:
      `<p>В вашей ноге ломается кость. Нога совершенно бесполезна, вы получаете состояние ${PRONE} и помеху на все проверки, связанные с подвижностью, а ваша ${SPEED} падает на один шаг. Вы должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(`ваша нога сломана. Она получает увечье ${BONE_MINOR}.`) +
      heal(SHOCK_DIFFICULT)
  },

  /* Разрубленные артерии — торс и нога: в книге у обеих один и тот же текст. */
  EDtYJa0b5bIoOd1N: {
    en: "Sliced Artery",
    name: "Разрубленные артерии",
    description: ARTERY_TEXT + injury(ARTERY_INJURY) + heal(ARTERY_HEAL)
  },
  uud73ybVjf9IDhD9: {
    en: "Sliced Artery",
    name: "Разрубленные артерии",
    description: ARTERY_TEXT + injury(ARTERY_INJURY) + heal(ARTERY_HEAL)
  },

  /* Жестокое расчленение — нога */
  wNFLqC7pKqBgFwps: {
    en: "Brutal Dismemberment",
    name: "Жестокое расчленение",
    description:
      "<p>Вашу изуродованную ногу отрывает от тела, что вызывает сильнейший шок и катастрофическую кровопотерю. Вы мертвы.</p>"
  }
};
