import { test } from "node:test";
import assert from "node:assert/strict";

import { chargeFor, shieldOf } from "../module/technomiracles/shield.js";

/**
 * Расход щита — то самое место, где правило и записано. Всё остальное в
 * shield.js трогает документы и проверяется живьём; эта арифметика — нет.
 */

test("попадание берёт Заряд за каждые начатые десять урона", () => {
  assert.equal(chargeFor(10, 10), 1);
  assert.equal(chargeFor(11, 10), 2);
  assert.equal(chargeFor(20, 10), 2);
  assert.equal(chargeFor(21, 10), 3);
  assert.equal(chargeFor(30, 10), 3);
});

test("даже царапина стоит целого Заряда", () => {
  // Отсюда и слабость против толпы: шесть слабых попаданий съедят шесть Зарядов.
  assert.equal(chargeFor(1, 10), 1);
  assert.equal(chargeFor(3, 10), 1);
  assert.equal(chargeFor(9, 10), 1);
});

test("нулевой и отрицательный урон всё равно не уходят в ноль Зарядов", () => {
  // До сюда доходит только реальное попадание, но округление не должно давать 0.
  assert.equal(chargeFor(0, 10), 1);
  assert.equal(chargeFor(-5, 10), 1);
});

test("ёмкость на Заряд задаётся чудом, а не зашита в код", () => {
  // Вольтагейст Риза в книге поднимает щит — у неё будет своя ёмкость.
  assert.equal(chargeFor(30, 15), 2);
  assert.equal(chargeFor(31, 15), 3);
});

test("шесть слабых попаданий дороже одного тяжёлого того же итога", () => {
  const swarm = [3, 3, 3, 3, 3, 3].reduce((sum, d) => sum + chargeFor(d, 10), 0);
  const single = chargeFor(18, 10);
  assert.equal(swarm, 6);
  assert.equal(single, 2);
  assert.ok(swarm > single, "толпа должна обдирать питание быстрее");
});

test("чудо без флага щита его не поднимает", () => {
  assert.equal(shieldOf({ flags: {} }), null);
  assert.equal(shieldOf(undefined), null);
});

test("флаг щита читается с ёмкостью по умолчанию", () => {
  assert.deepEqual(shieldOf({ flags: { "navis-apexialis": { shield: {} } } }), { perCharge: 10 });
  assert.deepEqual(
    shieldOf({ flags: { "navis-apexialis": { shield: { perCharge: 15 } } } }),
    { perCharge: 15 }
  );
});

test("испорченная ёмкость не роняет расчёт в ноль или в бесконечность", () => {
  assert.deepEqual(shieldOf({ flags: { "navis-apexialis": { shield: { perCharge: 0 } } } }), { perCharge: 10 });
  assert.deepEqual(shieldOf({ flags: { "navis-apexialis": { shield: { perCharge: -3 } } } }), { perCharge: 1 });
});
