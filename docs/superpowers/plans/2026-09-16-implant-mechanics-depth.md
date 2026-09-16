# Implant mechanics depth (cycle B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give implants reach into attacks, damage, protection and integrated weapons, so the families that are prose-only today can carry real mechanics.

**Architecture:** Five new declarative entry kinds compile to impmal scripts on triggers the system already dispatches, carried in the same `system.scriptData` the `testMod` kind already proved end to end. Two grant kinds put a real impmal `weapon` item on the actor, owned by the implant and removed with it. A new grant module owns creation and removal for weapons, traits and talents alike.

**Tech Stack:** Foundry VTT 13, Imperium Maledictum 3.3.0, warhammer-lib 2.9.0, ES modules, `node:test` + `node:assert/strict`, Handlebars, plain CSS.

**Spec:** `docs/superpowers/specs/2026-09-16-implant-mechanics-depth-design.md`

## Global Constraints

- **Test command** is `node --test tests/*.test.mjs` from the module root. There is no `package.json` and no framework beyond `node:test`. **Run the WHOLE suite before every commit**, not a subset: a repo-wide lang guard went red for five tasks in cycle A because runs were scoped by filename.
- **Exactly one test failure is expected**, `Voll journals translation covers every official document ID`. It is pre-existing and this branch never touches its inputs. Any other failure is yours.
- **Do NOT run `node tools/build.mjs`** — Foundry is running and holds a pack's LevelDB lock; it fails with EPERM for reasons unrelated to you. `node tools/build-skin.mjs` is fine and is required if you touch `src/skin/`.
- **Do not run Foundry.** The controller verifies live and screenshots.
- **Never modify the impmal system or warhammer-lib.**
- Pure modules under `module/implants/` import nothing from Foundry and take plain objects, never documents.
- Code and comments in module files are **English**; content strings are **Russian**, and every user-visible string comes from `game.i18n` with a key in **BOTH** `lang/ru.json` and `lang/en.json`. A key in one file only renders as a raw key — that bug has already shipped twice on this branch.
- `templates/item/implant.hbs` and `implant-mechanics.hbs` are ApplicationV2 PARTS: each must render **exactly one root element** or the sheet fails entirely. `tests/parts-single-root.test.mjs` guards it.
- **Foundry ids are exactly 16 alphanumeric characters.** A wrong-length id takes the whole compendium down silently at world launch.
- **Names are not contracts.** Every trigger and argument name below was read from impmal's own shipped scripts in the running world and is quoted with its source. Where you must add one that is not quoted here, find impmal's own example first — cycle A shipped three defects that were all "plausible name, wrong contract" and all invisible to a green suite.

### Verified facts you may rely on

Read from `game.impmal.config` in a live world:

- `dialog` trigger carries `args.fields.SL`, `args.fields.damage`, `args.advantage`, `args.disadvantage`, `args.actor`, `args.target`, `args.weapon`, `args.isAttack`.
  Examples: `weaponTrait:mastercrafted → args.fields.SL++;`, `weaponCat:force → args.fields.damage += args.actor.system.warp.charge;`, `protection:loud → args.disadvantage++;`
- An attack is discriminated by `args.isAttack` together with `args.weapon` — impmal's own guard reads `return args.isAttack && args.actor.type == "character" && args.weapon`.
- `preApplyDamage` carries `args.value`, `args.ignoreAP`, `args.locationData`, `args.modifiers` (an array taking `{ value, label }`), `args.actor`.
  Example: `weaponCat:graviton → let armour = args.locationData.armour; if (armour) { args.modifiers.push({value: armour, label: this.effect.l…`
- Immunity idiom: `let c = this.actor.hasCondition("fatigued"); if (c) { this.script.notification("…"); c.delete(); }`. `args.abort = true` aborts an effect.
- Of 21 weapon/armour traits only six are scripted (`defensive`, `shoddy`, `mastercrafted`, `gauss`, `phase`, `tesla`). The other fifteen — including `penetrating`, `inflict`, `rend` — the system handles **natively** from the trait's presence and value.
- Traits taking a value: `heavy`, `inflict`, `penetrating`, `rapidFire`, `rend`, `shield`, `supercharge`, `thrown`.
- An impmal `weapon`'s system data: `damage: { base, characteristic, SL, ignoreAP }`, `traits: { list: [{key}, {key, value}] }`, plus `attackType`, `category`, `spec`, `range`, `equipped: { value, force }`.
  Real example: Фраг-граната — `attackType: "ranged"`, `category: "grenadesExplosives"`, `spec: "ordnance"`, `range: "medium"`, `damage.base: "6"`, traits `[{key:"blast"},{key:"loud"},{key:"thrown",value:"Medium"},{key:"unstable"}]`.

---

### Task 1: Declare the new entry kinds

**Files:**
- Modify: `module/implants/mechanics/targets.js`
- Test: `tests/implants-targets.test.mjs`

**Interfaces:**
- Consumes: nothing new.
- Produces: `ENTRY_KINDS` grows from 13 to 20; `LIVE_KINDS` grows to `["testMod","script","attackMod","damageBonus","damageReduction","conditionImmunity"]`; `GRANT_KINDS` grows to `["trait","talent","weapon","weaponMount","weaponTrait"]`.

The five new script kinds and three new grant kinds all resolve to **no data path** — none of them is an Active Effect change. `targetPath` and `entryToChange` must return null for every one.

- [ ] **Step 1: Write the failing test**

Add to `tests/implants-targets.test.mjs`:

