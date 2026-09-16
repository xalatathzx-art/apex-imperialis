import { MODULE_ID, EXPOSURE_FLAG } from "../environment/environment-data.js";
import { environmentSnapshot } from "../environment/environment-derived.js";
import { adjustRadiationDose, buildBiomonitorModel, biomonitorThreats } from "./biomonitor-data.js";
import { BODY_HIT_ZONES, BODY_ORGAN_LAYERS, BODY_SCAN_LAYERS, implantTint } from "./biomonitor-body.js";
import { openSurgeon } from "../implants/surgeon-app.js";

export const BIOMONITOR_CLASS = "navis-biomonitor";
const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const t = key => game.i18n.localize(`NAVIS.Biomonitor.${key}`);
const items = list => list.length ? list.map(item => `<a data-document-id="${item.id}">${escape(item.name)}</a>`).join("") : `<span class="empty">${t("None")}</span>`;
// Импланты — те же ссылки, но окрашенные по категории: на фигуре и в списке
// один и тот же цвет, и родная аугметика с ними не путается.
const implantItems = list => list.map(item => `<a class="navis-implant-link" data-document-id="${item.id}" style="--navis-implant-tint:${implantTint(item.system?.category)}">${escape(item.name)}</a>`).join("");
const augmeticCount = model => model.augmetics.length + model.implants.length;

function bodyScan(model) {
  const state = key => {
    const zone = model.zones.find(entry => entry.key === key);
    return zone.criticals.length ? "critical" : zone.injuries.length ? "injured" : (zone.augmetics.length || zone.implants.length) ? "augmetic" : "";
  };
  const anatomy = BODY_SCAN_LAYERS.map(layer => `<i class="body-layer ${state(layer.zone)}" data-layer="${layer.zone}" style="--mask:url('${layer.src}')"></i>`).join("");
  const organs = BODY_ORGAN_LAYERS.map(layer => `<i class="organ-layer ${layer.key}" style="--mask:url('${layer.src}')"></i>`).join("");
  // Намеренно span, а не button: Foundry красит кнопки своим фоном, и зоны
  // закрывали фигуру чёрными прямоугольниками.
  const hits = BODY_HIT_ZONES.map(hit => `<span class="navis-body-hit" role="button" tabindex="0" data-zone="${hit.zone}" style="--x0:${hit.x0}%;--y0:${hit.y0}%;--x1:${hit.x1}%;--y1:${hit.y1}%" aria-label="${escape(game.i18n.localize(`NAVIS.Location.${hit.zone}`))}"></span>`).join("");
  return `<div class="navis-body-frame"><span class="scan-index">BIO/06</span><div class="navis-body-photo">${anatomy}${organs}<i class="body-scan-line"></i></div>${hits}</div>`;
}

