/**
 * Apex Imperialis — refit.
 *
 * Small, idempotent DOM passes over markup impmal has already rendered. They
 * add wrappers, labels and attributes the refit stylesheet needs, and they move
 * existing nodes rather than recreate them, so every data-action button keeps
 * working: Foundry's application actions are delegated from the window, not
 * bound to the button.
 *
 * Nothing here replaces an impmal template. If impmal changes one, a selector
 * stops matching and that part of the sheet falls back to the plain skin.
 *
 * Every function takes plain DOM and data, with no Foundry globals, so it can be
 * exercised outside the game.
 */

const DONE = "navisRefit";

/** Mark a node as processed; returns false if it already was. */
export function claim(node) {
  if (!node || node.dataset[DONE]) return false;
  node.dataset[DONE] = "1";
  return true;
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

/**
 * Does this sheet render impmal's NPC anatomy?
 *
 * Not `actor.type === "npc"`. impmal-inquisition's familiar is an actor type of
 * its own — `impmal-inquisition.familiar` — built on the very same markup: the
 * same `.npc-header`, the same `npc-main.hbs` for the Main tab, and a sheet it
 * registers under impmal's own `npc` class. The skin's NPC rules key on that
 * class, so the set of sheets that need this refit is exactly the set the
 * stylesheet already dresses. Asking the element keeps the two in step; asking
 * the type would need a new branch for every module that adds a creature.
 *
 * @param {HTMLElement} element  the sheet's own element, as the render hook hands it over
 */
export function usesNpcSheet(element) {
  return element?.classList?.contains("npc") ?? false;
}

/* ══════════════════════════════════════════════════════════════════════════
   CHAT — test cards
   ══════════════════════════════════════════════════════════════════════ */

/**
 * "Awareness Test - Search"            → "Awareness", "Search"
 * "Discipline (Psychic) Test - Purge"  → "Discipline", "Psychic · Purge"
 * "Laspistol"                          → "Laspistol"
 */
export function splitTestTitle(raw) {
  const [head, ...tail] = raw.trim().split(/\s+-\s+/);
  const base = head.replace(/\s+Test$/i, "");
  const paren = base.match(/^(.*?)\s*\(([^)]+)\)$/);
  const main = paren ? paren[1] : base;
  const qualifiers = [...(paren ? [paren[2]] : []), ...tail].filter(Boolean);
  return { main, qualifiers };
}

/**
 * Rebuild a .impmal.test card as a readout.
 *
 * @param {HTMLElement} card     the .impmal.test element
 * @param {object} result        message.system.result: roll, target, SL, outcome, critical, fumble
 * @param {object} [labels]      localisable strings
 */
