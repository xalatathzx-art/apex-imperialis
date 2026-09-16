/**
 * Russian for the content, as opposed to the interface.
 *
 * A language file reaches anything impmal prints through `game.i18n` — labels,
 * tabs, tooltips, the difficulty ladder. It cannot reach two other things:
 *
 *  1. Compendium documents. A talent's name and its rules text are document
 *     data, stored in the pack. Translating them means translating documents,
 *     which is what Babele exists for: it reads JSON files keyed by pack and
 *     rewrites each document as it leaves the compendium, leaving the pack
 *     itself untouched. That matters here — impmal-core, impmal-inquisition
 *     and impmal-requisition are Cubicle 7's packs, and we must not modify or
 *     redistribute them. A translation layer sits beside them instead.
 *
 *  2. Strings impmal hard-codes in its config. `config.factions` holds English
 *     text rather than i18n keys, so the Influence panel prints English
 *     whatever the language. Those are overwritten here.
 *
 * Both are gated on Russian, and the first is gated on Babele being installed:
 * without it the compendiums simply stay English, which is the stock state.
 */

import { FACTIONS_RU } from "./config/factions.js";

const MODULE_ID = "navis-apexialis";

/** Where the Babele files live, relative to the module root. */
const TRANSLATION_DIR = "compendium";

/**
 * Babele fires `babele.init` from its own `init` hook, and module order decides
 * whether that is before or after ours — so the listener is armed at load time,
 * while the ES module is being evaluated, which is earlier than any init hook.
 */
export function registerCompendiumTranslations() {
  Hooks.once("babele.init", babele => {
    if (game.i18n.lang !== "ru") return;

    babele.register({ module: MODULE_ID, lang: "ru", dir: TRANSLATION_DIR });
    console.log(`${MODULE_ID} | registered Russian compendium translations with Babele`);
  });
}

/**
 * Hard-coded config strings, rewritten at `setup`.
 *
 * Not at `i18nInit`: the book-terminology pass rebuilds impmal's config from a
 * snapshot on that hook, running every value back through `localize`. A faction
 * name is not a key, so `localize` would hand back the English it was given and
 * undo this. `setup` fires after all of that and nothing rewrites the config
 * again, which makes the order a fact rather than a hope.
 */
export function registerContentStrings() {
  Hooks.once("setup", () => {
    if (game.i18n.lang !== "ru") return;

    const factions = game.impmal?.config?.factions;
    if (!factions) return;

    for (const [key, name] of Object.entries(FACTIONS_RU)) {
      if (key in factions) factions[key] = name;
    }
  });
}