```js
test("the new attack, damage and protection kinds are declared", () => {
  for (const kind of ["attackMod", "damageBonus", "weaponTrait", "damageReduction", "conditionImmunity", "weapon", "weaponMount"]) {
    assert.ok(ENTRY_KINDS.includes(kind), `${kind} missing from ENTRY_KINDS`);
  }
});

test("script kinds are live and produce no change", () => {
  for (const kind of ["attackMod", "damageBonus", "damageReduction", "conditionImmunity"]) {
    assert.ok(LIVE_KINDS.includes(kind), `${kind} should be live`);
    assert.equal(targetPath({ kind }), null);
    assert.equal(entryToChange({ kind, value: 5 }, 2), null);
  }
});

test("grant kinds produce no change either — they create documents", () => {
  for (const kind of ["weapon", "weaponMount", "weaponTrait"]) {
    assert.equal(targetPath({ kind }), null);
    assert.equal(entryToChange({ kind, value: 5 }, 2), null);
  }
});

test("the kinds that DO target a data path are unchanged", () => {
  assert.equal(targetPath({ kind: "characteristic", key: "tgh" }), "system.characteristics.tgh.modifier");
  assert.equal(targetPath({ kind: "wounds" }), "system.combat.wounds.max");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/implants-targets.test.mjs`
Expected: FAIL — `attackMod missing from ENTRY_KINDS`

- [ ] **Step 3: Write minimal implementation**

In `targets.js`, extend the three frozen arrays and nothing else:

```js
export const ENTRY_KINDS = Object.freeze([
  "characteristic", "skill", "armour", "armourAll",
  "wounds", "criticals", "speed", "encumbrance",
  "energy", "trait", "talent", "testMod", "script",
  // Cycle B — attack, damage, protection, integrated weapons.
  "attackMod", "damageBonus", "weaponTrait",
  "damageReduction", "conditionImmunity",
  "weapon", "weaponMount"
]);

/** Kinds read at the moment of play, compiled to impmal scripts. */
export const LIVE_KINDS = Object.freeze([
  "testMod", "script",
  "attackMod", "damageBonus", "damageReduction", "conditionImmunity"
]);

/** Kinds that create or alter a document rather than a number. */
const GRANT_KINDS = Object.freeze([
  "trait", "talent",
  "weapon", "weaponMount", "weaponTrait"
]);
```

`weaponTrait` is a grant kind because it is applied to the weapon this implant grants, at grant time — impmal reads `penetrating`, `inflict`, `rend` and twelve others natively from the weapon's own trait list, so no script is needed.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/implants-targets.test.mjs`
Expected: PASS

- [ ] **Step 5: Checkpoint**

Run: `node --test tests/*.test.mjs`
Confirm exactly one failure, the Voll one. Commit:

```bash
git add module/implants/mechanics/targets.js tests/implants-targets.test.mjs
git commit -m "Declare cycle B entry kinds

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Compile the four script kinds

**Files:**
- Create: `module/implants/mechanics/compile.js`
- Test: `tests/implants-compile.test.mjs`

**Interfaces:**
- Consumes: `resolveQualityValue` from `../rules.js`.
- Produces: `compileEntry(entry, quality) → { labelKey?, label?, trigger, script, options? } | null`, and `CONDITION_KEYS` — the frozen list of the 14 tiered conditions.

This is a new file rather than more of `test-mods.js` because that file is about one kind and this is about four. `testModScript` stays where it is; Task 3 calls both.

- [ ] **Step 1: Write the failing test**

Create `tests/implants-compile.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { compileEntry, CONDITION_KEYS } from "../module/implants/mechanics/compile.js";

test("the fourteen tiered conditions are the ones impmal has", () => {
  assert.deepEqual([...CONDITION_KEYS], [
    "ablaze", "bleeding", "blinded", "deafened", "fatigued", "frightened",
    "incapacitated", "overburdened", "poisoned", "prone", "restrained",
    "stunned", "unconscious", "dead"
  ]);
});

test("attackMod fires on the dialog trigger and guards on isAttack", () => {
  const s = compileEntry({ kind: "attackMod", value: 2 }, 2);
  assert.equal(s.trigger, "dialog");
  assert.match(s.options.activateScript, /args\.isAttack/);
  assert.match(s.script, /args\.fields\.SL \+= 2/);
});

test("attackMod can narrow to melee or ranged", () => {
  const s = compileEntry({ kind: "attackMod", value: 1, attackType: "melee" }, 2);
  assert.match(s.options.activateScript, /args\.weapon\?\.system\?\.attackType === "melee"/);
});

test("attackMod advantage increments the counter, never assigns", () => {
  const s = compileEntry({ kind: "attackMod", advantage: 1 }, 2);
  assert.match(s.script, /args\.advantage\+\+/);
  assert.doesNotMatch(s.script, /args\.advantage\s*=/);
});

test("damageBonus adds to the dialog's damage field", () => {
  const s = compileEntry({ kind: "damageBonus", value: 3 }, 2);
  assert.equal(s.trigger, "dialog");
  assert.match(s.script, /args\.fields\.damage \+= 3/);
  assert.match(s.options.activateScript, /args\.isAttack/);
});

test("damageReduction pushes a labelled modifier on preApplyDamage", () => {
  const s = compileEntry({ kind: "damageReduction", value: 2 }, 2);
  assert.equal(s.trigger, "preApplyDamage");
  assert.match(s.script, /args\.modifiers\.push/);
  assert.match(s.script, /-2/);
});

