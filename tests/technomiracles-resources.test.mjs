import { test } from "node:test";
import assert from "node:assert/strict";

import { readBlock, spendFrom, restoreAtTurnStart, energyCapacity } from "../module/technomiracles/resources.js";

/**
 * Поддельный актёр: ровно то, чего касается resources.js, — бонусы
 * характеристик и пара методов для флага. Запускать ради этого Foundry не надо,
 * а проверить стоит именно путь записи: `readBlock` безобиден, а `spendFrom`
 * при нехватке обязан не записать ничего.
 */
const actorWith = ({ int = 4, tgh = 3, flag = null } = {}) => {
  let stored = flag;
  const writes = [];
  return {
    system: { characteristics: { int: { bonus: int }, tgh: { bonus: tgh } } },
    getFlag: () => stored,
    setFlag: async (_module, _key, value) => {
      writes.push(structuredClone(value));
      stored = value;
      return value;
    },
    writes
  };
};

test("пустой блок берёт ёмкость из бонусов характеристик", () => {
  const block = readBlock(actorWith({ int: 4, tgh: 3 }));
  assert.deepEqual(block.cognition, { value: 4, max: 4 });
  assert.deepEqual(block.energy, { value: 3, max: 3 });
  assert.deepEqual(block.processes, []);
});

test("чтение блока ничего не записывает", () => {
  const actor = actorWith();
  readBlock(actor);
  assert.equal(actor.writes.length, 0);
});

test("уже записанная ёмкость не пересчитывается от характеристик", () => {
  // Ведущий поднял ёмкость под Двигательные банки — перечитывание не должно её сбросить.
  const actor = actorWith({ int: 4, flag: { cognition: { value: 1, max: 6 }, energy: { value: 0, max: 2 } } });
  const block = readBlock(actor);
  assert.deepEqual(block.cognition, { value: 1, max: 6 });
  assert.deepEqual(block.energy, { value: 0, max: 2 });
});

test("трата снимает с нужного запаса и записывает результат", async () => {
  const actor = actorWith({ int: 4 });
  assert.equal(await spendFrom(actor, "cognition", 3), true);
  assert.deepEqual(actor.writes.at(-1).cognition, { value: 1, max: 4 });
});

test("при нехватке трата отказывает и НЕ записывает ничего", async () => {
  const actor = actorWith({ int: 2 });
  assert.equal(await spendFrom(actor, "cognition", 5), false);
  assert.equal(actor.writes.length, 0);
});

test("нулевая трата проходит, не трогая флаг", async () => {
  const actor = actorWith();
  assert.equal(await spendFrom(actor, "energy", 0), true);
  assert.equal(actor.writes.length, 0);
});

test("начало хода восстанавливает Когницию и не трогает Заряд", async () => {
  const actor = actorWith({ int: 4, tgh: 3, flag: { cognition: { value: 0, max: 4 }, energy: { value: 0, max: 3 }, processes: [] } });
  const block = await restoreAtTurnStart(actor);
  assert.deepEqual(block.cognition, { value: 2, max: 4 });
  assert.deepEqual(block.energy, { value: 0, max: 3 }, "Заряд сам не растёт");
});

test("восстановление не переливает через ёмкость", async () => {
  const actor = actorWith({ int: 6, flag: { cognition: { value: 3, max: 4 }, energy: { value: 0, max: 3 }, processes: [] } });
  const block = await restoreAtTurnStart(actor);
  assert.deepEqual(block.cognition, { value: 4, max: 4 });
});

test("восстановление сохраняет список Процессов", async () => {
  const processes = [{ itemId: "x", name: "Литания Движителя", cognition: 1 }];
  const actor = actorWith({ flag: { cognition: { value: 0, max: 4 }, energy: { value: 1, max: 3 }, processes } });
  const block = await restoreAtTurnStart(actor);
  assert.deepEqual(block.processes, processes);
});

const implantWithEnergy = (value, active = true) => ({
  type: "navis-apexialis.implant",
  system: { installed: true, disabled: false, active, quality: 2, chosenEffects: {},
            mechanics: [{ id: "g", operator: "AND", entries: [{ id: "e", kind: "energy", value }] }] }
});

test("Заряд capacity is the Toughness bonus when nothing adds to it", () => {
  const actor = { system: { characteristics: { tgh: { bonus: 4 } } }, items: [] };
  assert.equal(energyCapacity(actor), 4);
});

test("an active implant with an energy entry raises the capacity", () => {
  const actor = { system: { characteristics: { tgh: { bonus: 4 } } }, items: [implantWithEnergy(5)] };
  assert.equal(energyCapacity(actor), 9);
});

test("a switched-off implant does not", () => {
  const actor = { system: { characteristics: { tgh: { bonus: 4 } } }, items: [implantWithEnergy(5, false)] };
  assert.equal(energyCapacity(actor), 4);
});

test("capacity never goes below zero", () => {
  const actor = { system: { characteristics: { tgh: { bonus: 0 } } }, items: [implantWithEnergy(-5)] };
  assert.equal(energyCapacity(actor), 0);
});
