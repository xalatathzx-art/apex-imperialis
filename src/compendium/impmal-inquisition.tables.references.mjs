/**
 * Семнадцать таблиц Инквизиции, у которых переводится только название.
 *
 * Их строки — не текст, а ссылки на документы: возможности и слабости
 * Инквизиторов каждого Ордо, метки Хаоса, незаметные мутации, происхождения,
 * службы и философии. Сборщик подставляет в такую строку русское название
 * того документа, на который она указывает, — из уже переведённых паков.
 * Поэтому здесь нет `results`: написать их руками значило бы завести вторую
 * копию тех же названий, которая разойдётся с первой при первой же правке.
 *
 * Boon — «возможность», Liability — «слабость», как в самой системе.
 * Puritan и Radical — «пуританин» и «радикал».
 *
 * Строки «Философий Инквизиции» указывают на страницы журналов Инквизиции.
 * Пока журналы не переведены, сборщику неоткуда взять их названия, и строки
 * останутся английскими — название таблицы при этом уже русское.
 */

export const label = "Таблицы (Руководство Инквизиции)";

const ordo = (ordo, kind, bent) => `${kind} Инквизитора Ордо ${ordo} — ${bent}`;

export const byName = {
  "Faction (Inquisition Guide)": { name: "Служба (Руководство Инквизиции)" },
  "Inquisition Origins": { name: "Происхождения Инквизиции" },
  "Inquisition Philosophies": { name: "Философии Инквизиции" },
  "Marks of Chaos": { name: "Метки Хаоса" },
  "Subtle Mutations - Positive": { name: "Незаметные мутации — полезные" },
  "Subtle Mutations - Negative": { name: "Незаметные мутации — вредные" },

  "Ordo Hereticus Inquisitor Boons - Puritan": { name: ordo("Еретикус", "Возможности", "пуританин") },
  "Ordo Hereticus Inquisitor Boons - Radical": { name: ordo("Еретикус", "Возможности", "радикал") },
  "Ordo Hereticus Inquisitor Liabilities - Puritan": { name: ordo("Еретикус", "Слабости", "пуританин") },
  "Ordo Hereticus Inquisitor Liabilities - Radical": { name: ordo("Еретикус", "Слабости", "радикал") },

  "Ordo Malleus Inquisitor Boons - Puritan": { name: ordo("Маллеус", "Возможности", "пуританин") },
  "Ordo Malleus Inquisitor Boons - Radical": { name: ordo("Маллеус", "Возможности", "радикал") },
  "Ordo Malleus Inquisitor Liabilities - Puritan": { name: ordo("Маллеус", "Слабости", "пуританин") },
  "Ordo Malleus Inquisitor Liabilities - Radical": { name: ordo("Маллеус", "Слабости", "радикал") },

  "Ordo Xenos Inquisitor Boons - Puritan": { name: ordo("Ксенос", "Возможности", "пуританин") },
  "Ordo Xenos Inquisitor Boons - Radical": { name: ordo("Ксенос", "Возможности", "радикал") },
  "Ordo Xenos Inquisitor Liabilities - Puritan": { name: ordo("Ксенос", "Слабости", "пуританин") },
  "Ordo Xenos Inquisitor Liabilities - Radical": { name: ordo("Ксенос", "Слабости", "радикал") }
};
