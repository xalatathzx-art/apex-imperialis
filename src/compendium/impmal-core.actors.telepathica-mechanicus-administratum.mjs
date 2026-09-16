/**
 * Bestiary NPCs of the Adeptus Astra Telepathica, the Adeptus Mechanicus and
 * the Adeptus Administratum, from стр. 319–327 of the Russian edition.
 *
 * An actor carries three translatable things: its name, the lore impmal keeps
 * in `system.notes.gm`, and the rank line — `system.role` — that the sheet
 * prints beside the name.
 *
 * Its weapons, traits and talents are embedded copies rather than links, so
 * Babele cannot reach them through the item pack. The build generates that map
 * instead, copying the Russian name of every item we have already translated
 * onto each NPC that carries one — see the "Carry item names" pass in
 * tools/build-compendium-lang.mjs. Nothing about embedded items belongs in
 * this file.
 */

export const label = "Актёры (Основная книга)";

export const byName = {
  /* ── Адептус Астра Телепатика (стр. 319–321) ─────────────────────────── */

  "Primaris Psyker": {
    name: "Псайкер-примарис",
    description:
      "<p>Титул «примарис» носят самые могущественные псайкеры Империума. Лишь один из миллиона пленников Чёрных кораблей достигает такой мощи и уровня самоконтроля. Пережившие суровые тренировки становятся ценными орудиями и часто сопровождают высших офицеров Астра Милитарум, под чьим руководством могут наилучшим образом применять свои разрушительные способности. Такие псайкеры увешаны оберегами, а в их черепа вживлены подавители, сдерживающие побочные эффекты и одержимость демонами, но это не мешает им метать сгустки пси-энергии, способные расправить укреплённый керамит.</p>",
    items: {
      "Telekine": {
        name: "Телекинетик",
        description:
          "<p>Псайкер-примарис знает следующие психосилы из дисциплины «Телекинез»: @UUID[Compendium.impmal-core.items.Item.ihRo9NaIseAlNMbn]{Проклятие механизмов}, @UUID[Compendium.impmal-core.items.Item.4cMt2jtPhtzR8vlY]{Тиски}, @UUID[Compendium.impmal-core.items.Item.weeeCywXm9wF54Ly]{Психическая преграда}, @UUID[Compendium.impmal-core.items.Item.azVwWhP3qjVxYbQn]{Психическая буря}.</p>"
      },
      "Psychic Powers": {
        name: "Психосилы",
        description:
          "<p>Псайкер-примарис знает следующие малые психосилы: @UUID[Compendium.impmal-core.items.Item.I6NTqen3Srp90dyW]{Аура ужаса}, @UUID[Compendium.impmal-core.items.Item.6piNqY3oQ4WVndT0]{Полёт}, @UUID[Compendium.impmal-core.items.Item.wh2wJRpfoKu7YAiS]{Покой}, @UUID[Compendium.impmal-core.items.Item.iHemd2KVEYx2olv7]{Психический удар}, @UUID[Compendium.impmal-core.items.Item.plATcbLJsFW1evOT]{Духовное зрение}, @UUID[Compendium.impmal-core.items.Item.GTzPHDh6nh0CvuPI]{Спазм}, @UUID[Compendium.impmal-core.items.Item.XuFiBvRR2vT9IPeC]{Призрачные руки}.</p>"
      }
    }
  },

  Astropath: {
    name: "Астропат",
    description:
      "<p>Астропатами называют псайкеров, способных передавать сообщения через Варп, что обеспечивает связь между разрозненными звёздными владениями Человечества, отсутствие которой вызвало неисчислимые бедствия, когда Ноктис Этерна временно прервала сообщение между мирами. Вероятно, астропаты — самые известные члены Адептус Астра Телепатики. Их можно встретить на имперских пустотных кораблях, в важных ульях и везде, где нужна связь на невозможно большие расстояния. Астропаты по своей природе очень отстранённые и загадочные люди — виной тому сама их природа и тот факт, что им позволяют жить лишь пока они остаются полезны для Империума.</p>",
    items: {
      "Astropath": {
        name: "Астропат",
        description:
          "<p>Астропат может предпринять <strong>сложную (−20) проверку Психического мастерства (Телепатия)</strong>, чтобы пройти обряд отправки или получения сообщения от другого астропата. Это требует часа времени, во время которого астропата нельзя беспокоить. Ведущий может изменить сложность и длительность ритуала, исходя из расстояния между астропатами и возмущений в Варпе.</p>"
      },
      "Blind": {
        name: "Слепец",
        description:
          "<p>Астропат слеп, отчего автоматически проваливает проверки Бдительности (Зрение). Тем не менее, он способен ощущать мир и взаимодействовать с окружением благодаря психическому чутью. Состояние @UUID[JournalEntry.DjxnvYJajGflu7IY.JournalEntryPage.Tu0sU1bo9eZI6qoe#blinded]{Слепота} никак не действует на астропата.</p>"
      },
      "Soul-Bound": {
        name: "Связывание душ",
        description:
          "<p>Астропат получает преимущество во всех проверках, связанных с сопротивлением порче.</p>"
      },
      "Telepath": {
        name: "Прорицатель",
        description:
          "<p>Астропат знает следующие психосилы из дисциплины «Прорицания»: @UUID[Compendium.impmal-core.items.Item.qWQd7R5F8FqYiX9J]{Лозоходец}, @UUID[Compendium.impmal-core.items.Item.tb7ntikXWkv1mDLd]{Предупреждение}, @UUID[Compendium.impmal-core.items.Item.a8LvONbMdLRtynKS]{Боевое предвиденье}, @UUID[Compendium.impmal-core.items.Item.3vquTkVELDNBVsZL]{Психометрия}, @UUID[Compendium.impmal-core.items.Item.JD8KXpaybkhEvnUm]{Ясновиденье}, @UUID[Compendium.impmal-core.items.Item.4bbAQA6kvRtfUna1]{Охота на охотника}.</p>"
      },
      "Psychic Powers": {
        name: "Психосилы",
        description:
          "<p>Астропат знает следующие малые психосилы: @UUID[Compendium.impmal-core.items.Item.iHemd2KVEYx2olv7]{Психический удар}, @UUID[Compendium.impmal-core.items.Item.plATcbLJsFW1evOT]{Духовное зрение}.</p>"
      }
    }
  },

  "Sister Of Silence": {
    name: "Сестра Безмолвия",
    description:
      "<p>Сёстры Безмолвия — это орден отборных охотников на псайкеров, основанный ещё во время Великого похода. Каждая его воительница — «пария» или «неприкасаемая». Сестёр намного меньше, чем псайкеров, ибо парии — это очень редкие мутанты, что очень полезны Империуму благодаря своим необычным качествам. Обнаружив неприкасаемую, Астра Телепатика забирает её себе и готовит из неё идеальное оружие против псайкеров, поскольку проклятие, что вызывает всеобщую неприязнь, защищает своих носительниц от психических сил. Пройдя обучение и принеся обет молчания, сёстры получают вратиновый доспех и оружие, необходимые для вселенской охоты на колдунов.</p>",
    items: {
      "Null Maiden’s Glare": {
        name: "Взор нуль-девы",
        description:
          "<p>Потратив действие, сестра может пройти встречную проверку Командования (Запугивание) против Дисциплины (Страх) вражеского псайкера в пределах дальней дистанции, которого может видеть. В случае победы сестры превосходство группы падает на 1.</p>"
      },
      "Witch Hunter": {
        name: "Охотница на ведьм",
        description:
          "<p>Сестра получает преимущество в проверках, предпринятых для того, чтобы выследить псайкера, и имеет +1 КУ во всех проверках атаки против псайкеров.</p>"
      },
      "Vow of Tranquillity": {
        name: "Обет безмятежности",
        description:
          "<p>Все полноправные сёстры Безмолвия приносят обет, запрещающий им говорить при любых обстоятельствах. Общаются сёстры благодаря @UUID[Compendium.impmal-core.items.Item.z3pFUwFlp4BJf1oJ]{языку жестов}.</p>"
      },
      "Executioner Greatblade": { name: "Палаческий двуручный меч" },
      "Psyk-out Grenade": {
        name: "Антипсайкерская граната",
        description:
          "<p>Наносит двойной урон псайкерам и демонам.</p>"
      }
    }
  },

  "Black Ship Crewmember": {
    name: "Пустоход с Чёрного корабля",
    description:
      "<p>На Чёрных кораблях служат такие же трудолюбивые космические волки, как на иных судах, но у них есть и отличия. Во-первых, всех «чёрных» пустоходов учат сопротивляться психическому влиянию — хотя результаты такой подготовки меркнут в сравнении со способностями сестёр Безмолвия, что тоже бывают на борту кораблей, она будет очень кстати, если нечистый псайкер вырвется из своего узилища. Второе отличие состоит в том, что пустоходы на Чёрных кораблях всегда носят с собой оружие — их груз слишком опасен, чтобы пренебрегать этим.</p>",
    items: {
      "Inured to Witchcraft": {
        name: "Привычка к колдовству",
        description:
          "<p>Пустоход получает +1 КУ во встречных проверках, предпринятых для сопротивления психосилам.</p>"
      }
    }
  },

  // The book gives these two as variant profiles of the Primaris Psyker rather
  // than entries of their own, so they carry the name and no separate lore.
  "Primaris Biomancer": {
    name: "Биомант-примарис",
    items: {
      "Biomancer": {
        name: "Биомант",
        description:
          "<p>Биомант-примарис знает следующие психосилы дисциплины «Биомантия»: @UUID[Compendium.impmal-core.items.Item.Z1iAai8os7wLhSD8]{Недуг}, @UUID[Compendium.impmal-core.items.Item.eYVRPE01hIztBgtI]{Биомолния}, @UUID[Compendium.impmal-core.items.Item.uvzufc2k1F5wfmBh]{Метаболическая перегрузка}, @UUID[Compendium.impmal-core.items.Item.cIzMwE9MkVNjJzcm]{Скульптор плоти}.</p>"
      },
      "Psychic Powers": {
        name: "Психосилы",
        description:
          "<p>Биомант-примарис знает следующие малые психосилы: @UUID[Compendium.impmal-core.items.Item.iF1qxYZdS6GKxaVk]{Призыв вредителей}, @UUID[Compendium.impmal-core.items.Item.nsW4ViB2r0oIfyKp]{Приглушение боли}, @UUID[Compendium.impmal-core.items.Item.6piNqY3oQ4WVndT0]{Полёт}, @UUID[Compendium.impmal-core.items.Item.Qc4Adi2niwAoeY1j]{Сверхъестественные чувства}, @UUID[Compendium.impmal-core.items.Item.tNcKq3ZaMDeogkh3]{Затворение ран}, @UUID[Compendium.impmal-core.items.Item.iHemd2KVEYx2olv7]{Психический удар}, @UUID[Compendium.impmal-core.items.Item.GTzPHDh6nh0CvuPI]{Спазм}.</p>"
      }
    }
  },
  "Primaris Pyromancer": {
    name: "Пиромант-примарис",
    items: {
      "Pyromancer": {
        name: "Пиромант",
        description:
          "<p>Пиромант-примарис знает следующие психосилы дисциплины «Пиромантия»: @UUID[Compendium.impmal-core.items.Item.9irgirlcPgyDaPzw]{Огненная буря}, @UUID[Compendium.impmal-core.items.Item.dd8KipWb9j7FmYH7]{Инферно}, @UUID[Compendium.impmal-core.items.Item.twQADlfZ6PHF1DXO]{Плавящий луч}, @UUID[Compendium.impmal-core.items.Item.gZWa7JyP91MiigzA]{Плазменный факел}.</p>"
      },
      "Psychic Powers": {
        name: "Психосилы",
        description:
          "<p>Пиромант-примарис знает следующие малые психосилы: @UUID[Compendium.impmal-core.items.Item.ddM8dhP5O4FuF5ou]{Возгорание}, @UUID[Compendium.impmal-core.items.Item.I6NTqen3Srp90dyW]{Аура ужаса}, @UUID[Compendium.impmal-core.items.Item.6piNqY3oQ4WVndT0]{Полёт}, @UUID[Compendium.impmal-core.items.Item.iIC7OGDDtQtJ116l]{Пламя на ладони}, @UUID[Compendium.impmal-core.items.Item.4PwcP3ziykhvMnEr]{Нова}, @UUID[Compendium.impmal-core.items.Item.YtCa9wy5vrKATy99]{Обжигающий взгляд}, @UUID[Compendium.impmal-core.items.Item.5r4I5RwIJtfOrVZ6]{Нагрев}, @UUID[Compendium.impmal-core.items.Item.iHemd2KVEYx2olv7]{Психический удар}.</p>"
      }
    }
  },

  /* ── Адептус Механикус (стр. 322–324) ────────────────────────────────── */

  "Manufactorum Labourer": {
    name: "Рабочий с мануфакторума",
    description:
      "<p>Воинства Империума будут бессильны, если лишить их исполинской промышленной базы, что снабжает солдат оружием, боеприпасами, боевыми машинами и всем прочим. Труженики мануфакторумов составляют основу индустрии, благодаря которой миры Империума получают всё нужное, чтобы выживать и платить подати. Эти рабочие надрываются в жаре и холоде, среди облаков ядовитых испарений и грохота машинерии под взором начальников смен, для которых есть лишь одно мерило успеха — выполнение норм. Увечья и смерти для них — это лишь цифры, которые нужно учесть при подсчётах выработки.</p>",
    items: {
      "Industrial Tools": { name: "Промышленные инструменты" }
    }
  },

  Servitor: {
    name: "Сервитор",
    description:
      "<p>Сервиторами обобщённо называют все виды киберорганизмов, что применяются в Империуме для опасных, неприятных и тяжёлых работ. Каждый сервитор — это смешение плоти и машины, более глубокое, чем бывает у техножрецов. Как правило, таких слуг создаёт Адептус Механикус — иногда из искусственно выращенных клонов, но чаще из преступников, приговорённых к Сервитуту Империалис, чей разум очищается при переработке в сервитора.</p>" +
      "<p>Чтобы механический слуга мог работать, его органическая часть усиливается киберимплантатами, а в мозг закладываются программы — иногда самые простые, а иногда и более сложные, что позволяют ремонтировать механизмы или даже сражаться. Сервиторы способны отвечать на простые вопросы, если это касается их работы, но лишены сознания, что делает их идеальными слугами и воинами таких поборников логики, как Адептус Механикус.</p>",
    items: {
      "Programmed to Serve": {
        name: "Программа служения",
        description:
          "<p>У каждого сервитора есть программа, которую он будет выполнять. Программу можно изменить <strong>сложной (−20) проверкой Техники (Аугметика)</strong>. Тот, кто программировал или перепрограммировал сервитора, может отдавать ему простые приказы.</p>"
      },
      "Servo Claw": { name: "Сервоклешня" }
    }
  },

  /* ── Адептус Администратум (стр. 325–327) ────────────────────────────── */

  "Administratum Adept": {
    name: "Адепт Администратума",
    description:
      "<p>На адептах держится вся колоссально раздутая имперская бюрократия. Каждый наделён огромной властью в своей узкой сфере полномочий — например, доступом к секретным архивам, реквизиции оружия или выдаче разрешений на управление транспортом в пределах города. Один росчерк автопера такого чиновника может как решить немало проблем ваших героев, так и создать их.</p>" +
      "<p>Мало что так же раздражает, как необходимость иметь дело с адептом, который чинит вам препоны лишь для того, чтобы насладиться своей мелочной властью — грозит карами и печётся о ничтожных процедурных мелочах, делая всё для того, чтобы случайно вам не помочь. Впрочем, изредка встречаются и адепты, что искренне готовы помогать другим выжить в бюрократических войнах и видят в этом своё служение Императору.</p>",
    items: {
      "Bureaucratic Boldness": {
        name: "Чиновничья честь",
        description:
          "<p>Адепт получает решимость 3, когда дело касается бумажной работы, десятины и иных бюрократических процедур.</p>"
      },
      "Flaccid Fists": { name: "Вялые кулаки" }
    }
  }
};
