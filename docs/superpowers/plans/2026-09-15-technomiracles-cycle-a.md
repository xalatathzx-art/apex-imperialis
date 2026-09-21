# Techno-miracles, cycle A — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the machinery for DoomBC techno-miracles — a new item type, two Mechanicum resources, Processes with per-turn upkeep, a fully automated activation cycle, and a character-sheet tab that appears only when the actor carries one — shipping with no miracles in it.

**Architecture:** The item is a module-declared sub-type (`apex-imperialis.technomiracle`), the pattern Species already uses. Damage and traits are not imitated but reused: the classes are lifted off `CONFIG.Item.dataModels.weapon` so a miracle's damage is literally a weapon's damage, and attacks resolve through impmal's own `WeaponTest`. Resources live in an actor flag because impmal's `character` schema cannot be extended without patching the system. The tab joins impmal's own conditional-tab mechanism rather than inventing one.

**Tech Stack:** Node 24 ESM (no dependencies, no package.json), Foundry v13, impmal 3.3.0, warhammer-lib, `node --test` for unit tests, the existing `tools/build.mjs` LevelDB pipeline.

**Spec:** `docs/superpowers/specs/2026-09-15-technomiracles-cycle-a-design.md`

## Global Constraints

- **Module id** is `apex-imperialis`; all flags live under that key.
- **No version control.** This directory is not a git repository, so tasks end with a **Checkpoint** (run the tests and the checks) rather than a commit.
- **No package.json and no dependencies.** Tests run on `node --test` with no argument — Node treats an explicit path as a module to load, so `node --test test/` fails. Do not add npm packages.
- **Foundry must be closed** before running `tools/build.mjs` — LevelDB holds a lock on `packs/`.
- **Foundry ids are exactly 16 alphanumeric characters.** Any other length fails validation at world launch, is migrated to `_id: null` and takes the compendium down with it, silently, until the world will not open. This has already happened once in this project.
- **A change to `module.json` needs the world relaunched from Setup**, not a browser refresh. `documentTypes` is only read at world launch, so a sub-type registered mid-session exists for nothing.
- **Sheet classes are registered at `ready`, never at `setup`.** Foundry fills `CONFIG.Item.sheetClasses` inside `initializeSheets()`, which runs after the setup hook.
- **A schema field may not be called `source`.** warhammer-lib's base model defines `get source()` with no setter; a field of that name throws during model init and takes the whole item down.
- **Every skin rule must be gated on `body.apex-skin`** — `tools/build-skin.mjs` fails the build otherwise — and the skin is a per-client setting, so nothing may be legible only with it on.
- **Skin layers are listed explicitly** in `tools/build-skin.mjs`; a new CSS file is silently ignored until it is named there.
- **No miracles ship in this cycle.** The pack is registered and generated empty. Content is a later cycle.
- **Damage and traits are impmal's own classes**, lifted at registration time from `CONFIG.Item.dataModels.weapon.schema.fields`.

---

### Task 1: The resource arithmetic — ВЫПОЛНЕНО

Every rule that can be decided without a Foundry document, in one pure module with tests. Everything later consumes it.

**Files:**
- Create: `module/technomiracles/rules.js`
- Create: `tests/technomiracles-rules.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `defaultCapacity(bonus) -> number`
  - `resolveCost(cost, chosenX) -> {cognition: number, energy: number}`
  - `canAfford(pool, amount) -> boolean`
  - `spend(pool, amount) -> {value, max}`
  - `restoreCognition(pool, intBonus) -> {value, max}`
  - `upkeepTotal(processes) -> number`
  - `applyUpkeep(pool, processes) -> {pool, shortfall}`
  - `doctrineConflict(processes, miracle) -> object|null`

- [x] **Step 1: Write the failing tests**

Create `tests/technomiracles-rules.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  defaultCapacity, resolveCost, canAfford, spend, restoreCognition,
  upkeepTotal, applyUpkeep, doctrineConflict
} from "../module/technomiracles/rules.js";

const pool = (value, max) => ({ value, max });

test("capacity defaults to the characteristic bonus, never below zero", () => {
  assert.equal(defaultCapacity(3), 3);
  assert.equal(defaultCapacity(0), 0);
  assert.equal(defaultCapacity(-2), 0);
});

test("a fixed cost is returned as written", () => {
  assert.deepEqual(resolveCost({ cognition: 1, energy: 2 }), { cognition: 1, energy: 2 });
});

test("a variable cost takes the player's X", () => {
  assert.deepEqual(resolveCost({ cognition: "X", energy: 0 }, 3), { cognition: 3, energy: 0 });
  assert.deepEqual(resolveCost({ cognition: "X", energy: "X" }, 2), { cognition: 2, energy: 2 });
});

test("a variable cost with no X chosen is zero, not NaN", () => {
  assert.deepEqual(resolveCost({ cognition: "X", energy: 0 }), { cognition: 0, energy: 0 });
});

test("affordability is inclusive", () => {
  assert.equal(canAfford(pool(2, 3), 2), true);
  assert.equal(canAfford(pool(2, 3), 3), false);
  assert.equal(canAfford(pool(0, 3), 0), true);
});

test("spending never drops below zero and never touches max", () => {
  assert.deepEqual(spend(pool(3, 3), 2), pool(1, 3));
  assert.deepEqual(spend(pool(1, 3), 5), pool(0, 3));
});

test("cognition restores half the Intelligence bonus, rounded up, capped at max", () => {
  assert.deepEqual(restoreCognition(pool(0, 4), 3), pool(2, 4));
  assert.deepEqual(restoreCognition(pool(0, 4), 4), pool(2, 4));
  assert.deepEqual(restoreCognition(pool(3, 4), 3), pool(4, 4));
  assert.deepEqual(restoreCognition(pool(4, 4), 3), pool(4, 4));
});

test("upkeep is one whole point per process, never fractional", () => {
  assert.equal(upkeepTotal([]), 0);
  assert.equal(upkeepTotal([{ cognition: 1 }, { cognition: 1 }, { cognition: 0 }]), 2);
});

test("upkeep that fits is charged and reports no shortfall", () => {
  const result = applyUpkeep(pool(3, 4), [{ cognition: 1 }, { cognition: 1 }]);
  assert.deepEqual(result.pool, pool(1, 4));
  assert.equal(result.shortfall, 0);
});

test("upkeep that does not fit charges nothing and reports the gap", () => {
  const result = applyUpkeep(pool(1, 4), [{ cognition: 1 }, { cognition: 1 }]);
  assert.deepEqual(result.pool, pool(1, 4));
  assert.equal(result.shortfall, 1);
});

test("a doctrine conflicts only with another doctrine", () => {
  const active = [{ itemId: "a", name: "Доктрина Фульгурит", doctrine: true }];
  assert.equal(doctrineConflict(active, { doctrine: true })?.itemId, "a");
  assert.equal(doctrineConflict(active, { doctrine: false }), null);
  assert.equal(doctrineConflict([], { doctrine: true }), null);
});
```

- [x] **Step 2: Run the tests and watch them fail**

Run: `node --test tests/technomiracles-rules.test.mjs`
Expected: FAIL — `Cannot find module '../module/technomiracles/rules.js'`.

- [x] **Step 3: Write the rules**

Create `module/technomiracles/rules.js`:

```js
/**
 * Every techno-miracle rule that can be decided without a Foundry document.
 *
 * A techpriest is a resource-management character: Cognition is spent before
 * the roll and restored a little each turn, Charge is spent after the roll and
 * only on success, and sustained miracles bill Cognition every turn. All of
 * that is arithmetic, and arithmetic belongs somewhere it can be tested without
 * a game running.
 *
 * Nothing here touches a document. `activate.js` and `processes.js` do the
 * writing.
 */

/** A pool the actor could not have: capacity is never negative. */
export function defaultCapacity(bonus) {
  return Math.max(0, bonus ?? 0);
}

/**
 * The cost as a pair of numbers.
 *
 * The book writes some costs as X, meaning the priest decides how much to pour
 * in. Both halves of the cost can be X, and they take the same X.
 */
export function resolveCost(cost, chosenX) {
  const resolve = part => (part === "X" ? Math.max(0, chosenX ?? 0) : Math.max(0, part ?? 0));
  return { cognition: resolve(cost?.cognition), energy: resolve(cost?.energy) };
}

export function canAfford(pool, amount) {
  return (pool?.value ?? 0) >= amount;
}

/** Spending floors at zero and leaves capacity alone. */
export function spend(pool, amount) {
  return { value: Math.max(0, (pool?.value ?? 0) - amount), max: pool?.max ?? 0 };
}