test("conditionImmunity deletes the condition and says so", () => {
  const s = compileEntry({ kind: "conditionImmunity", condition: "fatigued" }, 2);
  assert.equal(s.trigger, "createCondition");
  assert.match(s.script, /hasCondition\("fatigued"\)/);
  assert.match(s.script, /\.delete\(\)/);
});

test("values resolve at the implant's quality before reaching the script", () => {
  const entry = { kind: "damageBonus", value: { 1: 1, 2: 2, 3: 3, 4: 4 } };
  assert.match(compileEntry(entry, 4).script, /args\.fields\.damage \+= 4/);
  assert.match(compileEntry(entry, 1).script, /args\.fields\.damage \+= 1/);
});

test("an entry that would do nothing compiles to nothing", () => {
  assert.equal(compileEntry({ kind: "attackMod", value: 0 }, 2), null);
  assert.equal(compileEntry({ kind: "damageBonus" }, 2), null);
  assert.equal(compileEntry({ kind: "conditionImmunity" }, 2), null);
});

test("a kind this file does not own compiles to nothing", () => {
  assert.equal(compileEntry({ kind: "characteristic", key: "tgh", value: 5 }, 2), null);
  assert.equal(compileEntry({ kind: "testMod", value: 1 }, 2), null);
});

test("an unknown condition key compiles to nothing rather than a broken script", () => {
  assert.equal(compileEntry({ kind: "conditionImmunity", condition: "notAThing" }, 2), null);
});

