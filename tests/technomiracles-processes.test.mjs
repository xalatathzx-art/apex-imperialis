import { test } from "node:test";
import assert from "node:assert/strict";

import { chargeUpkeep, dropProcess } from "../module/technomiracles/processes.js";

/**
 * Порядок «сперва восстановить, потом списать» — суть всей подсистемы, и
 * проверять его надо именно на связке, а не на чистой арифметике из rules.js:
 * там он не виден, потому что там нет актёра.
 *
 * `ui.notifications` и `game.i18n` подменяются на время теста: модуль их зовёт
 * при нехватке Когниции, а запускать ради этого Foundry незачем.
 */
function stubFoundry() {
  const warnings = [];
  globalThis.ui = { notifications: { warn: message => warnings.push(message) } };
  globalThis.game = { i18n: { format: (key, data) => `${key}:${JSON.stringify(data)}` } };
  return warnings;
}

const actorWith = (flag, { int = 4 } = {}) => {
  let stored = flag;
  const writes = [];
  return {
    system: { characteristics: { int: { bonus: int }, tgh: { bonus: 3 } } },
    getFlag: () => stored,
    setFlag: async (_m, _k, value) => {
      writes.push(structuredClone(value));
      stored = value;
      return value;
    },
    get stored() { return stored; },
    writes
  };
};

test("восстановление идёт ДО счёта: жрец платит тем, что только что получил", async () => {
  stubFoundry();
  // Пусто в запасе, бонус Интеллекта 4 даёт +2, два Процесса просят 2.
  const actor = actorWith({
    cognition: { value: 0, max: 4 },
    energy: { value: 0, max: 3 },
    processes: [{ itemId: "a", cognition: 1 }, { itemId: "b", cognition: 1 }]
  });
  await chargeUpkeep(actor);
  assert.deepEqual(actor.stored.cognition, { value: 0, max: 4 },
    "восстановил 2 и тут же отдал 2 — Процессы устояли");
});

test("если бы счёт шёл первым, Процессы погасли бы зря", async () => {
  const warnings = stubFoundry();
  const actor = actorWith({
    cognition: { value: 0, max: 4 },
    energy: { value: 0, max: 3 },
    processes: [{ itemId: "a", cognition: 1 }, { itemId: "b", cognition: 1 }]
  });
  await chargeUpkeep(actor);
  assert.deepEqual(warnings, [], "никакой нехватки быть не должно");
});

test("при нехватке Когниция не списывается и игрок предупреждён", async () => {
  const warnings = stubFoundry();
  // Бонус 1 даёт +1, а Процессов три.
  const actor = actorWith({
    cognition: { value: 0, max: 4 },
    energy: { value: 0, max: 3 },
    processes: [{ itemId: "a", cognition: 1 }, { itemId: "b", cognition: 1 }, { itemId: "c", cognition: 1 }]
  }, { int: 1 });
  await chargeUpkeep(actor);
  assert.deepEqual(actor.stored.cognition, { value: 1, max: 4 },
    "восстановленное осталось, счёт не снят");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Shortfall.*"short":2/);
});

test("Процессы без стоимости не мешают и счёта не создают", async () => {
  const warnings = stubFoundry();
  const actor = actorWith({
    cognition: { value: 0, max: 4 },
    energy: { value: 0, max: 3 },
    processes: [{ itemId: "a", cognition: 0 }, { itemId: "b", cognition: 0 }]
  }, { int: 0 });
  await chargeUpkeep(actor);
  assert.deepEqual(actor.stored.cognition, { value: 0, max: 4 });
  assert.deepEqual(warnings, []);
});

test("снятие Процесса убирает только его", async () => {
  stubFoundry();
  const actor = actorWith({
    cognition: { value: 2, max: 4 },
    energy: { value: 1, max: 3 },
    processes: [{ itemId: "a", name: "Литания" }, { itemId: "b", name: "Щит" }]
  });
  await dropProcess(actor, "a");
  assert.deepEqual(actor.stored.processes.map(p => p.itemId), ["b"]);
  assert.deepEqual(actor.stored.cognition, { value: 2, max: 4 }, "запас не тронут");
});

test("снятие несуществующего Процесса не ломает список", async () => {
  stubFoundry();
  const actor = actorWith({
    cognition: { value: 2, max: 4 },
    energy: { value: 1, max: 3 },
    processes: [{ itemId: "a", name: "Литания" }]
  });
  await dropProcess(actor, "нет-такого");
  assert.deepEqual(actor.stored.processes.map(p => p.itemId), ["a"]);
});
