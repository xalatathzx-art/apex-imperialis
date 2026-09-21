/**
 * Critical wounds of the head and the arm, стр. 358–359.
 *
 * The four tables share five result names — Рваная рана, Глубокая рана,
 * Разрубленные артерии, Чистый перелом, Жестокое расчленение — so those
 * documents are keyed by id instead of by name: the word is the same in every
 * table, the text is not.
 *
 * Three things are carried over from the English and must stay: the @UUID ids,
 * the `[[/r 1d10]]` inline rolls (Foundry turns them into clickable dice, and a
 * rewritten one stops rolling), and the three-part shape impmal gives every
 * critical — effect, <strong>Увечье</strong>, <strong>Лечение</strong>.
 * Results the book marks "Не требуется" carry no treatment paragraph at all,
 * exactly as impmal ships them.
 */

export const label = "Предметы (Основная книга)";

const U = (uuid, label) => `@UUID[${uuid}]{${label}}`;

const C = "JournalEntry.DjxnvYJajGflu7IY.JournalEntryPage.Tu0sU1bo9eZI6qoe";
const BLEEDING = U(`${C}#bleeding`, "Кровотечение");
const BLEEDING_MAJOR = U(`${C}#bleeding`, "Кровотечение (Серьёзное)");
const BLINDED = U(`${C}#blinded`, "Слепота");
const DEAFENED = U(`${C}#deafened`, "Глухота");
const FATIGUED = U(`${C}#fatigued`, "Усталость");
const PRONE = U(`${C}#prone`, "Сбит с ног");
const STUNNED = U(`${C}#stunned`, "Оглушение");
const INCAPACITATED = U(`${C}#incapacitated`, "Беспомощность");

const I = "Compendium.navis-apexialis.navis-core-items.Item";
const BONE_MINOR = U(`${I}.BUjBUUB42vTh3aKD`, "Перелом (Малый)");
const BONE_MAJOR = U(`${I}.b2oWmRETjNtrzEij`, "Перелом (Серьёзный)");
const CHIRURGEON = U(`${I}.au8V1ieKIHkTeA8l`, "Хирургеон");
const CHIRURGEONS_KIT = U(`${I}.qjjlckQ3WvF4KLxO`, "инструменты хирургеона");
const AMP_TEETH = U(`${I}.GvHZsCJUIJ32TVhe`, "Ампутация (Зубы)");
const AMP_EAR = U(`${I}.eZdj2nZpxI009cad`, "Ампутация (Ухо)");
const AMP_EYE = U(`${I}.yDm12mSRSP7eyFmr`, "Ампутация (Глаз)");
const AMP_FINGER = U(`${I}.cHYtB7pCpwTOW1We`, "Ампутация (Палец)");
const AMP_FINGERS = U(`${I}.cHYtB7pCpwTOW1We`, "Ампутация (Пальцы)");
const AMP_HAND = U(`${I}.vHHDZjKvukQuDV1z`, "Ампутация (Кисть)");
const AMP_ARM = U(`${I}.MYESOCTsSmjMdk48`, "Ампутация (Рука)");
const DISMEMBER_ARM = U(`${I}.TMJenhLaKejw5fNn`, "Жестокое расчленение");

/** The treatment line, which is the same sentence over and over. */
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

