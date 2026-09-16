/**
 * Два ресурса Механикум на актёре.
 *
 * Лежат во флаге, а не в схеме актёра, потому что модель `character` в impmal
 * фиксирована, а этот модуль систему не правит. Следствие, о котором стоит
 * знать: активный эффект до них не дотянется, поэтому ёмкость — обычное
 * редактируемое число, а не то, что эффекты умеют поднимать.
 *
 * Ёмкость берётся из бонуса характеристики при первом чтении блока и больше
 * никогда не пересчитывается: установка Двигательных банков сама по себе ничего
 * не поднимет. Так задумано — иначе этот пак и пак аугметики оказались бы
 * связаны кодом ради одной строки.
 *
 * Читать блок безопасно всегда: `readBlock` ничего не пишет, а только
 * достраивает недостающее. Запись — отдельным вызовом.
 */

import { canAfford, defaultCapacity, restoreCognition, spend } from "./rules.js";

const MODULE_ID = "navis-apexialis";
const FLAG = "mechanicum";

/** Блок в том виде, в каком его надо читать: недостающее достраивается от актёра. */
export function readBlock(actor) {
  const stored = actor.getFlag(MODULE_ID, FLAG) ?? {};
  const intBonus = actor.system.characteristics?.int?.bonus ?? 0;
  const tghBonus = actor.system.characteristics?.tgh?.bonus ?? 0;

  return {
    cognition: stored.cognition ?? {
      value: defaultCapacity(intBonus),
      max: defaultCapacity(intBonus)
    },
    energy: stored.energy ?? {
      value: defaultCapacity(tghBonus),
      max: defaultCapacity(tghBonus)
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
