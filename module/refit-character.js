/**
 * Navis Apexialis — player character refit.
 *
 * The approved "Player sheet refit" proposal applied to impmal's character
 * sheet: the header, the tab strip, the Main tab and the Combat tab. Same rules
 * as refit.js — every pass is idempotent, claims what it touches, and moves
 * impmal's own nodes (inputs, links, buttons) instead of recreating them, so
 * form submission and every data-action keep working.
 *
 * The few figures the markup does not carry — an armour item's base value, a
 * wound's location, the critical wound maximum on the Combat tab — come from a
 * `data` object the caller builds from the actor, so these functions stay free
 * of Foundry globals.
 */

import { claim, el, clamp, refitActions } from "./refit.js";

/**
 * The Equipment tab is the only label too long for an eight-tab strip. The full
 * name goes to the tooltip, so nothing is lost; the caller supplies the short
 * one through `labels.shortTabs` so it follows the language.
 */
const SHORT_TAB = { equipment: "Equip." };
const SHORT_LOCATION = { rightArm: "R. arm", leftArm: "L. arm", rightLeg: "R. leg", leftLeg: "L. leg" };

const DEFAULTS = {
  advancement: "Advancement",
  total: "Total",
  startAdv: "Start · Adv",
  rollMutation: "Roll mutation",
  crits: "Crits",
  experience: "Experience",
  patron: "Patron",
  noPatron: "No patron",
  noPatronHint: "Drag a patron actor here to bind them.",
  influence: "Influence",
  standing: "Standing",
  group: "Group",
  armament: "Armament",
  equipped: "Equipped",
  weapon: "Weapon",
  grip: "Grip",
  skill: "Skill",
  damage: "Dmg",
  range: "Range",
  magazine: "Magazine",
  melee: "Melee",
  ranged: "Ranged",
  empty: "Empty",
  qty: "Qty",
  noWeapons: "No weapons equipped.",
  byLocation: "Armour by location",
  damageMarked: "Damage marked",
  of: "of",
  left: "L",
  right: "R",
  leftHand: "Left hand",
  rightHand: "Right hand",
  offHand: "Off hand",
  pickAmmo: "Ammunition…",
  species: "Species",
  subspecies: "Subspecies",
  removeSpecies: "Remove species",
  removeSubspecies: "Remove subspecies",
  dropSubspecies: "Drag one here",
  needsSpecies: "Needs a species first",
  suggestedRoles: "Suggested roles"
};

const number = input => Number(input?.value) || 0;
const inputNamed = (root, name) => root.querySelector(`[name="${name}"]`);
const boxOf = (root, name) => inputNamed(root, name)?.closest(".attribute-box");
const minus = value => `−${Math.abs(value)}`;
const signed = value => (value > 0 ? `+${value}` : value < 0 ? minus(value) : "0");

/** A row of pips: `count` cells, the first `filled` carrying `state`. */
function pips(count, filled, state, extra = "") {
  const row = el("div", `navis-pips ${extra}`.trim());
  for (let i = 0; i < clamp(count, 0, 10); i++) row.append(el("s", i < filled ? state : ""));
  return row;
}

/** A bullet bar: value against a scale, with an optional threshold tick. */
function bullet(fraction, extra = "", threshold = null) {
  const bar = el("div", `navis-bullet ${extra}`.trim());
  const fill = el("i");
  fill.style.setProperty("--navis-v", `${clamp(fraction * 100, 0, 100)}%`);
  bar.append(fill);
  if (threshold !== null) {
    const tick = el("span", "navis-thr");
    tick.style.setProperty("--navis-t", `${clamp(threshold * 100, 0, 100)}%`);
    bar.append(tick);
  }
  return bar;
}

/** A block header: brass caption left, anything else right. */
function blockHead(caption, ...right) {
  const head = el("div", "navis-block-hd");
  const controls = el("span", "navis-block-ctl");
  controls.append(...right.filter(Boolean));
  head.append(el("span", "navis-cap", caption), controls);
  return head;
}

/* ══ HEADER ════════════════════════════════════════════════════════════════ */

export function refitCharacterHeader(header, labels = {}) {
  if (!claim(header)) return;
  const L = { ...DEFAULTS, ...labels };
  header.classList.add("navis-character-header");

  const details = header.querySelector(".header-details");
  if (!details) return;

  // Origin, faction, role and species share one row of four.
  const rows = [...details.querySelectorAll(":scope > .details-row:not(.name)")];
  if (rows.length) {
    rows[0].classList.add("navis-idents");
    for (const row of rows.slice(1)) {
      rows[0].append(...row.children);
      row.classList.add("navis-emptied");
    }
  }

  // Advancement is how a player changes this sheet: it moves up beside the
  // name. The window's own control stays where it is.
  const name = details.querySelector(":scope > .details-row.name");
  if (name) {
    const link = el("a", "navis-advancement", L.advancement);
    link.dataset.action = "advancement";
    link.append(el("i", "fa-solid fa-chevron-up"));
    name.append(link);
  }
}

