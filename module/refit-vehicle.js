/**
 * Apex Imperialis — лист техники.
 *
 * Правила те же, что у остальных пасов: каждый идемпотентен, помечает то, что
 * забрал, и переносит узлы самой impmal (поля, ссылки, кнопки), а не создаёт
 * их заново — иначе отвалились бы отправка формы и все `data-action`.
 *
 * Лист техники собран из тех же кирпичей, что лист НИП: `.attribute-box`,
 * `.sheet-list`, `.action-list`, строки оружия с `.weapon-aux`. Поэтому здесь
 * почти нет своей разметки — пас сводит показатели в одну полосу и отдаёт
 * оружие общей функции `refitWeaponRow`, которой уже пользуются обе анкеты.
 */

import { claim, el, refitTraits, refitWeaponRow, weaponLabels } from "./refit.js";

/* ══ ШАПКА ═════════════════════════════════════════════════════════════════ */

/**
 * Показатели машины — одной полосой.
 *
 * impmal раскладывает их двумя рядами по три ящика, причём в ящике брони сидят
 * сразу два поля со своими подписями. Ряды живут в отдельных flexrow, поэтому
 * «Категория» и «Экипаж» стоят в разных сетках и их ширины не совпадают.
 *
 * Пас разбирает ящики на пары «подпись ↔ поле» и собирает из них одну сетку:
 * семь показателей в ряд, подпись над значением. Ящик брони даёт две пары, и
 * это ровно то, что нужно — лоб и корма становятся самостоятельными колонками.
 */
export function refitVehicleStats(header, labels = {}) {
  const short = labels.shortVehicleCaps ?? {};
  const rows = [...header.querySelectorAll(".attribute-row")];
  if (!rows.length) return;

  const strip = el("div", "navis-veh-stats");

  for (const row of rows) {
    if (!claim(row)) continue;

    for (const box of row.querySelectorAll(":scope > .attribute-box")) {
      const captions = [...box.querySelectorAll(":scope > .label")];
      const fields = [...box.querySelectorAll(":scope > .field")];

      // Пар ровно столько, сколько полей: подпись без поля ничего не показывает,
      // а поле без подписи — и не должно случаться, но если случится, встанет
      // безымянной колонкой, а не потеряется.
      fields.forEach((field, index) => {
        const cell = el("div", "navis-veh-stat");
        const caption = captions[index];
        const label = caption?.querySelector("label");

        // Шестерёнка настройки брони — ссылка, а не текст: её переносим целиком,
        // иначе клик по ней перестанет открывать окно.
        const control = label?.querySelector("a");
        const text = (label?.textContent ?? "").trim();

        // Длинную подпись подменяем короткой, а полную отдаём подсказке:
        // «Броня спереди» — это 78 px над двузначным числом.
        const cap = el("span", "navis-veh-cap", short[text] ?? text);
        if (short[text]) cap.dataset.tooltip = text;
        if (control) cap.append(control);
        cell.append(cap, ...field.children);
        strip.append(cell);
      });
    }

    row.classList.add("navis-emptied");
  }

  if (!strip.children.length) return;
  rows[0].before(strip);
}

export function refitVehicleHeader(header, labels = {}) {
  if (!claim(header)) return;
  header.classList.add("navis-vehicle-header");

  const sheetHeader = header.querySelector("header.sheet-header");
  sheetHeader?.classList.add("navis-veh-nameplate");

  refitVehicleStats(header, labels);
}

/* ══ ОСНОВНАЯ ВКЛАДКА ══════════════════════════════════════════════════════ */

/**
 * Действия машины.
 *
 * Группировать их, как у НИП, нечем: у импала есть разбивка боевых действий по
 * назначению, а у действий техники её нет — и придумывать свою значило бы
 * решать за ведущего, что тут атака, а что манёвр. Поэтому строй остаётся
 * плоским, а работа паса в другом: правило при наведении ставится всплывающей
 * подсказкой с разметкой, иначе Foundry покажет сырой HTML одной строкой.
 */
export function refitVehicleActions(list) {
  if (!claim(list)) return;
  list.classList.add("navis-veh-actions");

  for (const button of list.querySelectorAll(":scope > button.action")) {
    if (button.dataset.tooltip?.includes("<")) button.dataset.tooltipClass = "navis-rule-tip";
  }
}

/**
 * Список с людьми на борту: экипаж или пассажиры.
 *
 * Внутри такого списка лежат и стволы — impmal кладёт их вложенным
 * `.list-content.weapons` в том же `.sheet-list`. Их забирает общая функция
 * строки оружия, а сам блок помечается `navis-armament`, потому что ширины
 * колонок заданы переменными на нём.
 */
export function refitVehicleActors(sheetList, labels = {}) {
  if (!claim(sheetList)) return;
  sheetList.classList.add("navis-veh-roster");

  const weapons = sheetList.querySelector(".list-content.weapons");
  if (weapons) {
    weapons.classList.add("navis-armament");
    const rows = weapons.querySelectorAll(":scope > .list-row");
    const arm = weaponLabels(labels);
    for (const row of rows) refitWeaponRow(row, arm);

    // Шапку колонок убираем той же логикой, что и в бою у персонажа: «Урон» и
    // «Дальность» ничего не добавляют к «10» и «Дальняя», а строку занимают.
    // Заголовок «Оружие» при этом остаётся — он отделяет стволы от людей.
    const head = weapons.previousElementSibling;
    if (head?.classList.contains("list-header")) {
      const cells = [...head.children];
      for (const cell of cells.slice(1)) cell.classList.add("navis-emptied");
      head.classList.add("navis-veh-subhead");
    }
  }

  for (const head of sheetList.querySelectorAll(":scope > .list-header")) {
    head.classList.add("navis-veh-head");
  }
}

export function refitVehicleMain(main, labels = {}) {
  if (!claim(main)) return;
  main.dataset.navisRefit = "vehicle";

  const actions = main.querySelector(".action-list");
  if (actions) refitVehicleActions(actions);

  for (const list of main.querySelectorAll(":scope > .sheet-list")) {
    if (list.classList.contains("vehicle-actors")) refitVehicleActors(list, labels);
    else if (list.classList.contains("traits")) refitTraits(list, labels);
  }
}

/** Все пасы листа техники. */
export function refitVehicleSheet(root, labels = {}) {
  const header = root.querySelector('[data-application-part="header"], header.sheet-header');
  if (header) refitVehicleHeader(header, labels);

  const main = root.querySelector('section.tab[data-tab="main"]');
  if (main) refitVehicleMain(main, labels);
}
