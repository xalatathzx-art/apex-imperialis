/**
 * Два ресурса Механикум на актёре.
 *
 * Лежат во флаге, а не в схеме актёра, потому что модель `character` в impmal
 * фиксирована, а этот модуль систему не правит. Следствие, о котором стоит
 * знать: активный эффект до них не дотянется, поэтому ёмкость — обычное
 * редактируемое число, а не то, что эффекты умеют поднимать.
 *
 * Ёмкость Заряда — см. `energyCapacity` ниже: бонус Стойкости плюс то, что
 * добавляют АКТИВНЫЕ имплантаты. Связь этого пака с паком имплантатов теперь
 * умышленная, а не то, чего когда-то избегали ради одной строки.
 *
 * Читать блок безопасно всегда: `readBlock` ничего не пишет, а только
 * достраивает недостающее. Запись — отдельным вызовом.
 */

import { canAfford, defaultCapacity, restoreCognition, spend } from "./rules.js";
import { implantsOf, isImplantActive } from "../implants/state.js";
import { resolveQualityValue } from "../implants/rules.js";

const MODULE_ID = "navis-apexialis";
const FLAG = "mechanicum";

/**
 * Ёмкость Заряда: бонус Стойкости плюс то, что добавляют АКТИВНЫЕ имплантаты.
 *
 * Это РАЗВОРАЧИВАЕТ решение, записанное прежде в заголовке этого файла: там
 * говорилось, что ёмкость читается из бонуса характеристики один раз и больше
 * не пересчитывается, потому что связывать пак техночудес с паком аугметики
 * кодом ради одной строки того не стоило. Тогда это было верно; сейчас — нет:
 * имплантаты Механикум приносят Двигательные банки Манипулус (+5 к ёмкости),
 * индукторы Электоо, Приводные банки Боевой брони и техночудеса, тратящие тот
 * же самый запас. Вид записи `energy` — это общий случай того, что иначе
 * пришлось бы делать особым.
 *
 * Заряд остаётся одним запасом в одном месте. Меняется лишь то, что его потолок
 * теперь не застывший.
 *
 * Живёт во флаге, куда активный эффект не дотягивается, — поэтому пересчёт
 * происходит при переключении гейта импланта, а не через конвейер эффектов.
 */
export function energyCapacity(actor) {
  const base = Math.max(0, actor?.system?.characteristics?.tgh?.bonus ?? 0);

  let added = 0;
  for (const item of implantsOf(actor)) {
    if (!isImplantActive(item)) continue;
    for (const group of item.system.mechanics ?? []) {
      for (const entry of group?.entries ?? []) {
        if (entry?.kind === "energy") added += resolveQualityValue(entry.value, item.system.quality);
      }
    }
  }

  return Math.max(0, base + added);
}

/**
 * Подогнать хранимую ёмкость Заряда под текущие имплантаты.
 *
 * `readBlock` берёт `energyCapacity` лишь пока во флаге ничего не записано;
 * дальше он держит то, что там лежит. Без этого вызова гейт импланта мог бы
 * переключиться, а сохранённый потолок остался бы прежним. Вызывается при
 * каждом переключении гейта — см. `module/implants/mechanics/apply.js`.
 *
 * Значение только подрезается под новый потолок, а не подгоняется под него:
 * рост ёмкости не даёт бесплатного заряда, падение — не уводит его в минус.
 */
export async function syncEnergyCapacity(actor) {
  if (!actor) return;

  const block = readBlock(actor);
  const capacity = energyCapacity(actor);
  if (block.energy.max === capacity && block.energy.value <= capacity) return;

  block.energy = { value: Math.min(block.energy.value, capacity), max: capacity };
  await writeBlock(actor, block);
}

/** Блок в том виде, в каком его надо читать: недостающее достраивается от актёра. */
export function readBlock(actor) {
  const stored = actor.getFlag(MODULE_ID, FLAG) ?? {};
  const intBonus = actor.system.characteristics?.int?.bonus ?? 0;

  return {
    cognition: stored.cognition ?? {
      value: defaultCapacity(intBonus),
      max: defaultCapacity(intBonus)
    },
    energy: stored.energy ?? {
      value: energyCapacity(actor),
      max: energyCapacity(actor)
    },
    processes: stored.processes ?? []
  };
}

export async function writeBlock(actor, block) {
  await actor.setFlag(MODULE_ID, FLAG, block);
}

/**
 * Снять с одного из запасов — либо отказать и сказать об этом.
 *
 * При нехватке возвращает false, ничего не записав: всякий вызывающий должен
 * остановиться, а не идти дальше с частичной оплатой.
 */
export async function spendFrom(actor, which, amount) {
  if (amount <= 0) return true;

  const block = readBlock(actor);
  if (!canAfford(block[which], amount)) return false;

  block[which] = spend(block[which], amount);
  await writeBlock(actor, block);
  return true;
}

/** Восстановление в начале хода владельца. Заряда не касается: он сам не растёт. */
export async function restoreAtTurnStart(actor) {
  const block = readBlock(actor);
  const intBonus = actor.system.characteristics?.int?.bonus ?? 0;
  block.cognition = restoreCognition(block.cognition, intBonus);
  await writeBlock(actor, block);
  return block;
}
