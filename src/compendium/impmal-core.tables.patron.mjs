/**
 * The patron tables — two per duty, боны and слабости — плюс таблицы
 * критических ран, стр. 18–27 и 358–361.
 *
 * These carry a name and nothing else on purpose. Every row is a reference to a
 * compendium document rather than text, and Babele's TableResult mapping
 * resolves a referenced row's name through that document's own translation. The
 * boons, liabilities and criticals are all translated already, so naming the
 * table is enough to make its contents read in Russian.
 */

export const label = "Таблицы (Основная книга)";

export const byName = {
  /* Возможности и слабости покровителя, по обязанностям (стр. 18–27) */
  "Departmento Munitorum Ordinate - Boons": { name: "Ординат Департаменто Муниторум — возможности" },
  "Departmento Munitorum Ordinate - Liabilities": { name: "Ординат Департаменто Муниторум — слабости" },
  "Tithe Prefectus - Boons": { name: "Десятинный префект — возможности" },
  "Tithe Prefectus - Liabilities": { name: "Десятинный префект — слабости" },
  "Astropath - Boons": { name: "Астропат — возможности", results: [{ range: [1, 1] }, { range: [2, 2] }, { range: [3, 3] }, { range: [4, 4] }, { range: [5, 5] }, { range: [6, 6] }, { range: [7, 7] }, { range: [8, 8] }, { range: [9, 9] }, { range: [10, 10] }] },
  "Astropath - Liabilities": { name: "Астропат — слабости" },
  "Sister of Silence - Boons": { name: "Сестра Безмолвия — возможности" },
  "Sister of Silence - Liabilities": { name: "Сестра Безмолвия — слабости" },
  "Forge Lord - Boons": { name: "Владыка кузницы — возможности" },
  "Forge Lord - Liabilities": { name: "Владыка кузницы — слабости" },
  "Magos Biologis - Boons": { name: "Магос Биологис — возможности" },
  "Magos Biologis - Liabilities": { name: "Магос Биологис — слабости" },
  "Arch-Confessor - Boons": { name: "Архиисповедник — возможности" },
  "Arch-Confessor - Liabilities": { name: "Архиисповедник — слабости" },
  "Canoness - Boons": { name: "Канонисса — возможности" },
  "Canoness - Liabilities": { name: "Канонисса — слабости" },
  "Lord-Commissar - Boons": { name: "Лорд-комиссар — возможности" },
  "Lord-Commissar - Liabilities": { name: "Лорд-комиссар — слабости" },
  "Senior Officer - Boons": { name: "Старший офицер — возможности" },
  "Senior Officer - Liabilities": { name: "Старший офицер — слабости" },
  "Voidship Captain - Boons": { name: "Капитан пустотного корабля — возможности" },
  "Voidship Captain - Liabilities": { name: "Капитан пустотного корабля — слабости" },
  "Port Commander - Boons": { name: "Комендант порта — возможности" },
  "Port Commander - Liabilities": { name: "Комендант порта — слабости" },
  "Criminal Mastermind - Boons": { name: "Преступный гений — возможности" },
  "Criminal Mastermind - Liabilities": { name: "Преступный гений — слабости" },
  "Guildmaster - Boons": { name: "Гильдмейстер — возможности" },
  "Guildmaster - Liabilities": { name: "Гильдмейстер — слабости" },
  "Ordo Xenos Inquisitor - Boons": { name: "Инквизитор Ордо Ксенос — возможности" },
  "Ordo Xenos Inquisitor - Liabilities": { name: "Инквизитор Ордо Ксенос — слабости" },
  "Ordo Hereticus Inquisitor - Boons": { name: "Инквизитор Ордо Еретикус — возможности" },
  "Ordo Hereticus Inquisitor - Liabilities": { name: "Инквизитор Ордо Еретикус — слабости" },
  "Diplomat - Boons": { name: "Дипломат — возможности" },
  "Diplomat - Liabilities": { name: "Дипломат — слабости" },
  "Trader Militant - Boons": { name: "Торговец-милитант — возможности" },
  "Trader Militant - Liabilities": { name: "Торговец-милитант — слабости" },

  /* Критические раны (стр. 358–361) */
  "Critical Wounds - Head": { name: "Критические раны головы" },
  "Critical Wounds - Arm": { name: "Критические раны руки" },
  "Critical Wounds - Body": { name: "Критические раны торса" },
  "Critical Wounds - Leg": { name: "Критические раны ноги" },

  /* Порча (стр. 222–223) */
  Mutations: { name: "Мутации" },
  Malignancies: { name: "Осквернения" },

  /* Создание персонажа */
  Origin: { name: "Происхождение" },
  "Random Talents": { name: "Случайные таланты" },
  "Patron Faction": { name: "Служба покровителя" }
};
