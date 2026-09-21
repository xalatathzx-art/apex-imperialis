// Compatibility layer for hard-coded Imperium Maledictum system scripts and
// effect macros that still use the original official pack namespaces.
const PREFIXES = [
  ["Compendium.impmal-core.actors", "Compendium.navis-apexialis.navis-core-actors"],
  ["Compendium.impmal-core.items", "Compendium.navis-apexialis.navis-core-items"],
  ["Compendium.impmal-core.journals", "Compendium.navis-apexialis.navis-core-journals"],
  ["Compendium.impmal-core.tables", "Compendium.navis-apexialis.navis-core-tables"],
  ["Compendium.impmal-core.scenes", "Compendium.navis-apexialis.navis-core-scenes"],
  ["Compendium.impmal-inquisition.actors", "Compendium.navis-apexialis.navis-inquisition-actors"],
  ["Compendium.impmal-inquisition.items", "Compendium.navis-apexialis.navis-inquisition-items"],
  ["Compendium.impmal-inquisition.journals", "Compendium.navis-apexialis.navis-inquisition-journals"],
  ["Compendium.impmal-inquisition.tables", "Compendium.navis-apexialis.navis-inquisition-tables"],
  ["Compendium.impmal-requisition.actors", "Compendium.navis-apexialis.navis-requisition-actors"],
  ["Compendium.impmal-requisition.items", "Compendium.navis-apexialis.navis-requisition-items"],
  ["Compendium.impmal-requisition.journals", "Compendium.navis-apexialis.navis-requisition-journals"],
  ["Compendium.impmal-requisition.tables", "Compendium.navis-apexialis.navis-requisition-tables"],
  ["Compendium.impmal-voll.actors", "Compendium.navis-apexialis.navis-voll-actors"],
  ["Compendium.impmal-voll.items", "Compendium.navis-apexialis.navis-voll-items"],
  ["Compendium.impmal-voll.journals", "Compendium.navis-apexialis.navis-voll-journals"],
  ["Compendium.impmal-voll.tables", "Compendium.navis-apexialis.navis-voll-tables"],
  ["Compendium.impmal-voll.scenes", "Compendium.navis-apexialis.navis-voll-scenes"]
];

export function navisUuid(value) {
  if (typeof value !== "string") return value;
  for (const [from, to] of PREFIXES) if (value.startsWith(from)) return to + value.slice(from.length);
  return value;
}

// warhammer-lib resolves DocumentReference uuids through foundry.utils.fromUuid
// directly, so patching only the globals leaves that path — the one existing
// worlds hit for pre-migration actors — unaliased. Patch both surfaces.
const PATCHED = "navisUuidAliased";

function patch(host, name) {
  const native = host?.[name];
  if (typeof native !== "function" || native[PATCHED]) return;
  const wrapper = function (uuid, ...rest) {
    return native.call(this, navisUuid(uuid), ...rest);
  };
  wrapper[PATCHED] = true;
  host[name] = wrapper;
}

for (const host of [globalThis, globalThis.foundry?.utils]) {
  patch(host, "fromUuid");
  patch(host, "fromUuidSync");
}