export const byName = {
  /* ── Критические раны головы (стр. 358) ──────────────────────────────── */

  "Black Eye": {
    type: "critical",
    name: "Синяк",
    description:
      "<p>Вы пропустили удар в глаз. Вы получаете помеху в проверках Бдительности (Зрение) и Стрельбы на один час.</p>"
  },

  "Rattling Blow": {
    type: "critical",
    name: "Сильный удар",
    description: `<p>От удара у вас из глаз сыплются искры. Вы получаете состояние ${STUNNED} до конца своего следующего хода.</p>`
  },

  "Mangled Ear": {
    type: "critical",
    name: "Изуродованное ухо",
    description:
      `<p>Удар рассекает вам ухо и вызывает звон в том, что осталось. Вы получаете состояние ${DEAFENED} до конца своего следующего хода и состояние ${BLEEDING}.</p>` +
      heal(BANDAGE_CHALLENGING)
  },

  "Dislocated Jaw": {
    type: "critical",
    name: "Вывихнутая челюсть",
    description:
      `<p>Удар приходится вам в лицо, выворачивая челюсть. Вы получаете состояние ${STUNNED} до конца своего следующего хода и помеху в проверках Взаимопонимания, связанных с речью.</p>` +
      injury(`ваша челюсть сломана. Она получает увечье ${BONE_MINOR}.`) +
      heal("<strong>средняя (+0) проверка Медики</strong> вправит челюсть на место.")
  },

  "Struck Forehead": {
    type: "critical",
    name: "Удар в лоб",
    description:
      `<p>Попадание приходится прямо в ваш лоб, отчего кровь начинает стекать по лицу и мешает видеть. Вы получаете состояния ${BLEEDING} и ${BLINDED}.</p>` +
      heal(BANDAGE_CHALLENGING)
  },

  "Major Eye Wound": {
    type: "critical",
    name: "Повреждение глаза",
    description:
      `<p>Удар в глаз повреждает его. Вы получаете помеху в проверках Бдительности (Зрение) и состояние ${BLEEDING}. Если у вас был только один глаз, вы получаете состояние ${BLINDED}.</p>` +
      injury(`глазница треснула. Ваш глаз получает увечье ${BONE_MINOR}.`) +
      heal("<strong>трудная (−10) проверка Медики</strong> позаботится о вашем глазе и остановит кровотечение.")
  },

  "Major Ear Wound": {
    type: "critical",
    name: "Повреждение уха",
    description:
      `<p>Удар поражает ухо или иным образом вредит барабанным перепонкам. Вы получаете состояние ${DEAFENED}. Если вы ещё раз получите этот результат, вы навсегда лишитесь слуха.</p>` +
      heal("<strong>трудная (−10) проверка Медики</strong>, обычно требующая препаратов, которые уменьшат опухание и воспаление.")
  },

  "Smashed Mouth": {
    type: "critical",
    name: "Выбитые зубы",
    description:
      `<p>Удар вышибает вам несколько зубов и вызывает состояние ${BLEEDING}. Вы должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или получите состояние ${PRONE}.</p>` +
      injury(`вы лишаетесь [[/r 1d10]] зубов. Вы получаете увечье ${AMP_TEETH}.`) +
      heal(`<strong>трудная (−10) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Broken Nose": {
    type: "critical",
    name: "Сломанный нос",
    description:
      `<p>Попадание в нос ломает его и вызывает слёзы у вас на глазах. Вы получаете состояние ${BLEEDING_MAJOR}. Также вы получаете состояние ${BLINDED} до конца вашего следующего хода и должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} до конца своего следующего хода.</p>` +
      injury(`ваш нос сломан. Он получает увечье ${BONE_MAJOR}.`) +
      heal(`чтобы остановить кровотечение, потребуется <strong>сложная (−20) проверка Медики</strong> и ${CHIRURGEONS_KIT}.`)
  },

  "Sliced Ear": {
    type: "critical",
    name: "Отсечённое ухо",
    description:
      `<p>Удар разрывает ваше ухо и вызывает состояние ${BLEEDING_MAJOR}. Вы получаете состояние ${DEAFENED} и должны предпринять <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или также получите состояние ${STUNNED} до конца вашего следующего хода.</p>` +
      injury(`вы лишаетесь уха и получаете увечье ${AMP_EAR}.`) +
      heal(`<strong>сложная (−20) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Concussive Blow": {
    type: "critical",
    name: "Оглушающий удар",
    description:
      `<p>Мощный оглушающий удар приходится вам в голову и вызывает состояние ${BLEEDING}. Также вы получаете состояния ${DEAFENED} и ${STUNNED} на одну минуту.</p>` +
      injury(`вы контужены и получаете состояние ${FATIGUED} на [[/r 1d10]] дней, от которого не помогает отдых.`) +
      heal(`чтобы прекратить кровотечение и вернуть слух, потребуется <strong>сложная (−20) проверка Медики</strong> и ${CHIRURGEONS_KIT}.`)
  },

  "Devastated Eye": {
    type: "critical",
    name: "Вытекший глаз",
    description:
      `<p>От удара ваш глаз лопается. Вы получаете состояние ${BLEEDING_MAJOR}, а все проверки Бдительности (Зрение) получают помеху. Если у вас был лишь один глаз, вы получаете состояние ${BLINDED}.</p>` +
      injury(`вы потеряли один глаз. Вы получаете увечье ${AMP_EYE}.`) +
      heal(`<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Mangled Jaw": {
    type: "critical",
    name: "Выбитая челюсть",
    description:
      `<p>Удар ломает вашу челюсть, вырывает язык и вышибает целую пригоршню зубов. Вы получаете состояние ${BLEEDING_MAJOR}. Вы должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong>. В случае успеха вы получите состояние ${STUNNED} до конца вашего следующего хода. В случае провала вы получите состояния ${PRONE} и ${INCAPACITATED} до конца вашего следующего хода.</p>` +
      injury(`вы теряете [[/r 1d10]] зубов, получаете увечье ${AMP_TEETH}, а ваша челюсть получает ${BONE_MAJOR}.`) +
      heal(`<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Shattered Skull": {
    type: "critical",
    name: "Расколотый череп",
    description: "<p>Ваша голова разваливается надвое, обдавая всё вокруг фонтаном крови и костей. Вы мертвы.</p>"
  },

  /* ── Критические раны руки (стр. 359) ────────────────────────────────── */

  "Jolted Wrist": {
    type: "critical",
    name: "Вывернутый сустав",
    description: "<p>Удар приходится в запястье и выворачивает вам руку. Вы роняете то, что держали в ней.</p>"
  },

  "Dead Arm": {
    type: "critical",
    name: "Омертвевшая рука",
    description:
      "<p>От сильного удара ваша рука временно немеет. На одну минуту все проверки, связанные с этой рукой, бросаются с помехой.</p>"
  },

  "Sliced Hand": {
    type: "critical",
    name: "Раненая кисть",
    description:
      `<p>Боль от раны, оставшейся у вас на кисти, отдаётся по всей руке и вызывает состояние ${BLEEDING}. Вы роняете то, что держали в этой руке.</p>` +
      heal(BANDAGE_CHALLENGING)
  },

  "Dislocated Shoulder": {
    type: "critical",
    name: "Выбитое плечо",
    description:
      `<p>Удар вышибает руку из плечевого сустава. Рука останется бесполезной, пока её не вправят. Пока рука не вправлена, в начале каждого хода вы должны предпринимать <strong>среднюю (+0) проверку Стойкости (Боль)</strong>. В случае провала вы получите состояние ${STUNNED} до начала вашего следующего хода.</p>` +
      heal("<strong>средняя (+0) проверка Медики</strong> позволит вправить руку на место.")
  },

  "Severed Finger": {
    type: "critical",
    name: "Отсечённый палец",
    description:
      `<p>Удар лишает вас пальца и вызывает состояние ${BLEEDING_MAJOR}.</p>` +
      injury(`вы теряете один палец и получаете увечье ${AMP_FINGER}.`) +
      heal(`<strong>средняя (+0) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}.`)
  },

  "Mangled Hand": {
    type: "critical",
    name: "Изуродованная кисть",
    description:
      `<p>Удар уродует вашу кисть, ломает кости или даже отсекает пальцы и вызывает состояние ${BLEEDING_MAJOR}. Вы роняете то, что держите в этой руке.</p>` +
      injury(
        `у вас страшная рана в кисти. Она получает ${BONE_MAJOR}. Также вы теряете [[/r 1d10-5]] пальцев. Если в итоге получился 0, вам удалось сохранить все. В противном случае вы получаете увечье ${AMP_FINGERS}.`
      ) +
      heal(`<strong>трудная (−10) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON}.`)
  },

  "Shattered Elbow": {
    type: "critical",
    name: "Разбитый локоть",
    description:
      `<p>Удар раскалывает кости в вашем локте. Вы роняете то, что держите в руке. Рука совершенно бесполезна. Кроме того, вы должны пройти <strong>трудную (−10) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(`ваша рука сломана. Она получает увечье ${BONE_MAJOR}.`) +
      heal(SHOCK_HARD)
  },

  "Cleft Hand": {
    type: "critical",
    name: "Рассечённая кисть",
    description:
      `<p>Удар разрубает кисть вашей руки, отрезает пальцы и вызывает состояние ${BLEEDING_MAJOR}. Вы роняете то, что держите в руке. Кроме того, вы должны пройти <strong>трудную (−10) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(
        `вы теряете палец и получаете увечье ${AMP_FINGER}. Каждую минуту, за которую об этой критической ране не позаботились, вы теряете ещё один палец. Если вы потеряете все пальцы, то получите увечье ${AMP_HAND}.`
      ) +
      heal(`<strong>сложная (−20) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Severed Hand": {
    type: "critical",
    name: "Отсечённая кисть",
    description:
      `<p>Вы теряете кисть руки. Вы получаете состояния ${BLEEDING_MAJOR} и ${STUNNED} на один час.</p>` +
      injury(`у вас больше нет кисти. Вы получаете увечье ${AMP_HAND}.`) +
      heal(`<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком.`)
  },

  "Ruined Arm": {
    type: "critical",
    name: "Оторванная рука",
    description:
      `<p>Ваша рука отрывается и повисает на тонком лоскутке плоти. Вы роняете то, что держите в этой руке. Рука совершенно бесполезна. Вы получаете состояние ${STUNNED} на один час и состояние ${BLEEDING_MAJOR}. Если вы получите ещё какой-то урон в эту руку, то немедленно сработает результат ${DISMEMBER_ARM}, и вы умрёте.</p>` +
      injury(`ваша рука почти не связана с телом — её нужно полностью отрезать. Вы получаете увечье ${AMP_ARM}.`) +
      heal(
        `<strong>очень сложная (−30) проверка Медики</strong>, предпринятая обладателем таланта ${CHIRURGEON} или иным знающим человеком, позволит ампутировать руку.`
      )
  }
};

/* The five names each table repeats, keyed by id because only the text differs. */
export const entries = {
  /* Рваная рана — щека, рука */
  "9VD9YyptqJ2wntsd": {
    en: "Laceration",
    name: "Рваная рана",
    description: `<p>На вашей щеке появляется рваная рана. Вы получаете состояние ${BLEEDING}.</p>` + heal(BANDAGE_ROUTINE)
  },
  t6L0jOqry3hLKson: {
    en: "Laceration",
    name: "Рваная рана",
    description: `<p>Удар оставляет на руке рваную рану и вызывает состояние ${BLEEDING}.</p>` + heal(BANDAGE_ROUTINE)
  },

  /* Чистый перелом — рука */
  BlcUOZd2C8TMZH5X: {
    en: "Clean Break",
    name: "Чистый перелом",
    description:
      `<p>В вашей руке ломается кость, и вы роняете то, что держите. Рука совершенно бесполезна. Вы должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong> или получите состояние ${STUNNED} на минуту.</p>` +
      injury(`ваша рука сломана. Она получает увечье ${BONE_MINOR}.`) +
      heal(SHOCK_DIFFICULT)
  },

  /* Глубокая рана — рука */
  Y6DXUrryyhdrcsWG: {
    en: "Deep Cut",
    name: "Глубокая рана",
    description:
      `<p>Глубокая рана в руку лишает вас подвижности и ловкости. Вы получаете состояние ${BLEEDING_MAJOR}, а во всех связанных с этой рукой проверках получаете помеху.</p>` +
      heal(`потребуется <strong>трудная (−10) проверка Медики</strong> и ${CHIRURGEONS_KIT}.`)
  },

  /* Разрубленные артерии — рука */
  "2hoDF5nLA8JedCpE": {
    en: "Sliced Artery",
    name: "Разрубленные артерии",
    description:
      `<p>Удар рассекает одну из важных артерий. Вы роняете то, что держите в руке, и получаете состояния ${BLEEDING_MAJOR} и ${FATIGUED}. Рука совершенно бесполезна.</p>` +
      injury(ARTERY_INJURY) +
      heal(ARTERY_HEAL)
  },

  /* Жестокое расчленение — рука */
  TMJenhLaKejw5fNn: {
    en: "Brutal Dismemberment",
    name: "Жестокое расчленение",
    description:
      "<p>Вашу изуродованную руку отрывает от тела, что вызывает сильнейший шок и катастрофическую кровопотерю. Вы мертвы.</p>"
  }
};
