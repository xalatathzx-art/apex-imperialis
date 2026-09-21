import {
  displaySpecialisationName, ownedSpecialisation, rollSpecialisation, specialisationCatalogue
} from "./skill-specialisations.js";
import { matchesSkillSearch } from "./skill-search.js";
import { usesNpcSheet } from "./refit.js";

const MODULE_ID = "apex-imperialis";
const MARK = "navis-bar-readout";
const TWF_MARK = "navis-twf-off";
const PICK_MARK = "navis-spec-pick";
const SEARCH_MARK = "navis-skill-search";

/** A client-only filter: it never changes the sheet data or its roll handlers. */
function skillSearch(element) {
  const tab = element.querySelector('.tab[data-tab="skills"]');
  const list = tab?.querySelector(":scope > .sheet-list.skills");
  if (!tab || !list || tab.querySelector(`.${SEARCH_MARK}`)) return;

  const search = document.createElement("label");
  search.className = SEARCH_MARK;
  search.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
  const input = document.createElement("input");
  input.type = "search";
  input.autocomplete = "off";
  input.placeholder = game.i18n.localize("NAVIS.SkillSearch.Placeholder");
  input.setAttribute("aria-label", game.i18n.localize("NAVIS.SkillSearch.Label"));
  search.append(input);

  const filter = () => {
    for (const row of list.querySelectorAll('.list-content > .list-row[data-key]')) {
      row.hidden = !matchesSkillSearch(input.value, [row.textContent]);
    }
  };
  input.addEventListener("input", filter);
  input.addEventListener("keydown", event => {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      filter();
      event.stopPropagation();
    }
  });
  list.before(search);
}

/**
 * Цифры на полосе нагрузки.
 *
 * Система рисует полосу без единой цифры: видно только, что закрашено и где
 * стоит риска порога. Сколько несёшь и сколько можешь — не видно, а от этого
 * зависят Перегрузка (помеха на Ловкость и скорость на ступень ниже) и
 * Обездвижен при двойном пределе.
 */
function encumbranceReadout(element, actor) {
  // Пишем внутрь самой полосы: подпись снизу отрывалась от неё и разваливала строку.
  const container = element.querySelector('.tab[data-tab="equipment"] .bar-section .bar-container');
  const encumbrance = actor?.system?.encumbrance;
  if (!container || !encumbrance || container.querySelector(`.${MARK}`)) return;

  const value = Number(encumbrance.value) || 0;
  const limit = Number(encumbrance.overburdened) || 0;
  const max = Number(encumbrance.restrained) || 0;
  const state = Number(encumbrance.state) || 0;

  // На полосе только цифры. Что означает состояние — в подсказке: словами
  // строка выходила длинной и перекрывала саму полосу.
  const note = document.createElement("div");
  note.className = `${MARK} state${state}`;
  note.innerHTML = `<b>${value} / ${limit}</b>`;
  note.dataset.tooltip = `${game.i18n.localize(`NAVIS.Encumbrance.state${Math.min(state, 2)}`)}`
    + ` · ${game.i18n.format("NAVIS.Encumbrance.restrainedAt", { max })}`;
  container.append(note);
}

/**
 * Бой двумя оружиями всегда на виду — и у персонажа, и у НИП.
 *
 * Система рисует эту кнопку только под `{{#if canUseTWF}}` — без подходящей
 * пары в руках её просто нет, и непонятно, существует ли приём вообще.
 * Добавляем затенённую заглушку: место в ряду занято, а нажать нельзя.
 *
 * Кладём её в ряд «Атака», куда `ACTION_GROUPS` в refit.js и определяет `twf`,
 * — рядом с Перехватом, а не отдельной строкой снизу. Если скин выключен и
 * рядов нет, падаем обратно в общий список действий.
 *
 * Список ищем по самому классу, а не внутри вкладки: у персонажа действия
 * лежат во вкладке «Бой», а у НИП — в «Основном», и привязка к `combat`
 * означала, что у НИП заглушки не было вовсе. Список на листе один.
 */