function ecg(model) {
  const paths = {
    stable: "M0 40 L18 40 L24 34 L30 40 L38 40 L43 57 L49 8 L56 51 L63 40 L79 40 L88 30 L98 40 L118 40 L124 34 L130 40 L138 40 L143 57 L149 8 L156 51 L163 40 L179 40 L188 30 L198 40 L218 40 L224 34 L230 40 L238 40 L243 57 L249 8 L256 51 L263 40 L279 40 L288 30 L300 40",
    wounded: "M0 40 L12 40 L18 34 L24 40 L29 55 L34 12 L40 50 L47 40 L58 40 L65 28 L74 40 L88 40 L94 34 L100 40 L105 55 L110 12 L116 50 L123 40 L134 40 L141 28 L150 40 L164 40 L170 34 L176 40 L181 55 L186 12 L192 50 L199 40 L210 40 L217 28 L226 40 L240 40 L246 34 L252 40 L257 55 L262 12 L268 50 L275 40 L286 40 L293 28 L300 40",
    severe: "M0 40 L9 40 L14 34 L19 40 L23 53 L27 17 L32 49 L38 40 L47 40 L53 29 L60 40 L69 40 L74 34 L79 40 L83 53 L87 17 L92 49 L98 40 L107 40 L113 29 L120 40 L129 40 L134 34 L139 40 L143 53 L147 17 L152 49 L158 40 L167 40 L173 29 L180 40 L189 40 L194 34 L199 40 L203 53 L207 17 L212 49 L218 40 L227 40 L233 29 L240 40 L249 40 L254 34 L259 40 L263 53 L267 17 L272 49 L278 40 L287 40 L293 29 L300 40",
    // Агония: редкие комплексы малой амплитуды — персонаж ещё жив.
    critical: "M0 40 L40 40 L46 36 L52 40 L58 40 L62 49 L67 24 L72 46 L78 40 L140 40 L146 36 L152 40 L158 40 L162 49 L167 24 L172 46 L178 40 L240 40 L246 36 L252 40 L258 40 L262 49 L267 24 L272 46 L278 40 L300 40",
    dead: "M0 40 L300 40"
  };
  const path = paths[model.status.key] ?? paths.stable;
  return `<section class="navis-bio-ecg ${model.status.key}">
    <header><span>${t("CardioMonitor")}</span><b>${t(model.status.key)}</b></header>
    <div class="ecg-screen"><svg viewBox="0 0 300 80" preserveAspectRatio="none"><path class="ecg-base" d="${path}"/><path class="ecg-lead" d="${path}"/></svg></div>
  </section>`;
}

function threatList(model) {
  const threats = biomonitorThreats(model);
  if (threats.empty) return `<p class="navis-clear"><i class="fa-solid fa-shield-heart"></i>${t("None")}</p>`;
  return threats.entries.map(({ document, kind }) => `<a class="threat ${kind}" data-document-id="${document.id}"><i></i>${escape(document.name)}</a>`).join("");
}

// Пока участок не выбран, карточка показывает аугметику без привязки к телу —
// иначе имплант, которому не проставили зону, не виден в мониторе нигде.
function zoneDefault(model) {
  const internal = [...model.internalAugmetics, ...model.internalImplants];
  if (!internal.length) return `<h4>${t("BodyZone")}</h4><p class="navis-clear">${t("SelectZone")}</p>`;
  return `<h4>${t("Internal")}</h4>${items(model.internalAugmetics)}${implantItems(model.internalImplants)}`;
}

// Заголовок фигуры — это и есть вход в Хирургеон для владельца/ГМ: кнопка
// открывает отдельное окно, монитор от этого не становится редактируемым,
// ставит и снимает импланты сам Хирургеон. У остальных — просто подпись.
function figureTitle(actor) {
  if (actor?.isOwner || game.user?.isGM) {
    const label = escape(game.i18n.localize("NAVIS.Surgeon.Title"));
    return `<button type="button" data-action="surgeon" data-tooltip="${label}">◄ ${label} ►</button>`;
  }
  return `<b>◄ ${t("BioScan")} ►</b>`;
}

function markup(model, actor) {
  const e = model.environment;
  return `<section class="${BIOMONITOR_CLASS}" data-actor-id="${model.actorId}">
    <div class="navis-biomonitor-detail">
      <div class="navis-bio-main">
        <section class="navis-bio-figure"><header>${figureTitle(actor)}<span>SUBJECT // ${escape(model.name)}</span></header><div class="navis-body-scan">${bodyScan(model)}</div><footer><span>● ${t("Flesh")}</span><span>◇ ${t("Augmetics")}: ${augmeticCount(model)}</span></footer></section>
        <div class="navis-bio-side">
          ${ecg(model)}
          <div class="navis-bio-vitals">
            <span><b>${model.effects.length}</b><small>${t("Conditions")}</small></span><span><b>${model.injuries.length}</b><small>${t("Injuries")}</small></span><span><b>${model.criticalItems.length}</b><small>${t("Criticals")}</small></span><span><b>${augmeticCount(model)}</b><small>${t("Augmetics")}</small></span>
          </div>
          <article class="navis-bio-threats"><h4>${t("Conditions")}</h4>${threatList(model)}</article>
          <article class="zone-detail">${zoneDefault(model)}</article>
        </div>
      </div>
      <footer class="navis-bio-telemetry">
        <span><i class="fa-solid fa-temperature-half"></i><small>${t("Temperature")}</small><b>${e.temperature}°C</b></span>
        <span><i class="fa-solid fa-weight-hanging"></i><small>${t("Gravity")}</small><b>${e.gravity}G</b></span>
        <span class="${e.radiation >= 7 ? "danger" : ""}"><i class="fa-solid fa-radiation"></i><small>${t("Radiation")}</small><b>${e.radiation}</b></span>
        <span><i class="fa-solid fa-lungs"></i><small>${t("Atmosphere")}</small><b>${escape(t(e.atmosphere.type))}</b></span>
        <span class="dose"><i class="fa-solid fa-dna"></i><small>${t("Dose")}</small><button type="button" data-action="dose" data-delta="-1">−</button><b>${e.radiationDose}</b><button type="button" data-action="dose" data-delta="1">+</button></span>
      </footer>
      </div>
  </section>`;
}

