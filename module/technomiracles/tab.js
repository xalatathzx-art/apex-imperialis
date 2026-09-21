/**
 * Вкладка «Техночудеса» на листе персонажа.
 *
 * impmal уже прячет свою вкладку психосил у того, у кого психосил нет:
 *
 *     _prepareTabs(options) {
 *         let tabs = super._prepareTabs(options);
 *         if (this.actor.itemTypes.power.length == 0) delete tabs.powers;
 *         return tabs;
 *     }
 *
 * Значит, условная вкладка — не механизм, который мы изобретаем, а тот, к
 * которому мы присоединяемся. Наша запись подмешивается в статические PARTS и
 * TABS класса листа, а тот же метод оборачивается, чтобы убирать вкладку, когда
 * чудес у актёра нет.
 *
 * Обёртка повторяет приём из module/horde/horde-combat.js: найти того, кому
 * метод действительно принадлежит, сохранить оригинал, пропатчить один раз.
 * Втыкать вкладку в DOM вместо этого значило бы вынести её за пределы
 * собственных групп приложения и заново писать переключение вкладок.
 *
 * Все числа для шаблона считаются здесь. Своего Handlebars-помощника модуль не
 * заводит: глобальное имя вроде `multiply` рискует столкнуться с чужим модулем,
 * а проценты одинаково легко посчитать в контексте.
 */

import { TECHNOMIRACLE_TYPE } from "./model.js";
import { readBlock } from "./resources.js";
import { dropProcess } from "./processes.js";
import { activateMiracle } from "./activate.js";
import { upkeepTotal } from "./rules.js";

const MODULE_ID = "apex-imperialis";
const TAB = "technomiracles";
const TEMPLATE = `modules/${MODULE_ID}/templates/actor/technomiracles.hbs`;

let patched = false;

/** Класс листа персонажа, который зарегистрировала impmal, либо null. */
function characterSheetClass() {
  const registered = CONFIG.Actor.sheetClasses?.character ?? {};
  return Object.values(registered).find(entry => entry?.cls)?.cls ?? null;
}

/** Дойти до того, кому `_prepareTabs` действительно принадлежит. */
function ownerOf(cls, method) {
  let proto = cls?.prototype;
  while (proto && !Object.prototype.hasOwnProperty.call(proto, method)) {
    proto = Object.getPrototypeOf(proto);
  }
  return proto;
}

export function registerTechnoMiracleTab() {
  if (patched) return;

  const cls = characterSheetClass();
  if (!cls) {
    console.error(
      `${MODULE_ID} | no impmal character sheet is registered, so the Techno-miracles tab cannot be added.`
    );
    return;
  }

  const tabsProto = ownerOf(cls, "_prepareTabs");
  if (!tabsProto) {
    console.error(
      `${MODULE_ID} | impmal's character sheet no longer defines _prepareTabs; `
      + "the Techno-miracles tab cannot be added."
    );
    return;
  }

  cls.PARTS[TAB] = { scrollable: [""], template: TEMPLATE };
  cls.TABS[TAB] = { id: TAB, group: "primary", label: "NAVIS.Techno.Tab" };

  const originalTabs = tabsProto._prepareTabs;
  tabsProto._prepareTabs = function (options) {
    const tabs = originalTabs.call(this, options);
    if (carriesMiracle(this.actor)) return tabs;
    delete tabs[TAB];
    return tabs;
  };

  patchParts(cls);

  patchContext(cls);
  wireClicks();
  patched = true;
}

/** Носит ли актёр хоть одно техночудо. */
function carriesMiracle(actor) {
  return (actor?.itemTypes?.[TECHNOMIRACLE_TYPE]?.length ?? 0) > 0;
}

/**
 * Не рисовать нашу часть, когда чудес нет.
 *
 * Убрать запись из `_prepareTabs` мало: это снимает только кнопку вкладки, а
 * сама часть продолжает отрисовываться. Без своей вкладки её раздел получает
 * пустой `data-tab`, выпадает из групп приложения и висит на листе всегда —
 * Когниция и Заряд оказывались на виду у персонажа, который к Механикум не имеет
 * отношения. Какие части рисовать, решает `_configureRenderParts`.
 */