/** A filled slot: the item's name as a link, and an ✕ that takes it back off. */
function speciesSlot(wrap, entry, removeLabel) {
  const slot = el("div", "singleton-item");
  slot.dataset.id = entry.id;

  const link = el("a", "", entry.name);
  link.dataset.action = "editEmbedded";
  slot.append(link);

  const remove = el("a", "navis-species-unset");
  remove.dataset.action = "deleteEmbedded";
  remove.dataset.id = entry.id;
  remove.dataset.tooltip = removeLabel;
  remove.append(el("i", "fa-solid fa-xmark"));

  wrap.append(slot, remove);
}

/**
 * impmal keeps Species as a text box while Origin, Faction and Role are item
 * slots. When the character owns a species item the box becomes the same kind of
 * slot — a link that opens the item and an ✕ that removes it — and a Subspecies
 * cell is added beside it, so the pair sits in the header the way the book pairs
 * them. With no species item the text box is left exactly as the system made it,
 * so a table that never touches the compendium loses nothing.
 */
export function refitSpeciesSlot(header, labels = {}, species = null) {
  const input = header.querySelector('input[name="system.details.species"]');
  const group = input?.closest(".detail-group");
  if (!group || !claim(group)) return;

  const L = { ...DEFAULTS, ...labels };
  group.classList.add("navis-species-slot");

  // The subspecies gets a cell of its own beside the species, so the two read
  // as one pair. It holds no form input: a subspecies is an item on the actor,
  // not a field, and the cell is only ever a view of it.
  const subGroup = el("div", "detail-group navis-subspecies-slot");
  const subWrap = el("div", "input-group");
  subGroup.append(subWrap, el("label", "", L.subspecies));
  group.after(subGroup);

  // With no species there is nothing for a subspecies to attach to, and the
  // cell says that rather than inviting a drop that would be refused.
  if (!species) {
    subWrap.append(el("span", "navis-species-hint", L.needsSpecies));
    return;
  }

  const wrap = input.closest(".input-group") ?? group;

  // The text field is hidden rather than cleared: it stays in the form with the
  // value it had, so removing the species later leaves the old text intact.
  input.classList.add("navis-emptied");

  speciesSlot(wrap, species, L.removeSpecies);
  if (species.restricted) group.classList.add("navis-species-restricted");

  if (species.sub) {
    speciesSlot(subWrap, species.sub, L.removeSubspecies);
    if (species.sub.restricted) subGroup.classList.add("navis-species-restricted");
  }
  else {
    subWrap.append(el("span", "navis-species-hint", L.dropSubspecies));
  }
}

export function refitTabs(nav, labels = {}) {
  if (!claim(nav)) return;
  for (const tab of nav.querySelectorAll("a[data-tab]")) {
    const short = (labels.shortTabs ?? SHORT_TAB)[tab.dataset.tab];
    const span = tab.querySelector("span");
    if (!short || !span) continue;
    tab.dataset.tooltip ??= span.textContent.trim();
    span.textContent = short;
  }
}

/* ══ MAIN ══════════════════════════════════════════════════════════════════ */

/**
 * Four table rows (Starting, Advances, Modifier, Total) become nine cells:
 * the total large with its bonus, and one quiet line under it holding the
 * real Starting and Advances inputs. The Modifier input shows when it is set,
 * or while the cell is hovered or focused, so it can always be edited.
 *
 * @returns {Map<string, number>} total per characteristic key
 */
