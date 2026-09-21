/**
 * Щиты техножреца — как силовые поля самой impmal.
 *
 * Чудо, поднимающее щит, помечено флагом `shield` со своей ёмкостью:
 *
 *     flags["apex-imperialis"].shield = { perCharge: 10 }
 *
 * Пока Процесс работает, у актёра лежит предмет `forceField`, помеченный тем же
 * флагом. Это даёт даром всё, что у полей уже есть: покрытие всех областей
 * попадания, правило «одно поле за раз», место в расчёте урона и вид в листе.
 *
 * ПРАВИЛО ЩИТА. Попадание съедает Заряд по числу начатых десятков урона, но не
 * меньше одного: щит откликается даже на царапину. Не хватило Заряда — щит
 * поглощает то, что оплачено, остаток проходит, и щит ЛОПАЕТСЯ: его Процесс
 * прекращается. Чинить нечего, это не устройство; поднять заново стоит обычной
 * активации — но Заряда на неё уже нет, и ограничение работает само.
 *
 * Из минимума в один Заряд и следует главная слабость: отряд слабых противников
 * обдирает питание быстрее, чем один тяжёлый. Шесть бандитов по три урона съедят
 * шесть Зарядов ради восемнадцати поглощённого.
 *
 * ПОЧЕМУ ОБЁРТКА, А НЕ СВОЙ РАСЧЁТ. impmal зовёт `applyField`, но результат её
 * ОТБРАСЫВАЕТ: снижение попадает в урон через массив `modifiers`. Поэтому обёртка
 * обязана положить туда своё слагаемое, а возврат остаётся для совместимости.
 * Родной бросок защиты мы не зовём никогда — у щита своя арифметика, и формула
 * поля стоит в «0», чтобы случайный чужой вызов ничего не снял.
 */

import { readBlock, spendFrom } from "./resources.js";

const MODULE_ID = "apex-imperialis";
const SHIELD_FLAG = "shield";

/** Порог перегрузки, до которого не дотянется никакой урон: щит не перегорает. */
const NO_OVERLOAD = 99999;

/** Настройки щита с чуда, если оно вообще его поднимает. */
export function shieldOf(item) {
  const data = item?.getFlag?.(MODULE_ID, SHIELD_FLAG)
    ?? item?.flags?.[MODULE_ID]?.[SHIELD_FLAG];
  if (!data) return null;
  return { perCharge: Math.max(1, Number(data.perCharge) || 10) };
}

// `items` может не быть у актёра, которого не ждали: свод правил зовёт снятие
// щита из гашения Процесса, а Процессы бывают и там, где предметов нет.
const fieldOf = actor =>
  [...(actor?.items ?? [])].find(i => i.type === "forceField" && i.getFlag?.(MODULE_ID, SHIELD_FLAG));

/** Поднять щит: создать поле и надеть его. */
export async function raiseShield(actor, item) {
  const shield = shieldOf(item);
  if (!shield) return;

  await lowerShield(actor);
  await actor.createEmbeddedDocuments("Item", [{
    name: item.name,
    type: "forceField",
    img: item.img,
    system: {
      // Родной бросок не используется — вся арифметика в обёртке ниже.
      protection: "0",
      overload: { value: NO_OVERLOAD, collapsed: false },
      equipped: { value: true }
    },
    flags: { [MODULE_ID]: { [SHIELD_FLAG]: { sourceId: item.id, perCharge: shield.perCharge } } }
  }]);
}

/** Снять щит. Зовётся и при гашении Процесса, и когда щит лопнул. */
export async function lowerShield(actor) {
  const field = fieldOf(actor);
  if (field) await field.delete();
}

/**
 * Сколько Заряда просит это попадание: по десятку за начатые десять урона,
 * но не меньше одного.
 */
export function chargeFor(damage, perCharge) {
  return Math.max(1, Math.ceil(Math.max(0, damage) / perCharge));
}

let patched = false;

export function registerShieldField() {
  if (patched) return;

  const model = CONFIG.Item.dataModels?.forceField;
  const proto = model?.prototype;
  if (typeof proto?.applyField !== "function") {
    console.error(
      `${MODULE_ID} | impmal's force field model has no applyField to wrap; techno-miracle shields `
      + "cannot spend Charge and would silently absorb nothing."
    );
    return;
  }

  const original = proto.applyField;

  proto.applyField = async function (damage, modifiers) {
    const shield = this.parent?.getFlag?.(MODULE_ID, SHIELD_FLAG);
    const actor = this.parent?.actor;
    if (!shield || !actor) return original.call(this, damage, modifiers);

    return absorb.call(this, actor, shield, damage, modifiers);
  };

  patched = true;
}

/**
 * Питать щит этим попаданием — или не питать.
 *
 * Спрашиваем всегда, когда есть чем платить: Заряд невосполним, и три царапины
 * не должны молча съесть то, что отложено на выстрел из мельты. Отказ оставляет
 * щит поднятым — жрец просто принял удар на себя.
 */
async function absorb(actor, shield, damage, modifiers) {
  const perCharge = Math.max(1, Number(shield.perCharge) || 10);
  const needed = chargeFor(damage, perCharge);
  const available = readBlock(actor).energy.value;

  if (available <= 0) {
    await burst(actor, shield, 0);
    return damage;
  }

  const spend = Math.min(needed, available);
  const absorbed = Math.min(damage, spend * perCharge);

  const feed = await foundry.applications.api.DialogV2.confirm({
    window: { title: this.parent.name },
    content: `<p>${game.i18n.format("NAVIS.Techno.ShieldPrompt", {
      damage, spend, needed, absorbed
    })}</p>` + (spend < needed ? `<p><strong>${game.i18n.localize("NAVIS.Techno.ShieldWillBurst")}</strong></p>` : "")
  });
  if (!feed) return damage;

  await spendFrom(actor, "energy", spend);
  if (modifiers instanceof Array) {
    modifiers.push({ value: -absorbed, label: this.parent.name });
  }

  if (spend < needed) await burst(actor, shield, absorbed);
  else ui.notifications.info(game.i18n.format("NAVIS.Techno.ShieldAbsorbed", { absorbed, spend }));

  return damage - absorbed;
}

/** Щит лопнул: сообщить, погасить Процесс, убрать поле. */
async function burst(actor, shield, absorbed) {
  ui.notifications.warn(game.i18n.format("NAVIS.Techno.ShieldBurst", { absorbed }), { permanent: true });

  // Процесс гасится через свой модуль, чтобы список Процессов и щит не разошлись.
  const { dropProcess } = await import("./processes.js");
  if (shield.sourceId) await dropProcess(actor, shield.sourceId);
  await lowerShield(actor);
}