export function refitTestCard(card, result = {}, labels = {}) {
  if (!claim(card)) return;
  const L = { sl: "SL", roll: "Roll", target: "Target", critical: "Critical · doubles", fumble: "Fumble", ...labels };

  const outcome = result.outcome;
  if (outcome === "success" || outcome === "failure") card.dataset.navisOutcome = outcome;

  // ── Title: the test's name, qualifiers quieter after a middle dot ──
  const titleText = card.querySelector(":scope > .title p") ?? card.querySelector(":scope > .title");
  if (titleText) {
    const { main, qualifiers } = splitTestTitle(titleText.textContent);
    titleText.textContent = main;
    if (qualifiers.length) titleText.append(el("span", "navis-qualifier", ` · ${qualifiers.join(" · ")}`));
  }

  const sl = card.querySelector(":scope > .sl");
  const comparison = card.querySelector(":scope > .comparison");
  const outcomeLine = card.querySelector(":scope > .outcome");
  if (!sl || !comparison || !outcomeLine) return;   // not a rolled test (e.g. an item-only card)

  // ── SL plate. impmal prints a zero as "−0" or "+0"; the edge colour and
  //    the tier word already say which way it went. ──
  const slValue = sl.querySelector(":scope > div");
  if (slValue && /^[+\-−]0$/.test(slValue.textContent.trim())) slValue.textContent = "0";
  sl.append(el("i", "navis-sl-caption", L.sl));

  // ── Evidence column: numbers, the 0–100 track, the tier ──
  comparison.querySelector(".roll")?.setAttribute("data-navis-label", L.roll);
  comparison.querySelector(".target")?.setAttribute("data-navis-label", L.target);

  const roll = Number(result.roll);
  const target = Number(result.target);
  const track = el("div", "navis-track");
  if (Number.isFinite(roll) && Number.isFinite(target)) {
    track.style.setProperty("--navis-target", `${clamp(target, 0, 100)}%`);
    track.style.setProperty("--navis-roll", `${clamp(roll, 0, 100)}%`);
    track.append(el("i", "navis-zone"), el("i", "navis-mark"));
  } else {
    track.hidden = true;
  }

  // One pip per point of SL, up to five: impmal's own tiers are 0 marginal,
  // 1–2 plain, 3–4 impressive, 5+ astounding.
  const filled = clamp(Math.abs(Number(result.SL) || 0), 0, 5);
  const pips = el("span", "navis-pips");
  for (let i = 0; i < 5; i++) pips.append(el("s", i < filled ? "on" : ""));
  outcomeLine.prepend(pips);

  const evidence = el("div", "navis-evidence");
  const readout = el("div", "navis-readout");
  comparison.before(readout);
  evidence.append(comparison, track, outcomeLine);
  readout.append(sl, evidence);

  // ── Critical and fumble get a hatched tag ──
  if (result.critical || result.fumble) {
    const tags = card.querySelector(".tags");
    const existing = tags?.querySelector("a.critical, a.fumble");
    if (existing) existing.closest(".tags > *")?.classList.add("navis-crit");
    else if (tags) tags.append(Object.assign(el("div", "navis-crit"), { textContent: result.fumble ? L.fumble : L.critical }));
  }
}

/** "To: Gamemaster" → "→ Gamemaster", beside the sender rather than on its own line. */
export function refitMessageHeader(messageEl) {
  const header = messageEl.querySelector(":scope > .message-header");
  if (!claim(header)) return;
  const whisper = header.querySelector(".whisper-to");
  const sender = header.querySelector(".message-sender");
  if (whisper && sender) {
    const name = whisper.textContent.replace(/^[^:]*:\s*/, "").trim();
    whisper.textContent = `→ ${name}`;
    sender.append(whisper);
  }
}

