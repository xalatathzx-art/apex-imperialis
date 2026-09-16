/**
 * The two places the horde rules touch impmal's combat.
 *
 * Both are wraps, not rewrites, and both are idempotent: the original is kept
 * and called, so every rule impmal applies on the way — force fields, armour,
 * Penetrating, Ineffective, Rend, and every effect script on both sides — still
 * runs exactly once and in its own order. We only change what the result *means*
 * for a unit that has no wounds to lose.
 *
 *   1. StandardActorModel#applyDamage — damage becomes bodies.
 *   2. TestDialog#computeFields — attacking a horde grants bonus SL.
 *
 * If either class cannot be found the patch reports and installs nothing, and
 * the horde row on the sheet still works as a counter the GM drives by hand.
 */

import { HORDE_HIT_LOCATION, MODULE_ID, readHorde, readResolve, writeResolve, writeSize } from "./horde-data.js";
import { AREA_TRAITS, casualtiesFrom, modifierApplies, modifierFor, resolveAttack } from "./horde-rules.js";

const MARK = "navisHordePatched";

export const SETTING_DAMAGE_SHARE = "hordeDamageShare";

/**
 * Extra damage on the horde's own attacks, on top of its numbers modifier.
 *
 * Off by default: the modifier already speaks for the mob's size, and it speaks
 * through SL, which is damage. Adding Tier on top counts the same numbers twice.
 */
const damageShare = tier => {
  const setting = game.settings.get(MODULE_ID, SETTING_DAMAGE_SHARE);
  if (setting === "full") return tier;
  if (setting === "half") return Math.ceil(tier / 2);
  return 0;
};

/* ══════════════════════════════════════════════════════════════════════════
   1 · DAMAGE BECOMES BODIES
   ══════════════════════════════════════════════════════════════════════ */

/** Walk the NPC model's prototype chain to whoever actually owns applyDamage. */
function findDamageOwner() {
  let proto = CONFIG.Actor?.dataModels?.npc?.prototype;
  while (proto && !Object.prototype.hasOwnProperty.call(proto, "applyDamage")) {
    proto = Object.getPrototypeOf(proto);
  }
  return typeof proto?.applyDamage === "function" ? proto : null;
}

/** Which of the area traits this attack carries, for the pure rule to judge. */
function areaTraitKeys(traits) {
  return AREA_TRAITS.filter(key => Boolean(traits?.has?.(key)));
}

/**
 * Damage minus armour, before impmal clamps it at zero.
 *
 * `applyDamage` hands back the modifier list it built, so the sum can be redone
 * here exactly as impmal does it: skip a modifier already folded in (Penetrating
 * marks itself `applied`), and skip armour entirely when the damage ignores it.
 * A negative result means the armour held.
 */
function damageOverArmour(probe, ignoreAP) {
  let total = Number(probe?.damage) || 0;
  for (const modifier of probe?.modifiers ?? []) {
    if (modifier.applied) continue;
    if (modifier.armour && ignoreAP) continue;
    total += Number(modifier.value) || 0;
  }
  return total;
}

