/**
 * Снаряжение NPC основной книги, которое impmal хранит строками-предметами:
 * «a pair of dog tags», «30 Solars» и т. п. У них нет источника в паке
 * предметов, поэтому Babele не может перевести их сам, как лазган или
 * фраг-гранату, — их переводит поле `items` актёра.
 *
 * Названия предметов — с заглавной, как на листе персонажа; формулировки — по строкам «Снаряжение» бестиария русского издания (стр. 317
 * и далее), например у солдата Астра Милитарум (стр. 329): «пара солдатских
 * жетонов», «Памятка имперского гвардейца для поднятия боевого духа»,
 * «униформа», «30 соляров». Ключ — id актёра, так что эти предметы сливаются с
 * уже переведёнными трейтами и оружием тех же актёров из других слайсов.
 *
 * Три специализации без названия в книге — наши: Stellar — «Звёзды»,
 * Voidship — «Пустотные корабли» (у капитана пустотного корабля), Mathematics —
 * «Математика» (у техножреца). Thoughtmark — «Мыслежесты», как на стр. 95.
 */

export const label = "Актёры (Основная книга)";

const TAGS = { "a pair of dog tags": { name: "Пара солдатских жетонов" } };
const PRIMER = { "a copy of the Imperial Infantryman’s Uplifting Primer": { name: "«Памятка имперского гвардейца для поднятия боевого духа»" } };
const UNIFORM = { "a uniform": { name: "Униформа" } };
const TROOPER = { ...TAGS, ...PRIMER, ...UNIFORM, "30 Solars": { name: "30 соляров" } };
const PRIMARIS = { "A Primaris Psyker’s Uniform": { name: "Униформа псайкера-примариса" } };
const RECORDS = { "several scrolls filled with records": { name: "Несколько свитков с записями" } };
const COLOURS = { "Gang Colours": { name: "Цвета банды" } };
const solars = (en, ru) => ({ [en]: { name: ru } });

