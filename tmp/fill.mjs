// Shared helpers for translating table-heavy journal pages.
// fill(pageId, manual) → writes tmp/tr/<pageId>.json with: auto link labels
// (single-@UUID runs), dictionary cells, pure numbers, then `manual` on top.
import fs from "node:fs"; import path from "node:path";
const dir = "src/compendium/journal-runs";
const cache = {};
const pack = p => (cache[p] ??= (() => { try { return JSON.parse(fs.readFileSync(`compendium/apex-imperialis.${p}.json`, "utf8")).entries ?? {}; } catch { return {}; } })());
export function ruName(uuid) {
  const m = uuid.match(/Compendium\.apex-imperialis\.([\w-]+)\.(?:Item|Actor|RollTable|JournalEntry)\.(\w+)$/);
  return m ? pack(m[1])[m[2]]?.name ?? null : null;
}
export const DICT = {
  "One Handed": "Одноручное", "Two Handed": "Двуручное", "One-Handed": "Одноручное", "Two-Handed": "Двуручное",
  Exotic: "Диковинная", Rare: "Редкая", Scarce: "Необычная", Common: "Обычная",
  Name: "Название", Cost: "Цена", Avail: "Доступн.", Availability: "Доступность", Specialisation: "Специализация",
  Damage: "Урон", Range: "Дальность", Mag: "Магазин", Traits: "Свойства", Encumbrance: "Нагрузка", Enc: "Нагр.",
  Armour: "Броня", Locations: "Области", Location: "Область", Effect: "Эффект", Description: "Описание",
  Short: "Ближняя", Medium: "Средняя", Long: "Дальняя", Extreme: "Сверхдальняя", Immediate: "Вплотную", Close: "Близкая",
  Pistol: "Пистолет", "Long Gun": "Длинноствольное", Thrown: "Метательное", Flamer: "Огнемёт", Launcher: "Пусковая установка",
  Ordnance: "Артиллерия", Engineering: "Инженерное дело", Brawling: "Кулачный бой",
  "All": "Все", "Arms": "Руки", "Body": "Тело", "Legs": "Ноги", "Head": "Голова", "–": "–", "-": "–", "—": "—",
  "1d10": "1к10"
};
export const LABELS = {
  Loud: "Громкое", Inflict: "Состояние", Stunned: "Оглушение", Unstable: "Непредсказуемое", Blast: "Взрыв",
  Fatigued: "Усталость", Poisoned: "Отравление", Ablaze: "Горение", Bleeding: "Кровотечение", Blinded: "Слепота",
  Deafened: "Глухота", Prone: "Сбит с ног", Restrained: "Обездвиживание", Frightened: "Страх", Unconscious: "Без сознания",
  Shield: "Щит", Heavy: "Тяжёлое", Penetrating: "Бронебойное", Spread: "Разлёт", Rend: "Разрывающее", Flamer: "Огнемёт",
  Defensive: "Оборонительное", "Two-Handed": "Двуручное", Subtle: "Незаметное", Burst: "Очередь", Rapidfire: "Скорострельное",
  Rapid: "Скорострельное", Reliable: "Надёжное", Unreliable: "Ненадёжное", Ineffective: "Бесполезное", Thrown: "Метательное",
  Spray: "Распыление", Supercharge: "Перегрев", Close: "Удобное", Precise: "Точное", Sturdy: "Прочное", Bulky: "Громоздкое",
  Mastercrafted: "Мастерской работы", Shoddy: "Некачественное", Ugly: "Уродливое", Lightweight: "Лёгкое",
  Force: "Психосиловое", Daemonbane: "Демоноборческое", Blessed: "Благословлённое", Null: "Нулевое", Tainted: "Осквернённое"
};
export function relabel(run) {
  const bare = run.replace(/@UUID\[[^\]]*\]\{[^}]*\}/g, "");
  if (/[A-Za-z]/.test(bare)) return null;
  let ok = true;
  const out = run.replace(/(@UUID\[[^\]]*\])\{([^}]*)\}/g, (all, u, label) => {
    const m = label.match(/^(.+?)(\s*\([^)]*\))?$/);
    const base = m[1].trim(), rest = m[2] ?? "";
    if (LABELS[base]) return `${u}{${LABELS[base]}${rest}}`;
    const n = ruName(u.slice(6, -1)); if (n) return `${u}{${n}}`;
    ok = false; return all;
  });
  return ok ? out : null;
}
export function fill(id, meta, manual = {}, dict = {}) {
  manual = { ...manual, __meta: meta };
  const file = fs.readdirSync(dir).map(p => path.join(dir, p, `${id}.json`)).find(f => fs.existsSync(f));
  const src = JSON.parse(fs.readFileSync(file, "utf8"));
  const runs = {}; const D = { ...DICT, ...dict }; const missing = [];
  for (const [i, r] of Object.entries(src.runs)) {
    const t = r.en.trim(); const lead = r.en.match(/^\s*/)[0], tail = r.en.match(/\s*$/)[0];
    const m = r.en.match(/^@UUID\[([^\]]+)\]\{([^}]*)\}$/);
    if (m) { const n = ruName(m[1]); if (n) { runs[i] = `@UUID[${m[1]}]{${n}}`; continue; } }
    if (D[t] !== undefined) { runs[i] = lead + D[t] + tail; continue; }
    if (/^[\d\s.,+\-−–×x/%()]+$/.test(t)) { runs[i] = r.en.replace(/-(?=\d)/g, "−"); continue; }
    const rl = relabel(r.en); if (rl) { runs[i] = rl; continue; }
    if (/^[\w\s,]+$/.test(t) && t.split(/\s*,\s*/).every(w => D[w] !== undefined)) { runs[i] = lead + t.split(/\s*,\s*/).map(w => D[w]).join(", ") + tail; continue; }
    if (!(i in manual)) missing.push(i);
  }
  Object.assign(runs, manual);
  const still = missing.filter(i => !(i in manual));
  fs.writeFileSync(`tmp/tr/${id}.json`, JSON.stringify({ ...(manual.__meta ?? {}), runs: Object.fromEntries(Object.entries(runs).filter(([k]) => k !== "__meta")) }, null, 1));
  if (still.length) console.error(`${id}: no translation for runs ${still.join(",")}`);
}
// Show only runs the helper cannot fill.
export function todo(id) {
  const file = fs.readdirSync(dir).map(p => path.join(dir, p, `${id}.json`)).find(f => fs.existsSync(f));
  const src = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`# ${src.pageName}`);
  for (const [i, r] of Object.entries(src.runs)) {
    const t = r.en.trim();
    const m = r.en.match(/^@UUID\[([^\]]+)\]\{([^}]*)\}$/);
    if (m && ruName(m[1])) continue;
    if (DICT[t] !== undefined || /^[\d\s.,+\-−–×x/%()]+$/.test(t) || relabel(r.en)) continue;
    if (/^[\w\s,]+$/.test(t) && t.split(/\s*,\s*/).every(w => DICT[w] !== undefined)) continue;
    console.log(`${i}: ${r.en}`);
  }
}
if (process.argv[2] === "todo") for (const id of process.argv.slice(3)) todo(id);
