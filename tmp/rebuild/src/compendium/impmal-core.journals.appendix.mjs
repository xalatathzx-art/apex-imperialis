/**
 * «Приложения» — фиаско, безделушки, критические раны (стр. 356),
 * состояния (стр. 356–357) и «Я хочу играть…» (стр. 362).
 *
 * Two things about journal pages that are not obvious and cost real time:
 *
 *  1. Every `@UUID[...#anchor]` in this system points at a HEADING, and Foundry
 *     builds that anchor from the heading's text — so translating an <h3> would
 *     break every link into it, silently, leaving the reader on the top of the
 *     page. Foundry takes `heading.id` first when one is present
 *     (JournalEntryPage#_makeHeadingNode), so every translated heading here
 *     carries the English slug as an explicit id and the links keep working.
 *
 *  2. `@TableHTML[...]` renders a roll table inline. The table itself is
 *     translated in the tables pack, so only the caption in braces is ours.
 *
 * One deliberate departure from the Russian edition: it prints Глухота as
 * lasting «1к10 раундов», but the English — and the sense, beside Слепота's own
 * 1d10 rounds — is minutes. That is a slip in the RU printing, not a rules
 * change, so the page says «минут».
 */

export const label = "Журналы (Основная книга)";

const U = (uuid, label) => `@UUID[${uuid}]{${label}}`;
const T = (id, caption) => `@TableHTML[RollTable.${id}]{${caption}}`;

/* Страницы, на которые ссылается таблица «Я хочу играть…». */
const CH = "JournalEntry.uJURMn2glWHhjqJk.JournalEntryPage";
const IM = "JournalEntry.GPqYZykonC12TJb1.JournalEntryPage";
const WOUNDS = "JournalEntry.hdElQAwiBr5AyoRf.JournalEntryPage.UaRHLqZ99zmg7AeE";

const origin = {
  shrine: U("Compendium.navis-apexialis.navis-core-items.Item.i7qRAalBsnddJYeW", "Мир-храм"),
  hive: U("Compendium.navis-apexialis.navis-core-items.Item.OjFcYwOwNH6WlUjT", "Мир-улей"),
  void: U("Compendium.navis-apexialis.navis-core-items.Item.bFXPJAp4GsM8TB8F", "Пустота"),
  schola: U("Compendium.navis-apexialis.navis-core-items.Item.7E0Gkel1gSaxTgVu", "Схола Прогениум"),
  feudal: U("Compendium.navis-apexialis.navis-core-items.Item.pzvSXkckglOmZgdk", "Феодальный мир"),
  feral: U("Compendium.navis-apexialis.navis-core-items.Item.jPXulXRUoZ099Cwl", "Дикий мир"),
  forge: U("Compendium.navis-apexialis.navis-core-items.Item.5SLj6QlgqqR0K5GX", "Мир-кузница")
};

const faction = {
  telepathica: U(`${CH}.Lbabs7YP2HuQqC8T`, "Адептус Астра Телепатика"),
  administratum: U(`${IM}.3TtxuCzt0nNV1ysj`, "Администратум"),
  navy: U(`${IM}.HlxK2pbpx2Uio6bU`, "Имперский Флот"),
  militarum: U(`${CH}.L6dhVRYQmfBKlwgO`, "Астра Милитарум"),
  ministorum: U(`${CH}.Fb8czdAGVFVDHfOF`, "Адептус Министорум"),
  infractionist: U(`${CH}.uhAdgxtMePoyNdnm`, "Одиночки"),
  inquisition: U(`${CH}.GFKCnze9kOgNTrOw`, "Инквизиция"),
  dynasty: U(`${CH}.JtcS09YO7exNVJum`, "Династия вольных торговцев"),
  mechanicus: U(`${CH}.1oKZw1hTM7Gx5cqB`, "Адептус Механикус")
};

const role = {
  zealot: U(`${CH}.TrSAGoKhRuNOwYhK`, "Фанатик"),
  savant: U(`${CH}.OS9fWy8dYBTURFLE`, "Эрудит"),
  interlocutor: U(`${CH}.5ewutQ9qVF8zhEGI`, "Переговорщик"),
  penumbra: U(`${CH}.sHSbkzrtFfIdmrJl`, "Полутень"),
  warrior: U(`${CH}.KznGxzLZLr1QaCoN`, "Воин"),
  mystic: U(`${CH}.XAXnQluFkxD2gsmG`, "Мистик")
};

