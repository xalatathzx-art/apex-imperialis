/**
 * Активация техночуда — в том порядке, на котором книга настаивает.
 *
 * Два шага несут весь замысел. Когниция тратится ДО броска: неудачное обращение
 * к священному коду всё равно съедает вычисление. Заряд тратится ПОСЛЕ броска и
 * только при успехе: системы берут питание лишь тогда, когда код исполнился.
 * Поменяйте их местами — и это просто психосила другими словами.
 *
 * Атака уходит в родной `setupWeaponTest` impmal. Это работает потому, что
 * модель чуда наследует модель оружия: у предмета есть и поля, и методы,
 * которые боевой расчёт с оружия читает. Проверено живьём — диалог открывается,
 * и черта `penetrating` в нём на месте.
 */

import { resolveCost } from "./rules.js";
import { spendFrom } from "./resources.js";
import { addProcess } from "./processes.js";

const MODULE_ID = "navis-apexialis";

/** Спросить X, когда книга оставляет размер вклада жрецу. */
async function askForX(item) {
  const answer = await foundry.applications.api.DialogV2.prompt({
    window: { title: item.name },
    content: `<p>${game.i18n.localize("NAVIS.Techno.AskX")}</p>`
      + '<input type="number" name="x" value="1" min="0">',
    ok: { callback: (event, button) => Number(button.form.elements.x.value) }
  });
  return Number.isFinite(answer) ? answer : null;
}

/** Импланты, которые чуду нужны, а у актёра их нет. */
function missingHardware(actor, item) {
  const owned = new Set(actor.items.filter(i => i.type === "augmetic").map(i => i.name));
  return (item.system.hardware ?? []).filter(name => !owned.has(name));
}

export async function activateMiracle(actor, item) {
  // 1. Порог. Везде в этом модуле Железо — вещь совещательная, но здесь стоит
  //    остановиться и спросить: активировать без нужного Железа — всегда
  //    оплошность, а не выбор. Решает всё равно игрок.
  const missing = missingHardware(actor, item);
  if (missing.length) {
    const proceed = await foundry.applications.api.DialogV2.confirm({
      window: { title: item.name },
      content: `<p>${game.i18n.format("NAVIS.Techno.MissingHardware", { list: missing.join(", ") })}</p>`
    });
    if (!proceed) return;
  }

  // 2. Переменная стоимость.
  const variable = item.system.cost.cognition === "X" || item.system.cost.energy === "X";
  const chosenX = variable ? await askForX(item) : 0;
  if (variable && chosenX === null) return;

  const cost = resolveCost(item.system.cost, chosenX);

  // 3. Когниция — до броска.
  if (!(await spendFrom(actor, "cognition", cost.cognition))) {
    ui.notifications.warn(game.i18n.format("NAVIS.Techno.NoCognition", { name: item.name }));
    return;
  }

  // 4. Бросок: Техника от Интеллекта.
  let test = null;
  if (!item.system.test.auto) {
    test = await actor.setupSkillTest(
      { key: "tech" },
      { characteristic: "int", appendTitle: ` — ${item.name}` },
      { fields: { modifier: item.system.test.modifier } }
    );
    // Жрец закрыл диалог — Когниция уже потрачена, как книга и велит.
    if (!test) return;
    if (!test.succeeded) {
      await postCard(actor, item, cost, false);
      return;
    }
  }

  // 5. Заряд — после броска и только при успехе.
  //
  // Книжной замены «заплатить телом вместо Заряда» здесь нет намеренно: в
  // impmal Усталость снимается тяжело и надолго, и разменивать на неё расходный
  // ресурс значило бы отдавать несопоставимое. Нет Заряда — чудо не берётся,
  // а Когниция остаётся потраченной, как книга и велит.
  if (cost.energy > 0 && !(await spendFrom(actor, "energy", cost.energy))) {
    ui.notifications.warn(game.i18n.format("NAVIS.Techno.NoEnergy", { name: item.name }));
    await postCard(actor, item, { cognition: cost.cognition, energy: 0 }, false);
    return;
  }

  // 6. Процесс.
  if (item.system.process.sustains) await addProcess(actor, item);

  // 7. Атака — родной машинерией системы.
  if (item.system.attacks) {
    await actor.setupWeaponTest(item.id, { appendTitle: ` — ${item.name}` });
  }

  await postCard(actor, item, cost, true);
}

async function postCard(actor, item, cost, succeeded) {
  // При провале Заряд не снимался, поэтому и в карточке его не показываем.
  const paid = game.i18n.format("NAVIS.Techno.Paid", {
    cognition: cost.cognition,
    energy: succeeded ? cost.energy : 0
  });
  const outcome = succeeded
    ? game.i18n.localize("NAVIS.Techno.Succeeded")
    : game.i18n.localize("NAVIS.Techno.Failed");

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: item.name,
    content: `<p><strong>${outcome}</strong></p><p>${paid}</p>`
      + (succeeded ? (item.system.notes.player ?? "") : ""),
    flags: { [MODULE_ID]: { technomiracle: item.id } }
  });
}
