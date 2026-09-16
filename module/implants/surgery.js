/**
 * Fitting an implant is an operation (DoomBC p. 49): Medicae at −30 — which
 * this module's doctrine renders as Disadvantage — with 1d10 unabsorbed damage
 * on a failure and 1d10+3 − T.b days of adaptation on a success.
 *
 * The test, the damage and the healing are all impmal's own. Nothing here
 * recalculates them; this file decides WHEN they happen and records the result.
 */

import { pendingChoices } from "./mechanics/entries.js";

const MODULE_ID = "navis-apexialis";

/** 1d10+3 − T.b days, minimum one. */
export function adaptationDays(roll, toughnessBonus) {
  const bonus = Number.isFinite(toughnessBonus) ? toughnessBonus : 0;
  return Math.max(1, (Number(roll) || 0) + 3 - bonus);
}

/**
 * An implant carrying an unchosen OR group contributes nothing from that
 * group until a choice is recorded — see mechanics/entries.js. Fitting is the
 * moment to ask, one group at a time, on the item that is about to go in.
 */
async function resolveChoices(item) {
  const chosen = { ...(item.system.chosenEffects ?? {}) };

  for (const group of pendingChoices(item.system.mechanics, chosen)) {
    const buttons = group.entries.map(entry => ({
      action: entry.id,
      label: entry.label || entry.kind
    }));

    const picked = await foundry.applications.api.DialogV2.wait({
      window: { title: item.name },
      content: `<p>${game.i18n.localize("NAVIS.Implant.ChooseEffect")}</p>`,
      buttons
    });

    // A cancelled dialog leaves the group unchosen: the implant is still
    // fitted, that group simply contributes nothing until the choice is
    // made on the sheet.
    if (picked) chosen[group.id] = picked;
  }

  await item.update({ "system.chosenEffects": chosen });
}

async function rollUnabsorbedDamage(actor) {
  const roll = await new Roll("1d10").evaluate();
  await actor.applyDamage(roll.total, { ignoreAP: true });
  return roll;
}

async function postCard(actor, item, content) {
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: item.name,
    content,
    flags: { [MODULE_ID]: { surgery: item.id } }
  });
}

/**
 * Fit `item` onto `actor`. Resolves any pending OR choices first, then either
 * installs without a roll (GM's and starting-equipment path) or runs the
 * Medicae test the rulebook calls for.
 */
export async function fitImplant(actor, item, { test = true } = {}) {
  await resolveChoices(item);

  if (!test) {
    await item.update({ "system.installed": true });
    await postCard(actor, item, `<p>${game.i18n.format("NAVIS.Surgery.FittedNoTest", { name: item.name })}</p>`);
    return { fitted: true, failed: false };
  }

  // `fields` is read off the SECOND argument, not the third: impmal's
  // TestDialog.setupData does `{fields : context.fields || {}}`, and `context`
  // is the object `setupSkillTest(key, context, options)` passes through. A
  // `fields` sitting in `options` is read by nobody, and the book's −30 quietly
  // disappears — so it travels with `appendTitle` in the context object.
  //
  // impmal's `disadvantage` field is a counter, not a boolean: it seeds at 0,
  // other code does `disadvantage++`, and the roll dialog interpolates the raw
  // value into its breakdown text. `true` would compute the right penalty (JS
  // coerces it to 1 in arithmetic) but print "true" to the player instead of
  // "1". Always pass a count.
  const skillTest = await actor.setupSkillTest(
    { key: "medicae" },
    { appendTitle: ` — ${item.name}`, fields: { disadvantage: 1 } }
  );

  // The GM or player closed the dialog: nothing happened yet.
  if (!skillTest) return { fitted: false, failed: false };

  if (!skillTest.succeeded) {
    const roll = await rollUnabsorbedDamage(actor);
    await postCard(
      actor,
      item,
      `<p>${game.i18n.format("NAVIS.Surgery.Failed", { name: item.name, damage: roll.total })}</p>`
    );
    return { fitted: false, failed: true };
  }

  await item.update({ "system.installed": true });

  const roll = await new Roll("1d10").evaluate();
  const days = adaptationDays(roll.total, actor.system.characteristics?.tgh?.bonus);

  // Adaptation belongs to the implant that was fitted, not to the patient. An
  // actor-level flag is a single slot: a second operation overwrites the first,
  // and nothing on any sheet ever says which implant the number was for. On the
  // item it cannot collide, it leaves with the implant, and the implant sheet
  // shows it beside the gate.
  await item.setFlag(MODULE_ID, "adaptation", { days, since: game.time.worldTime });

  await postCard(
    actor,
    item,
    `<p>${game.i18n.format("NAVIS.Surgery.Succeeded", { name: item.name, days })}</p>`
  );

  return { fitted: true, failed: false };
}

/**
 * Extraction is not a test: the rulebook does not make removal a roll, and
 * inventing one would be adding a rule. The item stays in the character's
 * gear, simply no longer installed.
 *
 * Takes only the item: everything extraction touches lives on the implant, and
 * a parameter that is never read is a promise the function does not keep.
 */
export async function extractImplant(item) {
  await item.update({ "system.installed": false });
}
