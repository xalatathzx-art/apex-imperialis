/**
 * Vocabulary Navis Apexialis adds to the impmal system config.
 *
 * These are the keys the compendium content refers to. Without them an NPC with
 * the `overseer` role shows nothing at all, so this has to land on `init`,
 * before any sheet renders.
 *
 * Maledictum Expanded's forty weapon and armour traits used to be registered
 * here as well and have been removed. Three of the forty did anything at all —
 * Gauss, Phase and Tesla, all on Necron weapons — and those keep working,
 * because impmal resolves a trait's mechanics through
 * `config.weaponTraitEffects[key]`, which has nothing to do with this list of
 * names. The rest were labels with no rules behind them, and twenty-eight of
 * those were not even on an item.
 *
 * The values are i18n keys, not labels. impmal localises its whole config from
 * `i18nInit` (`Hooks.on("i18nInit", () => localizeConfig(game.impmal.config))`),
 * which Foundry fires after `init` — so anything merged in from our own init
 * hook goes through the same pass. English lives in lang/en.json, Russian in
 * `OURS` in src/lang/ru.mjs.
 *
 * Ported from impmal-malexp v1.4.0.
 */

export const DISCIPLINES = {
  nurglitePowers: "NAVIS.Discipline.nurglitePowers"
};

export const NPC_ROLES = {
  master: "NAVIS.NpcRole.master",
  overseer: "NAVIS.NpcRole.overseer"
};