test("every generated script is valid JavaScript", () => {
  const cases = [
    { kind: "attackMod", value: 2, attackType: "ranged" },
    { kind: "attackMod", advantage: -1 },
    { kind: "damageBonus", value: 3 },
    { kind: "damageReduction", value: 2 },
    { kind: "conditionImmunity", condition: "bleeding" }
  ];
  for (const c of cases) {
    const s = compileEntry(c, 2);
    assert.doesNotThrow(() => new Function("args", s.script), `bad script for ${c.kind}`);
    if (s.options?.activateScript) {
      assert.doesNotThrow(() => new Function("args", s.options.activateScript), `bad guard for ${c.kind}`);
    }
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/implants-compile.test.mjs`
Expected: FAIL — `Cannot find module '../module/implants/mechanics/compile.js'`

- [ ] **Step 3: Write minimal implementation**

Create `module/implants/mechanics/compile.js`:

```js
/**
 * Entry → impmal script.
 *
 * Every trigger and argument name here was read from impmal's own shipped
 * scripts in a running world, not inferred from the trigger's name. The
 * examples, for the next reader:
 *
 *   dialog          args.fields.SL++            (weapon trait "mastercrafted")
 *                   args.fields.damage += N     (weapon category "force")
 *                   args.advantage++            (weapon trait "defensive")
 *                   args.isAttack && args.weapon  (impmal's own attack guard)
 *   preApplyDamage  args.modifiers.push({value, label})   (category "graviton")
 *   immunity idiom  hasCondition(k) → notification → delete()
 *
 * Scripts need `options.activateScript` or they render as unticked rows a
 * player must opt into — warhammer-lib's `activated()` returns false without
 * one. Cycle A shipped that bug; module/environment/gravity-rules.js is the
 * house example of the correct shape.
 */

import { resolveQualityValue } from "../rules.js";

/** impmal's tiered conditions, in its own order. */
export const CONDITION_KEYS = Object.freeze([
  "ablaze", "bleeding", "blinded", "deafened", "fatigued", "frightened",
  "incapacitated", "overburdened", "poisoned", "prone", "restrained",
  "stunned", "unconscious", "dead"
]);

/**
 * The EXPRESSION that says "this is an attack we care about" — not a whole
 * statement. Both the activate and hide scripts are built from it, so the two
 * can never drift, and neither is produced by string-surgery on the other.
 */
function attackGuardExpression(attackType) {
  const parts = ["args.isAttack", "args.weapon"];
  if (attackType === "melee" || attackType === "ranged") {
    parts.push(`args.weapon?.system?.attackType === ${JSON.stringify(attackType)}`);
  }
  return parts.join(" && ");
}

const scripted = (labelKey, trigger, script, guardExpression) => ({
  labelKey, trigger, script,
  options: {
    activateScript: `return ${guardExpression};`,
    hideScript: `return !(${guardExpression});`
  }
});

/** Always on: a guard that is a constant still has to be present. */
const ALWAYS = "true";

function attackMod(entry, quality) {
  const successes = resolveQualityValue(entry.value, quality);
  const advantage = Math.sign(Number(entry.advantage) || 0);
  if (!successes && !advantage) return null;

  const lines = [];
  if (successes) lines.push(`args.fields.SL += ${successes};`);
  // A counter, never an assignment: impmal's computeState compares the two
  // numerically, so assigning discards another source's contribution.
  if (advantage > 0) lines.push("args.advantage++;");
  if (advantage < 0) lines.push("args.disadvantage++;");

  return scripted("NAVIS.Implant.Kind.attackMod", "dialog", lines.join("\n"), attackGuardExpression(entry.attackType));
}

function damageBonus(entry, quality) {
  const value = resolveQualityValue(entry.value, quality);
  if (!value) return null;
  return scripted("NAVIS.Implant.Kind.damageBonus", "dialog",
    `args.fields.damage += ${value};`, attackGuardExpression(entry.attackType));
}

function damageReduction(entry, quality) {
  const value = resolveQualityValue(entry.value, quality);
  if (!value) return null;
  // A labelled modifier, as impmal's own graviton script does, so the player
  // can see where the reduction came from instead of an unexplained number.
  return scripted("NAVIS.Implant.Kind.damageReduction", "preApplyDamage",
    `args.modifiers.push({ value: ${-Math.abs(value)}, label: this.effect.name });`, ALWAYS);
}

function conditionImmunity(entry) {
  const key = entry.condition;
  if (!CONDITION_KEYS.includes(key)) return null;
  return scripted("NAVIS.Implant.Kind.conditionImmunity", "createCondition", [
    `let c = this.actor.hasCondition(${JSON.stringify(key)});`,
    `if (c) { this.script.notification(this.effect.name); c.delete(); }`
  ].join("\n"), ALWAYS);
}

const COMPILERS = { attackMod, damageBonus, damageReduction, conditionImmunity };

/**
 * @param {object} entry
 * @param {number} quality 1..4
 * @returns {{labelKey: string, trigger: string, script: string, options: object}|null}
 */
export function compileEntry(entry, quality) {
  const compiler = COMPILERS[entry?.kind];
  return compiler ? compiler(entry, quality) : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/implants-compile.test.mjs`
Expected: PASS, 11 tests

- [ ] **Step 5: Add the label keys**

Add to BOTH `lang/ru.json` and `lang/en.json` (Russian values shown):

```json
"NAVIS.Implant.Kind.attackMod": "Модификатор атаки",
"NAVIS.Implant.Kind.damageBonus": "Бонус урона",
"NAVIS.Implant.Kind.damageReduction": "Снижение урона",
"NAVIS.Implant.Kind.conditionImmunity": "Иммунитет к состоянию",
"NAVIS.Implant.Kind.weaponTrait": "Черта оружия",
"NAVIS.Implant.Kind.weapon": "Встроенное оружие",
"NAVIS.Implant.Kind.weaponMount": "Гнездо под оружие"
```

- [ ] **Step 6: Checkpoint**

Run: `node --test tests/*.test.mjs` — one failure, the Voll one. Commit.

---

### Task 3: Feed the compiled scripts into the effect

**Files:**
- Modify: `module/implants/mechanics/apply.js`
- Test: `tests/implants-apply-scripts.test.mjs`

**Interfaces:**
- Consumes: `compileEntry` from `./compile.js`; `testModScript` from `../test-mods.js`; `resolveEntries` from `./entries.js`.
- Produces: `scriptsForImplant(mechanics, chosen, quality) → array` — exported so it can be tested without Foundry.

Today `syncImplantMechanics` builds scripts by mapping `testModScript` over the resolved entries. It must now try both compilers.

- [ ] **Step 1: Write the failing test**

Create `tests/implants-apply-scripts.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { scriptsForImplant } from "../module/implants/mechanics/apply.js";

const group = entries => [{ id: "g1", operator: "AND", entries }];

test("a testMod and an attackMod both compile, from their own compilers", () => {
  const scripts = scriptsForImplant(group([
    { id: "e1", kind: "testMod", skill: "stealth", value: 1 },
    { id: "e2", kind: "attackMod", value: 2 }
  ]), {}, 2);
  assert.equal(scripts.length, 2);
  assert.ok(scripts.every(s => s.trigger));
  assert.ok(scripts.some(s => /args\.fields\.SL \+= 1/.test(s.script)));
  assert.ok(scripts.some(s => /args\.fields\.SL \+= 2/.test(s.script)));
});

test("numeric kinds contribute no scripts", () => {
  const scripts = scriptsForImplant(group([
    { id: "e1", kind: "characteristic", key: "tgh", value: 5 },
    { id: "e2", kind: "wounds", value: 2 }
  ]), {}, 2);
  assert.deepEqual(scripts, []);
});

test("an unchosen OR group contributes nothing", () => {
  const mechanics = [{ id: "g", operator: "OR", entries: [{ id: "e", kind: "attackMod", value: 2 }] }];
  assert.deepEqual(scriptsForImplant(mechanics, {}, 2), []);
  assert.equal(scriptsForImplant(mechanics, { g: "e" }, 2).length, 1);
});

test("quality reaches both compilers", () => {
  const scripts = scriptsForImplant(group([
    { id: "e1", kind: "damageBonus", value: { 1: 1, 2: 2, 3: 3, 4: 4 } }
  ]), {}, 4);
  assert.match(scripts[0].script, /args\.fields\.damage \+= 4/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/implants-apply-scripts.test.mjs`
Expected: FAIL — `scriptsForImplant is not a function`

- [ ] **Step 3: Write minimal implementation**

In `apply.js`, import `compileEntry` and export the collector, then use it where the script list is built:

```js
import { compileEntry } from "./compile.js";

/**
 * Every script this implant's entries contribute, from both compilers.
 * Exported for tests: it takes plain data and touches no document.
 */
export function scriptsForImplant(mechanics, chosen, quality) {
  return resolveEntries(mechanics, chosen)
    .map(entry => testModScript(entry, quality) ?? compileEntry(entry, quality))
    .filter(Boolean);
}
```

Replace the existing inline `.map(entry => testModScript(entry, quality)).filter(Boolean)` inside `syncImplantMechanics` with a call to it. Nothing else in that function changes — the label resolution added earlier already handles `labelKey`, and these records carry the same shape.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/implants-apply-scripts.test.mjs`
Expected: PASS, 4 tests

- [ ] **Step 5: Checkpoint**

Run: `node --test tests/*.test.mjs` — one failure, the Voll one. Commit.

---

### Task 4: The grant machinery, pure half

**Files:**
- Create: `module/implants/grants.js`
- Test: `tests/implants-grants.test.mjs`

**Interfaces:**
- Consumes: `resolveEntries` from `./mechanics/entries.js`; `isImplantActive`, `IMPLANT_TYPE` from `./state.js`.
- Produces: `GRANT_FLAG` (`"grantedBy"`), `grantKey(implantId, entryId) → string`, `plannedGrants(item) → array of { entryId, kind, data }`, `diffGrants(planned, existing) → { create, remove }`.

Cycle A declared `trait` and `talent` as kinds and never implemented granting — `setSource` writes a `sourceUuid` nothing reads. This task builds the diffing that granting needs; Task 5 does the Foundry half.

- [ ] **Step 1: Write the failing test**

Create `tests/implants-grants.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { GRANT_FLAG, grantKey, plannedGrants, diffGrants } from "../module/implants/grants.js";

const IMPLANT = "navis-apexialis.implant";
const implant = (entries, { installed = true, disabled = false, active = true, id = "imp1" } = {}) => ({
  id, type: IMPLANT,
  system: { installed, disabled, active, quality: 2, chosenEffects: {},
            mechanics: [{ id: "g1", operator: "AND", entries }] }
});

test("the grant key names both the implant and the entry", () => {
  assert.equal(grantKey("imp1", "e1"), "imp1:e1");
});

test("a weapon entry plans one grant", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти", attackType: "melee" } }
  ]));
  assert.equal(planned.length, 1);
  assert.equal(planned[0].kind, "weapon");
  assert.equal(planned[0].entryId, "e1");
});

test("a switched-off implant plans nothing", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "weapon", profile: { name: "Когти" } }
  ], { active: false }));
  assert.deepEqual(planned, []);
});

test("an unfitted or damaged implant plans nothing either", () => {
  assert.deepEqual(plannedGrants(implant([{ id: "e", kind: "weapon", profile: {} }], { installed: false })), []);
  assert.deepEqual(plannedGrants(implant([{ id: "e", kind: "weapon", profile: {} }], { disabled: true })), []);
});

test("non-grant kinds are not planned", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "characteristic", key: "tgh", value: 5 },
    { id: "e2", kind: "attackMod", value: 1 }
  ]));
  assert.deepEqual(planned, []);
});

test("weaponTrait is not granted on its own — it rides the weapon", () => {
  const planned = plannedGrants(implant([
    { id: "e1", kind: "weaponTrait", traitKey: "penetrating", traitValue: 4 }
  ]));
  assert.deepEqual(planned, []);
});

test("an empty mount plans nothing; a filled one plans a grant", () => {
  assert.deepEqual(plannedGrants(implant([{ id: "e1", kind: "weaponMount" }])), []);
  const filled = plannedGrants(implant([{ id: "e1", kind: "weaponMount", sourceUuid: "Compendium.x.y.Item.z" }]));
  assert.equal(filled.length, 1);
  assert.equal(filled[0].kind, "weaponMount");
});

test("diff creates what is planned and missing", () => {
  const { create, remove } = diffGrants([{ entryId: "e1", kind: "weapon", data: {} }], []);
  assert.equal(create.length, 1);
  assert.deepEqual(remove, []);
});

test("diff removes what exists and is no longer planned", () => {
  const existing = [{ id: "doc1", key: "imp1:e1" }];
  const { create, remove } = diffGrants([], existing, "imp1");
  assert.deepEqual(create, []);
  assert.deepEqual(remove, ["doc1"]);
});

test("diff leaves a grant that is both planned and present", () => {
  const existing = [{ id: "doc1", key: "imp1:e1" }];
  const planned = [{ entryId: "e1", kind: "weapon", data: {} }];
  const { create, remove } = diffGrants(planned, existing, "imp1");
  assert.deepEqual(create, []);
  assert.deepEqual(remove, []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/implants-grants.test.mjs`
Expected: FAIL — `Cannot find module '../module/implants/grants.js'`

- [ ] **Step 3: Write minimal implementation**

Create `module/implants/grants.js`:

```js
/**
 * What an implant should have created on its actor, and what to do about the
 * difference.
 *
 * Everything an implant grants carries a flag naming the implant AND the entry
 * that asked for it, so two entries on one implant cannot be confused and a
 * grant can never outlive its origin. This is the machinery cycle A declared
 * for trait and talent and never built.
 *
 * Pure: plain objects in, plain objects out, no document touched. The Foundry
 * half is in grants-apply.js.
 */

import { resolveEntries } from "./mechanics/entries.js";
import { isImplantActive } from "./state.js";

export const GRANT_FLAG = "grantedBy";

/** Identifies one grant: which implant, which entry. */
export function grantKey(implantId, entryId) {
  return `${implantId}:${entryId}`;
}

/** Kinds that put a document on the actor. weaponTrait is applied TO one. */
const GRANTING_KINDS = new Set(["weapon", "weaponMount", "trait", "talent"]);

/** A mount with nothing mounted grants nothing; a weapon needs a profile. */
function grantable(entry) {
  if (!GRANTING_KINDS.has(entry?.kind)) return false;
  if (entry.kind === "weaponMount") return !!entry.sourceUuid;
  if (entry.kind === "weapon") return !!entry.profile;
  return !!entry.sourceUuid;
}

/**
 * @param {object} item a plain implant-shaped object
 * @returns {Array<{entryId: string, kind: string, data: object}>}
 */
export function plannedGrants(item) {
  if (!isImplantActive(item)) return [];
  const chosen = item.system?.chosenEffects ?? {};
  return resolveEntries(item.system?.mechanics, chosen)
    .filter(grantable)
    .map(entry => ({ entryId: entry.id, kind: entry.kind, data: entry }));
}

/**
 * @param {Array} planned  from plannedGrants
 * @param {Array<{id: string, key: string}>} existing documents already granted by this implant
 * @param {string} implantId
 */
export function diffGrants(planned, existing = [], implantId = "") {
  const wanted = new Set(planned.map(p => grantKey(implantId, p.entryId)));
  const present = new Set(existing.map(e => e.key));

  return {
    create: planned.filter(p => !present.has(grantKey(implantId, p.entryId))),
    remove: existing.filter(e => !wanted.has(e.key)).map(e => e.id)
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/implants-grants.test.mjs`
Expected: PASS, 10 tests

- [ ] **Step 5: Checkpoint**

Run: `node --test tests/*.test.mjs` — one failure, the Voll one. Commit.

---

### Task 5: Weapon profile → impmal weapon data

**Files:**
- Create: `module/implants/weapon-profile.js`
- Test: `tests/implants-weapon-profile.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `weaponDataFromProfile(profile, traitEntries) → object` — an impmal weapon's creation data; `WEAPON_TRAITS_WITH_VALUE` — the frozen list of the eight.

- [ ] **Step 1: Write the failing test**

Create `tests/implants-weapon-profile.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { weaponDataFromProfile, WEAPON_TRAITS_WITH_VALUE } from "../module/implants/weapon-profile.js";

test("the eight value-taking traits are impmal's", () => {
  assert.deepEqual([...WEAPON_TRAITS_WITH_VALUE].sort(), [
    "heavy", "inflict", "penetrating", "rapidFire", "rend", "shield", "supercharge", "thrown"
  ]);
});

test("a melee profile maps onto impmal's own weapon shape", () => {
  const data = weaponDataFromProfile({
    name: "Когти Птераксии", attackType: "melee",
    damage: { base: "1d10+2", characteristic: "str" }
  }, []);
  assert.equal(data.name, "Когти Птераксии");
  assert.equal(data.type, "weapon");
  assert.equal(data.system.attackType, "melee");
  assert.equal(data.system.damage.base, "1d10+2");
  assert.equal(data.system.damage.characteristic, "str");
  assert.equal(data.system.damage.SL, false);
  assert.equal(data.system.damage.ignoreAP, false);
});

test("a granted weapon comes equipped — it is grown into the limb", () => {
  const data = weaponDataFromProfile({ name: "x", attackType: "melee" }, []);
  assert.equal(data.system.equipped.value, true);
});

test("weaponTrait entries become the weapon's trait list", () => {
  const data = weaponDataFromProfile({ name: "x", attackType: "melee" }, [
    { kind: "weaponTrait", traitKey: "penetrating", traitValue: 4 },
    { kind: "weaponTrait", traitKey: "reach" }
  ]);
  assert.deepEqual(data.system.traits.list, [
    { key: "penetrating", value: 4 },
    { key: "reach" }
  ]);
});

test("a value on a trait that takes none is dropped, not passed through", () => {
  const data = weaponDataFromProfile({ name: "x", attackType: "melee" }, [
    { kind: "weaponTrait", traitKey: "reach", traitValue: 9 }
  ]);
  assert.deepEqual(data.system.traits.list, [{ key: "reach" }]);
});

test("a ranged profile carries its category, spec and range", () => {
  const data = weaponDataFromProfile({
    name: "Плазменный резак", attackType: "ranged",
    category: "plasma", spec: "pistol", range: "short",
    damage: { base: "8" }
  }, []);
  assert.equal(data.system.category, "plasma");
  assert.equal(data.system.spec, "pistol");
  assert.equal(data.system.range, "short");
});

test("a profile with no name yields nothing rather than an unnamed weapon", () => {
  assert.equal(weaponDataFromProfile({ attackType: "melee" }, []), null);
  assert.equal(weaponDataFromProfile(null, []), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/implants-weapon-profile.test.mjs`
Expected: FAIL — `Cannot find module '../module/implants/weapon-profile.js'`

- [ ] **Step 3: Write minimal implementation**

Create `module/implants/weapon-profile.js`:

```js
/**
 * An implant's weapon profile, in impmal's own weapon shape.
 *
 * The shape was read from a real impmal weapon document (Фраг-граната):
 *   attackType "ranged", category "grenadesExplosives", spec "ordnance",
 *   range "medium", damage { base: "6", characteristic: "", SL: false,
 *   ignoreAP: false }, traits.list [{key:"blast"}, {key:"thrown", value:"Medium"}]
 *
 * Pure: no Foundry import, no document.
 */

/** impmal's traits that carry a value; the rest are presence-only. */
export const WEAPON_TRAITS_WITH_VALUE = Object.freeze([
  "heavy", "inflict", "penetrating", "rapidFire", "rend", "shield", "supercharge", "thrown"
]);

/** A trait entry becomes {key} or {key, value} — never {key, value: undefined}. */
function traitFromEntry(entry) {
  const key = entry?.traitKey;
  if (!key) return null;
  if (!WEAPON_TRAITS_WITH_VALUE.includes(key)) return { key };
  const value = entry.traitValue;
  return (value === undefined || value === null || value === "") ? { key } : { key, value };
}

/**
 * @param {object} profile     the entry's stored profile
 * @param {Array}  traitEntries the implant's weaponTrait entries
 * @returns {object|null} creation data for an impmal weapon
 */
export function weaponDataFromProfile(profile, traitEntries = []) {
  if (!profile?.name) return null;

  const damage = profile.damage ?? {};

  return {
    name: profile.name,
    type: "weapon",
    img: profile.img ?? undefined,
    system: {
      attackType: profile.attackType ?? "melee",
      category: profile.category ?? "",
      spec: profile.spec ?? "",
      range: profile.range ?? "",
      damage: {
        base: damage.base ?? "",
        characteristic: damage.characteristic ?? "",
        SL: !!damage.SL,
        ignoreAP: !!damage.ignoreAP
      },
      traits: { list: traitEntries.map(traitFromEntry).filter(Boolean) },
      // Grown into the limb: there is nothing to draw. `force` is load-bearing —
      // without it impmal.computeEquipped recomputes `value` from whether a hand
      // is holding the item and immediately un-equips it (impmal.js:8757).
      equipped: { value: true, force: true }
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/implants-weapon-profile.test.mjs`
Expected: PASS, 7 tests

- [ ] **Step 5: Checkpoint**

Run: `node --test tests/*.test.mjs` — one failure, the Voll one. Commit.

---

### Task 6: The grant machinery, Foundry half

**Files:**
- Create: `module/implants/grants-apply.js`
- Modify: `module/implants/mechanics/apply.js` — call the grant sync from the same hooks
- Modify: `module/implants/index.js` if a new registration is needed

**Interfaces:**
- Consumes: `plannedGrants`, `diffGrants`, `grantKey`, `GRANT_FLAG` from `./grants.js`; `weaponDataFromProfile` from `./weapon-profile.js`; `resolveEntries` from `./mechanics/entries.js`.
- Produces: `syncImplantGrants(item) → Promise<void>`, `queueGrantSync(item)`.

- [ ] **Step 1: Write the implementation**

Create `module/implants/grants-apply.js`. It must:

- Read the implant's existing grants off the actor: items whose `flags.navis-apexialis.grantedBy` starts with this implant's id.
- Build `plannedGrants(item)`, then `diffGrants(planned, existing, item.id)`.
- For each entry `p` in `create` — note `plannedGrants` returns `{ entryId, kind, data }`, so the original entry is `p.data`, not `p`:
  - `p.kind === "weapon"` → `weaponDataFromProfile(p.data.profile, weaponTraitEntries)` where `weaponTraitEntries` are this implant's resolved `weaponTrait` entries.
  - `p.kind === "weaponMount"` → `await fromUuid(p.data.sourceUuid)`, `toObject()`, delete `_id`, force `system.equipped.value = true`, and apply the same trait entries.
  - `p.kind === "trait"` / `"talent"` → `await fromUuid(p.data.sourceUuid)`, `toObject()`, delete `_id`.
  - Set `flags.navis-apexialis.grantedBy` to `grantKey(item.id, p.entryId)` on every one.

The queue, whose shape `apply.js` already has — copy it rather than inventing a second one:

```js
const grantQueues = new Map();

function queueGrantSync(item) {
  if (!item?.id) return Promise.resolve();
  const work = () => syncImplantGrants(item);
  // `work` as BOTH handlers: a rejected sync must not wedge this implant's chain.
  const next = (grantQueues.get(item.id) ?? Promise.resolve()).then(work, work);
  grantQueues.set(item.id, next);
  return next.catch(err => console.error("navis-apexialis | grant sync failed", err));
}
```
- Delete the ids in `remove`.
- Be **idempotent** and **queued per implant id**, reusing the promise-chain pattern already in `apply.js` (`mechanicsQueues`). Batched `createEmbeddedDocuments` fires several hooks at once; without the queue an implant ends with two weapons, exactly as cycle A ended with two effects.

Then in `apply.js`, call `queueGrantSync(item)` from the same `createItem` / `updateItem` / `deleteItem` hooks that already call `queueMechanicsSync`, watching the same fields plus `mechanics` and `chosenEffects`.

- [ ] **Step 2: Static verification**

Confirm `module/implants/grants-apply.js` loads via dynamic `import()` with no missing-module or syntax error — a missing Foundry global is expected and fine. Confirm every import path resolves.

- [ ] **Step 3: Run the suite**

Run: `node --test tests/*.test.mjs` — one failure, the Voll one.

- [ ] **Step 4: Checkpoint**

Commit. Live verification is Task 10.

---

### Task 7: The constructor UI for the new kinds

**Files:**
- Modify: `module/implants/mechanics/constructor.js`
- Modify: `templates/item/implant-mechanics.hbs`
- Modify: `styles/implants.css`
- Modify: `lang/ru.json`, `lang/en.json`

**Interfaces:**
- Consumes: `CONDITION_KEYS` from `./compile.js`; `WEAPON_TRAITS_WITH_VALUE` from `../weapon-profile.js`.
- Produces: no new exports; extends `KIND_FIELDS`, `kindGroupsFor` and the summary builder.

- [ ] **Step 1: Add the sixth group and the fields**

`kindGroupsFor` gains **Атака и урон** holding `attackMod`, `damageBonus`, `weaponTrait`, placed after **Броски**. `damageReduction` and `conditionImmunity` join **Защита**; `weapon` and `weaponMount` join **Выдачи**.

Per-kind fields:
- `attackMod` — successes, advantage select, attack-type select (любая / ближний / дальний)
- `damageBonus` — value, attack-type select
- `weaponTrait` — trait select over impmal's 21, and a value input shown only for the eight that take one
- `damageReduction` — value
- `conditionImmunity` — condition select over `CONDITION_KEYS`
- `weapon` — the profile fields: name, attack type, category, spec, range, damage base, damage characteristic, and the two damage booleans
- `weaponMount` — a drop target showing the mounted weapon's name and image, with a control to clear it

The value fields keep the existing **по уровням** toggle.

- [ ] **Step 2: Extend the summary builder**

Each new kind gets a one-line Russian sentence, built in `constructor.js` from the data, never assembled in the template:
- `attackMod` → «+2 успеха на атаки», narrowing to «…ближнего боя» when typed
- `damageBonus` → «+3 урона»
- `weaponTrait` → «Оружие: Пробивающее (4)»
- `damageReduction` → «−2 входящего урона»
- `conditionImmunity` → «Иммунитет: Кровотечение»
- `weapon` → «Оружие: Когти Птераксии»
- `weaponMount` → «Гнездо: <name>» or «Гнездо: пусто»

- [ ] **Step 3: Static verification**

Every new key in BOTH lang files; both parse; the template still has exactly one root (`node --test tests/parts-single-root.test.mjs`).

- [ ] **Step 4: Run the suite and commit**

Run: `node --test tests/*.test.mjs` — one failure, the Voll one.

---

### Task 8: Teach the audit the new kinds

**Files:**
- Modify: `tools/check-implants.mjs`
- Test: `tests/implants-audit.test.mjs` (create if the audit has no test file)

**Interfaces:**
- Consumes: `CONDITION_KEYS`, `WEAPON_TRAITS_WITH_VALUE`.
- Produces: no exports; new assertions.

- [ ] **Step 1: Add the assertions**

- `UNSUPPORTED_KINDS` becomes `["script"]` only — `trait` and `talent` are implemented now and must no longer fail the audit.
- A `weaponTrait` entry's `traitKey` must be one of impmal's 21; a trait outside `WEAPON_TRAITS_WITH_VALUE` must not carry a value.
- A `conditionImmunity` entry's `condition` must be one of `CONDITION_KEYS`.
- A `weapon` entry must have a `profile` with a name and an `attackType` of `melee` or `ranged`.
- A `weaponMount` entry must have either a `sourceUuid` or `emptySocket: true`, so an unfinished mount is declared rather than silently inert.
- Every mechanics group and entry id stays exactly 16 alphanumeric characters.

- [ ] **Step 2: Run the audit against existing content**

Run: `node tools/check-implants.mjs`
Expected: passes on the current 136 implants, which use none of the new kinds yet.

- [ ] **Step 3: Run the suite and commit**

---

### Task 9: Convert the weapon-bearing implants

**Files:**
- Modify: `tools/data/implants-mechadendrites.mjs` (12 implants)
- Modify: `tools/data/implants-bionics.mjs` (the 5 prose-only arms)

- [ ] **Step 1: Convert the mechadendrites**

All 12 are prose-only today because their book text is a weapon profile or an action. Give each whose book entry prints a profile a `weapon` entry with that profile plus its `weaponTrait` entries. Any whose text is an action rather than a weapon keeps `proseOnly: true` — do not invent a profile to clear the marker.

- [ ] **Step 2: Convert the bionic arms**

The five prose-only arms are Бионическая рука, монозадачная, рука-оружие, интегрированное оружие and универсальный порт. Рука-оружие and Универсальный порт take `weaponMount` with `emptySocket: true` — the book says the weapon is acquired separately. The others keep whatever their text actually says.

- [ ] **Step 3: Regenerate, audit, verify determinism**

```bash
node tools/make-implants.mjs
node tools/check-implants.mjs
git status --porcelain src/packs/items/
```
Run the generator twice; the second run must leave `git status` clean.

- [ ] **Step 4: Run the suite and commit**

---

### Task 10: Live verification

**Files:** none — this task changes nothing.

Nothing on this branch has run in Foundry. Cycle A's final review found three defects that made the entire feature inert, all invisible to a green suite, because no test crosses into warhammer-lib. This task is the answer to that.

- [ ] **Step 1: Report what to check**

Write the checklist to `.superpowers/sdd/implant-depth/live-checks.md` and hand it back. The controller runs it. The checks, in order of what would hurt most if broken:

1. Fit an implant with a `weapon` entry — a weapon item appears on the actor, equipped, and can be attacked with.
2. Its `weaponTrait` entries are on that weapon, and a valued trait carries its value.
3. An `attackMod` raises the SL on a weapon attack **without the player ticking anything**, and does NOT fire on a plain skill test.
4. A `damageBonus` raises the damage field on that attack.
5. A `damageReduction` shows as a labelled modifier when the character takes damage.
6. A `conditionImmunity` removes its condition and notifies.
7. Switching the implant off silences all of the above and removes the weapon; switching it back on restores them.
8. Removing the implant from the actor leaves no granted weapon behind.
9. Fitting through the Surgeon rather than by hand produces exactly ONE weapon, not two.

---

## Coverage against the spec

| Spec section | Task |
|---|---|
| Entry kinds table | 1 |
| Five kinds not seven; `attackMod` guard; `damageBonus` trigger; immunity idiom | 2 |
| Compiled scripts reach the effect | 3 |
| Grants — planning and diffing | 4 |
| `weapon` profile shape | 5 |
| Grants — creation and removal, queued | 6 |
| `weaponMount` drop target | 7 |
| The sheet | 7 |
| Audit assertions; `trait`/`talent` leave `UNSUPPORTED_KINDS` | 8 |
| Content: mechadendrites and weapon-bearing arms | 9 |
| Testing — pure unit-tested, contract crossings verified live | 2, 4, 5 and 10 |
| Out of scope — other prose-only implants, `script`, Drukhari, gene-seed, the three book privileges, native `augmetic` | not implemented; Task 8's audit keeps `script` failing |
