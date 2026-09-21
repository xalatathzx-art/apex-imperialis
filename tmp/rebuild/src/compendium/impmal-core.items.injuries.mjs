/**
 * The 23 injuries — eleven amputations and twelve broken bones — from
 * стр. 216–218 of the Russian edition.
 *
 * impmal names each one adjective + noun + location, "Minor Broken Bone
 * (Arms)"; the Russian mirrors that shape rather than the book's running prose,
 * because these are titles in a list, not sentences on a page. The book's own
 * wording is used for the rules text itself.
 *
 * The head locations keep impmal's split: the book prints one "Голова (Глаза)"
 * entry per severity, and impmal ships a separate document for eye, jaw and
 * nose. Each gets the sentence the book gives that part.
 */

export const label = "Предметы (Основная книга)";

const U = (uuid, label) => `@UUID[${uuid}]{${label}}`;

const C = "JournalEntry.DjxnvYJajGflu7IY.JournalEntryPage.Tu0sU1bo9eZI6qoe";
const BLINDED = U(`${C}#blinded`, "Слепота");
const INCAPACITATED = U(`${C}#incapacitated`, "Беспомощность");

const SPEED = U("JournalEntry.hdElQAwiBr5AyoRf.JournalEntryPage.zQYkbNcsJmGintdL#speed", "скорость");
const FUMBLE = U("JournalEntry.hdElQAwiBr5AyoRf.JournalEntryPage.Rjw4KykpjGJlGYEk#fumbles", "фиаско");
const TWO_HANDED = U("JournalEntry.wqlquQ8Njtd5fb4Y.JournalEntryPage.wsM53RDPPrqwS3Te#two-handed", "Двуручное");

const I = "Compendium.navis-apexialis.navis-core-items.Item";
const AMBIDEXTROUS = U(`${I}.Ck6P6S7KhYUXGxbs`, "Амбидекстрия");
const AMP_HAND = U(`${I}.vHHDZjKvukQuDV1z`, "ампутации кисти");
const SIGN_LANGUAGE = U(`${I}.z3pFUwFlp4BJf1oJ`, "язык жестов");

/** The sentence both the arm and the hand amputation end on. */
const NO_TWO_HANDS = `Вы получаете помеху во всех проверках, что требуют использования обеих рук, и не можете использовать оружие со свойством ${TWO_HANDED}.`;
const MOBILITY_LOSS = `Ваша ${SPEED} падает на один шаг (до минимума в медленную). Кроме того, вы получаете помеху в проверках, связанных с подвижностью — например, Рефлексов и Атлетики.`;

