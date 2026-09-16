/**
 * The strength counter over a horde's token, and the casualty line in chat.
 *
 * Neither can be done through data. A token bar reads a numeric attribute out of
 * `system`, and a horde's Strength is a flag; the chat card's damage line is
 * printed from `result.damage` by impmal's own template, with our text relegated
 * to a tooltip. So both are drawn on top of what the system already rendered —
 * the same approach the rest of the skin takes.
 */

import { MODULE_ID, readHorde } from "./horde-data.js";

const LABEL = "navisHordeCount";

/* ══════════════════════════════════════════════════════════════════════════
   TOKEN — the number of bodies still standing
   ══════════════════════════════════════════════════════════════════════ */

/** Skin-matched: tabular figures, heavy dark outline so it reads on any art. */
function style(fontSize) {
  return new PIXI.TextStyle({
    fontFamily: CONFIG.canvasTextStyle?.fontFamily ?? "Signika",
    fontSize,
    fontWeight: "700",
    fill: "#f2e7d5",
    stroke: "#0b0b0c",
    strokeThickness: Math.max(3, Math.round(fontSize / 5)),
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowDistance: 0,
    align: "center"
  });
}

function drawCount(token) {
  const horde = readHorde(token?.actor);

  if (!horde) {
    if (token[LABEL]) {
      token.removeChild(token[LABEL]);
      token[LABEL].destroy();
      token[LABEL] = null;
    }
    return;
  }

  const size = Math.round(Math.max(16, token.h / 4.5));
  const text = horde.destroyed ? "0" : String(horde.size);

  if (!token[LABEL]) {
    token[LABEL] = token.addChild(new foundry.canvas.containers.PreciseText(text, style(size)));
    token[LABEL].anchor.set(0.5, 1);
  } else {
    token[LABEL].text = text;
    token[LABEL].style = style(size);
  }

  token[LABEL].alpha = horde.destroyed ? 0.5 : 1;
  // Bottom centre, just inside the frame, where a nameplate would not collide.
  token[LABEL].position.set(token.w / 2, token.h - 2);
  token[LABEL].visible = token.visible;
  // Above the token art and its effects, below the ruler and targeting pips.
  token[LABEL].zIndex = 100;
}

export function registerHordeToken() {
  Hooks.on("drawToken", drawCount);
  Hooks.on("refreshToken", drawCount);

  // The flag lives on the actor, so a change there has to reach every token of it.
  Hooks.on("updateActor", (actor, changes) => {
    if (!foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) return;
    for (const token of actor.getActiveTokens()) drawCount(token);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   CHAT — what the attack actually did
   ══════════════════════════════════════════════════════════════════════ */

/**
 * impmal's card prints "N damage (Applied)" from the raw test result, which for
 * a horde is the least interesting number on it: what the table wants to know is
 * how many of them fell. The applied data we returned is stored whole on the
 * message, so the casualties are already there to read.
 */
function appliedData(message) {
  return message?.system?.applied || message?.system?.context?.applied || null;
}

export function refitHordeCard(message, element) {
  const applied = appliedData(message);
  const horde = applied?.horde;
  if (!horde) return;

  for (const details of element.querySelectorAll(".applied-details")) {
    if (details.dataset[LABEL]) continue;
    details.dataset[LABEL] = "1";

    const line = document.createElement("span");
    line.className = "navis-horde-casualties";
    line.textContent = horde.casualties
      ? game.i18n.format("NAVIS.Horde.Losses", { casualties: horde.casualties, size: horde.sizeAfter })
      : game.i18n.localize("NAVIS.Horde.NoLoss");
    if (horde.destroyed) line.classList.add("destroyed");

    details.prepend(line);
  }
}