/** Half the Intelligence bonus, rounded up, never past capacity. */
export function restoreCognition(pool, intBonus) {
  const gain = Math.ceil(Math.max(0, intBonus ?? 0) / 2);
  const max = pool?.max ?? 0;
  return { value: Math.min(max, (pool?.value ?? 0) + gain), max };
}

/**
 * What the active Processes bill this turn.
 *
 * The book charges halves and rounds the sum; this module charges whole points
 * per Process, because summing halves to round them again is arithmetic for its
 * own sake. A Process costs 0 or 1.
 */
export function upkeepTotal(processes) {
  return (processes ?? []).reduce((total, process) => total + (process.cognition ? 1 : 0), 0);
}

/**
 * Charge the upkeep, or charge nothing and say how short the priest is.
 *
 * Partial payment is deliberately not a thing: the priest chooses what to drop,
 * and that choice needs the full picture, not a pool already drained.
 */
export function applyUpkeep(pool, processes) {
  const total = upkeepTotal(processes);
  if (!canAfford(pool, total)) {
    return { pool: { value: pool?.value ?? 0, max: pool?.max ?? 0 }, shortfall: total - (pool?.value ?? 0) };
  }
  return { pool: spend(pool, total), shortfall: 0 };
}

/** The Doctrine already running that this one would replace, if any. */
export function doctrineConflict(processes, miracle) {
  if (!miracle?.doctrine) return null;
  return (processes ?? []).find(process => process.doctrine) ?? null;
}
```

- [x] **Step 4: Run the tests and watch them pass**

Run: `node --test tests/technomiracles-rules.test.mjs`
Expected: PASS, 11 tests.

- [x] **Step 5: Checkpoint**

Run: `node --test`
Expected: PASS — these plus the tests already in `tests/`.

---

### Task 2: The data model and the empty pack — ВЫПОЛНЕНО

**Files:**
- Create: `module/technomiracles/model.js`
- Create: `tools/make-technomiracles.mjs`
- Create: `tools/check-technomiracles.mjs`
- Modify: `module.json` — add the sub-type to `documentTypes`, add the pack, add it to `packFolders`
- Modify: `tools/build.mjs` — add the pack to `PACKS`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces:
  - `TECHNOMIRACLE_TYPE` — the string `"apex-imperialis.technomiracle"`
  - `defineTechnoMiracleModel() -> class|null`

- [x] **Step 1: Write the model**

Create `module/technomiracles/model.js`:

```js
/**
 * The Techno-miracle item type.
 *
 * Declared in module.json under `documentTypes`, which is Foundry's own way for
 * a module to add a document sub-type — nothing here patches impmal.
 *
 * Damage and traits are not imitated: the classes are lifted off impmal's own
 * weapon type, so a miracle's damage has the same fields as a bolt pistol's,
 * computes through the same code and renders with the same widgets. `game.impmal`
 * does not publish its data models, but the weapon type already holds them.
 *
 * The class is built inside a function because it extends a class warhammer-lib
 * puts on the global only once its own module has evaluated.
 */

export const TECHNOMIRACLE_TYPE = "apex-imperialis.technomiracle";

const MODULE_ID = "apex-imperialis";

let TechnoMiracleModel = null;

/** impmal's own DamageModel and TraitListModel, or null with a loud complaint. */
function borrowFromWeapon() {
  const weapon = CONFIG.Item.dataModels?.weapon;
  const damage = weapon?.schema?.fields?.damage?.model;
  const traits = weapon?.schema?.fields?.traits?.model;

  if (!damage || !traits) {
    console.error(
      `${MODULE_ID} | impmal's weapon model no longer exposes damage and traits where this module expects ` +
      "them (CONFIG.Item.dataModels.weapon.schema.fields). Techno-miracles cannot be registered."
    );
    return null;
  }

  return { damage, traits };
}

export function defineTechnoMiracleModel() {
  if (TechnoMiracleModel) return TechnoMiracleModel;

  const borrowed = borrowFromWeapon();
  if (!borrowed) return null;

  const fields = foundry.data.fields;
  const { BaseWarhammerItemModel } = warhammer.models;

  TechnoMiracleModel = class TechnoMiracleModel extends BaseWarhammerItemModel {
    static defineSchema() {
      const schema = super.defineSchema();

      schema.notes = new fields.SchemaField({
        player: new fields.HTMLField(),
        gm: new fields.HTMLField()
      });

      schema.school = new fields.StringField();
      schema.path = new fields.StringField();
      schema.xp = new fields.NumberField({ initial: 0, min: 0, integer: true });

      // The shape impmal uses for talents: readable text plus an optional check.
      schema.requirement = new fields.SchemaField({
        value: new fields.StringField(),
        script: new fields.JavaScriptField()
      });

      // Implant names from the Augmetics pack. Advisory: it warns, never blocks.
      schema.hardware = new fields.ArrayField(new fields.StringField());

      // A number, or the string "X" when the priest decides how much to pour in.
      const costField = () => new fields.StringField({ initial: "0" });
      schema.cost = new fields.SchemaField({ cognition: costField(), energy: costField() });

      schema.action = new fields.StringField({ initial: "free" });

      schema.process = new fields.SchemaField({
        sustains: new fields.BooleanField({ initial: false }),
        cognition: new fields.NumberField({ initial: 0, min: 0, max: 1, integer: true }),
        unique: new fields.BooleanField({ initial: false })
      });

      schema.test = new fields.SchemaField({
        auto: new fields.BooleanField({ initial: false }),
        modifier: new fields.NumberField({ initial: 0, integer: true })
      });

      schema.range = new fields.SchemaField({
        kind: new fields.StringField({ initial: "self" }),
        value: new fields.StringField()
      });

      schema.types = new fields.SchemaField({
        doctrine: new fields.BooleanField(),
        passive: new fields.BooleanField(),
        reactive: new fields.BooleanField(),
        unseen: new fields.BooleanField(),
        anima: new fields.BooleanField()
      });

      // The attack lives at the SAME field paths a weapon uses — `system.damage`,
      // `system.traits`, `system.attackType` — and not nested under an `attack`
      // object. impmal's WeaponTest reads those paths off whatever item it is
      // given, so matching them is what lets a miracle resolve through the
      // system's own attack machinery instead of a parallel one.
      schema.attackType = new fields.StringField({ initial: "none" });  // none | melee | ranged
      schema.damage = new fields.EmbeddedDataField(borrowed.damage);
      schema.traits = new fields.EmbeddedDataField(borrowed.traits);
      schema.penetration = new fields.NumberField({ initial: 0, integer: true });

      // The dodger must match the priest's SL, not merely succeed. impmal has
      // no equivalent, so it is a field of ours rather than a trait.
      schema.opposedDodge = new fields.BooleanField();

      return schema;
    }

    get attacks() {
      return this.attackType !== "none";
    }

    computeBase() {
      super.computeBase();
      this.traits.compute();
    }

    computeOwned(actor) {
      super.computeOwned?.(actor);
      if (this.attacks) this.damage.compute(actor);
    }
  };

  return TechnoMiracleModel;
}
```

- [x] **Step 2: Register the type and the pack**

In `module.json`, extend `documentTypes`:

```json
  "documentTypes": {
    "Item": {
      "species": {},
      "subspecies": {},
      "technomiracle": {}
    }
  },
```

Add to the `packs` array, after `navis-items`:

```json
    {
      "name": "navis-technomiracles",
      "label": "Техночудеса",
      "path": "packs/navis-technomiracles",
      "type": "Item",
      "system": "impmal",
      "ownership": {
        "PLAYER": "OBSERVER",
        "ASSISTANT": "OWNER"
      }
    },
```

And add `"navis-technomiracles"` to the `packs` list inside `packFolders`, after `"navis-items"`.

In `tools/build.mjs`, extend `PACKS` after the `items` entry:

```js
  { dir: "technomiracles", pack: "navis-technomiracles", primary: "items" },
```

- [x] **Step 3: Write the generator**

Create `tools/make-technomiracles.mjs`. It emits an empty tree in this cycle — folders and no documents — so the pipeline is proved before content exists:

```js
/**
 * Generate the Navis Techno-miracles source tree.
 *
 * Cycle A ships **no miracles**: converting the book's ~160 entries is later
 * work, directed by the user, and pouring content into a frame that then has to
 * change means rewriting the content. So this writes the folder tree and stops.
 *
 * Foundry ids are exactly 16 alphanumeric characters — not 15, not 17. An id of
 * the wrong length fails validation at world launch, is migrated to `_id: null`
 * and takes the compendium down with it, silently, until the world will not
 * open. tools/check-technomiracles.mjs asserts the length on every id.
 *
 *   node tools/make-technomiracles.mjs && node tools/build.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/packs/technomiracles");

const stats = () => ({
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.348",
  systemId: "impmal",
  systemVersion: "3.3.0"
});

/** navisTechFld + 4 digits = 16 — the shape the Augmetics folders already use. */
const FOLDERS = [
  { id: "navisTechFld0001", name: "Мотивотеургия", color: "#7a3f2f", sort: 100 },
  { id: "navisTechFld0002", name: "Кибертеургия", color: "#4f5a6a", sort: 200 },
  { id: "navisTechFld0003", name: "Ноотеургия", color: "#5d6b7a", sort: 300 },
  { id: "navisTechFld0004", name: "Аниматеургия", color: "#5a3f6a", sort: 400 }
];

