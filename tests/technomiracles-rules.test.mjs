import { test } from "node:test";
import assert from "node:assert/strict";

import {
  defaultCapacity, resolveCost, canAfford, spend, restoreCognition,
  upkeepTotal, applyUpkeep, doctrineConflict
} from "../module/technomiracles/rules.js";

const pool = (value, max) => ({ value, max });

test("capacity defaults to the characteristic bonus, never below zero", () => {
  assert.equal(defaultCapacity(3), 3);
  assert.equal(defaultCapacity(0), 0);
  assert.equal(defaultCapacity(-2), 0);
});

test("a fixed cost is returned as written", () => {
  assert.deepEqual(resolveCost({ cognition: 1, energy: 2 }), { cognition: 1, energy: 2 });
});

test("a variable cost takes the player's X", () => {
  assert.deepEqual(resolveCost({ cognition: "X", energy: 0 }, 3), { cognition: 3, energy: 0 });
  assert.deepEqual(resolveCost({ cognition: "X", energy: "X" }, 2), { cognition: 2, energy: 2 });
});

test("a variable cost with no X chosen is zero, not NaN", () => {
  assert.deepEqual(resolveCost({ cognition: "X", energy: 0 }), { cognition: 0, energy: 0 });
});

test("affordability is inclusive", () => {
  assert.equal(canAfford(pool(2, 3), 2), true);
  assert.equal(canAfford(pool(2, 3), 3), false);
  assert.equal(canAfford(pool(0, 3), 0), true);
});

test("spending never drops below zero and never touches max", () => {
  assert.deepEqual(spend(pool(3, 3), 2), pool(1, 3));
  assert.deepEqual(spend(pool(1, 3), 5), pool(0, 3));
});

test("cognition restores half the Intelligence bonus, rounded up, capped at max", () => {
  assert.deepEqual(restoreCognition(pool(0, 4), 3), pool(2, 4));
  assert.deepEqual(restoreCognition(pool(0, 4), 4), pool(2, 4));
  assert.deepEqual(restoreCognition(pool(3, 4), 3), pool(4, 4));
  assert.deepEqual(restoreCognition(pool(4, 4), 3), pool(4, 4));
});

test("upkeep is one whole point per process, never fractional", () => {
  assert.equal(upkeepTotal([]), 0);
  assert.equal(upkeepTotal([{ cognition: 1 }, { cognition: 1 }, { cognition: 0 }]), 2);
});

test("upkeep that fits is charged and reports no shortfall", () => {
  const result = applyUpkeep(pool(3, 4), [{ cognition: 1 }, { cognition: 1 }]);
  assert.deepEqual(result.pool, pool(1, 4));
  assert.equal(result.shortfall, 0);
});

test("upkeep that does not fit charges nothing and reports the gap", () => {
  const result = applyUpkeep(pool(1, 4), [{ cognition: 1 }, { cognition: 1 }]);
  assert.deepEqual(result.pool, pool(1, 4));
  assert.equal(result.shortfall, 1);
});

test("a doctrine conflicts only with another doctrine", () => {
  const active = [{ itemId: "a", name: "Доктрина Фульгурит", doctrine: true }];
  assert.equal(doctrineConflict(active, { doctrine: true })?.itemId, "a");
  assert.equal(doctrineConflict(active, { doctrine: false }), null);
  assert.equal(doctrineConflict([], { doctrine: true }), null);
});

/**
 * Ниже — случаи, которых в плане не было, но которые точно встретятся за столом.
 * Их лучше прибить сейчас, пока модуль пустой, чем потом ловить их в бою.
 */

test("Процесс без стоимости не берёт с жреца ничего", () => {
  // Пассивные процессы в книге есть, и они не должны съедать Когницию.
  const result = applyUpkeep(pool(0, 4), [{ cognition: 0 }, { cognition: 0 }]);
  assert.deepEqual(result.pool, pool(0, 4));
  assert.equal(result.shortfall, 0);
});

test("Восстановление не работает при нулевой ёмкости", () => {
  // Ёмкость 0 — это жрец без Мехникум-имплантов: копить ему некуда.
  assert.deepEqual(restoreCognition(pool(0, 0), 4), pool(0, 0));
});

test("Отрицательный бонус Интеллекта ничего не отнимает", () => {
  // Лучевая болезнь и высокая гравитация уводят характеристику в минус.
  assert.deepEqual(restoreCognition(pool(2, 4), -3), pool(2, 4));
});

test("Отрицательный X в переменной стоимости считается нулём", () => {
  assert.deepEqual(resolveCost({ cognition: "X", energy: 0 }, -5), { cognition: 0, energy: 0 });
});