/** Item posts: a caption with the item's type above its name. */
export function refitItemPost(messageEl, typeLabel) {
  const post = messageEl.querySelector(".item-post");
  if (!claim(post)) return;
  const name = post.querySelector(".post-header h4");
  if (name && typeLabel) {
    const titles = el("div", "navis-post-titles");
    name.before(titles);
    titles.append(el("small", "navis-post-type", typeLabel), name);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   ADVANCEMENT FORM
   ══════════════════════════════════════════════════════════════════════ */

/**
 * The three hints on impmal's advancement form, keyed by their English text.
 *
 * They are written into templates/apps/advancement.hbs as bare literals with no
 * `localize` call, so no translation file can reach them and the audit cannot
 * see them either. Matching on the sentence is the only hook there is; a future
 * impmal that localises them will simply stop matching and leave its own text.
 */
const ADVANCEMENT_HINTS = {
  "All Owned Items that have an associated XP Cost": "itemsHint",
  "Record of all the changes in XP Total and the associated reason.": "logHint",
  "Miscellaneous modifications to total spent XP": "otherHint"
};

/**
 * Advancement: translate what the template hardcodes, and turn the Items tab
 * from a column of disabled inputs into a list you can read and click.
 *
 * Those inputs are `disabled`, so they are a text field that cannot be typed in
 * and an item that cannot be opened — all of the weight of a control with none
 * of its use. They become plain text, and the row opens the item.
 *
 * @param {HTMLElement} root    the form's element
 * @param {object} [labels]
 * @param {(id: string) => void} [open]   called with an item id when a row is clicked
 */
export function refitAdvancement(root, labels = {}, open) {
  if (!claim(root)) return;
  const L = {
    itemsHint: "Owned items that cost XP.",
    logHint: "Every change to total XP, and why.",
    otherHint: "Adjustments to total XP spent.",
    submit: "Apply",
    openItem: "Open",
    characterCreation: "Character Creation",
    ...labels
  };

  root.classList.add("navis-advancement-form");

  for (const hint of root.querySelectorAll(".advancement-list > p")) {
    const key = ADVANCEMENT_HINTS[hint.textContent.trim()];
    if (key) hint.textContent = L[key];
    hint.classList.add("navis-adv-hint");
  }

  // impmal writes this one row of the Other tab in English when it creates the
  // character, so it is data rather than interface — but it is data every sheet
  // has, and leaving it is the only English left on the tab.
  for (const field of root.querySelectorAll('.advancement-list input[name="description"]')) {
    if (field.value.trim() === "Character Creation") field.value = L.characterCreation;
  }

  for (const row of root.querySelectorAll(".advancement-list > [data-id]")) {
    const name = row.querySelector("input.name");
    const xp = row.querySelector("input.xp");
    if (!name || !xp || !name.disabled) continue;

    const label = el("span", "name navis-adv-name", name.value);
    const cost = el("span", "xp navis-adv-xp", xp.value);
    name.replaceWith(label);
    xp.replaceWith(cost);

    row.classList.add("navis-adv-item");
    if (open) {
      row.dataset.tooltip = L.openItem;
      row.addEventListener("click", () => open(row.dataset.id));
    }
  }

  const submit = root.querySelector("footer button[type='submit'], .form-footer button[type='submit']");
  if (submit && /^submit$/i.test(submit.textContent.trim())) {
    (submit.querySelector("span") ?? submit).textContent = L.submit;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   NPC SHEET
   ══════════════════════════════════════════════════════════════════════ */

/**
 * The fourteen actions, grouped by what they do in a round.
 *
 * Shove sits in Other rather than Attack, which is a layout decision rather
 * than a rules one: the rows are five keys wide, and Two-Weapon Fighting
 * appears only while two one-handed weapons are equipped. With Shove in Attack
 * that conditional sixth key dropped onto a line of its own; moved out, Attack
 * is four keys and becomes five exactly when TWF shows up.
 */
const ACTION_GROUPS = [
  ["attack", ["aim", "charge", "grapple", "seize", "twf"]],
  ["defend", ["defend", "dodge", "cover", "disengage", "flee"]],
  ["other", ["help", "hide", "run", "search", "shove"]]
];

/**
 * Two labels that do not fit the space the sheet gives them. Both are supplied
 * by the caller through `labels`, keyed the way they are looked up: actions by
 * impmal's action key, vitals by their own localized text — so neither depends
 * on the interface being English.
 */
const SHORT_ACTION = { seize: "Seize Init.", twf: "Two-Weapon" };
const SHORT_VITAL = { "Critical Wounds": "Crits", "Initiative": "Init" };

export function refitNpcHeader(header, labels = {}) {
  if (!claim(header)) return;

  // impmal places every child of an attribute box by inline `grid-column`,
  // laying the box out as twelve columns: caption 1–12, value 1–6, max 7–12.
  // The skin lays it out as two — a value column sized to the figure and a
  // second that takes the rest — which is what keeps "5 / 22" on one line on
  // the default 600px sheet instead of breaking after the 5. An inline style
  // outranks any stylesheet, so the placement comes off here rather than being
  // fought with !important.
  for (const cell of header.querySelectorAll(".attribute-box > [style*='grid-column']")) {
    cell.style.removeProperty("grid-column");
  }

  // Highest characteristic(s) in brass. Skipped when they are all equal —
  // a highlight on every cell means nothing.
  const table = header.querySelector(".characteristic-table");
  if (table) {
    const rows = table.querySelectorAll("tr");
    const inputs = rows[1] ? [...rows[1].querySelectorAll("input")] : [];
    const values = inputs.map(input => Number(input.value));
    const max = Math.max(...values);
    const min = Math.min(...values);
    if (values.length && max > min) {
      values.forEach((value, index) => {
        if (value !== max) return;
        rows.forEach(row => row.children[index]?.classList.add("navis-hi"));
      });
    }
  }

  // Six vitals share one row, so the two long captions take their short
  // forms. Only the caption's own text node changes: Armour and Speed carry a
  // config link inside the same label.
  for (const caption of header.querySelectorAll(".attribute-box > .label :is(label, a)")) {
    const text = [...caption.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    const full = text?.textContent.trim();
    const short = full && (labels.shortVitals?.[full] ?? SHORT_VITAL[full]);
    if (!short) continue;
    text.textContent = text.textContent.replace(full, short);
    caption.dataset.tooltip ??= full;
  }

  // Wounds: value / max as a spent-load meter under the two fields.
  const woundsValue = header.querySelector('input[name="system.combat.wounds.value"]');
  const woundsMax = header.querySelector('input[name="system.combat.wounds.max"]');
  const woundsBox = woundsValue?.closest(".attribute-box");
  if (woundsBox) {
    woundsBox.classList.add("navis-wounds");
    const max = Number(woundsMax?.value) || 0;
    const value = Number(woundsValue.value) || 0;
    const meter = el("div", "navis-meter");
    const fill = el("i");
    fill.style.setProperty("--navis-fill", `${max > 0 ? clamp((value / max) * 100, 0, 100) : 0}%`);
    meter.append(fill);
    woundsBox.append(meter);
  }

  refitInstincts(header, labels);
}

/**
 * The familiar's two extra boxes, laid out like the six above them.
 *
 * impmal-inquisition's familiar header ends with a row its own template gets
 * wrong twice: the box holding the two instinct dropdowns is captioned
 * `IMPMAL.Encumbrance`, so the sheet shows "Нагрузка" twice running, and it
 * asks for `flex: 3` — which buys it nothing, because the skin dissolves the
 * template's rows (`.attribute-row { display: contents }`) and places every box
 * in one six-column grid. The box lands in a single track beside Cost, 78px
 * wide, and two dropdowns holding real words render as empty arrows.
 *
 * Their template is not ours to edit — the same reason the compendium
 * translations live in Babele rather than in a patched pack — so the row is
 * rebuilt here: one box per instinct, correctly captioned, and marked for the
 * stylesheet to give each a third of the second line.
 *
 * On an NPC there is no preservation select and the pass returns untouched.
 */
function refitInstincts(header, labels = {}) {
  const preservation = header.querySelector('select[name="system.instincts.preservation"]');
  const combat = header.querySelector('select[name="system.instincts.combat"]');
  const box = preservation?.closest(".attribute-box");
  if (!preservation || !combat || !box) return;

  // Marks the header for the familiar's own grid: the six vitals on the first
  // line, Cost and the two instincts as equal thirds on the second.
  header.classList.add("navis-familiar-vitals");
  header.querySelector('input[name="system.cost"]')?.closest(".attribute-box")?.classList.add("navis-cost");

  const caption = (node, short, full) => {
    const label = node.querySelector(".label label, .label a") ?? node.querySelector(".label");
    if (!label) return;
    label.textContent = short;
    label.dataset.tooltip ??= full;
  };

  // The box already on the page becomes Preservation: keeping it keeps the
  // select where it is, and Foundry's form submission is bound to the name.
  box.style.removeProperty("flex");
  box.classList.add("navis-instinct");
  caption(box, labels.preservationShort ?? "Preservation", labels.preservationInstinct ?? "Preservation Instinct");

  const combatBox = el("div", "attribute-box top-label navis-instinct");
  const label = el("div", "label");
  label.append(el("label", null, labels.combatShort ?? "Combat"));
  label.querySelector("label").dataset.tooltip = labels.combatInstinct ?? "Combat Instinct";
  const field = el("div", "field");
  field.append(combat);
  combatBox.append(label, field);
  box.after(combatBox);

  // The `.field` that held the combat select has to go with it: the skin draws
  // a "/" between two fields of one box — right for "5 / 22", a stray slash
  // under a lone dropdown. Not `:empty`, which the template's own indentation
  // defeats: a field is spent when it has no control left.
  for (const field of box.querySelectorAll(":scope > .field")) {
    if (!field.querySelector("input, select, textarea, a")) field.remove();
  }
}

export function refitActions(list, labels = {}) {
  if (!claim(list)) return;
  const L = { attack: "Attack", defend: "Defend", other: "Other", current: "Current", ...labels };

  // Once an action is chosen impmal swaps the whole grid for one line —
  // "<strong>Current Action:</strong> Charge" and a clear button. Give it the
  // grid's own shape: a caption on the left, the action on a plate beside it.
  const current = list.querySelector(":scope > .current-action");
  if (current) {
    list.classList.add("navis-actions", "navis-has-current");
    const line = current.querySelector(":scope > div");
    const strong = line?.querySelector("strong");
    const value = line ? [...line.childNodes].filter(node => node !== strong).map(node => node.textContent).join("").trim() : "";
    const caption = el("span", "navis-action-caption", L.current);
    if (strong) caption.dataset.tooltip = strong.textContent.replace(/:\s*$/, "").trim();
    line?.replaceChildren(el("span", "navis-current-value", value));
    list.prepend(caption);
    return;
  }

  const buttons = [...list.querySelectorAll(":scope > button.action[data-action-key]")];
  if (!buttons.length) return;
  const byKey = new Map(buttons.map(button => [button.dataset.actionKey, button]));
  const placed = new Set();

  list.classList.add("navis-actions");
  for (const [group, keys] of ACTION_GROUPS) {
    const row = el("div", "navis-action-row");
    for (const key of keys) {
      const button = byKey.get(key);
      if (!button) continue;
      row.append(button);
      placed.add(button);
    }
    // Anything a module adds that we do not know lands in "other".
    if (group === "other") buttons.filter(b => !placed.has(b)).forEach(b => row.append(b));
    if (!row.children.length) continue;
    list.append(el("span", "navis-action-caption", L[group]), row);
  }

  const shortActions = L.shortActions ?? SHORT_ACTION;

  for (const button of buttons) {
    const short = shortActions[button.dataset.actionKey];
    const full = button.textContent.trim();
    if (short) button.textContent = short;
    button.dataset.tooltip ??= full;
  }
}

/** "Awareness (Psyniscience) 70," → name, qualifier, target. */
export function parseSkillLink(text) {
  const match = text.trim().replace(/,\s*$/, "").match(/^(.*?)\s+(-?\d+)$/);
  if (!match) return null;
  const [, label, target] = match;
  const paren = label.match(/^(.*?)\s*\(([^)]+)\)$/);
  return { name: paren ? paren[1] : label, qualifier: paren ? paren[2] : null, target };
}

export function refitSkillsSummary(sheetList, labels = {}) {
  if (!claim(sheetList)) return;
  sheetList.classList.add("navis-skill-board");
  const header = sheetList.querySelector(":scope > .list-header");
  header?.append(el("div", "navis-board-caption", labels.target ?? "Target"));

  for (const link of sheetList.querySelectorAll(".skills-summary a.rollable")) {
    const parsed = parseSkillLink(link.textContent);
    if (!parsed) continue;
    const name = el("span", "navis-skill-name", parsed.name);
    if (parsed.qualifier) name.append(el("em", "", ` · ${parsed.qualifier}`));
    link.replaceChildren(name, el("b", "navis-skill-target", parsed.target));
  }
}

/**
 * Атаки НИП — той же вёрсткой, что и оружие в бою у персонажа.
 *
 * Раньше здесь был свой набор классов `navis-attack-*` и свои стили: тот же
 * замысел, написанный дважды. Две копии разошлись — у персонажа колонки
 * выровнены общей сеткой, а у НИП каждая строка вставала по содержимому, и
 * «МАГАЗИН» обрезал надпись «Нет патронов».
 *
 * Теперь строка собирается теми же классами `navis-arm-*` внутри
 * `.navis-armament`, и обе анкеты берут одни и те же правила. Своего у НИП
 * остаётся только магазин: система печатает здесь не ленту патронов с выбором
 * боеприпаса, а одну кнопку с названием заряженного — или отметку, что его нет.
 *
 * Вынесено из refitAttacks, потому что тем же строем идут и стволы на листе
 * техники — там они лежат внутри общего списка с экипажем, а не своим
 * .sheet-list, и обойти их снаружи проще, чем подгонять селектор.
 *
 * @param {HTMLElement} row  .list-row с оружием
 * @param {object} L  подписи, уже слитые с умолчаниями
 */
export function refitWeaponRow(row, L) {
  const main = row.querySelector(":scope > .row-content:not(.weapon-aux)");
  const aux = row.querySelector(":scope > .row-content.weapon-aux");
  if (!main) return;
  main.classList.add("navis-arm-row");

  const cells = [...main.children];
  const nameCell = cells[0];
  const skillCell = cells[1];
  const damageCell = cells[2];
  let rangeCell = cells[3];

  // Название и черты под ним одним столбиком — как у персонажа, иначе общая
  // сетка развалится: в её первой колонке стоит один элемент, а не два.
  if (nameCell) {
    const label = nameCell.querySelector(":scope > a.label");
    const names = el("div", "navis-arm-name");
    if (label) names.append(label);
    const traits = aux ? [...aux.querySelectorAll(".trait-list")].map(t => t.textContent.trim()).filter(Boolean) : [];
    if (traits.length) {
      names.append(el("small", "navis-arm-traits", traits.join(", ").split(/\s*,\s*/).join(" · ")));
    }
    nameCell.querySelector(":scope > img")?.after(names);
  }

  // «Двуручное (25)» → название и отдельно значение, по которому кликают.
  //
  // Значения может и не быть: на листе техники в этой колонке стоит одна лишь
  // специализация — стреляют оттуда кликом по значку, а не по числу. Текст
  // всё равно заворачивается в span, иначе он остался бы голым узлом и взял
  // бы кегль значения вместо кегля подписи.
  const skillText = skillCell?.textContent.trim() ?? "";
  const skill = skillText.match(/^(.*)\s+\((-?\d+)\)$/);
  if (skill) skillCell.replaceChildren(el("span", "", skill[1]), el("em", "", skill[2]));
  else if (skillText) skillCell.replaceChildren(el("span", "", skillText));
  skillCell?.classList.add("navis-arm-skill");

  // «3 Damage» → «3»; «Short Range» → «Short».
  if (damageCell) {
    damageCell.textContent = damageCell.textContent.trim().replace(/\s+\D+$/, "");
    damageCell.classList.add("navis-arm-damage");
  }
  if (rangeCell) rangeCell.textContent = rangeCell.textContent.trim().replace(/\s+\S+$/, "");
  else {
    rangeCell = el("div", "navis-dash", "—");
    main.append(rangeCell);
  }
  rangeCell.classList.add("navis-arm-range");

  // Магазин: заряжено — счётчик и название патрона, пусто — отметка тревоги.
  const magCell = el("div", "navis-arm-mag");
  const magButton = aux?.querySelector("button.mag");
  const ammoButton = aux?.querySelector('button[data-action="ammoChange"]');
  const quantity = aux?.querySelector('[data-action="stepProperty"]');
  if (magButton && ammoButton) {
    // Пока ничего не заряжено, система печатает своё «No Ammo Loaded», иначе
    // название боеприпаса и его количество.
    const text = ammoButton.textContent.trim();
    const isEmpty = L.noAmmoLoaded ? text === L.noAmmoLoaded : /^no ammo/i.test(text);
    if (isEmpty) {
      ammoButton.dataset.tooltip ??= ammoButton.textContent.trim();
      ammoButton.textContent = L.noAmmo;
      ammoButton.classList.add("navis-no-ammo");
      magCell.append(ammoButton);
    } else {
      ammoButton.classList.add("navis-ammo-name");
      magCell.append(magButton, ammoButton);
    }
  } else if (quantity) {
    magCell.append(quantity);
  } else {
    magCell.append(el("span", "navis-dash", "—"));
  }
  main.append(magCell);
  aux?.classList.add("navis-drained");
}

/** Подписи колонок оружия с умолчаниями — их же берёт лист техники. */
export function weaponLabels(labels = {}) {
  return { weapon: "Weapon", skill: "Skill", damage: "Dmg", range: "Range", mag: "Mag", noAmmo: "No ammo", ...labels };
}

export function refitAttacks(sheetList, labels = {}) {
  if (!claim(sheetList)) return;
  const L = weaponLabels(labels);
  sheetList.classList.add("navis-attacks", "navis-armament");

  for (const row of sheetList.querySelectorAll(":scope > .list-content > .list-row")) {
    refitWeaponRow(row, L);
  }
}

/** Traits: clamp long descriptions and offer the full rule on demand. */
export function refitTraits(sheetList, labels = {}) {
  if (!claim(sheetList)) return;
  sheetList.classList.add("navis-traits");
  for (const row of sheetList.querySelectorAll(":scope > .list-content > .list-row")) {
    const description = row.querySelector(":scope > .description");
    if (!description) continue;
    // Roughly two lines at the refit's measure. Measuring the element instead
    // would read zero whenever the Main tab is not the active one.
    if (description.textContent.trim().length <= 150) continue;
    const toggle = el("a", "navis-more", labels.more ?? "Read full rule");
    toggle.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const open = row.classList.toggle("navis-open");
      toggle.textContent = open ? (labels.less ?? "Show less") : (labels.more ?? "Read full rule");
    });
    description.after(toggle);
  }
}

/**
 * Warp charge. The bar is re-rendered with a new inline width whenever the
 * charge changes, so on its own it would snap. Remember the last width per
 * actor and hand the stylesheet a starting point, so the fill surges from
 * where it was to where it is now — and flows in from empty the first time a
 * charged sheet opens.
 *
 * @param {HTMLElement} root   the sheet element
 * @param {Map<string, number>} memory   last width per actor, kept by the caller
 * @param {string} key   the actor's id
 */
export function refitWarp(root, memory, key) {
  const container = root.querySelector(".warp-charge .bar-container");
  const bar = container?.querySelector(":scope > .bar");
  if (!bar || !claim(bar)) return;

  const now = parseFloat(bar.style.width) || 0;
  const before = memory.get(key);
  memory.set(key, now);

  container.style.setProperty("--navis-warp-level", String(clamp(now / 100, 0, 1)));
  if ((before === undefined && now > 0) || (before !== undefined && before !== now)) {
    bar.style.setProperty("--navis-warp-from", `${before ?? 0}%`);
    bar.classList.add("navis-warp-surge");
  }
}

/** Run every NPC pass that applies to a rendered sheet element. */
export function refitNpcSheet(root, labels = {}) {
  const header = root.querySelector('.npc-header, [data-application-part="header"]');
  if (header) refitNpcHeader(header, labels);

  const main = root.querySelector('[data-application-part="main"], section.tab[data-tab="main"]');
  if (!main) return;

  const actions = main.querySelector(".action-list");
  if (actions) refitActions(actions, labels);

  for (const list of main.querySelectorAll(":scope > .sheet-list")) {
    if (list.querySelector(".skills-summary")) refitSkillsSummary(list, labels);
    else if (list.querySelector('[data-action="createItem"][data-type="weapon"]')) refitAttacks(list, labels);
    else if (list.classList.contains("traits")) refitTraits(list, labels);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   NOTES SECTIONS — обе анкеты и лист предмета
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Notes sections with nothing in them start collapsed to their header.
 *
 * Одна и та же разметка стоит и на вкладке заметок персонажа, НИП, покровителя
 * и машины, и на листе предмета, поэтому пас зовут оба хука рендера. Типы
 * "duty" и "character" сюда не попадают намеренно: у них одна нескладываемая
 * секция и заметок ведущего нет вовсе.
 *
 * impmal opens every editor section by default, so a document with no GM notes
 * shows an empty editor a hundred and seventy pixels tall. impmal already marks
 * an empty section — its chevron gets `inactive` when the enriched text is
 * blank — so that is the test. The header stays: it is still the click target
 * that opens the section to write in it. The sheet's remembered collapse
 * state is left alone, so a section someone opened by hand stays theirs.
 */
export function refitEditorSections(root) {
  for (const section of root.querySelectorAll(".editor-section")) {
    if (!claim(section)) continue;
    if (!section.querySelector(":scope > .header .collapse-toggle.inactive")) continue;
    section.classList.add("navis-empty");
    section.querySelector(":scope > .dropdown-content.expanded")?.classList.replace("expanded", "collapsed");
  }
}

/**
 * The conditions panel's "Add Effect" placeholder.
 *
 * impmal writes that option's text straight into actor-effects.hbs with no
 * localisation key, so no translation can reach it. The option carries no
 * value, which is how the placeholder is told apart from the zone effects
 * listed under it.
 */
export function refitAddEffect(root, labels = {}) {
  const label = labels.addEffect;
  if (!label) return;

  for (const select of root.querySelectorAll("select.add-effect")) {
    const placeholder = select.querySelector("option:not([value])");
    if (!placeholder || !claim(placeholder)) continue;
    placeholder.textContent = label;
  }
}

/**
 * impmal's character generator.
 *
 * It is still an ApplicationV1, which is why it arrives unpainted: every rule
 * in this skin targets `.application`, and a V1 window is `.window-app`. The
 * painting is in src/skin/77-chargen.css; this pass adds the one thing CSS
 * cannot know — which stages the wizard considers done, and which are still
 * waiting on an earlier one.
 *
 * `app.stages` is the wizard's own list, each with `complete` and `dependantOn`.
 */
export function refitChargen(app, html, labels = {}) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  const stages = app?.stages;
  if (!root || !Array.isArray(stages)) return;

  const done = new Set(stages.filter(stage => stage.complete).map(stage => stage.key));

  for (const button of root.querySelectorAll("button.chargen-button")) {
    const stage = stages[Number(button.dataset.stage)];
    if (!stage) continue;

    button.classList.toggle("navis-done", Boolean(stage.complete));

    // A stage whose prerequisite is unfinished cannot be opened yet; impmal
    // says so only by refusing the click, which reads as a broken button.
    const waiting = (stage.dependantOn ?? []).filter(key => !done.has(key));
    button.classList.toggle("navis-blocked", waiting.length > 0);

    if (waiting.length && labels.stageBlocked) {
      const names = waiting.map(key => stages.find(s => s.key === key)?.title ?? key);
      button.dataset.tooltip = `${labels.stageBlocked}: ${names.join(", ")}`;
    }
  }
}

/**
 * Two strings the wizard's stage templates write as raw English text, never
 * passing them through `localize`, so no translation can reach them:
 *
 *   faction.hbs / role.hbs:  Allocate {n} Advances to the following Skills
 *   faction.hbs:             <a class="choose">… Choose Equipment</a>
 *
 * The first carries a number, so the count is read back out of the text rather
 * than assumed. Both are replaced only once — the pass claims what it rewrites.
 */
export function refitChargenStage(html, labels = {}) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root) return;

  if (labels.allocateAdvances) {
    for (const note of root.querySelectorAll("p.centered")) {
      const match = note.textContent.trim().match(/^Allocate\s+(\d+)\s+Advances/i);
      if (!match || !claim(note)) continue;
      note.textContent = labels.allocateAdvances.replace("{n}", match[1]);
    }
  }

  if (labels.chooseEquipment) {
    for (const link of root.querySelectorAll("a.choose.choice-menu")) {
      if (!claim(link)) continue;
      const icon = link.querySelector("i");
      link.textContent = "";
      if (icon) link.append(icon, " ");
      link.append(labels.chooseEquipment);
    }
  }
}
