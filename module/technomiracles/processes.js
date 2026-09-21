/**
 * Поддерживаемые техночудеса и во что они обходятся каждый ход.
 *
 * Техножрец играется как человек, жонглирующий несколькими запущенными
 * программами: каждый работающий Процесс берёт Когницию в начале его хода, а
 * когда платить нечем, приходится решать, что погасить. Этот выбор и есть
 * интересная часть, поэтому код никогда не решает за игрока сам.
 *
 * Содержание снимается на хуке `updateCombat`, а не на триггере `startTurn` из
 * warhammer-lib, как предполагала спека. Тот триггер выполняет скрипты, которые
 * лежат НА активных эффектах, — значит, пришлось бы вешать эффект на каждого
 * техножреца только ради выставления счёта. Хук Foundry задокументирован и
 * ничего вешать не требует.
 */

import { applyUpkeep, doctrineConflict } from "./rules.js";
import { readBlock, restoreAtTurnStart, writeBlock } from "./resources.js";
import { applyProcessEffects, clearProcessEffects } from "./process-effects.js";
import { lowerShield, raiseShield } from "./shield.js";

const MODULE_ID = "apex-imperialis";

/** Короткая запись Процесса: ровно то, чем его выставить в счёт и показать. */
const processOf = item => ({
  itemId: item.id,
  name: item.name,
  cognition: item.system.process.cognition,
  doctrine: item.system.types.doctrine
});

/**
 * Начать поддерживать чудо.
 *
 * Доктрина может работать только одна, а «единственное» чудо нельзя запустить
 * дважды, — обе проверки разрешаются здесь, а не в месте вызова, чтобы правило
 * не пришлось повторять у каждой кнопки.
 */
export async function addProcess(actor, item) {
  const block = readBlock(actor);

  if (item.system.process.unique && block.processes.some(process => process.itemId === item.id)) {
    ui.notifications.warn(game.i18n.format("NAVIS.Techno.AlreadyRunning", { name: item.name }));
    return;
  }

  const conflict = doctrineConflict(block.processes, { doctrine: item.system.types.doctrine });
  if (conflict) {
    const replace = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("NAVIS.Techno.DoctrineTitle") },
      content: `<p>${game.i18n.format("NAVIS.Techno.DoctrinePrompt", {
        running: conflict.name,
        next: item.name
      })}</p>`
    });
    if (!replace) return;
    block.processes = block.processes.filter(process => process.itemId !== conflict.itemId);
  }

  block.processes.push(processOf(item));
  await writeBlock(actor, block);

  // Что чудо надевает на время Процесса: прибавки — активными эффектами,
  // щит — силовым полем. Оба пути не мешают друг другу: чудо может не иметь
  // ни того, ни другого и держать Процесс чистой прозой.
  await applyProcessEffects(actor, item);
  await raiseShield(actor, item);
}

export async function dropProcess(actor, itemId) {
  const block = readBlock(actor);
  const had = block.processes.some(process => process.itemId === itemId);
  block.processes = block.processes.filter(process => process.itemId !== itemId);
  await writeBlock(actor, block);

  // Снимаем только если Процесс действительно был: иначе гашение чужого
  // Процесса сбило бы то, что держит другое чудо.
  if (!had) return;
  await clearProcessEffects(actor, itemId);
  await lowerShield(actor);
}

/**
 * Сперва восстановить, потом выставить счёт — в начале хода владельца.
 *
 * Порядок важен: жрец, который получает две Когниции и должен две, расплатится.
 * Счёт вперёд восстановления погасил бы Процессы, которые он мог себе позволить.
 *
 * При нехватке не снимается ничего: частичная оплата отобрала бы у игрока тот
 * самый выбор, ради которого всё и затевалось.
 */
export async function chargeUpkeep(actor) {
  const block = await restoreAtTurnStart(actor);
  const { pool, shortfall } = applyUpkeep(block.cognition, block.processes);

  if (shortfall > 0) {
    ui.notifications.warn(
      game.i18n.format("NAVIS.Techno.Shortfall", { short: shortfall }),
      { permanent: true }
    );
    return;
  }

  block.cognition = pool;
  await writeBlock(actor, block);
}

/**
 * Выставлять счёт в начале хода.
 *
 * Писать должен только один клиент, иначе все подключённые владельцы наперегонки
 * выставят счёт одному и тому же актёру. Пишет активный ведущий.
 */
export function registerProcessUpkeep() {
  Hooks.on("updateCombat", async (combat, changed) => {
    if (!game.users.activeGM?.isSelf) return;
    if (changed.turn === undefined && changed.round === undefined) return;

    const actor = combat.combatant?.actor;
    if (!actor) return;

    const block = actor.getFlag(MODULE_ID, "mechanicum");
    if (!block?.processes?.length) return;

    await chargeUpkeep(actor);
  });
}