async function adjustDose(actor, delta) {
  if (!(actor.isOwner || game.user.isGM)) return;
  const exposure = structuredClone(actor.getFlag(MODULE_ID, EXPOSURE_FLAG) ?? {});
  exposure.radiationDose = adjustRadiationDose(exposure.radiationDose, delta);
  await actor.setFlag(MODULE_ID, EXPOSURE_FLAG, exposure);
}

// Хит-зона и слой — разные элементы, поэтому наведение и выбор части тела
// переносятся на слой вручную.
function markZone(monitor, key, className) {
  monitor.querySelectorAll(`.navis-body-hit, .body-layer`).forEach(node => {
    const zone = node.dataset.zone ?? node.dataset.layer;
    node.classList.toggle(className, zone === key);
  });
}

export function renderBiomonitor(_sheet, root, actor) {
  if (!root || actor?.type !== "character" || root.querySelector(`.${BIOMONITOR_CLASS}`)) return;
  const main = root.querySelector('section.tab[data-tab="main"]');
  const influence = main?.querySelector(":scope > .sheet-list.influence, :scope > .navis-influence");
  if (!main || !influence) return;
  const model = buildBiomonitorModel(actor, environmentSnapshot(actor));
  influence.insertAdjacentHTML("afterend", markup(model, actor));
  const monitor = influence.nextElementSibling;
  monitor.addEventListener("pointerover", event => {
    const hit = event.target.closest(".navis-body-hit");
    markZone(monitor, hit?.dataset.zone ?? null, "hot");
  });
  monitor.addEventListener("pointerleave", () => markZone(monitor, null, "hot"));
  monitor.addEventListener("click", event => {
    const documentLink = event.target.closest("[data-document-id]");
    if (documentLink) actor.items?.get?.(documentLink.dataset.documentId)?.sheet?.render(true);
    if (event.target.closest('[data-action="surgeon"]')) openSurgeon(actor);
    const dose = event.target.closest('[data-action="dose"]');
    if (dose) adjustDose(actor, Number(dose.dataset.delta));
    const zoneButton = event.target.closest(".navis-body-hit");
    if (zoneButton) {
      const zone = model.zones.find(entry => entry.key === zoneButton.dataset.zone);
      markZone(monitor, zoneButton.dataset.zone, "selected");
      const readout = `<div class="zone-armour"><span>${t("Armour")}</span><b>${zone.armour}</b></div>`
        + ((zone.augmetics.length + zone.implants.length) ? `<div class="zone-armour"><span>${t("Augmetics")}</span><b>${zone.augmetics.length + zone.implants.length}</b></div>` : "");
      monitor.querySelector(".zone-detail").innerHTML = `<h4>${escape(game.i18n.localize(`NAVIS.Location.${zone.key}`))}</h4>${readout}${items([...zone.injuries, ...zone.criticals, ...zone.augmetics])}${implantItems(zone.implants)}`;
    }
  });
}
