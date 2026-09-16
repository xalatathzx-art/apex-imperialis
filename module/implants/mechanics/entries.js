/**
 * Which of an implant's entries apply, and what they become.
 *
 * Mechanics are stored as groups:
 *
 *   { id, operator: "AND" | "OR", entries: [ entry, ... ] }
 *
 * An AND group applies all of its entries. An OR group applies exactly one,
 * chosen when the implant is fitted — this is also the mechanism cycle B needs
 * for the book's Best.Q effect choice, which is why it exists now rather than
 * being invented later.
 *
 * An OR group with no choice recorded contributes NOTHING. Defaulting to the
 * first entry would silently give the character a benefit they never picked.
 */

import { LIVE_KINDS, entryToChange } from "./targets.js";

const groups = mechanics => Array.isArray(mechanics) ? mechanics : [];
const entriesOf = group => Array.isArray(group?.entries) ? group.entries : [];
const isOr = group => group?.operator === "OR";

/** An OR group with entries and no recorded choice is still waiting. */
function awaiting(group, chosen) {
  return isOr(group) && entriesOf(group).length > 0 && !chosen?.[group.id];
}

export function pendingChoices(mechanics, chosen = {}) {
  return groups(mechanics).filter(group => awaiting(group, chosen));
}

export function needsChoice(mechanics, chosen = {}) {
  return pendingChoices(mechanics, chosen).length > 0;
}

/** The entries that actually apply, flattened across all groups. */
export function resolveEntries(mechanics, chosen = {}) {
  const out = [];

  for (const group of groups(mechanics)) {
    const entries = entriesOf(group);

    if (!isOr(group)) {
      out.push(...entries);
      continue;
    }

    const pickedId = chosen?.[group.id];
    const picked = entries.find(entry => entry?.id === pickedId);
    // No choice, or a choice naming something that is not in this group: nothing.
    if (picked) out.push(picked);
  }

  return out;
}

/** Active Effect changes for everything that is not a live request. */
export function changesFor(mechanics, chosen = {}, quality = 2) {
  return resolveEntries(mechanics, chosen)
    .map(entry => entryToChange(entry, quality))
    .filter(Boolean);
}

/** The entries that store nothing and are read at roll time. */
export function liveEntries(mechanics, chosen = {}) {
  return resolveEntries(mechanics, chosen).filter(entry => LIVE_KINDS.includes(entry?.kind));
}
