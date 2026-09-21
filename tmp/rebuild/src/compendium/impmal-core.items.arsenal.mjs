/**
 * The Armoury: 67 weapons, 28 pieces of armour, 6 ammunition types, 2 force
 * fields and 10 weapon modifications, from chapter V of the Russian edition.
 *
 * Sources, page by page: melee стр. 128, ranged стр. 132–133, ammunition
 * стр. 133, grenades and explosives стр. 136, modifications стр. 137, armour
 * стр. 141, force fields стр. 142.
 *
 * Two pairs had to be resolved against the pack rather than the page. The book
 * prints "Омниспик" at 200/rare and "Омниприцел" at 50/common; impmal's
 * Omnispex costs 200 and is rare, Omniscope costs 50 and is common, so the
 * transliteration and the numbers agree. And "Двуручное оружие" is both a
 * weapon and a specialisation in the book — two documents, one name, as
 * printed.
 */

export const label = "Предметы (Основная книга)";

export const byName = {
  /* ── Холодное оружие (стр. 128) ──────────────────────────────────────── */
  Chainaxe: { type: "weapon", name: "Цепной топор" },
  Chainsword: { type: "weapon", name: "Цепной меч" },
  Eviscerator: { type: "weapon", name: "Эвисцератор" },
  "Force Staff": { type: "weapon", name: "Психосиловой посох" },
  "Force Sword": { type: "weapon", name: "Психосиловой меч" },
  Axe: { type: "weapon", name: "Топор" },
  "Brass Knuckles": { type: "weapon", name: "Кастет" },
  Flail: { type: "weapon", name: "Цеп" },
  "Great Weapon": { type: "weapon", name: "Двуручное оружие" },
  Hammer: { type: "weapon", name: "Молот" },
  "Improvised (One-handed)": { type: "weapon", name: "Импровизированное одноручное" },
  "Improvised (Two-handed)": { type: "weapon", name: "Импровизированное двуручное" },
  Knife: { type: "weapon", name: "Нож" },
  Staff: { type: "weapon", name: "Посох" },
  Sword: { type: "weapon", name: "Меч" },
  Unarmed: { type: "weapon", name: "Безоружный бой" },
  Whip: { type: "weapon", name: "Хлыст" },
  "Electro-Flail": { type: "weapon", name: "Электрохлыст" },
  "Shock Maul": { type: "weapon", name: "Шоковая булава" },
  "Power Axe": { type: "weapon", name: "Силовой топор" },
  "Power Fist": { type: "weapon", name: "Силовой кулак" },
  "Power Knife": { type: "weapon", name: "Силовой нож" },
  "Power Maul": { type: "weapon", name: "Силовая булава" },
  "Power Sword": { type: "weapon", name: "Силовой меч" },

  /* ── Стрелковое оружие (стр. 132–133) ────────────────────────────────── */
  "Bolt Pistol": { type: "weapon", name: "Болт-пистолет" },
  Boltgun: { type: "weapon", name: "Болтер" },
  "Heavy Bolter": { type: "weapon", name: "Тяжёлый болтер" },
  "Hand Flamer": { type: "weapon", name: "Ручной огнемёт" },
  Flamer: { type: "weapon", name: "Огнемёт" },
  Laspistol: { type: "weapon", name: "Лазпистолет" },
  Lasgun: { type: "weapon", name: "Лазган" },
  "Las Carbine": { type: "weapon", name: "Лазкарабин" },
  "Long Las": { type: "weapon", name: "Длиннолаз" },
  "Hot-Shot Laspistol": { type: "weapon", name: "Пробивной лазпистолет" },
  "Hot-Shot Lasgun": { type: "weapon", name: "Пробивной лазган" },
  Lascannon: { type: "weapon", name: "Лазпушка" },
  "Grenade Launcher": { type: "weapon", name: "Гранатомёт" },
  "Portable Missile Launcher": { type: "weapon", name: "Переносная ракетная установка" },
  "Inferno Pistol": { type: "weapon", name: "Инферно-пистолет" },
  Meltagun: { type: "weapon", name: "Мельта" },
  "Plasma Pistol": { type: "weapon", name: "Плазменный пистолет" },
  "Plasma Gun": { type: "weapon", name: "Плазмомёт" },
  Autopistol: { type: "weapon", name: "Автопистолет" },
  Autogun: { type: "weapon", name: "Автоган" },
  "Hand Cannon": { type: "weapon", name: "Ручная пушка" },
  "Heavy Stubber": { type: "weapon", name: "Тяжёлый стаббер" },
  "Shotgun (Combat)": { type: "weapon", name: "Боевой дробовик" },
  "Shotgun (Pump Action)": { type: "weapon", name: "Помповый дробовик" },
  "Sniper Rifle": { type: "weapon", name: "Снайперская винтовка" },
  "Stub Pistol": { type: "weapon", name: "Стаб-пистолет" },
  "Stub Revolver": { type: "weapon", name: "Стаб-револьвер" },
  "Needle Pistol": { type: "weapon", name: "Игольный пистолет" },
  "Needle Rifle": { type: "weapon", name: "Игольная винтовка" },
  "Web Pistol": { type: "weapon", name: "Паутинный пистолет" },
  Webber: { type: "weapon", name: "Паутиномёт" },

  /* ── Гранаты и взрывчатка (стр. 136) ─────────────────────────────────── */
  "Blasting Charge": { type: "weapon", name: "Шахтёрский подрывной заряд" },
  "Choke Grenade": { type: "weapon", name: "Удушающая граната" },
  "Demolition Charge": { type: "weapon", name: "Подрывной заряд" },
  "Fire Bomb": { type: "weapon", name: "Огненная бомба" },
  "Frag Grenade": { type: "weapon", name: "Фраг-граната" },
  "Frag Missile": { type: "weapon", name: "Фраг-ракета" },
  "Krak Grenade": { type: "weapon", name: "Крак-граната" },
  "Krak Missile": { type: "weapon", name: "Крак-ракета" },
  "Melta Bomb": { type: "weapon", name: "Мельта-бомба" },
  "Photon Flash Grenade": { type: "weapon", name: "Фотонная вспышка" },
  "Smoke Grenade": { type: "weapon", name: "Дымовая граната" },
  "Web Grenade": { type: "weapon", name: "Паутинная граната" },

  /* ── Необычные боеприпасы (стр. 133) ─────────────────────────────────── */
  "Bleeder Rounds": { type: "ammo", name: "Патроны «Кровопийца»" },
  "Executioner Rounds": { type: "ammo", name: "Патроны «Палач»" },
  "Hot-Shot Las Pack": { type: "ammo", name: "Пробивной заряд" },
  "Inferno Shells": { type: "ammo", name: "Патроны «Инферно»" },
  "Man-Stopper Bullets": { type: "ammo", name: "Бронебойные патроны" },
  "Tox Rounds": { type: "ammo", name: "Отравленные патроны" },

  /* ── Улучшения оружия (стр. 137) ─────────────────────────────────────── */
  "Exterminator Cartridge": { type: "modification", name: "Экстерминатор" },
  "Melee Attachment": { type: "modification", name: "Штык" },
  "Mono-edge": { type: "modification", name: "Моноклинок" },
  "Laser Sight": { type: "modification", name: "Лазерный целеуказатель" },
  Omnispex: { type: "modification", name: "Омниспик" },
  Omniscope: { type: "modification", name: "Омниприцел" },
  "Backpack Ammo Supply": { type: "modification", name: "Ранец для боеприпасов" },
  Bipod: { type: "modification", name: "Сошки" },
  "Fire Selector": { type: "modification", name: "Переключатель вида боеприпасов" },
  Silencer: { type: "modification", name: "Глушитель" },

  /* ── Доспехи (стр. 141) ──────────────────────────────────────────────── */
  "Robes/Light Leathers": { type: "protection", name: "Одеяние, лёгкий кожаный доспех" },
  // The table abbreviates this to "Тяж. кож. доспех" to fit its column.
  "Heavy Leathers": { type: "protection", name: "Тяжёлый кожаный доспех" },
  "Armoured Bodyglove": { type: "protection", name: "Бронекомбинезон" },
  "Armoured Greatcoat": { type: "protection", name: "Бронешинель" },
  "Scrap-plate": { type: "protection", name: "Кустарная броня" },
  "Scrap-shield": { type: "protection", name: "Кустарный щит" },
  "Combat Shield": { type: "protection", name: "Боевой щит" },
  "Boarding Shield": { type: "protection", name: "Абордажный щит" },
  "Xenos Hide Vest": { type: "protection", name: "Жилет из ксеношкуры" },
  "Flak Boots": { type: "protection", name: "Флак-ботинки" },
  "Flak Helmet": { type: "protection", name: "Флак-шлем" },
  "Flak Gauntlets": { type: "protection", name: "Флак-перчатки" },
  "Flak Vest": { type: "protection", name: "Флак-жилет" },
  "Flak Jacket": { type: "protection", name: "Флак-камзол" },
  "Astra Militarum Flak Armour": { type: "protection", name: "Флак-доспех Астра Милитарум" },
  "Mesh Boots": { type: "protection", name: "Ячеистые ботинки" },
  "Mesh Cowl": { type: "protection", name: "Ячеистый капюшон" },
  "Mesh Gauntlets": { type: "protection", name: "Ячеистые перчатки" },
  "Mesh Vest": { type: "protection", name: "Ячеистый жилет" },
  "Xenos Mesh": { type: "protection", name: "Ксеноячеистая броня" },
  "Carapace Helm": { type: "protection", name: "Панцирный шлем" },
  "Carapace Gauntlets": { type: "protection", name: "Панцирные перчатки" },
  "Carapace Greaves": { type: "protection", name: "Панцирные поножи" },
  "Carapace Chestplate": { type: "protection", name: "Панцирный нагрудник" },
  "Enforcer Carapace": { type: "protection", name: "Панцирь силовика" },
  "Tempestus Carapace": { type: "protection", name: "Панцирный доспех Темпестус" },
  "Light Power Armour": { type: "protection", name: "Лёгкая силовая броня" },
  "Power Armour": { type: "protection", name: "Силовая броня" },

  /* ── Защитные поля (стр. 142) ────────────────────────────────────────── */
  "Refractor Field": { type: "forceField", name: "Отражающее поле" },
  "Conversion Field": { type: "forceField", name: "Преобразующее поле" }
};
