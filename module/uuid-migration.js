/* One-shot world migration for documents that still point at the official packs. */
const NAVIS_UUID_MAP = {
  "impmal-core": "navis-core",
  "impmal-inquisition": "navis-inquisition",
  "impmal-requisition": "navis-requisition",
  "impmal-voll": "navis-voll"
};

function rewriteNavisUuid(value) {
  if (typeof value !== "string") return value;
  let out = value;
  for (const [from, to] of Object.entries(NAVIS_UUID_MAP)) {
    out = out.replaceAll(`Compendium.${from}.`, `Compendium.navis-apexialis.${to}-`);
  }
  return out;
}

function rewriteDeep(value) {
  if (typeof value === "string") return rewriteNavisUuid(value);
  if (Array.isArray(value)) return value.map(rewriteDeep);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewriteDeep(child)]));
}

Hooks.once("ready", async () => {
  if (!game.user?.isGM || game.settings.get("navis-apexialis", "uuidMigrationComplete")) return;
  const collections = [game.actors, game.items, game.journal, game.tables, game.scenes].filter(Boolean);
  let updated = 0;
  for (const collection of collections) {
    for (const doc of collection) {
      const source = doc.toObject();
      const rewritten = rewriteDeep(source);
      if (JSON.stringify(source) === JSON.stringify(rewritten)) continue;
      const changes = foundry.utils.flattenObject(rewritten);
      delete changes._id;
      await doc.update(changes);
      updated += 1;
    }
  }
  await game.settings.set("navis-apexialis", "uuidMigrationComplete", true);
  console.info(`Navis Apexialis: migrated ${updated} world documents to consolidated compendiums.`);
});
