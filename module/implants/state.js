/**
 * The gate: is this implant doing anything right now.
 *
 * Everything an implant grants hangs off `isImplantActive` — Active Effects
 * created on the item synchronise their own `disabled` to it, and live-request
 * entries consult it at roll time. One predicate, one source of truth. This is
 * warhammer-dbc's `isItemActive` + `syncItemEffectsDisabled` pair narrowed to a
 * single type.
 *
 * State lives in schema fields, not document flags. warhammer-dbc uses flags
 * because it was bolting state onto a type it wanted to keep schema-stable;
 * here the type is ours, and fields are what a data model is for.
 *
 * These functions take plain objects, never Foundry documents, so the whole
 * gate is testable without a running game.
 */

import { capState } from "./rules.js";

export const IMPLANT_TYPE = "navis-apexialis.implant";

/** Fitted — surgically installed. Damaged implants are still fitted: they still occupy the socket. */
export function isImplantFitted(item) {
  return !!item?.system?.installed;
}

/** Acting — fitted, undamaged, and switched on. */
export function isImplantActive(item) {
  const sys = item?.system;
  return !!sys?.installed && !sys?.disabled && !!sys?.active;
}

/** The actor's implants. Native `augmetic` items are a different type and a different budget. */
export function implantsOf(actor) {
  return (actor?.items ?? []).filter(item => item?.type === IMPLANT_TYPE);
}

/** Where this actor stands against both ceilings. */
export function actorCapState(actor) {
  const implants = implantsOf(actor);

  return capState({
    installed: implants.filter(isImplantFitted).length,
    active: implants.filter(isImplantActive).length,
    toughnessBonus: actor?.system?.characteristics?.tgh?.bonus ?? 0,
    talentBonus: 0,
    sacredCode: false
  });
}
