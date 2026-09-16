/**
 * Constructor entries → one Active Effect, and back again.
 *
 * The effect is created ON THE IMPLANT, never on the actor. That is the whole
 * rollback story: an embedded document leaves with its parent, so removing the
 * implant removes its mechanics however the removal happened — deleted, dragged
 * off, or the actor rebuilt. There is no bookkeeping to get wrong.
 *
 * One effect carries both halves. `changes` are the numeric entries, reaching
 * the same data paths impmal's own effect keys reach. `system.scriptData` are
 * the testMod entries, in the shape impmal runs on its triggers — the same
 * shape module/config/weapon-trait-effects.js already uses.
 *
 * The effect's `disabled` mirrors the gate, which silences BOTH halves at once:
 * a disabled effect contributes no changes and runs no scripts.
 *
 * The cap penalty is the one thing that cannot live on an implant, because it
 * belongs to the actor rather than to any one of them. It gets its own effect
 * on the actor — visible, named, and removed the moment the character is back
 * within the ceiling.
 */

import { changesFor, resolveEntries } from "./entries.js";
import { IMPLANT_TYPE, actorCapState, implantsOf, isImplantActive } from "../state.js";
import { CAP_PENALTY_SCRIPT, talentBonuses, testModScript } from "../test-mods.js";
import { syncEnergyCapacity } from "../../technomiracles/resources.js";

const MODULE_ID = "navis-apexialis";

/** Marks an effect as this module's, so we only ever replace our own. */
export const EFFECT_FLAG = "mechanicsEffect";
export const CAP_FLAG = "capPenalty";

const ownEffects = (doc, flag) => doc.effects.filter(effect => effect.getFlag(MODULE_ID, flag));

/** impmal reads scripts from an effect's own system data; transferData carries it to the actor. */
const scriptedEffect = (scripts) => ({
  transferData: { documentType: "Item" },
  scriptData: scripts
});

/**
 * Rebuild the implant's effect from its current entries, quality and gate
 * state. Idempotent — safe to call on every relevant update.
 */
export async function syncImplantMechanics(item) {
  if (item?.type !== IMPLANT_TYPE) return;

  const chosen = item.system.chosenEffects ?? {};
  const quality = item.system.quality;

  const changes = changesFor(item.system.mechanics, chosen, quality);
  const scripts = resolveEntries(item.system.mechanics, chosen)
    .map(entry => testModScript(entry, quality))
    .filter(Boolean);

  const existing = ownEffects(item, EFFECT_FLAG);

  // Nothing to express: remove ours and stop. An empty effect on the sheet is
  // something a player has to reason about for no reason.
  if (!changes.length && !scripts.length) {
    if (existing.length) await item.deleteEmbeddedDocuments("ActiveEffect", existing.map(e => e.id));
    return;
  }

  const data = {
    name: item.name,
    img: item.img,
    changes,
    disabled: !isImplantActive(item),
    transfer: true,
    system: scriptedEffect(scripts),
    flags: { [MODULE_ID]: { [EFFECT_FLAG]: true } }
  };

  if (!existing.length) {
    await item.createEmbeddedDocuments("ActiveEffect", [data]);
    return;
  }

  // Replace the first; delete any strays left by an older shape.
  await item.updateEmbeddedDocuments("ActiveEffect", [{ _id: existing[0].id, ...data }]);
  if (existing.length > 1) {
    await item.deleteEmbeddedDocuments("ActiveEffect", existing.slice(1).map(e => e.id));
  }
}

/**
 * The over-cap penalty, as an effect on the actor.
 *
 * It is a real, named, visible effect rather than a silent modifier, because a
 * penalty on every roll that the player cannot see on their sheet is a penalty
 * they will assume is a bug.
 */
export async function syncCapPenalty(actor) {
  if (!actor) return;

  const caps = actorCapState(actor, talentBonuses(actor));
  const existing = ownEffects(actor, CAP_FLAG);
  const wanted = caps.penalty === "disadvantage";

  if (!wanted) {
    if (existing.length) await actor.deleteEmbeddedDocuments("ActiveEffect", existing.map(e => e.id));
    return;
  }

  if (existing.length) return;

  await actor.createEmbeddedDocuments("ActiveEffect", [{
    name: game.i18n.localize("NAVIS.Implant.OverCap"),
    changes: [],
    disabled: false,
    system: { transferData: { documentType: "Actor" }, scriptData: [CAP_PENALTY_SCRIPT] },
    flags: { [MODULE_ID]: { [CAP_FLAG]: true } }
  }]);
}

/**
 * Per-actor queues for `syncEnergyCapacity`.
 *
 * `createItem`/`deleteItem` can fire several times near-simultaneously for one
 * Foundry operation (bulk embedded-document creation/deletion), and
 * `syncEnergyCapacity` is a read-modify-write on the actor's flag: an
 * overlapping pair can have the second call clone a snapshot taken before the
 * first call's write landed, and lose that write. Task 9 hit the identical
 * problem in the implant sheet and solved it with a promise chain kept on the
 * class instance; here the caller is a set of module-level hooks rather than
 * one instance, so the chain is keyed by actor id instead, so two different
 * actors never serialize against each other.
 */
const energyQueues = new Map();

/**
 * The same callback is passed as both handlers on purpose: a rejected sync
 * must not wedge the chain, or one failure would stop `energy.max` from ever
 * following that actor's implants again for the rest of the session.
 */
function queueEnergySync(actor) {
  if (!actor) return;

  const work = () => syncEnergyCapacity(actor);
  const previous = energyQueues.get(actor.id) ?? Promise.resolve();
  const next = previous.then(work, work);
  energyQueues.set(actor.id, next);

  return next.catch(error => {
    console.error(`${MODULE_ID} | Заряд capacity failed to sync.`, error);
  });
}

let registered = false;

export function registerImplantMechanicsHooks() {
  if (registered) return;
  registered = true;

  // Any change to what the entries say, what quality they are read at, or
  // whether the gate is open, rebuilds the effect.
  const WATCHED = ["mechanics", "chosenEffects", "quality", "installed", "disabled", "active"];

  const touchesGate = change =>
    WATCHED.some(key => foundry.utils.hasProperty(change, `system.${key}`));

  Hooks.on("createItem", item => {
    if (item?.type !== IMPLANT_TYPE) return;
    syncImplantMechanics(item).then(() => syncCapPenalty(item.parent));
    queueEnergySync(item.parent);
  });

  Hooks.on("updateItem", (item, change) => {
    if (item?.type !== IMPLANT_TYPE) return;
    if (!touchesGate(change)) return;
    syncImplantMechanics(item).then(() => syncCapPenalty(item.parent));
    queueEnergySync(item.parent);
  });

  Hooks.on("deleteItem", item => {
    if (item?.type !== IMPLANT_TYPE) return;
    syncCapPenalty(item.parent);
    queueEnergySync(item.parent);
  });

  // Toughness damage can put a legal character over the ceiling without any
  // implant changing — that is exactly the case the book calls out on p. 269.
  Hooks.on("updateActor", (actor, change) => {
    if (foundry.utils.hasProperty(change, "system.characteristics.tgh")) syncCapPenalty(actor);
  });
}
