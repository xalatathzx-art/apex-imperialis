/**
 * Marking the dead.
 *
 * Two rules, one mechanism — Foundry's own `dead` status effect, so the token
 * gets the skull overlay every table already recognises and nothing new has to
 * be taught.
 *
 *   • A horde at Strength 0 is dead. There is nobody left; it has no wounds to
 *     run out of, so without this it would sit on the field looking alive.
 *   • An NPC at maximum Wounds is dead. This one is a house rule, not RAW —
 *     impmal puts a character at maximum Wounds on a Fortitude test against
 *     falling Unconscious, and kills only through Critical Wounds — so it is a
 *     setting, and it never touches player characters.
 *
 * The mark is removed again if the thing is healed or reinforced, so a mistyped
 * number does not leave a corpse standing.
 */

import { MODULE_ID, readHorde } from "./horde-data.js";

export const SETTING_NPC_DEATH = "hordeNpcDeath";
const STATUS = "dead";

const npcDeathEnabled = () => game.settings.get(MODULE_ID, SETTING_NPC_DEATH) !== false;

/**
 * Exactly one client may write, or the effect is created once per session.
 *
 * This is not hypothetical: two GM windows open on the same world both ran this
 * hook and both added the condition, leaving two identical "Dead" effects nine
 * milliseconds apart. Foundry nominates one connected GM as `activeGM` for
 * precisely this kind of work; with no GM connected at all, the lowest-id active
 * owner takes it, which every client can agree on without talking.
 */
function mayWrite(actor) {
  if (!actor?.isOwner) return false;

  const gm = game.users.activeGM;
  if (gm) return gm.id === game.user.id;

  const owners = game.users.filter(user => user.active && actor.testUserPermission(user, "OWNER"));
  const elected = owners.sort((a, b) => a.id.localeCompare(b.id))[0];
  return elected?.id === game.user.id;
}

/**
 * Use warhammer-lib's condition API, not `toggleStatusEffect`.
 *
 * The library treats `dead` as one of its conditions and answers a raw
 * `toggleStatusEffect` by running `_handleConditionCreation`, which adds the
 * condition a second time — two identical "Dead" effects on the same actor.
 * `addCondition` is the path it expects; it is idempotent, and `removeCondition`
 * is its exact inverse.
 */
async function setDead(actor, dead) {
  if (!actor || !mayWrite(actor)) return;
  if (Boolean(actor.hasCondition?.(STATUS)) === dead) return;
  if (dead) await actor.addCondition(STATUS);
  else await actor.removeCondition(STATUS);
}

/** A horde with nobody left standing, and an NPC that has run out of Wounds. */
export function shouldBeDead(actor) {
  const horde = readHorde(actor);
  if (horde) return horde.destroyed;

  if (!npcDeathEnabled() || actor?.type !== "npc") return false;
  const wounds = actor.system?.combat?.wounds;
  return Boolean(wounds?.max) && wounds.value >= wounds.max;
}

export function registerDeathMarking() {
  game.settings.register(MODULE_ID, SETTING_NPC_DEATH, {
    name: "NAVIS.Horde.SettingNpcDeath",
    hint: "NAVIS.Horde.SettingNpcDeathHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Wounds change through an actor update; a horde's Strength is a flag, which
  // arrives on the same hook.
  Hooks.on("updateActor", (actor, changes) => {
    const touched = foundry.utils.hasProperty(changes, "system.combat.wounds")
      || foundry.utils.hasProperty(changes, `flags.${MODULE_ID}.horde`)
      || foundry.utils.hasProperty(changes, `flags.-=${MODULE_ID}`);
    if (!touched) return;
    setDead(actor, shouldBeDead(actor));
  });
}
