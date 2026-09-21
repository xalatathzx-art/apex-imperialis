// Keep the original Imperium Maledictum collection names resolvable after the
// official packs have been consolidated into Apex Imperialis.
const ALIASES = {
  "impmal-core.actors": "apex-imperialis.navis-core-actors",
  "impmal-core.items": "apex-imperialis.navis-core-items",
  "impmal-core.journals": "apex-imperialis.navis-core-journals",
  "impmal-core.tables": "apex-imperialis.navis-core-tables",
  "impmal-core.scenes": "apex-imperialis.navis-core-scenes",
  "impmal-inquisition.actors": "apex-imperialis.navis-inquisition-actors",
  "impmal-inquisition.items": "apex-imperialis.navis-inquisition-items",
  "impmal-inquisition.journals": "apex-imperialis.navis-inquisition-journals",
  "impmal-inquisition.tables": "apex-imperialis.navis-inquisition-tables",
  "impmal-requisition.actors": "apex-imperialis.navis-requisition-actors",
  "impmal-requisition.items": "apex-imperialis.navis-requisition-items",
  "impmal-requisition.journals": "apex-imperialis.navis-requisition-journals",
  "impmal-requisition.tables": "apex-imperialis.navis-requisition-tables",
  "impmal-voll.actors": "apex-imperialis.navis-voll-actors",
  "impmal-voll.items": "apex-imperialis.navis-voll-items",
  "impmal-voll.journals": "apex-imperialis.navis-voll-journals",
  "impmal-voll.tables": "apex-imperialis.navis-voll-tables",
  "impmal-voll.scenes": "apex-imperialis.navis-voll-scenes"
};

// The module was published as `navis-apexialis` up to 0.2.0. Worlds built then
// still hold Compendium.navis-apexialis.* UUIDs, so every pack answers to its
// old module id as well.
for (const pack of [
  "navis-core-actors", "navis-core-items", "navis-core-journals", "navis-core-tables", "navis-core-scenes",
  "navis-inquisition-actors", "navis-inquisition-items", "navis-inquisition-journals", "navis-inquisition-tables",
  "navis-requisition-actors", "navis-requisition-items", "navis-requisition-journals", "navis-requisition-tables",
  "navis-voll-actors", "navis-voll-items", "navis-voll-journals", "navis-voll-tables", "navis-voll-scenes",
  "navis-species", "navis-items", "navis-talents", "navis-bestiary", "navis-rules"
]) ALIASES[`navis-apexialis.${pack}`] = `apex-imperialis.${pack}`;

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
  console.info(`apex-imperialis | ${Object.keys(ALIASES).length} legacy compendium aliases enabled`);
});
