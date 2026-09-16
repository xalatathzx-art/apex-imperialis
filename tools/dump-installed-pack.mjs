/** Read-only helpers for indexing installed Foundry compendium packs. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readPack, partition } from "./lib/level.mjs";

export function collectionSummary(index, packageName) {
  return Object.fromEntries(Object.entries(index)
    .filter(([collection]) => collection.startsWith(`${packageName}.`))
    .map(([collection, pack]) => [collection, Object.keys(pack.entries ?? {}).length]));
}

export async function dumpPack(packRoot, name) {
  const { primary, embedded } = partition(await readPack(path.join(packRoot, name)));
  return { primary, embedded };
}

export function journalIndex(primary, embedded) {
  const pageById = new Map(Object.values(embedded).map(page => [page._id, page]));
  return Object.fromEntries(primary.map(journal => [journal._id, {
    type: null,
    name: journal.name,
    pages: (journal.pages ?? []).map(id => ({ id, name: pageById.get(id)?.name ?? "" }))
  }]));
}

export function actorIndex(primary, embedded) {
  const byId = new Map(Object.values(embedded).map(document => [document._id, document]));
  return Object.fromEntries(primary.map(actor => [actor._id, {
    type: actor.type ?? null,
    name: actor.name,
    ...(actor._stats?.compendiumSource ? { src: actor._stats.compendiumSource.split(".").at(-1) } : {}),
    embedded: (actor.items ?? []).map(id => byId.get(id)?.name ?? id),
    ...(actor.system?.species ? { species: actor.system.species } : {})
  }]));
}

export function itemIndex(primary) {
  return Object.fromEntries(primary.map(item => [item._id, {
    type: item.type ?? null,
    name: item.name,
    ...(item._stats?.compendiumSource ? { src: item._stats.compendiumSource.split(".").at(-1) } : {})
  }]));
}

export function tableIndex(primary, embedded) {
  const byId = new Map(Object.values(embedded).map(document => [document._id, document]));
  return Object.fromEntries(primary.map(table => [table._id, {
    type: null,
    name: table.name,
    rows: (table.results ?? []).map(id => {
      const row = byId.get(id) ?? {};
      const uuid = row.documentUuid ?? "";
      const match = uuid.match(/^Compendium\.([^.]+\.[^.]+)\.[^.]+\.([^.]+)$/);
      return {
        id,
        range: row.range,
        text: row.description ?? row.text ?? "",
        ...(match ? { refPack: match[1], ref: match[2] } : {})
      };
    })
  }]));
}

export function sceneIndex(primary, embedded) {
  const byId = new Map(Object.values(embedded).map(document => [document._id, document]));
  return Object.fromEntries(primary.map(scene => [scene._id, {
    type: null,
    name: scene.name,
    drawings: (scene.drawings ?? []).map(id => ({ id, text: byId.get(id)?.text ?? "" })),
    regions: (scene.regions ?? []).map(id => ({
      id,
      name: byId.get(id)?.name ?? "",
      behaviors: (byId.get(id)?.behaviors ?? []).map(behaviorId => ({
        id: behaviorId,
        name: byId.get(behaviorId)?.name ?? ""
      }))
    }))
  }]));
}

export function packIndex(packageId, manifest, dumped) {
  const definition = new Map((manifest.packs ?? []).map(pack => [path.basename(pack.path ?? pack.name), pack]));
  const make = (name, entries) => {
    const pack = definition.get(name);
    return [`${packageId}.${name === "journal" ? "journals" : name}`, {
      label: pack?.label ?? name,
      documentName: pack?.type ?? null,
      entries
    }];
  };
  return Object.fromEntries([
    make("actors", actorIndex(dumped.actors.primary, dumped.actors.embedded)),
    make("items", itemIndex(dumped.items.primary)),
    make("journal", journalIndex(dumped.journal.primary, dumped.journal.embedded)),
    make("tables", tableIndex(dumped.tables.primary, dumped.tables.embedded)),
    ...(dumped.scenes ? [make("scenes", sceneIndex(dumped.scenes.primary, dumped.scenes.embedded))] : [])
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [packRoot, output, packageId, manifestPath] = process.argv.slice(2);
  if (!packRoot || !output) throw new Error("Usage: node tools/dump-installed-pack.mjs <copied-pack-root> <output.json> [package-id module.json]");
  const result = {};
  for (const name of ["actors", "items", "journal", "tables", "scenes"]) {
    if (fs.existsSync(path.join(packRoot, name))) result[name] = await dumpPack(packRoot, name);
  }
  if (packageId && manifestPath) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const generated = packIndex(packageId, manifest, result);
    const index = output.endsWith("packs-index.json") && fs.existsSync(output)
      ? JSON.parse(fs.readFileSync(output, "utf8"))
      : {};
    for (const key of Object.keys(index).filter(key => key.startsWith(`${packageId}.`))) delete index[key];
    Object.assign(index, generated);
    fs.writeFileSync(output, `${JSON.stringify(index, null, 2)}\n`);
  } else fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
}