function twoWeaponPlaceholder(element, labels) {
  const list = element.querySelector(".action-list");
  // Пока действие уже выбрано, система показывает только его — не мешаем.
  if (!list || list.querySelector(".current-action")) return;
  if (list.querySelector('[data-action-key="twf"]') || list.querySelector(`.${TWF_MARK}`)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = `action ${TWF_MARK}`;
  button.disabled = true;
  button.dataset.actionKey = "twf";
  button.textContent = labels.short || game.i18n.localize("IMPMAL.TwoWeaponFighting");
  button.dataset.tooltip = game.i18n.localize("NAVIS.Combat.TwfUnavailable");

  const attackRow = list.querySelector(".navis-action-row");
  (attackRow ?? list).append(button);
}

/**
 * Все специализации умения — обычными строками под ним, как купленные.
 *
 * Ведущему за столом важно видеть, что вообще можно попросить: «кинь обоняние»
 * живее, чем «кинь бдительность». Поэтому некупленные показываются в том же
 * виде, что и свои, только приглушённо — лист читается одинаково.
 *
 * Предметы при этом не создаются: `setupSkillTest({ key, name })` бросает
 * специализацию по имени. Купленная бросается по своему предмету, иначе
 * потерялись бы продвижения.
 */
async function specialisationPicker(element, actor) {
  const rows = element.querySelectorAll('.tab[data-tab="skills"] .list-row[data-key]');
  if (!rows.length || !actor.isOwner) return;
  const catalogue = await specialisationCatalogue();

  for (const row of rows) {
    const skill = row.dataset.key;
    const names = catalogue[skill];
    const ownedRows = [...row.querySelectorAll(`.row-content.specialisation:not(.${PICK_MARK})`)];
    const ownedItems = actor.system?.skills?.[skill]?.specialisations ?? [];
    ownedRows.forEach((line, index) => {
      line.classList.toggle("navis-spec-untrained", Number(ownedItems[index]?.system?.advances) === 0);
    });
    if (!names?.length || row.querySelector(`.${PICK_MARK}`)) continue;

    // Без продвижений значение специализации равно значению самого умения.
    const total = actor.system?.skills?.[skill]?.total ?? "";
    const owned = ownedRows.length;
    const fragment = document.createDocumentFragment();

    for (const [index, name] of names.entries()) {
      if (ownedSpecialisation(actor, skill, name)) continue;
      const line = document.createElement("div");
      line.className = `row-content specialisation ${PICK_MARK}`;
      if (!owned && index === 0) line.classList.add("first");
      line.innerHTML = `<a class="list-name">${displaySpecialisationName(name)}</a><div></div>`
        + `<div class="small">0</div>`
        + `<div class="small"><a class="roll">${total}</a></div>`
        + `<div class="list-controls"></div>`;
      line.addEventListener("click", () => rollSpecialisation(actor, skill, name));
      fragment.append(line);
    }
    row.append(fragment);
  }
  element.querySelector(`.${SEARCH_MARK} input`)?.dispatchEvent(new Event("input"));
}

/**
 * Базовая ширина листа персонажа.
 *
 * Ядро открывает лист в 540 px, и вкладки жмутся сильнее, чем нужно. Было 613,
 * стало 648: запас снимает тесноту. Ставим только при первом рендере — дальше окно
 * принадлежит игроку, и его правку мы не трогаем.
 *
 * Высоту не трогаем. Раньше здесь стояли 804 px — на четыре пикселя больше
 * системных восьмисот, то есть прибавка ни за чем; убрана как лишняя.
 *
 * Вкладку эффектов в клиенте Foundry это не вылечило: содержимое всё так же
 * встаёт по месту только от ручного сдвига окна, а в браузере не съезжает
 * вовсе. Причина, стало быть, не в высоте, и остаётся неразобранной — держим
 * это в виду, если симптом станет мешать. Пока лечится запасом ширины.
 */
const SHEET_SIZE = { width: 648 };

function baseSheetSize(sheet, options) {
  if (!options?.isFirstRender || sheet?.document?.type !== "character") return;
  sheet.setPosition({ ...SHEET_SIZE });
}

export function registerSheetBars() {
  Hooks.on("renderActorSheetV2", (sheet, element, _context, options) => {
    const type = sheet?.document?.type;
    // Фамильяр — свой тип актёра на анкете НИП, поэтому ряд действий ищется
    // по разметке листа, а не по типу документа.
    if (type !== "character" && !usesNpcSheet(element)) return;

    // Ряд действий есть у обоих листов, остальное — только у персонажа:
    // у НИП нет ни полосы нагрузки, ни умений с их специализациями.
    twoWeaponPlaceholder(element, { short: game.i18n.localize("NAVIS.Sheet.TwoWeaponShort") });
    if (type !== "character") return;

    baseSheetSize(sheet, options);
    encumbranceReadout(element, sheet.document);
    skillSearch(element);
    specialisationPicker(element, sheet.document);
  });
}