export function refitCharacteristics(table, labels = {}) {
  const totals = new Map();
  if (!claim(table)) return totals;
  const L = { ...DEFAULTS, ...labels };

  const rows = [...table.querySelectorAll("tr")];
  if (rows.length < 5) return totals;
  const cells = row => [...row.children].slice(1);
  const [heads, starting, advances, modifiers, total] = rows.slice(0, 5).map(cells);

  const grid = el("div", "navis-chars");
  const caption = el("div", "navis-rowcap");
  caption.append(el("span"), el("span", "", L.total), el("span", "", L.startAdv));
  grid.append(caption);

  const values = total.map(td => Number(td.textContent.trim()));
  const finite = values.filter(Number.isFinite);
  const max = Math.max(...finite);
  const min = Math.min(...finite);

  heads.forEach((th, index) => {
    const cell = el("div", "navis-char");
    const link = total[index]?.querySelector("a");
    const value = values[index];
    if (link?.dataset.key && Number.isFinite(value)) totals.set(link.dataset.key, value);
    if (finite.length && max > min && value === max) cell.classList.add("navis-hi");

    const figure = el("span", "navis-tot");
    if (link) figure.append(link);
    if (Number.isFinite(value)) figure.append(el("i", "navis-bonus", String(Math.floor(value / 10))));

    const line = el("span", "navis-adv");
    const start = starting[index]?.querySelector("input");
    const advance = advances[index]?.querySelector("input");
    const modifier = modifiers[index]?.querySelector("input");
    if (start) line.append(start);
    if (advance) {
      const wrap = el("span", "navis-adv-advances");
      wrap.classList.toggle("up", number(advance) > 0);
      wrap.append(advance);
      line.append(wrap);
    }
    if (modifier) {
      const wrap = el("span", "navis-adv-mod");
      wrap.classList.toggle("set", number(modifier) !== 0);
      wrap.dataset.tooltip = modifiers[index]?.closest("tr")?.firstElementChild?.textContent.trim() ?? "";
      wrap.append(modifier);
      line.append(wrap);
    }

    cell.append(el("span", "navis-ab", th.textContent.trim()), figure, line);
    grid.append(cell);
  });

  table.before(grid);
  table.classList.add("navis-emptied");
  return totals;
}

/** A value / max attribute box as a tile; returns the box. */
function tile(box) {
  box?.classList.add("navis-tile");
  return box;
}

