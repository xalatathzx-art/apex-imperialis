/**
 * Всё в техночудесах, что решается без документа Foundry.
 *
 * Техножрец — персонаж про распоряжение запасами: Когниция тратится до броска
 * и понемногу восстанавливается каждый ход, Заряд — после броска и только при
 * успехе, а поддерживаемые чудеса берут Когницию каждый ход. Это арифметика, а
 * арифметике место там, где её можно проверить без запущенной игры.
 *
 * Здесь ничего не пишется в документ: этим занимаются activate.js и
 * processes.js.
 */

/** Ёмкости, которой не может быть, не бывает: ниже нуля она не опускается. */
export function defaultCapacity(bonus) {
  return Math.max(0, bonus ?? 0);
}

/**
 * Стоимость как пара чисел.
 *
 * Часть стоимостей книга пишет как X: сколько влить, решает сам жрец. Обе
 * половины могут быть X, и тогда обе берут один и тот же X.
 */
export function resolveCost(cost, chosenX) {
  const resolve = part => (part === "X" ? Math.max(0, chosenX ?? 0) : Math.max(0, part ?? 0));
  return { cognition: resolve(cost?.cognition), energy: resolve(cost?.energy) };
}

export function canAfford(pool, amount) {
  return (pool?.value ?? 0) >= amount;
}

/** Трата упирается в ноль и не трогает ёмкость. */
export function spend(pool, amount) {
  return { value: Math.max(0, (pool?.value ?? 0) - amount), max: pool?.max ?? 0 };
}

/** Половина бонуса Интеллекта с округлением вверх, но не выше ёмкости. */
export function restoreCognition(pool, intBonus) {
  const gain = Math.ceil(Math.max(0, intBonus ?? 0) / 2);
  const max = pool?.max ?? 0;
  return { value: Math.min(max, (pool?.value ?? 0) + gain), max };
}

/**
 * Сколько Когниции берут за этот ход запущенные Процессы.
 *
 * Книга считает половинками и округляет сумму; здесь Процесс берёт целый пункт,
 * потому что складывать половинки, чтобы потом их округлить, — арифметика ради
 * арифметики. Процесс стоит 0 или 1.
 */
export function upkeepTotal(processes) {
  return (processes ?? []).reduce((total, process) => total + (process.cognition ? 1 : 0), 0);
}

/**
 * Снять содержание — либо не снимать ничего и сказать, сколько не хватает.
 *
 * Частичной оплаты намеренно нет: жрец сам решает, что погасить, а для такого
 * решения нужна полная картина, а не уже опустошённый запас.
 */
export function applyUpkeep(pool, processes) {
  const total = upkeepTotal(processes);
  if (!canAfford(pool, total)) {
    return {
      pool: { value: pool?.value ?? 0, max: pool?.max ?? 0 },
      shortfall: total - (pool?.value ?? 0)
    };
  }
  return { pool: spend(pool, total), shortfall: 0 };
}

/** Доктрина, которая уже работает и которую эта заменит, если такая есть. */
export function doctrineConflict(processes, miracle) {
  if (!miracle?.doctrine) return null;
  return (processes ?? []).find(process => process.doctrine) ?? null;
}