function patchParts(cls) {
  const proto = ownerOf(cls, "_configureRenderParts");
  if (!proto) {
    console.error(
      `${MODULE_ID} | no _configureRenderParts to wrap, so the Techno-miracles part would render `
      + "even for actors with no miracles."
    );
    return;
  }

  const original = proto._configureRenderParts;
  proto._configureRenderParts = function (options) {
    const parts = original.call(this, options);
    if (parts?.[TAB] && !carriesMiracle(this.actor)) delete parts[TAB];
    return parts;
  };
}

/** Подать шаблону то, что ему нужно, поверх того, что уже готовит impmal. */
function patchContext(cls) {
  const proto = ownerOf(cls, "_prepareContext") ?? cls.prototype;
  const original = proto._prepareContext;

  proto._prepareContext = async function (options) {
    const context = await original.call(this, options);
    if (this.actor?.type !== "character") return context;

    const block = readBlock(this.actor);
    const miracles = this.actor.itemTypes[TECHNOMIRACLE_TYPE] ?? [];
    const owned = new Set(this.actor.items.filter(i => i.type === "augmetic").map(i => i.name));
    const committed = upkeepTotal(block.processes);
    const max = block.cognition.max || 0;

    context.techno = {
      cognition: block.cognition,
      energy: block.energy,
      processes: block.processes,

      // Ширина заливки — сколько Когниции осталось.
      fill: max ? Math.round((block.cognition.value / max) * 100) : 0,
      // Беспокойство полосы — сколько ёмкости расписано по Процессам. Именно
      // это и тревожно: свободной Когниции нет, а счёт придёт в начале хода.
      level: max ? Math.min(1, committed / max) : 0,
      committed: committed > 0 && committed >= block.cognition.value,

      // Ячейки Заряда: он не течёт, а тратится штучно, как патроны.
      charge: Array.from({ length: block.energy.max || 0 }, (_, i) => i < block.energy.value),

      // Чудеса по школам — как их печатает книга.
      schools: groupBySchool(miracles, owned)
    };

    return context;
  };
}

/** `[{ name, miracles: [{ id, name, ready, missing }] }]`, школы по алфавиту. */
function groupBySchool(miracles, owned) {
  const groups = new Map();

  for (const item of miracles) {
    const missing = (item.system.hardware ?? []).filter(name => !owned.has(name));
    const school = item.system.school?.trim() || "";
    if (!groups.has(school)) groups.set(school, []);
    groups.get(school).push({
      id: item.id,
      name: item.name,
      img: item.img,
      cost: item.system.cost,
      sustains: item.system.process.sustains,
      ready: missing.length === 0,
      missing: missing.join(", ")
    });
  }

  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, list]) => ({
      name,
      miracles: list.sort((a, b) => a.name.localeCompare(b.name))
    }));
}

/**
 * Нажатия внутри вкладки.
 *
 * Слушатель вешается на саму вкладку и делегирует: лист перерисовывается от
 * любого изменения, и обработчики на каждой кнопке пришлось бы навешивать
 * заново каждый раз.
 */
function wireClicks() {
  Hooks.on("renderActorSheetV2", (app, element) => {
    const host = element.querySelector(`section.tab[data-tab="${TAB}"]`);
    if (!host || host.dataset.navisWired) return;
    host.dataset.navisWired = "1";

    host.addEventListener("click", async event => {
      const activate = event.target.closest("[data-navis-activate]");
      if (activate) {
        const item = app.actor.items.get(activate.dataset.navisActivate);
        if (item) await activateMiracle(app.actor, item);
        return;
      }

      const drop = event.target.closest("[data-navis-drop]");
      if (drop) await dropProcess(app.actor, drop.dataset.navisDrop);
    });
  });
}