fs.rmSync(OUT, { recursive: true, force: true });
for (const folder of FOLDERS) fs.mkdirSync(path.join(OUT, folder.name), { recursive: true });

fs.writeFileSync(
  path.join(OUT, "_folders.json"),
  JSON.stringify(
    FOLDERS.map(folder => ({
      _id: folder.id,
      name: folder.name,
      type: "Item",
      folder: null,
      description: "",
      color: folder.color,
      sorting: "m",
      sort: folder.sort,
      flags: {},
      _stats: stats()
    })),
    null,
    2
  ) + "\n"
);

console.log(`техночудеса: ${FOLDERS.length} папок, 0 документов (контент — следующий цикл)`);
```

- [x] **Step 4: Write the validator**

Create `tools/check-technomiracles.mjs`:

```js
/**
 * Check the generated techno-miracles tree.
 *
 * Passes on an empty tree by design — cycle A ships no miracles — but the id
 * and folder rules are in place from the start, because the 16-character id rule
 * has already broken a world once in this project.
 *
 *   node tools/check-technomiracles.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/packs/technomiracles");
const TYPE = "apex-imperialis.technomiracle";

const problems = [];
const fail = message => problems.push(message);

const ID = /^[A-Za-z0-9]{16}$/;
const checkId = (id, where, what) => {
  if (!ID.test(id ?? "")) {
    fail(`${where}: ${what} id "${id}" is not 16 alphanumeric characters (it is ${(id ?? "").length})`);
  }
};

function documents(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...documents(full));
    else if (entry.name.endsWith(".json") && entry.name !== "_folders.json") {
      found.push([full, JSON.parse(fs.readFileSync(full, "utf8"))]);
    }
  }
  return found;
}

const folders = JSON.parse(fs.readFileSync(path.join(SRC, "_folders.json"), "utf8"));
const folderIds = new Set(folders.map(folder => folder._id));
for (const folder of folders) checkId(folder._id, "_folders.json", `folder "${folder.name}"`);

const seen = new Map();

for (const [file, document] of documents(SRC)) {
  const where = path.relative(ROOT, file);

  if (document.type !== TYPE) fail(`${where}: type is "${document.type}", expected "${TYPE}"`);

  checkId(document._id, where, "item");
  if (seen.has(document._id)) fail(`${where}: id "${document._id}" is already used by ${seen.get(document._id)}`);
  seen.set(document._id, where);

  if (!folderIds.has(document.folder)) {
    fail(`${where}: names folder "${document.folder}", which _folders.json does not declare`);
  }

  const cost = document.system?.cost ?? {};
  for (const half of ["cognition", "energy"]) {
    const value = cost[half];
    if (value !== "X" && !/^\d+$/.test(String(value ?? ""))) {
      fail(`${where}: cost.${half} is "${value}" — expected a whole number or "X"`);
    }
  }

  const attackType = document.system?.attackType;
  if (attackType && attackType !== "none" && !document.system?.damage) {
    fail(`${where}: attackType is "${attackType}" but the item carries no damage`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(`\n${problems.length} problem${problems.length > 1 ? "s" : ""} found`);
  process.exit(1);
}

console.log(`техночудеса: ${seen.size} документов, ${folders.length} папок — идентификаторы и поля в порядке`);
```

- [x] **Step 5: Generate, check and build**

Close Foundry first — LevelDB holds a lock.

Run: `node tools/make-technomiracles.mjs && node tools/check-technomiracles.mjs && node tools/build.mjs`
Expected: four folders written, the check passes on zero documents, and `navis-technomiracles` appears among the built packs with 0 documents and 4 keys.

- [x] **Step 6: Checkpoint**

Run: `node --test && node tools/check-technomiracles.mjs && node tools/verify.mjs && node tools/check-content.mjs`
Expected: all pass.

---

### Task 3: Registration and the item sheet — ВЫПОЛНЕНО

**Files:**
- Create: `module/technomiracles/sheet.js`
- Create: `module/technomiracles/index.js`
- Create: `templates/item/technomiracle.hbs`
- Modify: `module/apex-imperialis.js` — import and call the two registrars

**Interfaces:**
- Consumes: `TECHNOMIRACLE_TYPE`, `defineTechnoMiracleModel()` from Task 2.
- Produces:
  - `registerTechnoMiracleModel() -> void` (call at `init`)
  - `registerTechnoMiracleSheet() -> void` (call at `ready`)

- [x] **Step 1: Write the sheet**

Create `module/technomiracles/sheet.js`, built on impmal's own item sheet the way `module/species/species-sheet.js` is:

```js
/**
 * The Techno-miracle item sheet.
 *
 * Built on impmal's own talent sheet so the window, header, effects tab and
 * drop handling are the system's rather than a parallel implementation. Only
 * the details tab is ours.
 *
 * Like the data model, the class is built inside a function: the class it
 * extends only exists once Foundry has run initializeSheets(), which is after
 * the setup hook.
 */

import { TECHNOMIRACLE_TYPE } from "./model.js";

const MODULE_ID = "apex-imperialis";
const DETAILS_TEMPLATE = `modules/${MODULE_ID}/templates/item/technomiracle.hbs`;

let sheet = null;

function findBaseSheet() {
  const registered = CONFIG.Item.sheetClasses?.talent ?? {};
  const cls = Object.values(registered).find(entry => entry?.cls)?.cls;

  if (!cls) {
    console.error(
      `${MODULE_ID} | no impmal item sheet is registered for "talent", so the Techno-miracle sheet cannot be ` +
      "built on one. This means registerTechnoMiracleSheet ran before Foundry initialised CONFIG.Item.sheetClasses."
    );
  }

  return cls;
}

