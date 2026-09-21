/**
 * Пояснения к талантам NPC основной книги — то, как талант работает у этого
 * существа. Названия талантов уже переведены; здесь только описания.
 *
 * impmal местами копирует пояснение одного NPC другим: «Санкционированный
 * псайкер» у астропата говорит о псайкере-примарисе, «Псайкер» у всех трёх
 * ужасов — о серном ужасе, «Пустотные ноги» у капитана — об оруженосце. Это
 * огрехи оригинала; перевод повторяет текст как есть, чтобы не сочинять правил.
 */

export const label = "Актёры (Основная книга)";

const FRIGHTENED = "@UUID[JournalEntry.DjxnvYJajGflu7IY.JournalEntryPage.Tu0sU1bo9eZI6qoe#frightened]{Страх}";

const SANCTIONED = { "Sanctioned Psyker": { description: "<p>Порог Варпа псайкера-примариса равен удвоенному бонусу Силы воли.</p>" } };
const HORROR = { Psyker: { description: "<p>Серный ужас знает психосилу «Психический удар». Будучи демоном, он не имеет порога Варпа.</p>" } };
const VOID_LEGS = { "Void Legs": { description: "<p>Оруженосец не получает помехи от условий, свойственных пустоте, — например, качки корабля или невесомости.</p>" } };

export const entries = {
  "4neMMGpoX4oC0yOt": { items: SANCTIONED },
  QiMSgysDqIaNjdGp: { items: SANCTIONED },
  Voy7lhLzRunxvWkM: { items: SANCTIONED },
  vaqtX7WfPsT0Y8NR: { items: SANCTIONED },
  "5a6Q3NRdPonZjiGr": {
    items: {
      Martyrdom: {
        description: `<p>Когда убийца из культа смерти получает одну или больше ран, он избавляется от состояния ${FRIGHTENED}, если оно у него было. Союзники в состоянии ${FRIGHTENED} на короткой дистанции, которые видят убийцу, могут немедленно за свободное действие пройти проверку Дисциплины (Страх) с преимуществом. Преуспевшие больше не находятся в состоянии ${FRIGHTENED}.</p>`
      }
    }
  },
  Boq9jjqKp2eDcVe8: { items: HORROR },
  CAvzgSBWrbnHu8zi: { items: HORROR },
  jPEYTvQIqOBwHU6q: { items: HORROR },
  ipcjevVXtDR4XkNu: { items: VOID_LEGS },
  kYpTOdUezMczq5eC: { items: VOID_LEGS },
  pXsZLEawZr8Tf8Ym: { items: VOID_LEGS },
  vds8HRa533wcv1Pq: {
    items: { "Data Delver": { description: "<p>Адепт Администратума получает преимущество в проверках, предпринятых, чтобы найти или извлечь сведения из документа или архива (бумажного или цифрового).</p>" } }
  },
  xHzo06YI2vDu4kM0: {
    items: { Deadeye: { description: "<p>Когда альдарский странник совершает действие Прицеливание, он получает +1 КУ к проверке стрелковой атаки.</p>" } }
  }
};
