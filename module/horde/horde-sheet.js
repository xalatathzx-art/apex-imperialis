/**
 * The Horde row on the NPC sheet's Effects tab.
 *
 * A DOM pass over markup impmal has already rendered, in the same style as the
 * rest of the refit: it adds a block, never replaces an impmal template, and it
 * marks what it has done so a re-render of the tab is a no-op.
 *
 * One numeric input drives the whole subsystem, and the row shows nothing else.
 * The Effects tab is already crowded, so the readouts that used to sit here —
 * Tier, the outgoing modifier, how many targets a mob's attack covers — live in
 * the rules journal and on the token instead. What the field means is on the
 * row's tooltip, which costs no height.
 */

import { readHorde, writeSize } from "./horde-data.js";

const DONE = "navisHorde";

export function refitHordeRow(root, actor) {
  if (!root || actor?.type !== "npc") return;

  const effects = root.querySelector('[data-application-part="effects"], section.tab[data-tab="effects"]');
  if (!effects) return;

  const existing = effects.querySelector(".navis-horde");
  if (existing) {
    // A re-render replaced the tab's contents; the old node is gone with it.
    if (existing.isConnected && existing.dataset[DONE]) return;
  }

  const horde = readHorde(actor);

  const block = document.createElement("div");
  block.className = "navis-horde";
  block.dataset[DONE] = "1";
  block.dataset.tooltip = t("NAVIS.Horde.Hint");
  block.dataset.tooltipDirection = "UP";
  block.innerHTML = markup(horde);

  const input = block.querySelector("input[name='navis-horde-size']");
  input.addEventListener("change", async event => {
    const raw = event.currentTarget.value.trim();
    // An empty field means "this is not a horde"; a typed 0 means "wiped out".
    await writeSize(actor, raw === "" ? 0 : Number(raw), { clear: raw === "" });
    actor.sheet?.render(false);
  });

  effects.prepend(block);
}

function t(key, data) {
  return data ? game.i18n.format(key, data) : game.i18n.localize(key);
}

function markup(horde) {
  // No flag at all: an ordinary NPC, with the field offered to field one.
  const value = horde ? `value="${horde.size ?? 0}"` : 'value="" placeholder="—"';

  return `
    <label class="navis-horde-label">${t("NAVIS.Horde.Label")}</label>
    <span class="navis-horde-caption">${t("NAVIS.Horde.Strength")}</span>
    <input type="number" name="navis-horde-size" min="0" step="1" ${value} />`;
}
