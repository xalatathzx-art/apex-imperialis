/**
 * Keep the book's vocabulary when another Russian translation is installed.
 *
 * Foundry merges translation files in the order core → system → modules → world,
 * and within modules in module order. Whoever loads last wins, and that order is
 * decided by the install rather than by any module — so with a second Russian
 * translation active, this module's strings are silently replaced, including the
 * ones it left in English.
 *
 * That is a real difference, not a matter of taste. The other translation reads
 * the difficulty ladder as cognates, which swaps Challenging (+0) and Hard (−20)
 * against the printed book, and renames Wounds, Presence, Fellowship and Rapport.
 * A table reading the Russian rulebook would find the sheet disagreeing with the
 * page at the two most-used difficulties.
 *
 * Two things have to happen, and the order of Foundry's own steps decides both:
 *
 *  1. Foundry fires `init` (game.mjs:661) but only loads translations at :672,
 *     where `setLanguage` *replaces* `game.i18n.translations` wholesale. Merging
 *     at init writes into an object that is then thrown away, so the merge waits
 *     for `i18nInit`, which fires at the end of that load.
 *
 *  2. impmal localizes its own config on `i18nInit` too, walking every string in
 *     `game.impmal.config` through `localize` and replacing the key with the
 *     text. It registers that hook from a classic script, so it always runs
 *     before a module's — by the time we merge, the keys are gone and the
 *     characteristics, skills and difficulties are already the other
 *     translation's words. So the config is snapshotted at `init`, while it
 *     still holds keys, and rebuilt from that snapshot after the merge.
 *
 * It is a setting, because it is the user's table and they may prefer the other
 * translation's words.
 */

import { RU_TERMS } from "../lang/ru-terms.mjs";

const MODULE_ID = "navis-apexialis";
const SETTING = "bookTerminology";

/** impmal's config as it was before anything localized it: values are i18n keys. */
let rawConfig = null;
let rawStatusEffects = null;

/** Registered at init; the override itself waits for i18nInit. */
export function registerTerminology() {
  game.settings.register(MODULE_ID, SETTING, {
    name: "Терминология по книге",
    hint:
      "Использовать термины русского издания Imperium Maledictum (Раны, Командование, Средняя) даже если установлен другой русский перевод. Выключите, чтобы оставить его словарь.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true
  });

  if (!shouldOverride()) return;

  rawConfig = foundry.utils.deepClone(game.impmal?.config ?? {});
  rawStatusEffects = foundry.utils.deepClone(CONFIG.statusEffects ?? []);

  Hooks.once("i18nInit", applyBookTerminology);
}

/** Only when Russian is on, the setting is on, and something else is competing. */
function shouldOverride() {
  if (game.i18n.lang !== "ru") return false;
  if (!game.settings.get(MODULE_ID, SETTING)) return false;

  return game.modules.some(
    module => module.active && module.id !== MODULE_ID && module.languages?.some(l => l.lang === "ru")
  );
}

function applyBookTerminology() {
  foundry.utils.mergeObject(game.i18n.translations, RU_TERMS, { inplace: true });

  // impmal has already baked the other translation into its config; rebuild it
  // from the keys we kept, which now resolve to ours.
  relocalize(game.impmal?.config, rawConfig);
  relocalize(CONFIG.statusEffects, rawStatusEffects);

  console.log(`${MODULE_ID} | book terminology applied over the other Russian translation`);
}

/**
 * Walk the snapshot and write each key's translation back into the live object.
 * Anything the snapshot does not describe is left alone, so config another
 * module added after ours survives.
 */
function relocalize(live, raw) {
  if (!live || !raw) return;

  for (const key of Object.keys(raw)) {
    const value = raw[key];

    if (typeof value === "string") live[key] = game.i18n.localize(value);
    else if (value && typeof value === "object") relocalize(live[key], value);
  }
}