export function defineTechnoMiracleSheet() {
  if (sheet) return sheet;

  const Base = findBaseSheet();
  if (!Base) return null;

  sheet = class TechnoMiracleSheet extends Base {
    static type = TECHNOMIRACLE_TYPE;

    static DEFAULT_OPTIONS = {
      classes: ["technomiracle"],
      position: { width: 520, height: "auto" }
    };

    static PARTS = {
      header: { scrollable: [""], template: "systems/impmal/templates/item/item-header.hbs", classes: ["sheet-header"] },
      tabs: { scrollable: [""], template: "templates/generic/tab-navigation.hbs" },
      description: { scrollable: [""], template: "systems/impmal/templates/item/item-description.hbs" },
      details: { scrollable: [""], template: DETAILS_TEMPLATE },
      effects: { scrollable: [""], template: "systems/impmal/templates/item/item-effects.hbs" }
    };
  };

  return sheet;
}
```

- [x] **Step 2: Write the details template**

Create `templates/item/technomiracle.hbs`. Read `templates/item/species.hbs` first and follow its markup conventions — the same field wrappers and the same action attributes:

```hbs
<section class="tab {{tab.cssClass}}" data-group="primary" data-tab="{{tab.id}}">

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.School"}}</label>
    <input type="text" name="system.school" value="{{system.school}}">
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.Path"}}</label>
    <input type="text" name="system.path" value="{{system.path}}">
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.Xp"}}</label>
    <input type="number" name="system.xp" value="{{system.xp}}">
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.Requirement"}}</label>
    <input type="text" name="system.requirement.value" value="{{system.requirement.value}}">
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.CostCognition"}}</label>
    <input type="text" name="system.cost.cognition" value="{{system.cost.cognition}}">
    <label>{{localize "NAVIS.Techno.CostEnergy"}}</label>
    <input type="text" name="system.cost.energy" value="{{system.cost.energy}}">
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.Action"}}</label>
    <select name="system.action">
      <option value="free" {{#if (eq system.action "free")}}selected{{/if}}>{{localize "NAVIS.Techno.ActionFree"}}</option>
      <option value="half" {{#if (eq system.action "half")}}selected{{/if}}>{{localize "NAVIS.Techno.ActionHalf"}}</option>
      <option value="full" {{#if (eq system.action "full")}}selected{{/if}}>{{localize "NAVIS.Techno.ActionFull"}}</option>
      <option value="reaction" {{#if (eq system.action "reaction")}}selected{{/if}}>{{localize "NAVIS.Techno.ActionReaction"}}</option>
      <option value="none" {{#if (eq system.action "none")}}selected{{/if}}>{{localize "NAVIS.Techno.ActionNone"}}</option>
    </select>
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.Sustains"}}</label>
    <input type="checkbox" name="system.process.sustains" {{checked system.process.sustains}}>
    <label>{{localize "NAVIS.Techno.Upkeep"}}</label>
    <input type="number" name="system.process.cognition" value="{{system.process.cognition}}" min="0" max="1">
    <label>{{localize "NAVIS.Techno.Unique"}}</label>
    <input type="checkbox" name="system.process.unique" {{checked system.process.unique}}>
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.TestAuto"}}</label>
    <input type="checkbox" name="system.test.auto" {{checked system.test.auto}}>
    <label>{{localize "NAVIS.Techno.TestModifier"}}</label>
    <input type="number" name="system.test.modifier" value="{{system.test.modifier}}">
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.Doctrine"}}</label>
    <input type="checkbox" name="system.types.doctrine" {{checked system.types.doctrine}}>
    <label>{{localize "NAVIS.Techno.Passive"}}</label>
    <input type="checkbox" name="system.types.passive" {{checked system.types.passive}}>
    <label>{{localize "NAVIS.Techno.Reactive"}}</label>
    <input type="checkbox" name="system.types.reactive" {{checked system.types.reactive}}>
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.AttackKind"}}</label>
    <select name="system.attackType">
      <option value="none" {{#if (eq system.attackType "none")}}selected{{/if}}>{{localize "NAVIS.Techno.AttackNone"}}</option>
      <option value="ranged" {{#if (eq system.attackType "ranged")}}selected{{/if}}>{{localize "NAVIS.Techno.AttackRanged"}}</option>
      <option value="melee" {{#if (eq system.attackType "melee")}}selected{{/if}}>{{localize "NAVIS.Techno.AttackMelee"}}</option>
    </select>
  </div>

  <div class="form-group">
    <label>{{localize "NAVIS.Techno.Damage"}}</label>
    <input type="text" name="system.damage.base" value="{{system.damage.base}}">
    <label>{{localize "NAVIS.Techno.Penetration"}}</label>
    <input type="number" name="system.penetration" value="{{system.penetration}}">
    <label>{{localize "NAVIS.Techno.OpposedDodge"}}</label>
    <input type="checkbox" name="system.opposedDodge" {{checked system.opposedDodge}}>
  </div>

  {{> itemTraits traits=document.system.traits path="system.traits" label="IMPMAL.Traits"}}

</section>
```

- [x] **Step 3: Write the wiring**

Create `module/technomiracles/index.js`:

```js
/**
 * Wiring for the Techno-miracle item type.
 *
 * The model goes into CONFIG at init, before any document is prepared; the
 * sheet at `ready`, which is the first moment Foundry's sheet registry exists.
 *
 * Because the type is declared in module.json, it only reaches a world at
 * launch — enabling the module in a running world registers a model for a type
 * the world does not have, so reportState says so out loud.
 */

import { defineTechnoMiracleModel, TECHNOMIRACLE_TYPE } from "./model.js";
import { defineTechnoMiracleSheet } from "./sheet.js";

const MODULE_ID = "apex-imperialis";

export { TECHNOMIRACLE_TYPE };

export function registerTechnoMiracleModel() {
  if (!globalThis.warhammer?.models) {
    console.error(`${MODULE_ID} | warhammer-lib is unavailable; the Techno-miracle item type cannot be registered.`);
    return;
  }

  const model = defineTechnoMiracleModel();
  if (!model) return;

  CONFIG.Item.dataModels[TECHNOMIRACLE_TYPE] = model;
  CONFIG.Item.typeLabels ??= {};
  CONFIG.Item.typeLabels[TECHNOMIRACLE_TYPE] = "NAVIS.Techno.Type";
}

export function registerTechnoMiracleSheet() {
  if (!CONFIG.Item.dataModels[TECHNOMIRACLE_TYPE]) {
    console.error(`${MODULE_ID} | the Techno-miracle data model is not registered; the sheet cannot be either.`);
    return;
  }

  const cls = defineTechnoMiracleSheet();
  if (!cls) return;

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, MODULE_ID, cls, {
    types: [TECHNOMIRACLE_TYPE],
    makeDefault: true,
    label: "NAVIS.Techno.Sheet"
  });

  reportState();
}

function reportState() {
  if (!game.documentTypes?.Item?.includes(TECHNOMIRACLE_TYPE)) {
    const message =
      "Apex Imperialis: the Techno-miracle item type is not registered with this world. Return to Setup and " +
      "launch the world again — enabling a module mid-session does not add its document types.";
    console.error(`${MODULE_ID} | ${message}`);
    ui.notifications.error(message, { permanent: true });
    return;
  }

  console.log(`${MODULE_ID} | Techno-miracle item type ready, sheet registered`);
}
```

- [x] **Step 4: Call the registrars**

In `module/apex-imperialis.js`, add the import beside the others:

```js
import { registerTechnoMiracleModel, registerTechnoMiracleSheet } from "./technomiracles/index.js";
```

Call the model registrar from the existing `init` hook, immediately after `registerSpeciesModel()`:

```js
  registerSpeciesModel();
  registerTechnoMiracleModel();
```

and the sheet registrar from the existing `ready` hook, after `registerSpeciesSheet()`:

```js
  registerSpeciesSheet();
  registerTechnoMiracleSheet();
```

- [x] **Step 5: Add the strings**

In `lang/en.json`, beside the existing `NAVIS.*` keys:

```json
  "NAVIS.Techno.Type": "Techno-miracle",
  "NAVIS.Techno.Sheet": "Techno-miracle Sheet",
  "NAVIS.Techno.School": "School",
  "NAVIS.Techno.Path": "Path",
  "NAVIS.Techno.Xp": "XP",
  "NAVIS.Techno.Requirement": "Requires",
  "NAVIS.Techno.CostCognition": "Cognition",
  "NAVIS.Techno.CostEnergy": "Charge",
  "NAVIS.Techno.Action": "Action",
  "NAVIS.Techno.ActionFree": "Free action",
  "NAVIS.Techno.ActionHalf": "Half action",
  "NAVIS.Techno.ActionFull": "Full action",
  "NAVIS.Techno.ActionReaction": "Reaction",
  "NAVIS.Techno.ActionNone": "None",
  "NAVIS.Techno.Sustains": "Sustains",
  "NAVIS.Techno.Upkeep": "Upkeep",
  "NAVIS.Techno.Unique": "Unique",
  "NAVIS.Techno.TestAuto": "Automatic",
  "NAVIS.Techno.TestModifier": "Modifier",
  "NAVIS.Techno.Doctrine": "Doctrine",
  "NAVIS.Techno.Passive": "Passive",
  "NAVIS.Techno.Reactive": "Reactive",
  "NAVIS.Techno.AttackKind": "Attack",
  "NAVIS.Techno.AttackNone": "None",
  "NAVIS.Techno.AttackRanged": "Ranged",
  "NAVIS.Techno.AttackMelee": "Melee",
  "NAVIS.Techno.Damage": "Damage",
  "NAVIS.Techno.Penetration": "Penetration",
  "NAVIS.Techno.OpposedDodge": "Dodge must match SL",
```

In `src/lang/ru.mjs`, add the same keys to the `OURS` map:

```js
  "NAVIS.Techno.Type": "Техночудо",
  "NAVIS.Techno.Sheet": "Лист техночуда",
  "NAVIS.Techno.School": "Школа",
  "NAVIS.Techno.Path": "Путь",
  "NAVIS.Techno.Xp": "Опыт",
  "NAVIS.Techno.Requirement": "Требования",
  "NAVIS.Techno.CostCognition": "Когниция",
  "NAVIS.Techno.CostEnergy": "Заряд",
  "NAVIS.Techno.Action": "Действие",
  "NAVIS.Techno.ActionFree": "Свободное действие",
  "NAVIS.Techno.ActionHalf": "Полудействие",
  "NAVIS.Techno.ActionFull": "Полное действие",
  "NAVIS.Techno.ActionReaction": "Реакция",
  "NAVIS.Techno.ActionNone": "Нет",
  "NAVIS.Techno.Sustains": "Процесс",
  "NAVIS.Techno.Upkeep": "Поддержание",
  "NAVIS.Techno.Unique": "Уникальный",
  "NAVIS.Techno.TestAuto": "Автоматически",
  "NAVIS.Techno.TestModifier": "Модификатор",
  "NAVIS.Techno.Doctrine": "Доктрина",
  "NAVIS.Techno.Passive": "Пассивное",
  "NAVIS.Techno.Reactive": "Реагирование",
  "NAVIS.Techno.AttackKind": "Атака",
  "NAVIS.Techno.AttackNone": "Нет",
  "NAVIS.Techno.AttackRanged": "Дальний бой",
  "NAVIS.Techno.AttackMelee": "Ближний бой",
  "NAVIS.Techno.Damage": "Урон",
  "NAVIS.Techno.Penetration": "Пробитие",
  "NAVIS.Techno.OpposedDodge": "Уклонение должно сравнять КУ",
```

Run: `node tools/build-lang.mjs`
Expected: it reports coverage and rewrites `lang/ru.json` without errors.

- [x] **Step 6: Verify in the running game**

Relaunch the world from Setup — `module.json` changed, and `documentTypes` is only read at launch.

In the console:

```js
const item = await Item.create({ name: "проба", type: "apex-imperialis.technomiracle" });
console.log(item.type, item.system.cost, item.system.damage);
await item.sheet.render(true);
```

Expected: the item is created, `cost` is `{cognition: "0", energy: "0"}`, and `system.damage` has impmal's own damage fields (`base`, `characteristic`, `SL`, `ignoreAP`) at the same path a weapon has them. The sheet opens with a details tab carrying the fields above.

Then confirm the borrowed classes really are impmal's, not lookalikes:

```js
const weaponDamage = CONFIG.Item.dataModels.weapon.schema.fields.damage.model;
console.log(item.system.damage instanceof weaponDamage);
```

Expected: `true`. If this is `false`, stop: the borrow in `model.js` found something else, and everything downstream that relies on impmal's attack machinery will misbehave in ways that are hard to trace.

Clean up: `await item.delete();`

- [x] **Step 7: Checkpoint**

Run: `node --test && node tools/check-technomiracles.mjs && node tools/build-lang.mjs`
Expected: all pass, plus the console check above.

---

### Task 4: The resource block and its panel — ВЫПОЛНЕНО

**Files:**
- Create: `module/technomiracles/resources.js`
- Create: `src/skin/81-technomiracles.css`
- Modify: `tools/build-skin.mjs` — register the layer

**Interfaces:**
- Consumes: `defaultCapacity`, `restoreCognition`, `spend`, `canAfford` from Task 1.
- Produces:
  - `readBlock(actor) -> {cognition, energy, processes}` — seeded if absent, never written
  - `writeBlock(actor, block) -> Promise<void>`
  - `spendFrom(actor, which, amount) -> Promise<boolean>`

- [x] **Step 1: Write the resource accessor**

Create `module/technomiracles/resources.js`:

```js
/**
 * The two Mechanicum resources, stored on the actor.
 *
 * They live in a flag rather than in the actor's schema because impmal's
 * `character` model is fixed and this module does not patch the system. The
 * consequence worth knowing: an Active Effect cannot touch these, so capacity
 * is an ordinary editable number rather than something effects can raise.
 *
 * Capacity is seeded from the characteristic bonus the first time the block is
 * read and never recomputed after that — installing Motive Banks raises nothing
 * by itself, and that is deliberate, to keep this pack and the Augmetics pack
 * uncoupled.
 */

import { canAfford, defaultCapacity, restoreCognition, spend } from "./rules.js";

const MODULE_ID = "apex-imperialis";
const FLAG = "mechanicum";

/** The block as it should be read, seeded from the actor if it is not there yet. */
export function readBlock(actor) {
  const stored = actor.getFlag(MODULE_ID, FLAG) ?? {};
  const intBonus = actor.system.characteristics?.int?.bonus ?? 0;
  const tghBonus = actor.system.characteristics?.tgh?.bonus ?? 0;

  return {
    cognition: stored.cognition ?? { value: defaultCapacity(intBonus), max: defaultCapacity(intBonus) },
    energy: stored.energy ?? { value: defaultCapacity(tghBonus), max: defaultCapacity(tghBonus) },
    processes: stored.processes ?? []
  };
}

export async function writeBlock(actor, block) {
  await actor.setFlag(MODULE_ID, FLAG, block);
}

/**
 * Spend from one pool, or refuse and say so.
 *
 * Returns false without writing anything when the pool is short, because every
 * caller needs to stop rather than proceed with a partial payment.
 */
export async function spendFrom(actor, which, amount) {
  if (amount <= 0) return true;

  const block = readBlock(actor);
  if (!canAfford(block[which], amount)) return false;

  block[which] = spend(block[which], amount);
  await writeBlock(actor, block);
  return true;
}

/** Restore at the start of the owner's turn. Does not touch Charge: it never regenerates. */
export async function restoreAtTurnStart(actor) {
  const block = readBlock(actor);
  const intBonus = actor.system.characteristics?.int?.bonus ?? 0;
  block.cognition = restoreCognition(block.cognition, intBonus);
  await writeBlock(actor, block);
  return block;
}
```

- [x] **Step 2: Write the skin layer**

Create `src/skin/81-technomiracles.css`. The Cognition bar copies the construction of the Warp Charge bar in `75-dialog-warp.css` — vessel, fill, flow, sheen — in the Mechanicum's palette rather than the Warp's. Read that file first and follow its structure:

```css
/* ══════════════════════════════════════════════════════════════════════════
   80 TECHNO-MIRACLES — the Cognition and Charge readouts and the Processes
   list on the Techno-miracles tab.

   The Cognition bar is the Warp Charge bar's sibling: same vessel, same flow,
   same sheen, brass and red instead of violet. Nothing here is load-bearing —
   the skin is a per-client setting, and with it off the tab must still read as
   a list of numbers and buttons.
   ══════════════════════════════════════════════════════════════════════ */

body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-pools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
}

/* The vessel. */
body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-bar {
  position: relative;
  flex: 1;
  height: 26px;
  overflow: hidden;
  background: radial-gradient(ellipse 60% 140% at 18% 50%, #22150d 0%, #070707 75%);
  border: 1px solid var(--navis-line);
  border-left: 3px solid var(--navis-brass-dim);
  clip-path: var(--navis-plate-sm);
  box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.85);
}

/* The charge. */
body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-bar > .fill {
  position: relative;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  background-color: #2b1b0f;
  background-image:
    linear-gradient(90deg, #2b1b0f 0%, #6a4420 50%, #b8863a 100%),
    repeating-linear-gradient(115deg, transparent 0 14px, rgba(255, 196, 120, 0.13) 14px 16px, transparent 16px 34px);
  background-size: 100% 100%, 180px 100%;
  --navis-techno-flow: calc(18s - 9s * var(--navis-techno-level, 0));
  animation: navis-warp-flow var(--navis-techno-flow) linear infinite;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.55);
}

/* A sheen crossing the charge every few seconds. */
body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-bar > .fill::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -48px;
  width: 48px;
  background: linear-gradient(90deg, transparent, rgba(255, 228, 180, 0.22), transparent);
  animation: navis-warp-sheen 6s ease-in-out infinite;
  pointer-events: none;
}

body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-processes {
  margin: 8px 0 0;
}

body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-processes > li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px;
  border-left: 3px solid var(--navis-brass-dim);
}

@media (prefers-reduced-motion: reduce) {
  body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-bar > .fill,
  body.apex-skin .application.impmal.actor .tab[data-tab="technomiracles"] .navis-techno-bar > .fill::before {
    animation: none !important;
  }
}
```

The `navis-warp-flow` and `navis-warp-sheen` keyframes are declared in `75-dialog-warp.css`, which is concatenated before this layer, so they are in scope.

- [x] **Step 3: Register the layer**

`tools/build-skin.mjs` lists its layers explicitly rather than reading the directory, so a new file is silently ignored until it is named. Add it after the augmetics layer at the end of that list:

```js
  layer("79-augmetics.css"),
  "",
  layer("80-technomiracles.css"),
```

Run: `node tools/build-skin.mjs`
Expected: it rebuilds `styles/apex-skin.css` with no ungated-rule errors, and `navis-techno-bar` appears in the output.

- [x] **Step 4: Checkpoint**

Run: `node --test && node tools/build-skin.mjs && grep -c "navis-techno-bar" styles/apex-skin.css`
Expected: tests pass, the skin builds, and the grep reports at least 1.

---

### Task 5: Processes and turn-start upkeep — ВЫПОЛНЕНО

**Files:**
- Create: `module/technomiracles/processes.js`
- Modify: `module/technomiracles/index.js` — call `registerProcessUpkeep()` from the wiring

**Interfaces:**
- Consumes: `readBlock`, `writeBlock`, `restoreAtTurnStart` from Task 4; `applyUpkeep`, `doctrineConflict` from Task 1.
- Produces:
  - `addProcess(actor, item) -> Promise<void>`
  - `dropProcess(actor, itemId) -> Promise<void>`
  - `registerProcessUpkeep() -> void`

**Note on the upkeep trigger.** The spec said upkeep would ride warhammer-lib's `startTurn` script trigger. That trigger runs scripts that live *on Active Effects*, so using it would mean planting an effect on every techpriest just to bill them. This plan uses the module's own `updateCombat` hook instead: no effect required, and it depends on Foundry's documented hook rather than another module's internals.

- [x] **Step 1: Write the process handling**

Create `module/technomiracles/processes.js`:

```js
/**
 * Sustained techno-miracles and what they cost every turn.
 *
 * A techpriest plays as someone juggling several running programs: each active
 * Process bills Cognition at the start of his turn, and when he cannot pay he
 * must choose what to shut down. That choice is the interesting part, so the
 * code never picks for him.
 */

import { applyUpkeep, doctrineConflict } from "./rules.js";
import { readBlock, restoreAtTurnStart, writeBlock } from "./resources.js";

const MODULE_ID = "apex-imperialis";

/** The compact record a Process keeps — enough to bill it and to show it. */
const processOf = item => ({
  itemId: item.id,
  name: item.name,
  cognition: item.system.process.cognition,
  doctrine: item.system.types.doctrine
});

/**
 * Start sustaining a miracle.
 *
 * Only one Doctrine may run at a time, and a unique miracle may not run twice,
 * so both are resolved here rather than at the call site.
 */
export async function addProcess(actor, item) {
  const block = readBlock(actor);

  if (item.system.process.unique && block.processes.some(process => process.itemId === item.id)) {
    ui.notifications.warn(game.i18n.format("NAVIS.Techno.AlreadyRunning", { name: item.name }));
    return;
  }

  const conflict = doctrineConflict(block.processes, { doctrine: item.system.types.doctrine });
  if (conflict) {
    const replace = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("NAVIS.Techno.DoctrineTitle") },
      content: `<p>${game.i18n.format("NAVIS.Techno.DoctrinePrompt", { running: conflict.name, next: item.name })}</p>`
    });
    if (!replace) return;
    block.processes = block.processes.filter(process => process.itemId !== conflict.itemId);
  }

  block.processes.push(processOf(item));
  await writeBlock(actor, block);
}

export async function dropProcess(actor, itemId) {
  const block = readBlock(actor);
  block.processes = block.processes.filter(process => process.itemId !== itemId);
  await writeBlock(actor, block);
}

/**
 * Restore, then bill, at the start of the owner's turn.
 *
 * The order matters: a priest who regains two Cognition and owes two can pay.
 * Billing first would shut down Processes he could have afforded.
 */
export async function chargeUpkeep(actor) {
  const block = await restoreAtTurnStart(actor);
  const { pool, shortfall } = applyUpkeep(block.cognition, block.processes);

  if (shortfall > 0) {
    ui.notifications.warn(
      game.i18n.format("NAVIS.Techno.Shortfall", { short: shortfall }),
      { permanent: true }
    );
    return;
  }

  block.cognition = pool;
  await writeBlock(actor, block);
}

/**
 * Bill at the start of a turn.
 *
 * `updateCombat` rather than warhammer-lib's `startTurn` script trigger: that
 * trigger runs scripts that live on Active Effects, so riding it would mean
 * planting an effect on every techpriest purely to bill him.
 *
 * Only one client may do the writing, or every connected owner races to bill
 * the same actor. The active GM is the one that does.
 */
export function registerProcessUpkeep() {
  Hooks.on("updateCombat", async (combat, changed) => {
    if (!game.users.activeGM?.isSelf) return;
    if (changed.turn === undefined && changed.round === undefined) return;

    const actor = combat.combatant?.actor;
    if (!actor) return;

    const block = actor.getFlag(MODULE_ID, "mechanicum");
    if (!block?.processes?.length) return;

    await chargeUpkeep(actor);
  });
}
```

- [x] **Step 2: Add the strings**

In `lang/en.json`:

```json
  "NAVIS.Techno.AlreadyRunning": "{name} is already running.",
  "NAVIS.Techno.DoctrineTitle": "Replace the Doctrine",
  "NAVIS.Techno.DoctrinePrompt": "{running} is already running, and only one Doctrine may be active. Replace it with {next}?",
  "NAVIS.Techno.Shortfall": "Not enough Cognition to sustain everything — {short} short. Drop a Process.",
```

In `src/lang/ru.mjs`, in `OURS`:

```js
  "NAVIS.Techno.AlreadyRunning": "{name} уже поддерживается.",
  "NAVIS.Techno.DoctrineTitle": "Сменить Доктрину",
  "NAVIS.Techno.DoctrinePrompt": "Уже активна {running}, а Доктрина может быть только одна. Заменить её на {next}?",
  "NAVIS.Techno.Shortfall": "Когниции не хватает на все Процессы — недостаёт {short}. Отключите один.",
```

- [x] **Step 3: Call the registrar**

In `module/technomiracles/index.js`, add the import and extend the model registrar — the hook only needs the game, not the sheet registry, so `init` is early enough:

```js
import { registerProcessUpkeep } from "./processes.js";
```

and at the end of `registerTechnoMiracleModel()`:

```js
  registerProcessUpkeep();
```

- [x] **Step 4: Checkpoint**

Run: `node --test && node tools/build-lang.mjs`
Expected: both pass. The behaviour is verified in Task 8, which has combat to run it in.

---

### Task 6: The activation cycle — ВЫПОЛНЕНО

**Files:**
- Create: `module/technomiracles/activate.js`

**Interfaces:**
- Consumes: `resolveCost`, `canAfford` from Task 1; `readBlock`, `spendFrom` from Task 4; `addProcess` from Task 5.
- Produces: `activateMiracle(actor, item) -> Promise<void>`

- [x] **Step 1: Write the activation cycle**

Create `module/technomiracles/activate.js`:

```js
/**
 * Activating a techno-miracle, in the order the book insists on.
 *
 * Two steps carry the whole design. Cognition is spent **before** the roll —
 * a failed appeal to the sacred code still consumes the computation — and
 * Charge is spent **after** it and only on success, because the systems only
 * draw power once the code has executed. Swap them and this is just a psychic
 * power with different words.
 */

import { canAfford, resolveCost } from "./rules.js";
import { readBlock, spendFrom } from "./resources.js";
import { addProcess } from "./processes.js";

const MODULE_ID = "apex-imperialis";

/** Ask for X when the book leaves the amount to the priest. */
async function askForX(item) {
  const answer = await foundry.applications.api.DialogV2.prompt({
    window: { title: item.name },
    content: `<p>${game.i18n.localize("NAVIS.Techno.AskX")}</p><input type="number" name="x" value="1" min="0">`,
    ok: { callback: (event, button) => Number(button.form.elements.x.value) }
  });
  return Number.isFinite(answer) ? answer : null;
}

/** Implants the miracle needs and the actor does not have. */
function missingHardware(actor, item) {
  const owned = new Set(actor.items.filter(i => i.type === "augmetic").map(i => i.name));
  return (item.system.hardware ?? []).filter(name => !owned.has(name));
}

export async function activateMiracle(actor, item) {
  // 1. Gate. Advisory everywhere else in this module; here it is worth a stop,
  //    because activating without the hardware is always a mistake, never a choice.
  const missing = missingHardware(actor, item);
  if (missing.length) {
    const proceed = await foundry.applications.api.DialogV2.confirm({
      window: { title: item.name },
      content: `<p>${game.i18n.format("NAVIS.Techno.MissingHardware", { list: missing.join(", ") })}</p>`
    });
    if (!proceed) return;
  }

  // 2. Variable cost.
  const variable = item.system.cost.cognition === "X" || item.system.cost.energy === "X";
  const chosenX = variable ? await askForX(item) : 0;
  if (variable && chosenX === null) return;

  const cost = resolveCost(item.system.cost, chosenX);

  // 3. Cognition, before the roll.
  if (!(await spendFrom(actor, "cognition", cost.cognition))) {
    ui.notifications.warn(game.i18n.format("NAVIS.Techno.NoCognition", { name: item.name }));
    return;
  }

  // 4. The roll. Tech, keyed to Intelligence.
  let test = null;
  if (!item.system.test.auto) {
    test = await actor.setupSkillTest(
      { key: "tech" },
      { characteristic: "int", appendTitle: ` — ${item.name}` },
      { fields: { modifier: item.system.test.modifier } }
    );
    if (!test) return;              // the priest closed the dialog; Cognition is gone, as the book says
    if (!test.succeeded) {
      await postCard(actor, item, cost, test, false);
      return;
    }
  }

  // 5. Charge, after the roll and only on success.
  if (cost.energy > 0) {
    const block = readBlock(actor);
    const payWithBody = !canAfford(block.energy, cost.energy);
    if (payWithBody) {
      ui.notifications.info(game.i18n.format("NAVIS.Techno.Fatigue", { count: cost.energy }));
      await actor.addCondition("fatigued");
    } else {
      await spendFrom(actor, "energy", cost.energy);
    }
  }

  // 6. Process.
  if (item.system.process.sustains) await addProcess(actor, item);

  // 7. Attack, through impmal's own machinery. The item carries damage, traits
  //    and attackType at the same field paths a weapon does, which is what lets
  //    the system's own WeaponTest resolve it.
  if (item.system.attacks) {
    await actor.setupWeaponTest(item.id, { appendTitle: ` — ${item.name}` });
  }

  await postCard(actor, item, cost, test, true);
}

async function postCard(actor, item, cost, test, succeeded) {
  const paid = game.i18n.format("NAVIS.Techno.Paid", { cognition: cost.cognition, energy: succeeded ? cost.energy : 0 });
  const outcome = succeeded
    ? game.i18n.localize("NAVIS.Techno.Succeeded")
    : game.i18n.localize("NAVIS.Techno.Failed");

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: item.name,
    content: `<p><strong>${outcome}</strong></p><p>${paid}</p>${succeeded ? item.system.notes.player : ""}`,
    flags: { [MODULE_ID]: { technomiracle: item.id } }
  });
}
```

- [x] **Step 2: Add the strings**

In `lang/en.json`:

```json
  "NAVIS.Techno.AskX": "How much do you pour in?",
  "NAVIS.Techno.MissingHardware": "This miracle needs hardware you do not have: {list}. Activate anyway?",
  "NAVIS.Techno.NoCognition": "Not enough Cognition for {name}.",
  "NAVIS.Techno.Fatigue": "No Charge left — paid with the body instead, taking Fatigue for {count}.",
  "NAVIS.Techno.Paid": "Spent: {cognition} Cognition, {energy} Charge",
  "NAVIS.Techno.Succeeded": "The code executes",
  "NAVIS.Techno.Failed": "The code fails — the computation is spent regardless",
```

In `src/lang/ru.mjs`, in `OURS`:

```js
  "NAVIS.Techno.AskX": "Сколько вкладываете?",
  "NAVIS.Techno.MissingHardware": "Для этого чуда нужно Железо, которого у вас нет: {list}. Всё равно активировать?",
  "NAVIS.Techno.NoCognition": "Когниции не хватает на {name}.",
  "NAVIS.Techno.Fatigue": "Заряда нет — плата телом, Усталость за {count}.",
  "NAVIS.Techno.Paid": "Потрачено: {cognition} Когниции, {energy} Заряда",
  "NAVIS.Techno.Succeeded": "Код выполнен",
  "NAVIS.Techno.Failed": "Код не выполнен — вычисления потрачены всё равно",
```

- [x] **Step 3: Probe the attack path before trusting it**

The one assumption in this task that cannot be checked offline: that impmal's
`setupWeaponTest` accepts an item that is not of type `weapon`. It reads its
fields off whatever item id it is handed, and the model now matches a weapon's
field paths — but "should" is not "does".

In the running game, on an actor:

```js
const probe = await Item.create({
  name: "проба атаки", type: "apex-imperialis.technomiracle",
  system: { attackType: "ranged", penetration: 2, damage: { base: "5", characteristic: "int" } }
}, { parent: actor });

await actor.setupWeaponTest(probe.id);
```

Expected: the weapon test dialog opens, naming the item, with penetration 2 in play.

**If it throws or refuses**, do not work around it inside `activate.js`. Stop and
report: the fix is a decision about the model, not a patch at the call site, and
the likely answer is to give the model the two or three further fields the test
reads off a weapon (`range`, `mag`, `ammo`) as inert defaults.

Clean up: `await probe.delete();`

- [x] **Step 4: Checkpoint**

Run: `node --test && node tools/build-lang.mjs`
Expected: both pass, plus the probe above opening a weapon test.

---


> **Итог пробы из шага 3.** Проба провалилась: `weapon.system.hasAmmo is not a
> function`. Причина глубже нехватки полей — `setupWeaponTest` читает с оружия
> методы (`hasAmmo()`, геттер `skill`), а не только данные. Принятое решение:
> модель чуда НАСЛЕДУЕТ модель оружия impmal вместо того, чтобы встраивать два
> её класса. Следствия: наше понятие дальности переехало в `reach` (поле `range`
> у оружия занято полосой short/medium/long), поле `penetration` удалено — в
> impmal это черта `penetrating` со значением, `hasAmmo()` переопределён на
> `true`. Повторная проба прошла: диалог «Проверка: Стрельба» открылся с нашим
> предметом и чертой `penetrating:2`.

### Task 7: The Techno-miracles tab — ВЫПОЛНЕНО

**Files:**
- Create: `module/technomiracles/tab.js`
- Create: `templates/actor/technomiracles.hbs`
- Modify: `module/technomiracles/index.js` — call `registerTechnoMiracleTab()` from the sheet registrar

**Interfaces:**
- Consumes: `TECHNOMIRACLE_TYPE` from Task 2; `readBlock` from Task 4; `dropProcess` from Task 5; `activateMiracle` from Task 6.
- Produces: `registerTechnoMiracleTab() -> void`

- [x] **Step 1: Write the tab registration**

Create `module/technomiracles/tab.js`:

```js
/**
 * The Techno-miracles tab on the character sheet.
 *
 * impmal already hides its Powers tab from anyone with no powers:
 *
 *     _prepareTabs(options) {
 *         let tabs = super._prepareTabs(options);
 *         if (this.actor.itemTypes.power.length == 0) delete tabs.powers;
 *         return tabs;
 *     }
 *
 * So the conditional tab is not a mechanism we invent — it is one we join. Our
 * entry is merged into the sheet class's static PARTS and TABS and the same
 * method is wrapped to drop our tab when the actor carries no miracles.
 *
 * The wrap follows the idiom module/horde/horde-combat.js already uses on
 * impmal's damage code: find whoever owns the method, keep the original, patch
 * once. Injecting the tab into the DOM instead would put it outside the
 * application's own tab groups and leave us reimplementing tab switching.
 */

import { TECHNOMIRACLE_TYPE } from "./model.js";
import { readBlock } from "./resources.js";
import { dropProcess } from "./processes.js";
import { activateMiracle } from "./activate.js";

const MODULE_ID = "apex-imperialis";
const TAB = "technomiracles";
const TEMPLATE = `modules/${MODULE_ID}/templates/actor/technomiracles.hbs`;

let patched = false;

/** The character sheet class impmal registered, or null. */
function characterSheetClass() {
  const registered = CONFIG.Actor.sheetClasses?.character ?? {};
  return Object.values(registered).find(entry => entry?.cls)?.cls ?? null;
}

/** Walk to whoever actually owns _prepareTabs. */
function ownerOfPrepareTabs(cls) {
  let proto = cls?.prototype;
  while (proto && !Object.prototype.hasOwnProperty.call(proto, "_prepareTabs")) {
    proto = Object.getPrototypeOf(proto);
  }
  return proto;
}

export function registerTechnoMiracleTab() {
  if (patched) return;

  const cls = characterSheetClass();
  if (!cls) {
    console.error(`${MODULE_ID} | no impmal character sheet is registered, so the Techno-miracles tab cannot be added.`);
    return;
  }

  const proto = ownerOfPrepareTabs(cls);
  if (!proto) {
    console.error(`${MODULE_ID} | impmal's character sheet no longer defines _prepareTabs; the Techno-miracles tab cannot be added.`);
    return;
  }

  cls.PARTS[TAB] = { scrollable: [""], template: TEMPLATE };
  cls.TABS[TAB] = { id: TAB, group: "primary", label: "NAVIS.Techno.Tab" };

  const original = proto._prepareTabs;
  proto._prepareTabs = function (options) {
    const tabs = original.call(this, options);
    if (this.actor?.itemTypes?.[TECHNOMIRACLE_TYPE]?.length > 0) return tabs;
    delete tabs[TAB];
    return tabs;
  };

  registerTabContext(cls);
  registerTabActions();
  patched = true;
}

/** Feed the template what it needs, on top of whatever impmal already prepares. */
function registerTabContext(cls) {
  const proto = cls.prototype;
  const original = proto._prepareContext;

  proto._prepareContext = async function (options) {
    const context = await original.call(this, options);
    const block = readBlock(this.actor);

    context.techno = {
      cognition: block.cognition,
      energy: block.energy,
      processes: block.processes,
      miracles: this.actor.itemTypes[TECHNOMIRACLE_TYPE] ?? [],
      // 0..1, drives the bar's width and the flow animation's period.
      level: block.cognition.max ? block.cognition.value / block.cognition.max : 0
    };

    return context;
  };
}

/** Clicks inside our tab. Delegated, because the tab re-renders constantly. */
function registerTabActions() {
  Hooks.on("renderActorSheetV2", (app, element) => {
    const host = element.querySelector(`section.tab[data-tab="${TAB}"]`);
    if (!host || host.dataset.navisWired) return;
    host.dataset.navisWired = "1";

    host.addEventListener("click", async event => {
      const activate = event.target.closest("[data-navis-activate]");
      if (activate) {
        const item = app.actor.items.get(activate.dataset.navisActivate);
        if (item) await activateMiracle(app.actor, item);
        return;
      }

      const drop = event.target.closest("[data-navis-drop]");
      if (drop) await dropProcess(app.actor, drop.dataset.navisDrop);
    });
  });
}
```

- [x] **Step 2: Write the tab template**

Create `templates/actor/technomiracles.hbs`:

```hbs
<section class="tab {{tab.cssClass}}" data-group="primary" data-tab="{{tab.id}}">

  <div class="navis-techno-pools">
    <label>{{localize "NAVIS.Techno.CostCognition"}}</label>
    <div class="navis-techno-bar" style="--navis-techno-level: {{techno.level}}">
      <div class="fill" style="width: {{multiply techno.level 100}}%"></div>
    </div>
    <span>{{techno.cognition.value}} / {{techno.cognition.max}}</span>
  </div>

  <div class="navis-techno-pools">
    <label>{{localize "NAVIS.Techno.CostEnergy"}}</label>
    <span>{{techno.energy.value}} / {{techno.energy.max}}</span>
  </div>

  <h3>{{localize "NAVIS.Techno.Processes"}}</h3>
  <ul class="navis-techno-processes">
    {{#each techno.processes}}
      <li>
        <span>{{this.name}}</span>
        <span>{{this.cognition}}</span>
        <a data-navis-drop="{{this.itemId}}"><i class="fa-solid fa-power-off"></i></a>
      </li>
    {{else}}
      <li>{{localize "NAVIS.Techno.NoProcesses"}}</li>
    {{/each}}
  </ul>

  <h3>{{localize "NAVIS.Techno.Miracles"}}</h3>
  <ul class="navis-techno-list">
    {{#each techno.miracles}}
      <li>
        <a data-navis-activate="{{this.id}}"><i class="fa-solid fa-bolt"></i></a>
        <span>{{this.name}}</span>
        <span>{{this.system.school}}</span>
      </li>
    {{/each}}
  </ul>

</section>
```

`multiply` is not a Foundry helper. Register it beside the tab, in `tab.js`, at the top of `registerTechnoMiracleTab()`:

```js
  Handlebars.registerHelper("multiply", (a, b) => Number(a ?? 0) * Number(b ?? 0));
```

- [x] **Step 3: Add the strings**

In `lang/en.json`:

```json
  "NAVIS.Techno.Tab": "Techno-miracles",
  "NAVIS.Techno.Processes": "Processes",
  "NAVIS.Techno.NoProcesses": "Nothing running.",
  "NAVIS.Techno.Miracles": "Miracles",
```

In `src/lang/ru.mjs`, in `OURS`:

```js
  "NAVIS.Techno.Tab": "Техночудеса",
  "NAVIS.Techno.Processes": "Процессы",
  "NAVIS.Techno.NoProcesses": "Ничего не поддерживается.",
  "NAVIS.Techno.Miracles": "Чудеса",
```

- [x] **Step 4: Call the registrar**

In `module/technomiracles/index.js`, import it and call it from `registerTechnoMiracleSheet()`, after the sheet is registered — it needs `CONFIG.Actor.sheetClasses`, which fills at the same time as the item registry:

```js
import { registerTechnoMiracleTab } from "./tab.js";
```

```js
  registerTechnoMiracleTab();
  reportState();
```

- [x] **Step 5: Checkpoint**

Run: `node --test && node tools/build-lang.mjs && node tools/build-skin.mjs`
Expected: all pass.

---


> **Найдено живой проверкой (задача 7).** Не атакующее чудо роняло подготовку
> данных, а с ней и подготовку всего актёра, двумя местами модели оружия:
> `computeBase` читает `config[`${attackType}Specs`][spec]`, а такой таблицы для
> «none» нет; `computeOwned` читает `actor.system.skills["none"].total`.
> Починено: пустая таблица `noneSpecs` в config при регистрации и переопределён
> `computeOwned`, который для не атакующего чуда не зовёт оружейный расчёт
> вовсе. Юнит-тестом это не ловится — ошибка живёт на стыке с системой.

### Task 8: Live verification — ВЫПОЛНЕНО

The spec's acceptance criteria, against the real game. Nothing here ships on the strength of unit tests: the Species cycle was verified this way and it found two failures no offline check could have.

**Files:** none changed.

- [x] **Step 1: Build and launch**

Close Foundry, then run:

`node tools/make-technomiracles.mjs && node tools/check-technomiracles.mjs && node tools/build.mjs && node tools/verify.mjs`

Relaunch the world from Setup, not a browser refresh.

- [x] **Step 2: Build the two fixtures**

In the console. These are fixtures in the world, not pack content:

```js
const actor = await Actor.create({ name: "ТЕХНОЖРЕЦ ПРОБА", type: "character" });

const sustained = await Item.create({
  name: "Проба: Процесс", type: "apex-imperialis.technomiracle",
  system: { cost: { cognition: "1", energy: "0" }, process: { sustains: true, cognition: 1, unique: true },
            types: { doctrine: true }, test: { auto: true } }
}, { parent: actor });

const attacking = await Item.create({
  name: "Проба: Атака", type: "apex-imperialis.technomiracle",
  system: { cost: { cognition: "1", energy: "1" }, test: { auto: false, modifier: 0 },
            attackType: "ranged", penetration: 2, damage: { base: "5", characteristic: "int" } }
}, { parent: actor });

console.log(actor.itemTypes["apex-imperialis.technomiracle"].length);
```

Expected: `2`.

- [x] **Step 3: Run the acceptance checks**

1. **The tab appears.** Open the actor before creating the items: no Techno-miracles tab. After creating them, reopen: the tab is there, beside Psychic Powers.
2. **The tab disappears.** Delete both items, reopen: the tab is gone. Re-create them for the rest of the checks.
3. **Capacity seeds.** The tab shows Cognition and Charge at the actor's Intelligence and Toughness bonuses.
4. **Cognition is spent on failure.** Activate "Проба: Атака" and fail the roll deliberately. Cognition drops by 1; Charge does not move. The chat card says the computation was spent regardless.
5. **Charge is spent only on success.** Activate it again and succeed. Charge drops by 1, and the attack dialog opens through impmal's own weapon test with penetration 2 applied.
6. **The Process sustains.** Activate "Проба: Процесс". It appears in the Processes list.
7. **Upkeep bills at turn start.** Put the actor in a combat and advance to its turn. Cognition first rises by half the Intelligence bonus, then falls by 1 for the running Process.
8. **Shortfall stops.** Set Cognition to 0, advance the turn again: a permanent warning says how short the priest is, and nothing is deducted.
9. **Doctrine replaces.** Create a second miracle tagged `doctrine` and activate it: a dialog offers to replace the first, and accepting drops it from the list.
10. **The bar tracks.** The Cognition bar's fill follows the value as it is spent and restored.
11. **The skin off.** Turn off the skin in client settings: the tab is still a readable list of numbers and buttons.

- [x] **Step 4: Record what failed**

Any check that fails goes back to the task that owns it. Do not patch around a failure in a later file than the one that caused it.

- [x] **Step 5: Clean up and checkpoint**

`await actor.delete();`

Run: `node --test && node tools/check-technomiracles.mjs && node tools/build.mjs && node tools/verify.mjs && node tools/check-content.mjs && node tools/build-lang.mjs && node tools/build-skin.mjs`
Expected: all pass. Cycle A is done, and the pack is ready for content.


---

## Цикл A завершён

Все восемь задач выполнены и проверены в работающей игре. Одиннадцать приёмочных
проверок из задачи 8 пройдены: вкладка появляется и исчезает, ёмкость сеется из
бонусов, Когниция тратится до броска и остаётся потраченной при провале, Заряд
списывается только при успехе, Процесс поддерживается, счёт в начале хода идёт
после восстановления, нехватка ничего не списывает и предупреждает, Доктрина
заменяется с подтверждением, полоса следит за значением, с выключенным скином
всё читается.

Атака разрешается родным `WeaponTest` impmal: в живой проверке она прошла через
диалог «Проверка: Стрельба», выбрала область попадания и отработала встречную
проверку.

Что осталось на следующий цикл: содержимое — примерно 160 чудес четырёх школ,
плюс черты `arc`, `extreme`, `linger`, `smoke` и `rad`, которые приходят вместе
с теми чудесами, которым они нужны.
