/**
 * The faction tables a character rolls on after choosing an origin (стр. 55),
 * and the top-level encounter complications table.
 *
 * Name only: every row points at a faction item, and the build names referenced
 * rows from the item pack's own translation.
 */

export const label = "Таблицы (Основная книга)";

export const byName = {
  "Agri World Faction": { name: "Служба — агромир" },
  "Feral World Faction": { name: "Служба — дикий мир" },
  "Feudal World Faction": { name: "Служба — феодальный мир" },
  "Forge World Faction": { name: "Служба — мир-кузница" },
  "Hive World Faction": { name: "Служба — мир-улей" },
  "Schola Progenium Faction": { name: "Служба — Схола Прогениум" },
  "Shrine World Faction": { name: "Служба — мир-храм" },
  "Voidborn Faction": { name: "Служба — Пустота" },

  "Encounter Complications": {
    name: "Осложнения боевых сцен",
    results: {
      "8oqzCccJxsEJ6qSq": { name: "Осложнения боевых сцен — Окружение" },
      "OHWabNrip9DLbGgA": { name: "Осложнения боевых сцен — Тактика" },
      "ga2hzznkkuhZjcJH": { name: "Осложнения боевых сцен — Время" },
      "WoHRNIx3biECREf6": { name: "Осложнения боевых сцен — Защита" },
      "2HYSCkpx7xUrlIGj": { name: "Осложнения боевых сцен — Важная цель" },
      "nTgd5ikNBBZWToXM": { name: "Осложнения боевых сцен — Взаимодействие" }
    }
  }
};