export function patchApplyDamage() {
  const proto = findDamageOwner();
  if (!proto) {
    console.error(`${MODULE_ID} | impmal's applyDamage was not found; hordes will not convert damage.`);
    return false;
  }
  if (proto[MARK]) return true;

  const original = proto.applyDamage;

  proto.applyDamage = async function (value, options = {}) {
    const attackerTest = options.opposed?.attackerTest;

    // A horde's own attacks add Tier to damage — volume of fire, not accuracy.
    const attackerActor = attackerTest?.actor;
    const attacker = readHorde(attackerActor);
    if (attacker) {
      const tier = effectiveTier(attackerActor, attacker.tier);
      if (tier > 0) value = Number(value || 0) + damageShare(tier);
    }

    const horde = readHorde(this.parent);
    if (!horde) return original.call(this, value, options);

    // Nothing is left to kill; further hits fall on corpses rather than
    // quietly turning the unit back into an NPC with wounds to lose.
    if (horde.destroyed) {
      return { damage: value, text: game.i18n.localize("NAVIS.Horde.AlreadyDestroyed"),
               woundsGained: 0, excess: 0, critical: null, modifiers: [], updateData: {} };
    }

    // Run impmal's own pipeline for everything up to the wound write, then take
    // the number it arrived at. `woundsGained` is the damage left after armour.
    const probe = await original.call(this, value, {
      ...options,
      location: HORDE_HIT_LOCATION,
      update: false,
      message: false
    });

    const traits = attackerTest?.itemTraits;
    // Damage with no attacker behind it is the world burning, gassing or
    // crushing the whole formation — Ablaze, a Hazard, suffocation. It sweeps,
    // which is also what makes a flamer's Ablaze worth a body per point rather
    // than half that. Bleeding is the one such source that should not sweep, and
    // it never reaches a horde: the condition is refused on creation (see
    // blockPersonalConditions).
    const environmental = !attackerTest && Boolean(options.ignoreAP);
    const area = environmental || areaTraitKeys(traits).length > 0;
    const triumph = Boolean(attackerTest?.result?.critical);

    // Armour is a threshold here, so what matters is whether the damage reached
    // it — not what survived it. impmal clamps `woundsGained` at zero, which
    // loses exactly that distinction, so the modifier list it hands back is
    // re-totalled the way impmal totals it, minus the clamp.
    const surplus = damageOverArmour(probe, options.ignoreAP);

    const outcome = resolveAttack({
      size: horde.size,
      armourBeaten: probe.damage > 0 && surplus >= 0,
      damageOverArmour: Math.max(0, probe.woundsGained),
      area,
      triumph
    });

    const text = describe(this.parent, outcome, { area, triumph });

    if (options.update !== false) {
      await writeSize(this.parent, outcome.sizeAfter, { start: horde.start });

      if (outcome.resolveLost) {
        const before = readResolve(this.parent);
        if (before > 0) await writeResolve(this.parent, before - outcome.resolveLost);
      }

      // impmal only damages armour inside its own `update` branch, which we
      // skipped, so Rend has to be applied here or a chainsword would never
      // wear the horde's armour down.
      const rend = traits?.has?.("rend");
      if (rend) {
        await this.parent.damageArmour(HORDE_HIT_LOCATION, Number(rend.value || 0), null, {
          prompt: true,
          rend: true,
          attackerTest
        });
      }
    }

    if (options.message) {
      await ChatMessage.create({
        content: `<p>${text}</p>`,
        speaker: ChatMessage.getSpeaker({ actor: this.parent })
      });
    }

    // Same shape impmal's callers expect, with nothing left to write as wounds.
    return {
      ...probe,
      text,
      woundsGained: 0,
      excess: 0,
      critical: null,
      updateData: {},
      horde: outcome
    };
  };

  proto[MARK] = true;
  return true;
}

/** The one line the GM reads in chat. */
function describe(actor, outcome, { area, triumph }) {
  const t = key => game.i18n.localize(key);
  if (!outcome.casualties) return t("NAVIS.Horde.NoLoss");

  const parts = [
    game.i18n.format("NAVIS.Horde.Losses", {
      casualties: outcome.casualties,
      size: outcome.sizeAfter
    })
  ];
  if (area) parts.push(t("NAVIS.Horde.AreaTag"));
  if (triumph) parts.push(t("NAVIS.Horde.TriumphTag"));
  if (outcome.tierAfter !== outcome.tierBefore) {
    parts.push(game.i18n.format("NAVIS.Horde.TierFell", {
      from: outcome.tierBefore,
      to: outcome.tierAfter
    }));
  }
  if (outcome.destroyed) parts.push(t("NAVIS.Horde.Destroyed"));
  else if (outcome.resolveLost && readResolve(actor) - outcome.resolveLost <= 0) {
    parts.push(t("NAVIS.Horde.Desperate"));
  }
  return parts.join(" · ");
}

/* ══════════════════════════════════════════════════════════════════════════
   2 · ATTACKING A HORDE GRANTS BONUS SL
   ══════════════════════════════════════════════════════════════════════ */

/**
 * impmal's TestDialog is not exported, so the class object is taken from the
 * first dialog that renders. Foundry fires a V2 render hook for every class in
 * the inheritance chain, so `renderTestDialog` arrives for a WeaponTestDialog
 * too — but `app.constructor` is then the leaf, and patching leaves is a trap:
 * WeaponTestDialog → AttackDialog → SkillTestDialog each override
 * `computeFields` and each calls `super`, so patching two of them in one chain
 * would add the Tier twice.
 *
 * The root, TestDialog, is therefore the only patch point. Every subclass
 * reaches it through super, so the wrapper runs exactly once per compute.
 */
export function patchTestDialog() {
  Hooks.on("renderTestDialog", app => {
    const root = findDialogRoot(app);
    if (!root || root[MARK]) return;

    const original = root.computeFields;
    if (typeof original !== "function") {
      console.error(`${MODULE_ID} | impmal's TestDialog.computeFields was not found; the horde's Tier will not add SL.`);
      root[MARK] = true;
      return;
    }

    root.computeFields = async function (...args) {
      await original.apply(this, args);
      applyHordeFields(this);
    };
    root[MARK] = true;

    // This dialog already computed its fields under the old method.
    app.render();
  });
}

