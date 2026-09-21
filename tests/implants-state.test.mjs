import test from "node:test";
import assert from "node:assert/strict";
import { IMPLANT_TYPE, isImplantActive, isImplantFitted, implantsOf, actorCapState } from "../module/implants/state.js";

const implant = (installed, disabled, active) => ({
  type: IMPLANT_TYPE,
  system: { installed, disabled, active }
});

test("the type id is the one declared in module.json", () => {
  assert.equal(IMPLANT_TYPE, "apex-imperialis.implant");
});

test("an implant acts only when fitted, undamaged and switched on", () => {
  assert.equal(isImplantActive(implant(true, false, true)), true);
  assert.equal(isImplantActive(implant(false, false, true)), false, "not fitted");
  assert.equal(isImplantActive(implant(true, true, true)), false, "damaged");
  assert.equal(isImplantActive(implant(true, false, false)), false, "switched off");
});

test("fitted is independent of switched on — the book counts them separately", () => {
  assert.equal(isImplantFitted(implant(true, false, false)), true);
  assert.equal(isImplantActive(implant(true, false, false)), false);
});

test("a damaged implant is still fitted and still occupies its socket", () => {
  assert.equal(isImplantFitted(implant(true, true, true)), true);
});

test("a malformed item is inert rather than throwing", () => {
  assert.equal(isImplantActive(undefined), false);
  assert.equal(isImplantActive({}), false);
  assert.equal(isImplantFitted({ system: {} }), false);
});

test("only implants are counted, never native augmetics", () => {
  const actor = { items: [implant(true, false, true), { type: "augmetic", system: {} }] };
  assert.equal(implantsOf(actor).length, 1);
});

test("the actor's cap state counts fitted and active separately", () => {
  const actor = {
    system: { characteristics: { tgh: { bonus: 4 } } },
    items: [
      implant(true, false, true),
      implant(true, false, true),
      implant(true, false, false)
    ]
  };
  const state = actorCapState(actor);
  assert.equal(state.installedCap, 2);
  assert.equal(state.activeCap, 2);
  assert.equal(state.overInstalled, 1, "three fitted against a cap of two");
  assert.equal(state.overActive, 0, "only two are switched on");
  assert.equal(state.penalty, "disadvantage");
});

test("an actor with no implants is never penalised", () => {
  const actor = { system: { characteristics: { tgh: { bonus: 0 } } }, items: [] };
  assert.equal(actorCapState(actor).penalty, "");
});
