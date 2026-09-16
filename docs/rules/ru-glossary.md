# Russian glossary — impmal terms as the book prints them

The Russian translation in `lang/ru.json` is not translated from English. It is
matched against the Russian edition of the Imperium Maledictum core rulebook
(v1.01), because the table reads that book and a second vocabulary would put the
sheet and the page at odds.

Where the two disagree, the book wins. Where the book is silent, the term is
marked **(ours)** and the choice is explained.

## The trap that started this

English difficulty names and Russian ones do not run in the same order. A
literal translation swaps two of them.

| Key | modifier | English | Russian (book) |
| --- | --- | --- | --- |
| `veryEasy` | +60 | Very Easy | Очень лёгкая |
| `easy` | +40 | Easy | Лёгкая |
| `routine` | +20 | Routine | Рутинная |
| `challenging` | +0 | Challenging | **Средняя** |
| `difficult` | −10 | Difficult | **Трудная** |
| `hard` | −20 | Hard | **Сложная** |
| `veryHard` | −30 | Very Hard | Очень сложная |

*Challenging* is «Средняя», not «Сложная». *Hard* is «Сложная». Reading either
one as a cognate produces a sheet that contradicts the book at two of the seven
difficulties, which are the two most used.

## Characteristics

| Key | English | Russian | Abbrev |
| --- | --- | --- | --- |
| `ws` | Weapon Skill | Ближний бой | ББ |
| `bs` | Ballistic Skill | Дальний бой | ДБ |
| `str` | Strength | Сила | Сил |
| `tgh` | Toughness | Выносливость | Вын |
| `ag` | Agility | Ловкость | Лов |
| `int` | Intelligence | Интеллект | Инт |
| `per` | Perception | Восприятие | Вос |
| `wil` | Willpower | Сила воли | СВ |
| `fel` | Fellowship | Товарищество | Тов |

## Skills

The book's summary table (p.93) extracts with its columns interleaved, so each
of these was read from the skill's own entry, where the characteristic is
printed in the heading.

| Key | English | Russian | Char |
| --- | --- | --- | --- |
| `athletics` | Athletics | Атлетика | Сил |
| `awareness` | Awareness | Бдительность | Вос |
| `dexterity` | Dexterity | Ловкость рук | Лов |
| `discipline` | Discipline | Дисциплина | СВ |
| `fortitude` | Fortitude | Стойкость | Вын |
| `intuition` | Intuition | Чутьё | Вос |
| `linguistics` | Linguistics | Языки | Инт |
| `logic` | Logic | Логика | Инт |
| `lore` | Lore | Знания | Инт |
| `medicae` | Medicae | Медика | Инт |
| `melee` | Melee | Бой | ББ |
| `navigation` | Navigation | Ориентирование | Инт |
| `piloting` | Piloting | Пилотирование | Лов |
| `presence` | Presence | **Командование** | СВ |
| `psychic` | Psychic Mastery | Психическое мастерство | СВ |
| `ranged` | Ranged | Стрельба | ДБ |
| `rapport` | Rapport | Взаимопонимание | Тов |
| `reflexes` | Reflexes | Рефлексы | Лов |
| `stealth` | Stealth | Скрытность | Лов |
| `tech` | Tech | Техника | Инт |

**Presence is «Командование» and it runs on Willpower**, not Fellowship. The
scrambled summary table appears to put it on Тов; the skill's own entry (p.202)
reads «КОМАНДОВАНИЕ (СВ)», which agrees with `defaultSkillCharacteristics` in
`impmal.js`. Do not "fix" this to Товарищество.

## Core mechanics

| English | Russian | Note |
| --- | --- | --- |
| Test | Проверка | |
| SL / Success Levels | **КУ** / количество успехов | not «УС» |
| Advantage | Преимущество | |
| Disadvantage | Помеха | |
| Advance | Улучшение | a +5 step |
| Specialisation | Специализация | |
| Opposed Test | Встречная проверка | |
| Wounds | Раны | |
| Critical Wound | Критическое ранение | |
| Fate | Судьба | |
| Corruption | Порча | |
| Influence | Влияние | |
| Superiority | Превосходство | |
| Solars | Соляры | |
| Patron | Покровитель | |
| Origin | Происхождение | |
| Faction | Фракция | |
| Role | Роль | |
| Duty | Долг | |

## Conditions

| Key | English | Russian |
| --- | --- | --- |
| `ablaze` | Ablaze | Горение |
| `bleeding` | Bleeding | Кровотечение |
| `blinded` | Blinded | Слепота |
| `deafened` | Deafened | Глухота |
| `fatigued` | Fatigued | Усталость |
| `frightened` | Frightened | Страх |
| `poisoned` | Poisoned | Отравление |
| `restrained` | Restrained | Обездвиживание |
| `stunned` | Stunned | Оглушение |
| `prone` | Prone | Сбит с ног |
| `unconscious` | Unconscious | Без сознания |
| `incapacitated` | Incapacitated | Беспомощность |
| `overburdened` | Overburdened | Перегрузка |

Severity suffixes: **(Малое)** for Minor, **(Серьёзное)** for Major.

## Where the book is silent

Foundry has interface the book never names — window controls, configuration
dialogs, error messages. Those are translated plainly and marked **(ours)** in
this file only where a reader might otherwise go looking for them in the book.
