/**
 * "Assign Target" on a test chat card.
 *
 * impmal already ships the adding half of this. Its "Add Targets" entry takes
 * whatever is targeted and appends it to a test that has already been rolled,
 * re-resolving the card without touching the dice — `Test#roll` reuses the
 * stored roll, which is why `reroll` has to delete it first, and the ammo spend
 * is guarded by `context.ammoUsed`, so nothing is paid twice.
 *
 * What it cannot do is take a target away. Fire at the wrong token and the only
 * way out is a fresh roll. This adds the replacing half: the tokens targeted now
 * become the test's targets, and everything the departing ones left behind goes
 * with them.
 *
 * A target that survives the change keeps its opposed message untouched, so a
 * defender who has already rolled their Dodge does not lose it.
 */

const MODULE_ID = "apex-imperialis";

export function registerRetarget() {
  Hooks.on("getChatMessageContextOptions", (html, options) => {
    // First in the list: this is the entry someone goes looking for the moment
    // they notice the card resolved against nothing.
    options.unshift({
      name: game.i18n.localize("NAVIS.Chat.Retarget"),
      icon: '<i class="fa-solid fa-crosshairs"></i>',
      condition: li => Boolean(retargetable(li)),
      callback: li => retarget(li)
    });
  });
}

/**
 * The test this entry would act on, or null.
 *
 * `saveContext` throws for anyone who is neither the GM nor the message's
 * author, and the opposed messages to be cleaned up were authored by the same
 * user, so the entry is offered only to someone who can actually finish the job.
 */
function retargetable(li) {
  const message = game.messages.get(li?.dataset?.messageId);
  if (message?.type !== "test") return null;
  if (!game.user.isGM && !message.isAuthor) return null;

  const test = message.system?.test;
  if (!test) return null;

  return speakersNowTargeted(test).length ? { message, test } : null;
}

/** Speakers for what this user has targeted, less the attacker's own token. */
function speakersNowTargeted(test) {
  const self = test.context?.speaker?.token;
  return Array.from(game.user.targets)
    .filter(target => target.document.id !== self)
    .map(target => ChatMessage.getSpeaker({ token: target.document }));
}

async function retarget(li) {
  const found = retargetable(li);
  if (!found) return;

  const { test } = found;
  const speakers = speakersNowTargeted(test);
  const keep = new Set(speakers.map(speaker => speaker.token));

  // Copies, because what goes back to the message has to be a whole object:
  // saveContext merges, so a dropped key would otherwise survive the write.
  const responses = { ...test.context.responses };
  const appliedDamage = { ...test.context.appliedDamage };

  for (const target of test.context.targets) {
    if (keep.has(target.id)) continue;
    await discard(responses[target.id], target.actor);
    delete responses[target.id];
    delete appliedDamage[target.id];
  }

  test.context.targetSpeakers = speakers;
  test.context.responses = responses;
  test.context.appliedDamage = appliedDamage;

  // Foundry's replace-this-object syntax, the same impmal uses when a failed
  // ranged attack clears its responses: saveContext merges, so a key dropped
  // above would otherwise come straight back.
  //
  // `skipOpposed` matters. The message update fires impmal's own opposed
  // handling, and the `roll` below fires it again — both would find no response
  // registered for a new target and each would open one, leaving an orphan
  // message behind. impmal guards the same pair of calls the same way.
  test.context["==responses"] = responses;
  test.context["==appliedDamage"] = appliedDamage;
  await test.save({ skipOpposed: true });
  delete test.context["==responses"];
  delete test.context["==appliedDamage"];

  // Re-resolves the card against the new targets and opens their opposed tests.
  // The dice are not rolled again.
  await test.roll();

  ui.notifications.info(game.i18n.format("NAVIS.Chat.Retargeted", {
    targets: speakers.map(speaker => speaker.alias).join(", ")
  }));
}

/**
 * Retire one departing target's opposed test: its message, and the flag on the
 * defender that points back at it — impmal sets that when the opposed test is
 * created and reads it to find the attack a defender is answering.
 */
async function discard(responseId, actor) {
  if (!responseId || responseId === "unopposed") return;

  const opposed = game.messages.get(responseId);
  if (opposed && (game.user.isGM || opposed.isAuthor)) {
    await opposed.delete().catch(error => console.warn(`${MODULE_ID} |`, error));
  }

  if (actor?.isOwner && actor.getFlag("impmal", "opposed") === responseId) {
    await actor.unsetFlag("impmal", "opposed");
  }
}
