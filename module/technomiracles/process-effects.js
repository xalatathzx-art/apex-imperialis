/**
 * Эффекты, которые живут ровно столько, сколько идёт Процесс.
 *
 * Большинство поддерживаемых техночудес — это прибавка к характеристике,
 * скорости, броне или Преимущество на какой-то род проверок. Всё это Foundry
 * умеет сам, активными эффектами, и правило перевода велит брать готовое, а не
 * городить своё: у нас уже дважды написан этот же приём — гравитация и лучевая
 * болезнь правят характеристики именно так.
 *
 * Поэтому чудо просто НЕСЁТ на себе активные эффекты с `transfer: false`. Пока
 * чудо лежит на листе, они не действуют; Процесс их надевает, гашение снимает.
 *
 * Почему не `transfer: true`. Тогда эффект включался бы от одного наличия чуда
 * на листе — то есть жрец получал бы прибавку, ничего не активировав и не
 * заплатив. Вся суть подсистемы в том, что за прибавку платят.
 *
 * Щит идёт другим путём (module/technomiracles/shield.js), и это не
 * непоследовательность: щит — не прибавка, а силовое поле, у impmal для него
 * есть свой тип документа, и правило велит брать именно его.
 */

const MODULE_ID = "navis-apexialis";
const FROM_FLAG = "processEffect";

/** Эффекты, которые это чудо надевает на время Процесса. */
export function effectsOf(item) {
  return [...(item?.effects ?? [])].filter(effect => !effect.disabled);
}

/** Уже надетое этим чудом. */
const wornFrom = (actor, itemId) =>
  [...(actor?.effects ?? [])].filter(
    effect => effect.getFlag?.(MODULE_ID, FROM_FLAG)?.sourceId === itemId
  );

/**
 * Надеть эффекты чуда.
 *
 * Сперва снимаем своё же старое: повторная активация не должна складывать
 * прибавку сама с собой. «Единственность» чуда проверяется в processes.js, но
 * полагаться на неё здесь нельзя — не всякое чудо помечено единственным.
 */
export async function applyProcessEffects(actor, item) {
  const effects = effectsOf(item);
  if (!effects.length) return;

  await clearProcessEffects(actor, item.id);

  const data = effects.map(effect => ({
    ...effect.toObject(),
    _id: undefined,
    origin: item.uuid,
    disabled: false,
    transfer: false,
    flags: {
      ...(effect.flags ?? {}),
      [MODULE_ID]: { ...(effect.flags?.[MODULE_ID] ?? {}), [FROM_FLAG]: { sourceId: item.id } }
    }
  }));

  await actor.createEmbeddedDocuments("ActiveEffect", data);
}

/** Снять эффекты, надетые этим чудом. */
export async function clearProcessEffects(actor, itemId) {
  const worn = wornFrom(actor, itemId);
  if (!worn.length) return;
  await actor.deleteEmbeddedDocuments("ActiveEffect", worn.map(effect => effect.id));
}