export const byName = {
  /* ── Ампутации (стр. 217–218) ────────────────────────────────────────── */

  "Amputation (Arm)": {
    type: "injury",
    name: "Ампутация (Рука)",
    description: `<p>${NO_TWO_HANDS}</p>`
  },

  "Amputation (Hand)": {
    type: "injury",
    name: "Ампутация (Кисть)",
    description:
      `<p>${NO_TWO_HANDS} Вы можете примотать щит к предплечью и пользоваться им. Если вы потеряли кисть своей ведущей руки, то получаете помеху во всех проверках, использующих оставшуюся кисть, пока не приобретёте талант ${AMBIDEXTROUS}.</p>`
  },

  "Amputation (Leg)": {
    type: "injury",
    name: "Ампутация (Нога)",
    description:
      `<p>${MOBILITY_LOSS} Кроме того, все проверки, связанные с подвижностью, не могут быть легче <strong>сложных (−20)</strong>.</p>`
  },

  "Amputation (Foot)": {
    type: "injury",
    name: "Ампутация (Стопа)",
    description: `<p>${MOBILITY_LOSS}</p>`
  },

  "Amputation (Finger)": {
    type: "injury",
    name: "Ампутация (Палец)",
    description:
      `<p>Потеря пальца ослабит вашу хватку, отчего вам будет проще провалить проверки, связанные с кистью этой руки. Если вы потеряли один палец, то при любой единице на кости единиц в проверках, связанных с этой кистью, вы терпите ${FUMBLE}. При потере двух пальцев фиаско происходит на 1 и 2 на кости единиц, и так далее.</p>` +
      `<p>Потеряв четыре или больше пальцев на одной кисти, переходите к правилам ${AMP_HAND}.</p>`
  },

  "Amputation (Toes)": {
    type: "injury",
    name: "Ампутация (Пальцы ног)",
    description:
      "<p>Потеря пальцев ног помешает вам удерживать равновесие. За каждый потерянный палец вы навсегда получаете −1 к Ловкости и Ближнему бою.</p>"
  },

  "Amputation (Eye)": {
    type: "injury",
    name: "Ампутация (Глаз)",
    description:
      "<p>Потеря глаза сильно понизит вашу внимательность, срезав глубину восприятия и умение оценивать расстояние. Потеряв глаз, вы получаете помеху в проверках Бдительности (Зрение) до тех пор, пока не привыкнете к своей потере — это занимает [[/r 5d10]] недель.</p>" +
      `<p>Потеряв оба глаза, вы навсегда получаете состояние ${BLINDED}.</p>`
  },

  "Amputation (Ear)": {
    type: "injury",
    name: "Ампутация (Ухо)",
    description:
      "<p>Потеря уха болезненна, но её можно пережить. Впрочем, если вам не повезёт потерять оба уха, вы получите помеху в проверках Бдительности (Слух).</p>"
  },

  "Amputation (Nose)": {
    type: "injury",
    name: "Ампутация (Нос)",
    description: "<p>Вы получаете помеху в проверках Бдительности (Обоняние).</p>"
  },

  "Amputation (Teeth)": {
    type: "injury",
    name: "Ампутация (Зубы)",
    description:
      "<p>Отсутствие зубов вынудит вас говорить невнятно, шепелявить и иным образом помешает ясно излагать свои мысли и общаться. За каждые два потерянных зуба понизьте значение умения Взаимопонимание на 1.</p>" +
      "<p>Потеряв больше половины зубов (16), вы начнёте медленно есть и не сможете употреблять некоторые блюда.</p>"
  },

  "Amputation (Tongue)": {
    type: "injury",
    name: "Ампутация (Язык)",
    description:
      `<p>Потеря языка лишит вас возможности говорить и повлияет на общение с окружающими. Вы получаете помеху в проверках Взаимопонимания и проходите любые проверки, связанные с речью, только если вам выпадет 01–05.</p>` +
      `<p>Многие набожные подданные Империума принимают обет молчания — особенно почтенные сёстры Безмолвия, что вместо слов используют ${SIGN_LANGUAGE}.</p>`
  },

  /* ── Малые переломы (стр. 216) ───────────────────────────────────────── */

  "Minor Broken Bone (Torso)": {
    type: "injury",
    name: "Малый перелом (Торс)",
    description: `<p>Ваша сила и подвижность резко падают. Вы получаете помеху в проверках Силы и Ловкости, а ваша ${SPEED} падает на один шаг (до минимума в медленную).</p>`
  },

  "Minor Broken Bone (Arms)": {
    type: "injury",
    name: "Малый перелом (Руки)",
    description:
      "<p>Сильная боль не даёт использовать эту руку. Вы получаете помеху во всех проверках, связанных с этой рукой — например, если хотите сделать выпад мечом, прицелиться из винтовки или куда-то залезть.</p>"
  },

  "Minor Broken Bone (Legs)": {
    type: "injury",
    name: "Малый перелом (Ноги)",
    description:
      `<p>Быстрые движения вызывают у вас кошмарную боль. Вы получаете помеху во всех проверках, что связаны с подвижностью — например, Рефлексов и Атлетики, а ваша ${SPEED} падает на один шаг (до минимума в медленную).</p>`
  },

  "Minor Broken Bone (Head - Eye)": {
    type: "injury",
    name: "Малый перелом (Голова — глаз)",
    description: "<p>У вас треснула глазница, и опухоль мешает видеть. Вы получаете помеху в проверках Бдительности (Зрение).</p>"
  },

  "Minor Broken Bone (Head - Jaw)": {
    type: "injury",
    name: "Малый перелом (Голова — челюсть)",
    description:
      "<p>Сломанная кость мешает вам говорить. Вы получаете помеху в проверках Взаимопонимания и всех проверках, связанных с речью.</p>"
  },

  "Minor Broken Bone (Head - Nose)": {
    type: "injury",
    name: "Малый перелом (Голова — нос)",
    description:
      "<p>Ваш сломанный нос превратился в мешанину крови и хрящей. Вы получаете помеху в проверках Бдительности (Обоняние).</p>"
  },

  /* ── Серьёзные переломы (стр. 216) ───────────────────────────────────── */

  "Major Broken Bone (Torso)": {
    type: "injury",
    name: "Серьёзный перелом (Торс)",
    description:
      `<p>Перелом повреждает ваши внутренние органы, что почти не даёт вам двигаться. Предпринимая любое физическое действие, вы должны пройти <strong>среднюю (+0) проверку Стойкости (Боль)</strong>. В случае успеха вы можете попытаться сделать, что хотели, но ваша проверка будет бросаться с помехой. В случае провала вы получаете состояние ${INCAPACITATED} и не можете предпринимать никаких физических действий до следующего дня или пока вам не помогут <strong>средней (+0) проверкой Медики</strong>.</p>`
  },

  "Major Broken Bone (Arms)": {
    type: "injury",
    name: "Серьёзный перелом (Руки)",
    description:
      `<p>Ваша рука бесполезна — вы должны использовать другую. ${NO_TWO_HANDS} Если у вас сломана кисть, вы можете закрепить щит на предплечье, но все остальные ограничения сохраняются.</p>`
  },

  "Major Broken Bone (Legs)": {
    type: "injury",
    name: "Серьёзный перелом (Ноги)",
    description:
      `<p>Воздействие такое же, как у малого перелома, но все проверки, связанные с подвижностью, не могут быть легче <strong>сложных (−20)</strong>.</p>`
  },

  "Major Broken Bone (Head - Eyes)": {
    type: "injury",
    name: "Серьёзный перелом (Голова — глаза)",
    description:
      "<p>Ваша глазница расколота, что вызывает сильнейшую опухоль, перекрывающую поле зрения. Вы получаете помеху в проверках Бдительности (Зрение) и ничего не видите пострадавшим глазом.</p>"
  },

  "Major Broken Bone (Head - Jaw)": {
    type: "injury",
    name: "Серьёзный перелом (Голова — челюсть)",
    description:
      "<p>Ваша челюсть погублена. Несколько недель вы не сможете говорить и будете в силах питаться только жидкой пищей.</p>"
  },

  "Major Broken Bone (Head - Nose)": {
    type: "injury",
    name: "Серьёзный перелом (Голова — нос)",
    description: "<p>Ваш нос разбит на осколки. Вы лишаетесь обоняния.</p>"
  }
};