export const entries = {
  ZIodTiyH9W5QBRU9: { en: "Astra Militarum Trooper", items: TROOPER },
  "1zbpGAEiHv1J7cMu": { en: "Astra Militarum Trooper (Vox-Specialist)", items: TROOPER },
  "3VwOwrGJIsyO1Bzy": { en: "Astra Militarum Trooper (Medic)", items: TROOPER },
  RNClvLzC2icVV8Yj: { en: "Astra Militarum Trooper (Lascutter)", items: TROOPER },
  rrIQnA8yT6xzDDf9: { en: "Astra Militarum Trooper (Weapons Specialist)", items: TROOPER },
  bkP99HZ6JJ7IWd8U: { en: "Tempestus Scion", items: { ...TAGS, ...PRIMER } },
  wyyOOGQNpAYh5Txm: {
    en: "Commissar",
    items: {
      "A Commissar’s uniform": { name: "Униформа комиссара" },
      ...TAGS,
      "a bookmarked copy of the Imperial Infantryman’s Uplifting Primer": { name: "«Памятка имперского гвардейца для поднятия боевого духа» с закладками" },
      ...solars("100 solars", "100 соляров")
    }
  },
  "5CCbRXAMBtwviuFE": { en: "Bounty Hunter", items: solars("100 solars", "100 соляров") },
  "5rrnycKS5mMDjQJc": { en: "Acolyte", items: solars("100 solars", "100 соляров") },
  CsFqLJu3uHM45otd: { en: "Arbitrator", items: solars("100 solars", "100 соляров") },
  gQxTENJSdTQTVfDM: { en: "Enforcer", items: solars("50 solars", "50 соляров") },
  Eirl3ldJXIrs2frc: { en: "Interrogator", items: solars("300 solars", "300 соляров") },
  "8EOYNULRU7nA8acm": { en: "Kroot Mercenary", items: solars("20 solars", "20 соляров") },
  "5fAQrj0KDjAXkHRY": { en: "Devout", items: { "A set of ragged robes": { name: "Рваные одеяния" } } },
  "9kYI2Oshwn0wqWUo": {
    en: "Ministorum Priest",
    items: { "a Rosarius": { name: "Розарий" }, ...solars("50 solars", "50 соляров") }
  },
  CBLdHnFWFqdhfRKx: {
    en: "Sister Of Silence",
    items: { Thoughtmark: { name: "Мыслежесты" }, "A set of Vratine Armour.": { name: "Вратиновый доспех" } }
  },
  DiCcUGLaqWptKqE9: {
    en: "Merchant Trader",
    items: { "Clothes with the Ornamental Trait": { name: "Одежда с достоинством Красивое" }, ...solars("500 solars", "500 соляров") }
  },
  QiMSgysDqIaNjdGp: { en: "Primaris Biomancer", items: PRIMARIS },
  Voy7lhLzRunxvWkM: { en: "Primaris Psyker", items: PRIMARIS },
  vaqtX7WfPsT0Y8NR: { en: "Primaris Pyromancer", items: PRIMARIS },
  RsIGQ61VYTusa8TR: {
    en: "Imperial Citizen",
    items: { "Ragged clothing": { name: "Рваная одежда" }, ...solars("1d10 solars", "1к10 соляров") }
  },
  VWoY9PpvbDqQYv8X: {
    en: "Black Ship Crewmember",
    items: { "A Heavy Leather Uniform or a Void Suit": { name: "Униформа из толстой кожи или пустотный костюм" } }
  },
  ZUWBWGM4eH7xFZ8P: {
    en: "Dreg",
    items: { "Rotting rags": { name: "Гниющие лохмотья" }, ...solars("1d5 solars", "1к5 соляров") }
  },
  b8x4YQfSyzlvU4LX: {
    en: "Drukhari Kabalite Warrior",
    items: {
      "A set of Kabalite Armour": { name: "Кабалитский доспех" },
      "a collection of horrific battle trophies.": { name: "Коллекция жутких боевых трофеев" }
    }
  },
  bB0rMr6Gez3M9bME: { en: "Ganger", items: { ...COLOURS, ...solars("1d10 solars", "1к10 соляров") } },
  kdhQ2SwO7Vm2rzUI: { en: "Gang Leader", items: { ...COLOURS, ...solars("300 solars", "300 соляров") } },
  fR4lfJVppXfiiYea: { en: "Battle Sister", items: { "A set of Sororitas Power Armour": { name: "Силовой доспех Сороритас" } } },
  ipcjevVXtDR4XkNu: {
    en: "Voidship Captain",
    items: { Stellar: { name: "Звёзды" }, Voidship: { name: "Пустотные корабли" }, ...solars("300 solars", "300 соляров") }
  },
  ncXwqNsh38L8CyRo: {
    en: "Smuggler",
    items: { "Light Leathers": { name: "Лёгкий кожаный доспех" }, "an Auspex": { name: "Ауспик" }, ...solars("1d10 x 100 solars", "1к10 × 100 соляров") }
  },
  pGE97yqMKNMkyzgL: {
    en: "Cult Leader",
    items: { "a Cult Standard": { name: "Знамя культа" }, "a book of abominable knowledge.": { name: "Книга мерзостных знаний" } }
  },
  ppicZvgr0bEuhWeh: {
    en: "Cultist",
    items: { "some Heretical Writings": { name: "Еретические писания" }, ...solars("20 solars", "20 соляров") }
  },
  qBvBctGcZoWcW7Tz: {
    en: "Manufactorum Labourer",
    items: { "Ragged clothes": { name: "Рваная одежда" }, ...solars("5 Solars", "5 соляров") }
  },
  rilaQaBPslIRzGco: {
    en: "Tech-Priest",
    items: { Mathematics: { name: "Математика" }, "Adeptus Mechanicus robes": { name: "Одеяния Адептус Механикус" }, ...solars("300 solars", "300 соляров") }
  },
  utelXH1DahFI5iHt: { en: "Accursed Cultist", items: solars("1d10 solars", "1к10 соляров") },
  vds8HRa533wcv1Pq: { en: "Administratum Adept", items: { ...RECORDS, ...solars("30 solars", "30 соляров") } },
  wzB86nJHHIRHMQTO: { en: "Overseer", items: { ...RECORDS, ...solars("50 solars", "50 соляров") } },
  xHzo06YI2vDu4kM0: { en: "Aeldari Ranger", items: { "A set of Aeldari Mesh Armour.": { name: "Альдарский сетчатый доспех" } } }
};