/** The TestDialog prototype behind whatever dialog just rendered. */
function findDialogRoot(app) {
  let proto = app?.constructor?.prototype;
  let fallback = null;
  while (proto) {
    if (Object.prototype.hasOwnProperty.call(proto, "computeFields")) fallback = proto;
    if (proto.constructor?.name === "TestDialog") return proto;
    proto = Object.getPrototypeOf(proto);
  }
  return fallback;
}

/**
 * Two separate things happen in one dialog, and neither of them is bonus SL.
 *
 *   • Shooting *at* a horde grants **Advantage** — a wall of people is hard to
 *     miss. Advantage turns misses into hits without inflating SL, which is the
 *     whole point: SL is damage, and a bonus there made big crowds melt.
 *   • A horde rolling *its own* Perception, Melee, Ranged or Fellowship test
 *     takes a **modifier** for its numbers. That one does raise SL, and it is
 *     meant to: a mob that pours fire hits harder as well as more often.
 */
function applyHordeFields(dialog) {
  advantageAgainstHordes(dialog);
  modifierForOwnNumbers(dialog);
}

function advantageAgainstHordes(dialog) {
  if (!isAttackDialog(dialog)) return;

  const fielded = (dialog.data?.targets ?? [])
    .map(target => readHorde(target?.actor ?? target?.document?.actor))
    .filter(horde => horde && !horde.destroyed);
  if (!fielded.length) return;

  dialog.advCount = Number(dialog.advCount || 0) + 1;
  dialog.tooltips?.add?.("advantage", 1, game.i18n.localize("NAVIS.Horde.Label"));
}

/**
 * The roller's own numbers.
 *
 * Gated on the characteristic rather than on a list of skills: Perception covers
 * Awareness and Intuition, Weapon Skill covers Melee, Ballistic Skill covers
 * Ranged including Thrown, Fellowship covers Rapport — and the raw
 * characteristic tests come along for free, which is what the rule asks for.
 */
function modifierForOwnNumbers(dialog) {
  const horde = readHorde(dialog?.actor);
  if (!horde || horde.destroyed) return;

  const characteristic = dialog.data?.characteristic ?? dialog.fields?.characteristic;
  if (!modifierApplies(characteristic)) return;

  const modifier = modifierFor(horde.size);
  if (!modifier) return;

  dialog.fields.modifier = Number(dialog.fields.modifier || 0) + modifier;
  dialog.tooltips?.add?.("modifier", modifier, game.i18n.localize("NAVIS.Horde.Label"));
}

/** A weapon or melee test — the dialog carries the weapon-only fields. */
function isAttackDialog(dialog) {
  const data = dialog?.data ?? {};
  if (data.weapon || data.item?.system?.attackType) return true;
  return ["fireMode", "burst", "rapidFire", "hitLocation"].some(key => key in (dialog.fields ?? {}));
}

/* ══════════════════════════════════════════════════════════════════════════
   3 · CONDITIONS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Conditions that mean nothing to a formation: one man bleeding does not slow
 * the unit, and a mob cannot be knocked flat. They are refused outright rather
 * than applied and ignored, so nothing downstream — least of all the
 * armour-ignoring tick of Bleeding — has to special-case them.
 */
const IGNORED_CONDITIONS = ["bleeding", "prone"];

/**
 * Conditions that would cripple one body instead cost the unit a step of Tier
 * while they last: a fifth of the mob blinded or reeling is a fifth of the
 * volume of fire gone.
 */
const SUPPRESSING_CONDITIONS = ["stunned", "frightened", "blinded", "deafened", "overburdened"];

/** Tier after any suppressing condition, never below 1 while anyone is alive. */
export function effectiveTier(actor, tier) {
  if (!tier) return 0;
  const suppressed = SUPPRESSING_CONDITIONS.some(key => actor?.statuses?.has?.(key));
  return suppressed ? Math.max(1, tier - 1) : tier;
}

export function blockPersonalConditions() {
  Hooks.on("preCreateActiveEffect", (effect, data, options, userId) => {
    const actor = effect.parent;
    if (!readHorde(actor)) return true;

    const keys = [effect.statuses, data?.statuses].flatMap(s => Array.from(s ?? []));
    if (!keys.some(key => IGNORED_CONDITIONS.includes(key))) return true;

    if (game.user.id === userId) {
      ui.notifications.info(game.i18n.format("NAVIS.Horde.ConditionIgnored", {
        condition: effect.name,
        name: actor.name
      }));
    }
    return false;
  });
}

export { casualtiesFrom };
