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
import { IMPLANT_TYPE, actorCapState, isImplantActive } from "../state.js";
import { CAP_PENALTY_SCRIPT, talentBonuses, testModScript } from "../test-mods.js";
import { syncEnergyCapacity } from "../../technomiracles/resources.js";

const MODULE_ID = "navis-apexialis";

/** Marks an effect as this module's, so we only ever replace our own. */
export const EFFECT_FLAG = "mechanicsEffect";
export const CAP_FLAG = "capPenalty";

const ownEffects = (doc, flag) => doc.effects.filter(effect => effect.getFlag(MODULE_ID, flag));

/**
 * impmal reads scripts from an effect's own system data; `transferData` decides
 * whether an effect living on an ITEM reaches the actor wearing it.
 *
 * `warhammer-lib.js` determineTransfer() allows exactly one shape:
 *
 *   let allowed = (application.type == "document" && application.documentType == "Actor");
 *
 * Both halves are required. `documentType: "Item"` means "this effect applies to
 * the item itself" — that is what module/config/weapon-trait-effects.js wants for
 * a weapon trait, and it is the wrong answer here: an implant's numbers and
 * testMod scripts belong to the character. Actor#allApplicableEffects and
 * getScripts both run through determineTransfer(), so getting this wrong makes
 * every mechanic on the implant silently inert.
 *
 * These are also the schema defaults (warhammer-lib.js defineSchema), stated
 * explicitly here because the defaults are what make the feature work.
 */
const scriptedEffect = (scripts) => ({
  transferData: { type: "document", documentType: "Actor" },
  scriptData: scripts
});

/**
 * `test-mods.js` is pure and cannot call `game.i18n`, so a script built there
 * carries a `labelKey` instead of a `label` — this is the one Foundry-aware
 * point in the pipeline that resolves it. `WarhammerScript`'s constructor
 * (warhammer-lib.js:620) does `this.label = data.label` verbatim with no
 * localization of its own, so a key left unresolved prints as the literal
 * key string in the roll dialog.
 *
 * `labelKey` is kept on the stored record alongside the resolved `label` —
 * it costs one field and means the key survives for anything that later
 * wants to re-resolve it. Nothing does that automatically today: the label
 * is baked into the stored effect at build time, so switching the game's
 * language leaves an already-built implant's labels in the old language
 * until the implant is next touched (its mechanics rebuilt). That is
 * acceptable — this module's content is deliberately Russian — but worth
 * knowing before chasing a "wrong language" report as a bug.
 *
 * A script with a literal `label` instead (an author's own text, from
 * `entry.label` in test-mods.js) has no `labelKey` and passes through
 * untouched — it must never be run through `localize`.
 */
const resolveLabel = (script) =>
  script.labelKey ? { ...script, label: game.i18n.localize(script.labelKey) } : script;

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
    .filter(Boolean)
    .map(resolveLabel);

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
    system: { transferData: { documentType: "Actor" }, scriptData: [resolveLabel(CAP_PENALTY_SCRIPT)] },
    flags: { [MODULE_ID]: { [CAP_FLAG]: true } }
  }]);
}

/**
 * Keyed promise chains for every sync in this file.
 *
 * All three syncs are read-modify-writes, and all three are driven by hooks
 * that fire several times for one user action: `_onFit` alone sends `side`,
 * `chosenEffects` and `installed` as three separate item updates, and Foundry
 * fires `createItem`/`deleteItem` once per document in a bulk operation. An
 * overlapping pair reads its "existing" snapshot before the previous call's
 * create lands, so both branches take the create path — leaving the implant
 * with two effects and doubled numbers, or the actor with two cap penalties.
 *
 * Task 9 hit the identical problem in the implant sheet and solved it with a
 * promise chain kept on the class instance; here the callers are module-level
 * hooks rather than one instance, so each chain is keyed — by item id for the
 * implant's own effect, by actor id for the actor-level syncs — so unrelated
 * documents never serialize against each other.
 */
const mechanicsQueues = new Map();
const capQueues = new Map();
const energyQueues = new Map();

/**
 * The same callback is passed as both handlers on purpose: a rejected sync must
 * not wedge the chain, or one failure would stop that document from ever being
 * synced again for the rest of the session. A failure is logged rather than
 * swallowed, because an implant whose numbers stopped following its sheet is
 * otherwise indistinguishable from an implant with no numbers.
 */
function enqueue(queues, key, work, what) {
  if (!key) return;

  const previous = queues.get(key) ?? Promise.resolve();
  const next = previous.then(work, work);
  queues.set(key, next);

  return next.catch(error => {
    console.error(`${MODULE_ID} | ${what} failed to sync.`, error);
  });
}

/** Serialised `syncImplantMechanics`, keyed per implant. */
export function queueImplantMechanics(item) {
  if (item?.type !== IMPLANT_TYPE) return;
  return enqueue(mechanicsQueues, item.id, () => syncImplantMechanics(item), "Implant mechanics");
}

/** Serialised `syncCapPenalty`, keyed per actor. */
export function queueCapPenalty(actor) {
  if (!actor) return;
  return enqueue(capQueues, actor.id, () => syncCapPenalty(actor), "The over-cap penalty");
}

/** Serialised `syncEnergyCapacity`, keyed per actor. */
function queueEnergySync(actor) {
  if (!actor) return;
  return enqueue(energyQueues, actor.id, () => syncEnergyCapacity(actor), "Заряд capacity");
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

  // The three syncs are queued independently rather than chained: the cap
  // penalty and the Заряд ceiling are read off the actor's implants, not off
  // the effect this implant is about to grow, so nothing is waiting on anything.
  Hooks.on("createItem", item => {
    if (item?.type !== IMPLANT_TYPE) return;
    queueImplantMechanics(item);
    queueCapPenalty(item.parent);
    queueEnergySync(item.parent);
  });

  Hooks.on("updateItem", (item, change) => {
    if (item?.type !== IMPLANT_TYPE) return;
    if (!touchesGate(change)) return;
    queueImplantMechanics(item);
    queueCapPenalty(item.parent);
    queueEnergySync(item.parent);
  });

  Hooks.on("deleteItem", item => {
    if (item?.type !== IMPLANT_TYPE) return;
    queueCapPenalty(item.parent);
    queueEnergySync(item.parent);
  });

  // Toughness damage can put a legal character over the ceiling without any
  // implant changing — that is exactly the case the book calls out on p. 269.
  // Toughness moves the Заряд ceiling too, so both follow it.
  Hooks.on("updateActor", (actor, change) => {
    if (!foundry.utils.hasProperty(change, "system.characteristics.tgh")) return;
    queueCapPenalty(actor);
    queueEnergySync(actor);
  });
}
