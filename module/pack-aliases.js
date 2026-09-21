// Keep the original Imperium Maledictum collection names resolvable after the
// official packs have been consolidated into Navis Apexialis.
const ALIASES = {
  "impmal-core.actors": "navis-apexialis.navis-core-actors",
  "impmal-core.items": "navis-apexialis.navis-core-items",
  "impmal-core.journals": "navis-apexialis.navis-core-journals",
  "impmal-core.tables": "navis-apexialis.navis-core-tables",
  "impmal-core.scenes": "navis-apexialis.navis-core-scenes",
  "impmal-inquisition.actors": "navis-apexialis.navis-inquisition-actors",
  "impmal-inquisition.items": "navis-apexialis.navis-inquisition-items",
  "impmal-inquisition.journals": "navis-apexialis.navis-inquisition-journals",
  "impmal-inquisition.tables": "navis-apexialis.navis-inquisition-tables",
  "impmal-requisition.actors": "navis-apexialis.navis-requisition-actors",
  "impmal-requisition.items": "navis-apexialis.navis-requisition-items",
  "impmal-requisition.journals": "navis-apexialis.navis-requisition-journals",
  "impmal-requisition.tables": "navis-apexialis.navis-requisition-tables",
  "impmal-voll.actors": "navis-apexialis.navis-voll-actors",
  "impmal-voll.items": "navis-apexialis.navis-voll-items",
  "impmal-voll.journals": "navis-apexialis.navis-voll-journals",
  "impmal-voll.tables": "navis-apexialis.navis-voll-tables",
  "impmal-voll.scenes": "navis-apexialis.navis-voll-scenes"
};

// game.packs only exists once Foundry has built the compendium collections,
// which happens between the init and setup hooks.
Hooks.once("setup", () => {
  if (typeof game.packs?.get !== "function" || game.packs.get.navisAliased) return;
  const nativeGet = game.packs.get.bind(game.packs);
  // Callers pass {strict: true} to make a miss throw. Look the alias up on a
  // non-strict probe first so the fallback gets its chance, and only let the
  // native call throw when neither name resolves.
  const aliased = function (key, options) {
    const direct = nativeGet(key);
    if (direct) return direct;
    const alias = ALIASES[key];
    if (alias) {
      const fallback = nativeGet(alias);
      if (fallback) return fallback;
    }
    return nativeGet(key, options);
  };
  aliased.navisAliased = true;
  game.packs.get = aliased;
  console.info(`navis-apexialis | ${Object.keys(ALIASES).length} legacy compendium aliases enabled`);
});