/** Стр. 362, в порядке книги — он же порядок английской таблицы. */
const archetypes = [
  ["Послушница Сестёр безмолвия", origin.shrine, faction.telepathica, role.zealot],
  ["Адепт Администратума", origin.hive, faction.administratum, role.savant],
  ["Пилот Аэронавтики", origin.void, faction.navy, role.savant],
  ["Комиссар-кадет", origin.schola, faction.militarum, role.interlocutor],
  ["Убийца из культа смерти", origin.feudal, faction.ministorum, role.zealot],
  ["Бандит", origin.hive, faction.infractionist, role.penumbra],
  ["Имперский гвардеец", origin.feudal, faction.militarum, role.warrior],
  ["Аколит Инквизиции", origin.schola, faction.inquisition, role.penumbra],
  ["Экзорцист Инквизиции", origin.shrine, faction.inquisition, role.zealot],
  ["Штурмовик Инквизиции", origin.schola, faction.inquisition, role.warrior],
  ["Пария Инквизиции", origin.hive, faction.inquisition, role.mystic],
  ["Полевой медик Астра Милитарум", origin.feudal, faction.militarum, role.savant],
  ["Снайпер Астра Милитарум", origin.schola, faction.militarum, role.penumbra],
  ["Миссионер", origin.shrine, faction.ministorum, role.interlocutor],
  ["Посвящённый Оффицио Ассасинорум", origin.schola, faction.administratum, role.penumbra],
  ["Проповедник", origin.shrine, faction.ministorum, role.zealot],
  ["Адепт-омолодитель", origin.shrine, faction.administratum, role.savant],
  ["Наёмник вольного торговца", origin.feral, faction.dynasty, role.warrior],
  ["Сенешаль вольного торговца", origin.void, faction.dynasty, role.interlocutor],
  ["Санкционированный псайкер", origin.void, faction.telepathica, role.mystic],
  ["Послушница ордена Диалогус", origin.schola, faction.ministorum, role.savant],
  ["Сестра-фамула", origin.schola, faction.ministorum, role.interlocutor],
  ["Послушница-госпитальерка", origin.schola, faction.ministorum, role.savant],
  ["Послушница сестёр битвы", origin.schola, faction.ministorum, role.warrior],
  ["Техножрец", origin.forge, faction.mechanicus, role.savant],
  ["Кадет отпрысков Темпестус", origin.schola, faction.militarum, role.warrior],
  ["Флотский оруженосец", origin.void, faction.navy, role.warrior]
];

const cell = (value, extra = "") => `<td style="width:25%${extra}"><p>${value}</p></td>`;

const archetypeTable = `<table class="impmal">` +
  `<thead>` +
    `<tr class="title"><td colspan="4"><p>Я хочу играть…</p></td></tr>` +
    `<tr class="subheader">${["Архетип", "Происхождение", "Служба", "Роль"].map(h => cell(h)).join("")}</tr>` +
  `</thead><tbody>` +
  archetypes.map(([name, o, f, r]) =>
    `<tr>${cell(name, ";font-weight:normal")}${cell(o)}${cell(f)}${cell(r)}</tr>`
  ).join("") +
  `</tbody></table>`;

/** Заголовок с английским слагом: см. пункт 1 в шапке файла. */
const h = (level, slug, text) => `<h${level} id="${slug}">${text}</h${level}>`;
const ul = (...items) => `<ul>${items.map(i => `<li><p>${i}</p></li>`).join("")}</ul>`;