export function refitResources(main, labels = {}, totals = new Map()) {
  const L = { ...DEFAULTS, ...labels };
  const anchor = main.querySelector(":scope > .navis-chars") ?? main.firstElementChild;

  const wounds = tile(boxOf(main, "system.combat.wounds.value"));
  const corruption = tile(boxOf(main, "system.corruption.value"));
  const fate = tile(boxOf(main, "system.fate.value"));
  const crits = tile(boxOf(main, "system.combat.criticals.value"));
  const augmetics = tile(boxOf(main, "system.augmetics.value"));
  const initiative = tile(boxOf(main, "system.combat.initiative"));
  const handed = tile(boxOf(main, "system.handed"));

  // Wounds: a hatched bullet, value and max always in figures above it.
  if (wounds) {
    const value = number(inputNamed(main, "system.combat.wounds.value"));
    const max = number(inputNamed(main, "system.combat.wounds.max"));
    wounds.append(bullet(max > 0 ? value / max : 0, "wounds"));
  }

  // Corruption: the limit as a tick. Past it the scale grows to fit, the tile
  // turns danger, and impmal's mutation roll becomes a link in the tile.
  if (corruption) {
    const value = number(inputNamed(main, "system.corruption.value"));
    const max = number(inputNamed(main, "system.corruption.max"));
    const scale = Math.max(value, max, 1);
    const over = value > max;
    corruption.classList.toggle("navis-danger", over);
    corruption.append(bullet(value / scale, over ? "corr over" : "corr", max / scale));

    const mutation = corruption.querySelector('a[data-action="rollMutation"]');
    if (mutation) {
      const label = mutation.parentElement;
      const caption = mutation.textContent.trim();
      mutation.replaceChildren(el("i", "fa-solid fa-dice-d10"), document.createTextNode(` ${L.rollMutation}`));
      mutation.classList.add("navis-mutation");
      label.append(document.createTextNode(caption));
      corruption.append(mutation);
    }
  }

  if (fate) {
    const value = number(inputNamed(main, "system.fate.value"));
    const max = number(inputNamed(main, "system.fate.max"));
    fate.append(pips(max, value, "on", "fate"));
  }

  if (crits) {
    // Four tiles share a row, so the long caption takes its short form; only
    // the text node changes.
    const caption = crits.querySelector(":scope > .label label");
    const full = caption?.textContent.trim();
    if (caption && full && L.crits) {
      caption.textContent = L.crits;
      caption.dataset.tooltip = full;
    }
    const value = number(inputNamed(main, "system.combat.criticals.value"));
    const max = number(inputNamed(main, "system.combat.criticals.max"));
    crits.classList.toggle("navis-danger", max > 0 && value >= max);
    crits.append(pips(max, value, "spent"));
  }

  if (augmetics) {
    const value = number(inputNamed(main, "system.augmetics.value"));
    const max = number(inputNamed(main, "system.augmetics.max"));
    augmetics.append(pips(max, value, "on"));
  }

  // Initiative, when impmal computes it, says what it is made of.
  if (initiative) {
    const input = inputNamed(main, "system.combat.initiative");
    const ag = totals.get("ag");
    const per = totals.get("per");
    if (input?.disabled && Number.isFinite(ag) && Number.isFinite(per)) {
      const abbrev = key => main.querySelector(`.navis-char a[data-key="${key}"]`)?.closest(".navis-char")?.querySelector(".navis-ab")?.textContent ?? key;
      initiative.append(el("span", "navis-note", `${abbrev("ag")} ${Math.floor(ag / 10)} + ${abbrev("per")} ${Math.floor(per / 10)}`));
    }
  }

  // Handed: two options, always visible. The buttons set impmal's own select
  // and fire its change event, so the sheet saves it as it always has.
  if (handed) {
    const select = inputNamed(main, "system.handed");
    const switcher = el("div", "navis-seg");
    for (const value of ["left", "right"]) {
      const option = select.querySelector(`option[value="${value}"]`);
      if (!option) continue;
      const button = el("button", select.value === value ? "on" : "", option.textContent.trim());
      button.type = "button";
      button.dataset.value = value;
      button.addEventListener("click", event => {
        event.preventDefault();
        if (select.value === value) return;
        select.value = value;
        for (const other of switcher.children) other.classList.toggle("on", other.dataset.value === value);
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      switcher.append(button);
    }
    select.closest(".field")?.classList.add("navis-emptied");
    handed.append(switcher);
  }

  const rowA = el("div", "navis-res");
  rowA.append(...[wounds, corruption, fate, crits].filter(Boolean));
  const rowB = el("div", "navis-res2");
  rowB.append(...[augmetics, initiative, handed].filter(Boolean));
  anchor?.after(rowA, rowB);

  for (const row of main.querySelectorAll(":scope > .attribute-row")) {
    if (!row.querySelector(".attribute-box")) row.classList.add("navis-emptied");
  }
  return rowB;
}

/** Experience: a ledger of three figures and a spent-of-total bar. */
export function refitExperience(box, labels = {}) {
  if (!claim(box)) return;
  const L = { ...DEFAULTS, ...labels };
  const captions = [...box.querySelectorAll(":scope > .label")];
  const fields = [...box.querySelectorAll(":scope > .field")];
  box.classList.add("navis-block", "navis-xp");

  const ledger = el("div", "navis-ledger");
  fields.forEach((field, index) => {
    const cell = el("div");
    const caption = captions[index + 1];
    if (caption) cell.append(caption);
    cell.append(field);
    ledger.append(cell);
  });

  const [available, spent, total] = fields.map(field => number(field.querySelector("input")));
  const body = el("div", "navis-block-bd");
  body.append(ledger, bullet(total > 0 ? spent / total : 0, "xp"));
  box.append(blockHead(L.experience), body);
  box.dataset.navisAvailable = String(available);
}

/** Patron: a block with the patron's token and four facts. */
export function refitPatron(patron, labels = {}) {
  if (!claim(patron)) return;
  const L = { ...DEFAULTS, ...labels };
  patron.classList.add("navis-block");

  const unset = patron.querySelector(':scope > a[data-action="unset"]');
  const open = patron.querySelector(":scope > img") ? el("i", "fa-solid fa-arrow-up-right-from-square navis-open") : null;
  const body = el("div", "navis-block-bd navis-patron-bd");

  const missing = patron.querySelector(":scope > .missing");
  if (missing) {
    missing.textContent = L.noPatron;
    body.classList.add("navis-patron-missing");
    body.append(missing, el("span", "navis-note", L.noPatronHint));
  } else {
    body.append(...patron.querySelectorAll(":scope > img, :scope > .details"));
  }
  patron.prepend(blockHead(L.patron, open, unset), body);
}

/** Influence: each faction's standing on a signed scale around zero. */
export function refitInfluence(list, labels = {}) {
  if (!claim(list)) return;
  const L = { ...DEFAULTS, ...labels };
  list.classList.add("navis-block", "navis-influence");

  // The block gets a caption; impmal's header row stays as column captions,
  // and its controls (patron influence, add faction) move up into the caption.
  const header = list.querySelector(":scope > .list-header");
  const controls = header?.querySelector(":scope > .list-controls");
  list.prepend(blockHead(L.influence, controls));
  if (controls) header.append(el("div"));

  const headCells = list.querySelectorAll(":scope > .list-header > div");
  const standing = headCells[1];
  if (standing) {
    standing.dataset.tooltip ??= standing.textContent.trim();
    standing.textContent = L.standing;
  }

  for (const cell of list.querySelectorAll(":scope > .list-content > .list-row > .row-content > .small")) {
    const input = cell.querySelector("input");
    if (!input) continue;
    const value = number(input);
    const width = `${clamp((Math.abs(value) / 5) * 100, 0, 100)}%`;
    const negative = el("div", "navis-scale-bar neg");
    const positive = el("div", "navis-scale-bar pos");
    const fill = el("i");
    fill.style.width = width;
    (value < 0 ? negative : positive).append(value === 0 ? el("i") : fill);
    const scale = el("div", "navis-scale");
    scale.classList.toggle("pos", value > 0);
    scale.classList.toggle("neg", value < 0);
    scale.append(negative, input, positive);
    cell.append(scale);
  }
}

export function refitCharacterMain(main, labels = {}) {
  if (!claim(main)) return;
  const table = main.querySelector(":scope > .characteristic-table");
  const totals = table ? refitCharacteristics(table, labels) : new Map();
  const after = refitResources(main, labels, totals);

  const patron = main.querySelector(":scope > .patron");
  const xp = main.querySelector(".attribute-box.experience");
  if (patron) refitPatron(patron, labels);
  if (xp) refitExperience(xp, labels);
  if (patron || xp) {
    const two = el("div", "navis-two");
    after.after(two);
    two.append(...[patron, xp].filter(Boolean));
  }

  const influence = main.querySelector(":scope > .sheet-list.influence");
  if (influence) refitInfluence(influence, labels);
}

/**
 * A card under the resources naming what the character's body does: the species,
 * what it granted, and the figures its effects move. It saves opening the item
 * to answer "why do I have 21 wounds".
 */
export function refitSpeciesCard(main, labels = {}, species = null) {
  if (!species) return;

  const existing = main.querySelector(":scope > .navis-species-card");
  if (existing) return;

  const L = { ...DEFAULTS, ...labels };
  const card = el("div", "navis-block navis-species-card");
  card.dataset.navisRefit = "";

  const size = el("span", "navis-species-size", species.size);
  const title = species.sub ? `${species.name} · ${species.sub.name}` : species.name;
  card.append(blockHead(`${L.species} · ${title}`, size));

  const body = el("div", "navis-species-card-bd");

  if (species.effects.length) {
    const figures = el("div", "navis-species-figures");
    for (const { label, value } of species.effects) {
      const figure = el("div", "navis-species-figure");
      figure.append(el("span", "navis-cap", label), el("em", "", value));
      figures.append(figure);
    }
    body.append(figures);
  }

  if (species.traits.length) {
    const list = el("div", "navis-species-traits");
    for (const trait of species.traits) {
      const link = el("a", "navis-species-trait", trait.name);
      link.dataset.action = "editEmbedded";
      link.dataset.id = trait.id;
      list.append(link);
    }
    body.append(list);
  }

  if (species.roles.length) {
    const roles = el("div", "navis-species-roles");
    roles.append(el("span", "navis-cap", L.suggestedRoles));
    roles.append(el("em", "", species.roles.join(" · ")));
    body.append(roles);
  }

  if (!body.children.length) return;

  card.append(body);
  main.append(card);
}

/* ══ COMBAT ════════════════════════════════════════════════════════════════ */

/** "Defending against": attacker, test and SL on one danger banner. */
export function refitDefending(banner) {
  if (!claim(banner)) return;
  const details = banner.querySelector(".attack-details");
  const line = details?.querySelector(":scope > div:last-child");
  const [name, title, sl] = line ? [...line.querySelectorAll(":scope > span")] : [];
  if (!line || !name) return;

  line.classList.add("navis-def-line");
  if (title) name.after(document.createTextNode(" · "));
  if (sl) {
    const value = parseInt(sl.textContent.replace("−", "-"), 10);
    const plate = el("div", "navis-def-sl", Number.isFinite(value) ? signed(value) : sl.textContent.trim());
    plate.append(el("small", "", sl.textContent.replace(/^[\s+\-−\d]+/, "").trim() || "SL"));
    sl.classList.add("navis-emptied");
    banner.querySelector(":scope > .remove-opposed")?.before(plate);
  }
}

/** The four figures above the actions. */
export function refitReadiness(row, labels = {}, data = {}) {
  if (!claim(row)) return;
  const L = { ...DEFAULTS, ...labels };
  row.classList.add("navis-ready");
  for (const box of row.querySelectorAll(":scope > .attribute-box")) {
    box.classList.add("navis-rtile");
    if (box.querySelector('.label a[data-action^="roll"]')) box.classList.add("navis-roll");
    if (box.querySelector(".superiority-update")) box.querySelector(":scope > .label")?.append(el("span", "navis-group", L.group));
    if (box.querySelector('.label a[data-action="speedConfig"]')) box.classList.add("navis-speed");
    if (box.querySelector('.label a[data-action="rollDodge"]') && Number.isFinite(data.dodge)) {
      const input = box.querySelector('input[type="number"]');
      if (input) input.value = String(data.dodge);
    }
  }
}

/** Trait links keep their tooltips; only the separators change. */
function traitLine(aux) {
  const lists = aux ? [...aux.querySelectorAll(".trait-list")] : [];
  if (!lists.some(list => list.textContent.trim())) return null;
  const line = el("small", "navis-arm-traits");
  for (const list of lists) {
    for (const node of list.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/\s*,\s*/g, " · ");
    }
    line.append(...list.childNodes);
  }
  return line;
}

function refitArmRow(row, labels) {
  const L = { ...DEFAULTS, ...labels };
  const main = row.querySelector(":scope > .row-content:not(.weapon-aux)");
  const aux = row.querySelector(":scope > .row-content.weapon-aux");
  if (!main || !claim(main)) return;
  main.classList.add("navis-arm-row");

  const [nameCell, skillCell, damageCell, rangeCell, ammoCell] = [...main.children];

  // Name, traits under it, grip beside it.
  if (nameCell) {
    const label = nameCell.querySelector(":scope > a.label");
    const names = el("div", "navis-arm-name");
    if (label) names.append(label);
    const traits = traitLine(aux);
    if (traits) names.append(traits);
    nameCell.querySelector(":scope > img")?.after(names);

    // impmal prints one hand icon per hand actually holding the weapon. The
    // refit shows the hand as a letter instead, but only for the hands that are
    // holding it: rendering an empty box for the free hand turned the pair into
    // something that read as a two-round magazine sitting next to the real one.
    const grip = nameCell.querySelector(":scope > .grip") ?? el("div", "grip");
    const held = new Map([...grip.querySelectorAll("[data-hand]")].map(span => [span.dataset.hand, span.classList.contains("offhand")]));
    grip.replaceChildren(...["left", "right"].filter(hand => held.has(hand)).map(hand => {
      const offhand = held.get(hand);
      const cell = el("span", offhand ? "off" : "on", L[hand]);
      cell.dataset.hand = hand;
      cell.dataset.tooltip = offhand
        ? `${L[hand === "left" ? "leftHand" : "rightHand"]} · ${L.offHand}`
        : L[hand === "left" ? "leftHand" : "rightHand"];
      return cell;
    }));
    grip.classList.add("navis-grip");
    grip.classList.toggle("navis-grip-empty", !held.size);
    nameCell.append(grip);
  }

  const skill = skillCell?.textContent.trim().match(/^(.*)\s+\((-?\d+)\)$/);
  if (skill) skillCell.replaceChildren(el("span", "", skill[1]), el("em", "", skill[2]));
  skillCell?.classList.add("navis-arm-skill");
  damageCell?.classList.add("navis-arm-damage");
  if (damageCell) damageCell.dataset.navisLabel = L.damageLabel ?? "";

  let range = rangeCell;
  if (!range) {
    range = el("div", "navis-dash", "—");
    main.append(range);
  }
  range.classList.add("navis-arm-range");
  // Шапки с названиями колонок больше нет — подпись живёт при самом значении.
  range.dataset.navisLabel = L.rangeLabel ?? "";

  // Magazine: one cell per round, the count and ammo beside it, Reload when
  // the magazine is not full — impmal's own buttons, moved.
  const magazine = el("div", "navis-arm-mag");
  const magButton = aux?.querySelector("button.mag");
  const quantity = aux?.querySelector('[data-action="stepProperty"][data-path="system.quantity"]');
  const reload = aux?.querySelector('button[data-action="reload"]');
  const select = ammoCell?.querySelector("select");

  if (magButton) {
    const current = Number(magButton.querySelector(".current")?.textContent) || 0;
    const size = Number(magButton.querySelector(".value")?.textContent) || 0;
    if (size > 0 && size <= 12) {
      const cells = el("div", "navis-cells");
      cells.style.setProperty("--navis-n", String(size));
      for (let i = 0; i < size; i++) cells.append(el("s", i < current ? "on" : ""));
      magButton.append(cells);
      magButton.classList.add("navis-has-cells");
    }
    const meta = el("div", "navis-mag-meta");
    const count = el("span", "navis-mag-count");
    if (current <= 0) {
      count.textContent = L.empty;
      count.classList.add("navis-mag-empty");
    } else {
      count.textContent = `${current} / ${size}`;
    }
    const info = el("span", "navis-mag-info");
    info.append(count);
    if (select) {
      // With nothing selected impmal's blank option has no text, and the skin
      // sizes the control to its content — so the one control that attaches
      // ammunition rendered as zero pixels of nothing. Give the empty state a
      // label and an affordance; a chosen round still reads as quiet text.
      const blank = select.querySelector('option[value=""]');
      if (blank && !blank.textContent.trim()) blank.textContent = L.pickAmmo;
      // impmal's own tooltip is the chosen round's name and count, which with
      // nothing chosen renders as the literal " ()".
      if (!select.value) select.dataset.tooltip = L.pickAmmo;
      if (select.value) {
        // A chosen round is quiet text beside the count. Hidden only when it
        // would repeat what an empty magazine already says.
        info.append(el("span", "navis-sep", "·"), select);
        if (current <= 0) info.classList.add("navis-hide-ammo");
      } else {
        // Nothing chosen: this is the control that attaches ammunition, so it
        // needs to be legible. There is no room for it beside the count —
        // measured on a 550px row the magazine column is 136px and Reload
        // claims 85 of them, leaving the select 10px — so it takes its own line
        // under them.
        select.classList.add("navis-ammo-unset");
      }
    }
    meta.append(info);
    if (reload) meta.append(reload);
    if (select && !select.value) meta.append(select);
    magazine.append(magButton, meta);
  } else if (quantity) {
    quantity.querySelector("label")?.replaceChildren(L.qty);
    magazine.append(quantity);
  } else {
    magazine.append(el("span", "navis-dash", "—"));
  }
  main.append(magazine);
  ammoCell?.classList.add("navis-emptied");
  aux?.classList.add("navis-drained");
}

/** Melee and ranged, one block with shared columns. */
export function refitArmament(melee, ranged, labels = {}) {
  const L = { ...DEFAULTS, ...labels };
  const lists = [[melee, L.melee], [ranged, L.ranged]].filter(([list]) => list && claim(list));
  if (!lists.length) return;

  const block = el("div", "navis-block navis-armament");
  // Подписей колонок нет: «Оружие», «Урон», «Дальность» и «Умение» занимали
  // строку ради того, что и так видно по самим значениям. Колонки при этом не
  // разъезжаются — их ширины заданы переменными блока, а не шапкой.
  lists[0][0].before(block);
  block.append(blockHead(L.armament, el("span", "navis-cap dim", L.equipped)));

  let rows = 0;
  for (const [list, caption] of lists) {
    list.classList.add("navis-arm-list");
    list.querySelector(":scope > .list-header")?.classList.add("navis-emptied");
    list.querySelector(":scope > .list-content")?.before(el("div", "navis-arm-sub", caption));
    const listRows = list.querySelectorAll(":scope > .list-content > .list-row");
    rows += listRows.length;
    if (!listRows.length) list.classList.add("navis-emptied");
    listRows.forEach(row => refitArmRow(row, labels));
    block.append(list);
  }
  if (!rows) {
    head.classList.add("navis-emptied");
    block.append(el("div", "navis-block-bd navis-note", L.noWeapons));
  }
}

/** Protection as a body: six plates laid out like the figure they cover. */
export function refitProtection(list, labels = {}, data = {}) {
  if (!claim(list)) return;
  const L = { ...DEFAULTS, ...labels };
  list.classList.add("navis-block", "navis-body-map");

  const header = list.querySelector(":scope > .list-header");
  if (header) {
    header.classList.add("navis-block-hd");
    header.replaceChildren(el("span", "navis-cap", header.textContent.trim()), el("span", "navis-cap dim", L.byLocation));
  }
  list.querySelector(":scope > .list-content")?.classList.add("navis-body");

  for (const location of list.querySelectorAll(".location[data-key]")) {
    const key = location.dataset.key;
    const values = location.querySelector(":scope > .location-values");
    const details = location.querySelector(":scope > .location-details");
    const label = values?.querySelector(":scope > label");
    if (!values) continue;
    const full = label?.textContent.trim() ?? key;
    const short = (labels.shortLocations ?? SHORT_LOCATION)[key];
    if (label && short) {
      label.textContent = short;
      label.dataset.tooltip = full;
    }

    const items = [...(details?.querySelectorAll(".protection-item[data-id]") ?? [])];
    const names = items.map(item => item.querySelector("label")?.textContent.replace(/^\s*[–-]\s*/, "").trim()).filter(Boolean);
    values.append(el("span", "navis-loc-item", names.length ? names.join(" · ") : "—"));

    // The item list under the map: location and item, current of base armour.
    for (const item of items) {
      const name = item.querySelector("label");
      if (name) name.textContent = `${full} — ${name.textContent.replace(/^\s*[–-]\s*/, "").trim()}`;
      const value = item.querySelector("a.damage-armour");
      const base = data.armour?.(item.dataset.id);
      if (value && Number.isFinite(base) && /^\d+$/.test(value.textContent.trim())) {
        value.textContent = `${value.textContent.trim()} ${L.of} ${base}`;
      }
    }
    for (const other of details?.querySelectorAll(".protection-item:not([data-id]) label") ?? []) {
      other.textContent = other.textContent.replace(/^\s*[–-]\s*/, "").trim();
    }

    const damage = parseInt(values.querySelector(".armour-damage")?.textContent.replace(/[^\d]/g, ""), 10);
    if (details && damage > 0) {
      const row = el("div", "protection-item navis-loc-damage");
      row.append(el("label", "", L.damageMarked), el("span", "", minus(damage)));
      details.append(row);
    }
  }
}

/** Critical wounds and injuries, edged by kind, beside the armour. */
export function refitWounds(column, labels = {}, data = {}) {
  if (!claim(column)) return;
  column.classList.add("navis-wounds");
  for (const list of column.querySelectorAll(":scope > .sheet-list")) {
    const type = list.querySelector('.list-header [data-action="createItem"]')?.dataset.type;
    list.classList.add("navis-block", type === "critical" ? "navis-crit-list" : "navis-injury-list");
    list.querySelector(":scope > .list-header")?.classList.add("navis-block-hd");

    const criticals = data.criticals;
    if (type === "critical" && criticals && Number(criticals.max) > 0) {
      const count = el("span", "navis-count", `${Number(criticals.value) || 0} / ${criticals.max}`);
      count.classList.toggle("navis-at-max", Number(criticals.value) >= Number(criticals.max));
      list.querySelector(":scope > .list-header .list-controls")?.before(count);
    }

    for (const row of list.querySelectorAll(":scope > .list-content > .list-row")) {
      row.classList.add("navis-wound");
      const where = data.location?.(row.dataset.uuid);
      if (where) row.querySelector(".list-name")?.append(el("small", "navis-wound-sub", where));
    }
  }
}

export function refitCharacterCombat(tab, labels = {}, data = {}) {
  if (!claim(tab)) return;

  const banner = tab.querySelector(":scope > .defending-against");
  if (banner) refitDefending(banner);

  const readiness = [...tab.querySelectorAll(":scope > .flexrow")].find(row => row.querySelector(":scope > .attribute-box.single"));
  if (readiness) refitReadiness(readiness, labels, data);

  const actions = tab.querySelector(":scope > .action-list");
  if (actions) refitActions(actions, labels);

  // Told apart by their column headers: melee has three (name, specialisation,
  // damage), ranged five (plus range and ammo), shield two (name, traits).
  // Vehicle weapons have four and no .flex column, and keep the plain skin.
  const lists = [...tab.querySelectorAll(":scope > .sheet-list")];
  const columns = list => list.querySelectorAll(":scope > .list-header > div").length;
  const hasFlex = list => Boolean(list.querySelector(":scope > .list-header > .flex"));
  const melee = lists.find(list => hasFlex(list) && columns(list) === 3);
  const ranged = lists.find(list => hasFlex(list) && columns(list) === 5);
  refitArmament(melee, ranged, labels);
  const shield = lists.find(list => hasFlex(list) && columns(list) === 2);
  if (shield) {
    shield.classList.add("navis-block", "navis-shield");
    if (shield.classList.contains("inactive")) shield.classList.add("navis-emptied");
  }

  const protection = [...tab.querySelectorAll(":scope > .flexrow")].find(row => row.querySelector(":scope > .hit-locations"));
  if (protection) {
    protection.classList.add("navis-prot");
    refitProtection(protection.querySelector(":scope > .hit-locations"), labels, data);
    const column = protection.querySelector(":scope > .flexcol");
    if (column) refitWounds(column, labels, data);
  }
}

/** Run every character pass that applies to a rendered sheet element. */
export function refitCharacterSheet(root, labels = {}, data = {}) {
  const header = root.querySelector('header.sheet-header[data-application-part="header"], [data-application-part="header"]');
  if (header) {
    refitCharacterHeader(header, labels);
    refitSpeciesSlot(header, labels, data.species);
  }

  const nav = root.querySelector("nav.sheet-tabs");
  if (nav) refitTabs(nav, labels);

  const main = root.querySelector('section.tab[data-tab="main"]');
  if (main) {
    refitCharacterMain(main, labels);
    refitSpeciesCard(main, labels, data.species);
  }

  const combat = root.querySelector('section.tab[data-tab="combat"]');
  if (combat) refitCharacterCombat(combat, labels, data);
}
