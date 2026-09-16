/**
 * Russian for the Core Rulebook's items, from the Russian edition.
 *
 * Keys are document ids, which is what Babele matches on first and what
 * survives a rename upstream. The English name sits beside each entry so this
 * file can be read without the pack open; the build tool checks it against the
 * live index and fails on a mismatch, so the two cannot drift apart silently.
 *
 * Nothing here is invented. Every name is the one the Russian rulebook prints:
 * origins from the table on стр. 51, services and roles from the contents.
 */

export const label = "Предметы (Основная книга)";

export const entries = {
  /* ── Службы (стр. 56–73) ──────────────────────────────────────────────
     The book calls a faction a "служба" — a branch of the Imperium one
     serves in, not a party one belongs to. */
  bHebLGbKASjqUQu8: { en: "Adeptus Administratum", name: "Адептус Администратум" },
  BLOQk9yJsb03nyDH: { en: "Adeptus Astra Telepathica", name: "Адептус Астра Телепатика" },
  XFPir4cg9PIHWNkc: { en: "Adeptus Mechanicus", name: "Адептус Механикус" },
  PdQjDIH5C6kx3vAy: { en: "Adeptus Ministorum", name: "Адептус Министорум" },
  yJNgIfm0cNk85aIe: { en: "Astra Militarum", name: "Астра Милитарум" },
  "0DNYdNKKglMlFOko": { en: "Imperial Fleet", name: "Имперские флотилии" },
  // Not a transliteration: the book reads the Infractionists as those who
  // serve no branch at all, and names them for that.
  oa5nKvqMjOoHsBcK: { en: "Infractionist", name: "Одиночки" },
  I8BJ1QcLwzC85KTF: { en: "The Inquisition", name: "Инквизиция" },
  N3xtZGybYbWZlAhS: { en: "Rogue Trader Dynasty", name: "Династии вольных торговцев" },

  /* ── Происхождения (стр. 51) ─────────────────────────────────────────
     Three of the six worlds put the noun first in Russian, which is why the
     interface can no longer build these from "{world} мир". */
  ADwxsrnXWBFViy5k: { en: "Agri World", name: "Агромир" },
  jPXulXRUoZ099Cwl: { en: "Feral World", name: "Дикий мир" },
  pzvSXkckglOmZgdk: { en: "Feudal World", name: "Феодальный мир" },
  "5SLj6QlgqqR0K5GX": { en: "Forge World", name: "Мир-кузница" },
  OjFcYwOwNH6WlUjT: { en: "Hive World", name: "Мир-улей" },
  "7E0Gkel1gSaxTgVu": { en: "Schola Progenium", name: "Схола Прогениум" },
  i7qRAalBsnddJYeW: { en: "Shrine World", name: "Мир-храм" },
  bFXPJAp4GsM8TB8F: { en: "Voidborn", name: "Пустота" },

  /* ── Роли (стр. 74–80) ───────────────────────────────────────────────── */
  tXNLuikTOveBv5vs: { en: "Interlocutor", name: "Переговорщик" },
  YoGYdL2LE9DyZAn7: { en: "Mystic", name: "Мистик" },
  QZt2YvBWGpuYd8vt: { en: "Penumbra", name: "Полутень" },
  Hs52ZhBml3McDNzB: { en: "Savant", name: "Эрудит" },
  xiPnNRIX1nGk3wmO: { en: "Warrior", name: "Воин" },
  eHbhPZOZEyESve2L: { en: "Zealot", name: "Фанатик" }
};