export const byName = {
  Appendix: {
    name: "Приложения",
    pages: {
      "Fumble Table": {
        name: "Фиаско",
        text: `<p>${T("HL6DtTGWIUQy5NZ9", "Результат,no-center")}</p>`
      },

      Curios: {
        name: "Безделушки",
        text:
          `<p>Каждый игровой персонаж начинает игру с одной или несколькими безделушками, ` +
          `определяемыми по таблице ниже. Безделушки — это небольшие предметы, что почти ничего ` +
          `не стоят, но дороги своему владельцу. Ведущий может пользоваться этой таблицей и для ` +
          `того, чтобы быстро определить содержимое карманов — например, когда персонажи обыскивают ` +
          `убитого врага или чужие пожитки.</p>` +
          `<p>${T("o3wbgwFvTGN5aEan", "Тип,no-center")}</p>`
      },

      "Critical Wounds": {
        name: "Критические раны",
        text:
          h(4, "treatment", "Исцеление") +
          `<p>В описании критических ран указано, как их лечить. Приведённая сложность подразумевает, ` +
          `что лечение проходит прямо во время боя. В ином случае она понижается на шаг ` +
          `(сложная (−20) становится трудной (−10), средняя (+0) превращается в рутинную (+20) и т. д.).</p>` +
          `<p>Указание «<strong>Лечение</strong>: не требуется» означает, что лечение не требуется, ` +
          `а рана не идёт в число неисцелённых критических ран при расчёте того, ` +
          `${U(`${WOUNDS}#dying`, "умрёт персонаж или нет")}.</p>` +
          h(4, "injury", "Увечья") +
          `<p>Некоторые ${U(`${WOUNDS}#critical-wounds`, "критические раны")} вызывают ` +
          `${U(`${WOUNDS}#injuries`, "увечья")} — их эффект не только вступает в силу немедленно, ` +
          `но и сохраняется после того, как критическая рана будет исцелена. Увечье — это ` +
          `долговременный штраф, требующий для исцеления медицинского ухода или хирургических ` +
          `операций, но не считающийся в числе критических ран при расчёте того, ` +
          `${U(`${WOUNDS}#dying`, "умер персонаж или нет")}.</p>` +
          h(3, "head-critical-wounds", "Критические раны головы") +
          `<p>${T("dvsiB3K8ezHI8F7M", "Критическая рана")}</p>` +
          h(3, "arm-critical-wounds", "Критические раны руки") +
          `<p>${T("7PZdfk0TRBPDr0QR", "Критическая рана")}</p>` +
          h(3, "leg-critical-wounds", "Критические раны ноги") +
          `<p>${T("kCP63j7ZWPVquLqW", "Критическая рана")}</p>` +
          h(3, "body-critical-wounds", "Критические раны торса") +
          `<p>${T("2GOSTiyV8FH51YD2", "Критическая рана")}</p><p></p>`
      },

      Conditions: {
        name: "Состояния",
        text:
          `<p>Оружие, условия среды и психосилы могут наложить на персонажей немало разных ` +
          `состояний. Ниже приведён полный список таковых. Состояние остаётся с персонажем, пока ` +
          `не будет снято (см. описания) или пока не пройдёт само — обычно это указывается в ` +
          `правилах того, что причиняет это состояние.</p>` +
          `<p>Некоторые состояния могут быть малыми или серьёзными. Если не указано обратного, то, ` +
          `получая состояние в первый раз, вы обретаете его малую версию, а если потом будете ` +
          `вынуждены получить его ещё раз, она сменится на серьёзную.</p>` +

          h(3, "ablaze", "Горение") +
          ul(
            "Вы объяты пламенем.",
            "<strong>Горение (Малое)</strong>: вы получаете [[/r 1d5]] единиц урона в начале своего хода. От этого не спасает броня.",
            "<strong>Горение (Серьёзное)</strong>: вы получаете [[/r 1d10]] единиц урона в начале своего хода. От этого не спасает броня."
          ) +
          `<p>Когда вы <em>горите</em>, вы автоматически проваливаете все проверки Скрытности. ` +
          `Если не указано обратного, вы можете снять <em>Горение</em>, упав на землю ` +
          `(будет считаться, что вы ${U(".Tu0sU1bo9eZI6qoe#prone", "Сбиты с ног")}), потратив ` +
          `действие и успешно пройдя <strong>среднюю (+0) проверку Атлетики</strong>.</p>` +

          h(3, "bleeding", "Кровотечение") +
          ul(
            "Вы теряете кровь.",
            "Кровотечение (Малое): вы получаете одно очко урона в конце вашего хода. От этого не спасает броня.",
            "Кровотечение (Серьёзное): вы получаете три очка урона в конце вашего хода. От этого не спасает броня."
          ) +
          `<p>Если из-за <em>Кровотечения</em> вы потеряете все свои раны, то получите критическую ` +
          `рану по общим правилам. Если это произойдёт, вы больше не будете получать урон от ` +
          `<em>Кровотечения</em>, но ваши раны нельзя будет восстановить, пока <em>Кровотечение</em> ` +
          `не остановят. Если <em>Кровотечение</em> началось не из-за критической раны, его можно ` +
          `остановить <strong>средней (+0) проверкой Медики</strong> или при помощи ` +
          `${U("Compendium.navis-apexialis.navis-core-items.Item.qjjlckQ3WvF4KLxO", "инструментов хирургеона")}.</p>` +

          h(3, "blinded", "Слепота") +
          ul(
            "Вы ничего не видите.",
            "Проверки, связанные со зрением (например, Бдительность (Зрение) или Стрельба), будут успешны, только если на костях выпадет 01–05.",
            "Вы получаете помеху на все проверки Боя и Рефлексов (Уклонения)."
          ) +
          `<p>Если не указано обратного, <em>Слепота</em> проходит через [[/r 1d10]] раундов.</p>` +

          h(3, "deafened", "Глухота") +
          ul(
            "Вы ничего не слышите.",
            "Проверки, связанные со слухом (например, Бдительность (Слух)), будут успешны, только если на костях выпадет 01–05."
          ) +
          `<p>Если не указано обратного, <em>Глухота</em> проходит через [[/r 1d10]] минут.</p>` +
          `<p>Способов прекратить Глухоту или Слепоту раньше обычного почти не существует, но если ` +
          `речь идёт о соответствующих аугметических органах чувств, то они могут вернуться в строй ` +
          `благодаря действию, потраченному на обновление цикла их работы.</p>` +

          h(3, "fatigued", "Усталость") +
          `<p>Вы вымотаны, истощены и крайне нуждаетесь в отдыхе.</p>` +
          ul(
            "<strong>Усталость (Малая)</strong>: все ваши проверки бросаются с помехой.",
            "<strong>Усталость (Серьёзная)</strong>: сложность всех ваших проверок возрастает до очень сложной (−30)."
          ) +
          `<p>Если вы уже имеете <strong>Усталость (Серьёзную)</strong> и получаете ` +
          `<em>Усталость</em> ещё раз, вы сможете действовать ещё количество минут, равное вашему ` +
          `бонусу Выносливости, после чего упадёте ` +
          `${U(".Tu0sU1bo9eZI6qoe#unconscious", "Без сознания")}. Если не указано обратного, ` +
          `вы можете снять <em>Усталость</em>, отдохнув шесть часов.</p>` +

          h(3, "frightened", "Страх") +
          ul(
            "Вы объяты <em>страхом</em>.",
            "<strong>Страх (Малый)</strong>: страх обостряет чувства — вы получаете преимущество в проверках Бдительности и Чутья. Тем не менее вы получаете помеху во всех проверках, связанных с противостоянием источнику вашего страха.",
            "<strong>Страх (Серьёзный)</strong>: вы испытываете ужас. Вы должны бежать прочь от источника вашего страха самым быстрым из возможных способов. Останавливаться вы можете лишь, чтобы открыть дверь или сделать что-то ещё, что поможет вам выбраться из текущей ситуации."
          ) +
          `<p>Если не указано обратного, в конце каждого раунда вы можете предпринять ` +
          `<strong>среднюю (+0) проверку Дисциплины (Страх)</strong>, чтобы снять это состояние.</p>` +

          h(3, "incapacitated", "Беспомощность") +
          ul(
            "Вы не можете двигаться и предпринимать действия.",
            `Вы не можете защитить себя. Атаки в ближнем бою автоматически наносят вам ${U(`${WOUNDS}#critical-hit`, "критическое попадание")}.`
          ) +

          h(3, "overburdened", "Перегрузка") +
          ul(
            "Вы получаете помеху на все проверки Ловкости, а ваша скорость падает на один шаг."
          ) +

          h(3, "poisoned", "Отравление") +
          ul(
            "Вы чувствуете себя дурно.",
            "<strong>Отравление (Малое)</strong>: вы получаете помеху в проверках Силы и Выносливости. Предельное количество успехов, что вы можете набрать в любой проверке, не может превышать ваш бонус Выносливости.",
            "<strong>Отравление (Серьёзное)</strong>: вы <em>сбиты с ног</em> и <em>беспомощны</em>."
          ) +
          `<p>Если длительность <em>Отравления</em> не указана, оно продолжается [[/r 1d5]] часов.</p>` +
          `<p>Как правило, <em>Отравление</em> можно вылечить <strong>средней (+0) проверкой ` +
          `Медики</strong> и применением ` +
          `${U("Compendium.navis-apexialis.navis-core-items.Item.qjjlckQ3WvF4KLxO", "инструментов хирургеона")}. ` +
          `Особенно опасные яды могут потребовать трудной (−10) проверки или хуже. Самые ` +
          `смертоносные вещества требуют очень сложной (−30) проверки, а когда срок их действия ` +
          `подходит к концу, обычно к концу подходит и жизнь жертвы.</p>` +

          h(3, "prone", "Сбит с ног") +
          ul(
            `Сбитые с ног могут двигаться только ${U("JournalEntry.hdElQAwiBr5AyoRf.JournalEntryPage.zQYkbNcsJmGintdL#climbing,-crawling,-sneaking,-squeezing,-and-swimming", "ползком")}, если не потратят движение на то, чтобы встать.`,
            "Вы получаете помеху на проверки Боя.",
            "Если атакующее вас существо находится от вас в непосредственной близости, оно атакует с преимуществом.",
            "Если атакующее вас существо находится от вас не в непосредственной близости, его атака бросается с помехой."
          ) +

          h(3, "restrained", "Обездвиживание") +
          ul(
            "Вы не можете двигаться.",
            "<strong>Обездвиживание (Малое)</strong>: вы не можете совершать движение. Вы получаете помеху в проверках, связанных с передвижением, — в том числе Атлетики, Ловкости рук, Боя, Рефлексов и Стрельбы.",
            "<strong>Обездвиживание (Серьёзное)</strong>: вы становитесь Беспомощным.",
            "Чтобы сбросить это состояние, требуется уместная проверка — например, Ловкости рук (Взлом замков)."
          ) +

          h(3, "stunned", "Оглушение") +
          ul(
            "Вы ошеломлены и дезориентированы.",
            "<strong>Оглушение (Малое)</strong>: вы можете совершать движение или действие, но только что-то одно.",
            "<strong>Оглушение (Серьёзное)</strong>: также вы получаете помеху на все проверки."
          ) +
          `<p>Если длительность <em>Оглушения</em> не указана, оно продолжается [[/r 1d5]] раундов. ` +
          `Если соратник потратит действие на то, чтобы привести вас в чувство, вы можете ` +
          `предпринять <strong>среднюю (+0) проверку Стойкости (Боль)</strong>, чтобы сбросить ` +
          `это состояние.</p>` +

          h(3, "unconscious", "Без сознания") +
          ul(
            "Вы валитесь Без сознания.",
            `Вы немедленно роняете то, что держите, считаетесь ${U(".Tu0sU1bo9eZI6qoe#prone", "Сбитым с ног")} и становитесь ${U(".Tu0sU1bo9eZI6qoe#incapacitated", "Беспомощным")}.`,
            `Любой, кто находится в непосредственной близости и имеет оружие без свойства ${U("JournalEntry.wqlquQ8Njtd5fb4Y.JournalEntryPage.wsM53RDPPrqwS3Te#ineffective", "Бесполезное")}, может убить вас безо всяких проверок.`
          )
      },

      "I Want To Play...": {
        name: "Я хочу играть…",
        text:
          `<p>Персонажи в <strong>Империуме Маледиктум</strong> определяются ` +
          `${U(`${CH}.IOuNLIGWoHRDvHab`, "происхождением")} (откуда они), ` +
          `${U(`${CH}.ZJ4j0hrbxg7bL2K4`, "службой")} (к какой организации принадлежат) и ролью ` +
          `(чем занимаются в составе группы). Эти элементы можно сочетать множеством способов, ` +
          `чтобы создавать уникальных героев сорок первого тысячелетия. Если вам знаком ` +
          `беспросветный мрак <strong>Warhammer 40 000</strong>, вы, вероятно, уже подумали о том, ` +
          `кем должен быть ваш персонаж — например, солдатом Астра Милитарум. В таком случае ` +
          `сверьтесь с таблицей «<strong>Я хочу играть…</strong>»: она подскажет, какие ` +
          `происхождение, службу и роль можно выбрать, чтобы получился персонаж желаемого вами ` +
          `архетипа.</p>` +
          archetypeTable
      }
    }
  }
};
