/**
 * File every Imperium Maledictum compendium into one folder in the sidebar.
 *
 * Paste into the console (F12) as GM, once per world. It moves nothing and
 * copies nothing: a compendium folder is a world-level label, and a pack can
 * sit in one whatever module ships it. Cubicle 7's books stay their own
 * modules, so they keep updating, and the sidebar still reads as one thing.
 *
 * Re-running is safe — it reuses the folders it made last time.
 */

const ROOT = "Imperium Maledictum";

/** Sidebar order, and the label each module gets. Anything absent is skipped. */
const SHELVES = [
  { id: "navis-apexialis", label: "Navis Apexialis", color: "#8b6a1f" },
  { id: "impmal-core", label: "Core Rulebook", color: "#4a5a6a" },
  { id: "impmal-inquisition", label: "Inquisition Guide", color: "#6a3a3a" },
  { id: "impmal-requisition", label: "Macharian Requisition", color: "#3a5a4a" }
];

const findFolder = (name, parent = null) =>
  game.folders.find(f => f.type === "Compendium" && f.name === name && f.folder?.id === (parent?.id ?? undefined));

const root =
  game.folders.find(f => f.type === "Compendium" && f.name === ROOT && !f.folder) ??
  (await Folder.create({ name: ROOT, type: "Compendium", color: "#8b6a1f", sorting: "m" }));

let filed = 0;

for (const [index, shelf] of SHELVES.entries()) {
  const packs = game.packs.filter(pack => pack.metadata.packageName === shelf.id);
  if (!packs.length) continue;

  const folder =
    findFolder(shelf.label, root) ??
    (await Folder.create({
      name: shelf.label,
      type: "Compendium",
      folder: root.id,
      color: shelf.color,
      sort: (index + 1) * 1000,
      sorting: "m"
    }));

  for (const pack of packs) {
    if (pack.folder?.id === folder.id) continue;
    await pack.configure({ folder: folder.id });
    filed++;
  }
}

ui.notifications.info(`${filed} compendiums filed under "${ROOT}".`);
console.log(
  `Compendium shelves under "${ROOT}":`,
  SHELVES.map(s => `${s.label} (${game.packs.filter(p => p.metadata.packageName === s.id).length})`).join(", ")
);
