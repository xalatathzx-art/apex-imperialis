# Environment Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scene-bound, automated weather, temperature, gravity, radiation, and atmosphere rules to Apex Imperialis.

**Architecture:** Pure functions normalize data and calculate exposure independently of Foundry. A thin Foundry adapter stores Scene and Actor flags, schedules tests from world/combat time, and renders an ApplicationV2 editor plus compact HUD widget.

**Tech Stack:** ES modules, Foundry VTT 13 API, Imperium Maledictum 3.1+, Node built-in test runner, Handlebars, CSS.

**Spec:** `docs/superpowers/specs/2026-09-15-environment-biomonitor-design.md`

## Global Constraints

- Temporary environment modifiers are computed, never persisted as Active Effects.
- Lasting consequences use native impmal Actor methods and are applied only by the active GM.
- Every registration and render operation is idempotent.
- The module directory is not a Git repository, so commit steps are inapplicable.

---

### Task 1: Pure environment model and rules

**Files:**
- Create: `module/environment/environment-data.js`
- Create: `module/environment/environment-rules.js`
- Create: `tests/environment-rules.test.mjs`

**Interfaces:**
- Produces: `normaliseEnvironment(value)`, `environmentForScene(scene)`, `actorProtection(actor)`, `temperatureBand(celsius)`, `radiationBand(intensity)`, `effectiveEnvironment(environment, protection)`, `weatherModifiers(environment, context)`, `dueExposureHazards(environment, protection, clocks)`.

- [ ] **Step 1: Write failing boundary tests** for normalization, all temperature/radiation bands, protection, weather modifiers, and due intervals using `node:test` assertions.
- [ ] **Step 2: Run `node --test tests/environment-rules.test.mjs`** and confirm missing-module failure.
- [ ] **Step 3: Implement the exported pure functions** with the exact tables and closed weather-effect vocabulary from the spec.
- [ ] **Step 4: Re-run the test file** and require zero failures.

### Task 2: Scene editor and compact widget

**Files:**
- Create: `module/environment/environment-app.js`
- Create: `module/environment/environment-widget.js`
- Create: `templates/apps/environment.hbs`
- Create: `src/skin/79-environment.css`
- Modify: `tools/build-skin.mjs`

**Interfaces:**
- Consumes: `normaliseEnvironment`, `environmentForScene`.
- Produces: `EnvironmentApp`, `registerEnvironmentWidget()`, `refreshEnvironmentUI()`.

- [ ] **Step 1: Add a failing static contract test** verifying the editor exports an ApplicationV2 class and the widget owns one stable DOM id.
- [ ] **Step 2: Run the test and confirm failure.**
- [ ] **Step 3: Implement GM scene-control launch, immediate Scene flag save, read-only widget, collapse preference, and Navis-scoped CSS.**
- [ ] **Step 4: Rebuild CSS with `node tools/build-skin.mjs` and re-run tests.**

### Task 3: Scheduling and impmal integration

**Files:**
- Create: `module/environment/environment-tests.js`
- Create: `module/environment/environment-derived.js`
- Create: `module/environment/index.js`
- Create: `tests/environment-scheduler.test.mjs`
- Modify: `module/apex-imperialis.js`

**Interfaces:**
- Consumes: pure rule outputs and actor/system APIs.
- Produces: `registerEnvironment()`, `resolveDueExposures()`, `environmentTestModifiers()`, and `environmentSnapshot(actor)`.

- [ ] **Step 1: Write failing tests** for active-GM election, one catch-up test, unique clock keys, and modifier deduplication.
- [ ] **Step 2: Run tests and confirm expected failures.**
- [ ] **Step 3: Implement hooks** for scene/world-time/combat changes, native Fortitude tests, conditions/damage/chat consequences, and local test modifiers.
- [ ] **Step 4: Run all environment tests and skin build.**

