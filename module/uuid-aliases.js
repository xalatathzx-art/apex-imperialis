// Compatibility layer for hard-coded Imperium Maledictum system scripts and
// effect macros that still use the original official pack namespaces.
const PREFIXES = [
  ["Compendium.impmal-core.actors", "Compendium.apex-imperialis.navis-core-actors"],
  ["Compendium.impmal-core.items", "Compendium.apex-imperialis.navis-core-items"],
  ["Compendium.impmal-core.journals", "Compendium.apex-imperialis.navis-core-journals"],
  ["Compendium.impmal-core.tables", "Compendium.apex-imperialis.navis-core-tables"],
  ["Compendium.impmal-core.scenes", "Compendium.apex-imperialis.navis-core-scenes"],
  ["Compendium.impmal-inquisition.actors", "Compendium.apex-imperialis.navis-inquisition-actors"],
  ["Compendium.impmal-inquisition.items", "Compendium.apex-imperialis.navis-inquisition-items"],
  ["Compendium.impmal-inquisition.journals", "Compendium.apex-imperialis.navis-inquisition-journals"],
  ["Compendium.impmal-inquisition.tables", "Compendium.apex-imperialis.navis-inquisition-tables"],
  ["Compendium.impmal-requisition.actors", "Compendium.apex-imperialis.navis-requisition-actors"],
  ["Compendium.impmal-requisition.items", "Compendium.apex-imperialis.navis-requisition-items"],
  ["Compendium.impmal-requisition.journals", "Compendium.apex-imperialis.navis-requisition-journals"],
  ["Compendium.impmal-requisition.tables", "Compendium.apex-imperialis.navis-requisition-tables"],
  ["Compendium.impmal-voll.actors", "Compendium.apex-imperialis.navis-voll-actors"],
  ["Compendium.impmal-voll.items", "Compendium.apex-imperialis.navis-voll-items"],
  ["Compendium.impmal-voll.journals", "Compendium.apex-imperialis.navis-voll-journals"],
  ["Compendium.impmal-voll.tables", "Compendium.apex-imperialis.navis-voll-tables"],
  ["Compendium.impmal-voll.scenes", "Compendium.apex-imperialis.navis-voll-scenes"],
  // 0.2.0 and earlier shipped under the `navis-apexialis` id; its UUIDs live on
  // in worlds built against it.
  ["Compendium.navis-apexialis.", "Compendium.apex-imperialis."]
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
