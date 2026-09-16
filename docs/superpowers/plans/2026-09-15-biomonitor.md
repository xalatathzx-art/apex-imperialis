# Character Biomonitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a detailed, always-available character biomonitor below Influence using native impmal health data and the environment engine.

**Architecture:** A pure view-model maps actor documents into six body zones and summary readings. A sheet adapter inserts idempotent markup into the existing character Main tab and wires native document/dose actions without replacing the system template.

**Tech Stack:** ES modules, Foundry VTT 13 ActorSheetV2 hooks, Imperium Maledictum documents, DOM, CSS, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-15-environment-biomonitor-design.md`

## Global Constraints

- Do not duplicate Wounds, Critical Wounds, injuries, conditions, armour, or augmetics.
- Never infer augmetic placement from its name.
- Insert once, immediately after the Influence block, and preserve sheet behavior with skin disabled.
- The module directory is not a Git repository, so commit steps are inapplicable.

---

### Task 1: Biomonitor view model

**Files:**
- Create: `module/biomonitor/biomonitor-body.js`
- Create: `module/biomonitor/biomonitor-data.js`
- Create: `tests/biomonitor.test.mjs`

**Interfaces:**
- Produces: `BODY_ZONES`, `augmeticLocation(item)`, `buildBiomonitorModel(actor, snapshot)`.

- [ ] **Step 1: Write failing tests** for location priority, six zones, status thresholds, native-document references, and environment readings.
- [ ] **Step 2: Run tests and confirm missing-module failure.**
- [ ] **Step 3: Implement the pure mapping and safe fallbacks.**
- [ ] **Step 4: Re-run tests and require zero failures.**

### Task 2: Character sheet UI and controls

**Files:**
- Create: `module/biomonitor/biomonitor-sheet.js`
- Create: `module/biomonitor/index.js`
- Create: `src/skin/80-biomonitor.css`
- Modify: `tools/build-skin.mjs`
- Modify: `module/skin.js`
- Modify: `lang/en.json`
- Modify: `lang/ru.json`

**Interfaces:**
- Consumes: `buildBiomonitorModel`, `environmentSnapshot`.
- Produces: `registerBiomonitor()`, `renderBiomonitor(sheet, root, actor)`.

- [ ] **Step 1: Add failing contract tests** for stable root id, six zone controls, collapsed summary, dose controls, and localization keys.
- [ ] **Step 2: Run tests and confirm failure.**
- [ ] **Step 3: Implement DOM rendering** below Influence, expanded panels, filtering, document opening, permission-aware dose adjustment with reason and chat log, and reduced-motion behavior.
- [ ] **Step 4: Build the skin and run all tests.**

### Task 3: Full verification

**Files:**
- Modify only files required by failures discovered in verification.

- [ ] **Step 1: Run `node --test tests/*.test.mjs`.**
- [ ] **Step 2: Run `node tools/build-skin.mjs`.**
- [ ] **Step 3: Run syntax checks over every new module with `node --check`.**
- [ ] **Step 4: Inspect the generated stylesheet and module entry registrations for duplicate hooks or ungated rules.**
