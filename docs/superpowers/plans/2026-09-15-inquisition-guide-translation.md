# Inquisition Guide Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a complete Russian Babele overlay for `impmal-inquisition` 3.0.1.

**Architecture:** Read immutable copies of the four official LevelDB packs, refresh the checked source index, and author small ES-module translation slices merged by the existing builder. Translation never writes into the paid module.

**Tech Stack:** Node.js ES modules, classic-level, Babele, Foundry VTT 13, `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-15-inquisition-guide-translation-design.md`

## Global Constraints

- Russian core rulebook v1.01 and `docs/rules/ru-glossary.md` control terminology.
- Preserve ids, HTML, anchors, formulas, scripts and UUID targets.
- Original `impmal-inquisition` packs remain untouched.
- Generated files are never edited by hand.

---

### Task 1: Complete source inventory and validation

**Files:**
- Create: `tools/dump-installed-pack.mjs`
- Modify: `src/compendium/packs-index.json`
- Create: `tests/inquisition-translation.test.mjs`

**Interfaces:**
- Produces: complete index entries containing names, visible fields, embedded documents, pages and table rows.

- [x] Write a failing test asserting all four collections and counts 46/227/17/41.
- [x] Run `node --test tests/inquisition-translation.test.mjs` and observe the missing inventory API failure.
- [x] Implement a read-only LevelDB dump that accepts a copied pack root and emits the builder's existing index shape.
- [x] Refresh the four index collections and run the test to green.

### Task 2: Interface strings and pack labels

**Files:**
- Modify: `src/lang/ru.mjs`
- Modify: `module.json`
- Generated: `lang/ru.json`, `lang/ru-terms.mjs`

**Interfaces:**
- Produces: Russian `IMPMAL.Inquisition` keys and Russian pack labels.

- [x] Add a coverage assertion for every key in `impmal-inquisition/lang/en.json`.
- [x] Translate every visible interface string using established terms.
- [x] Run `node tools/build-lang.mjs` and the focused test.

### Task 3: Items

**Files:**
- Create: focused `src/compendium/impmal-inquisition.items.*.mjs` slices by item family.
- Generated: `compendium/impmal-inquisition.items.json`

**Interfaces:**
- Each source exports `{label, entries}` keyed by official item id with adjacent `en` source name.

- [ ] Add a failing assertion requiring all 227 item ids and visible fields.
- [ ] Translate names, descriptions, requirements and player-facing notes by family.
- [ ] Run `node tools/build-compendium-lang.mjs` after every slice.
- [ ] Resolve every new glossary conflict before continuing.

### Task 4: Actors

**Files:**
- Create: focused `src/compendium/impmal-inquisition.actors.*.mjs` slices.
- Generated: `compendium/impmal-inquisition.actors.json`

**Interfaces:**
- Actor entries translate the actor and only local embedded content; sourced items inherit Task 3.

- [ ] Add a failing assertion requiring all 46 actors and all local embedded names/descriptions.
- [ ] Translate actors by faction while preserving source-linked embedded items.
- [ ] Build and verify no name-driven script loses its English fallback.

### Task 5: Tables

**Files:**
- Create: focused `src/compendium/impmal-inquisition.tables.*.mjs` slices.
- Generated: `compendium/impmal-inquisition.tables.json`

**Interfaces:**
- Table `results` are keyed by result id; linked names are reconciled by the builder.

- [ ] Add a failing assertion requiring 41 translated table names and every visible row.
- [ ] Translate prose rows and retain ranges, ids and document links.
- [ ] Build and verify result counts and linked labels.

### Task 6: Journals

**Files:**
- Create: one or more `src/compendium/impmal-inquisition.journals.<chapter>.mjs` files per journal.
- Generated: `compendium/impmal-inquisition.journals.json`

**Interfaces:**
- Journal entries expose `pages` in official order with page id, English name, Russian name and translated `text.content`.

- [ ] Add a failing assertion requiring all 17 journals and 137 embedded pages.
- [ ] Translate page headings and HTML content chapter by chapter.
- [ ] Preserve every tag, anchor, inline roll and `@UUID[...]` target.
- [ ] Build after every journal and compare structural signatures.

### Task 7: Final audit

**Files:**
- Modify: `docs/rules/ru-glossary.md` only for newly settled recurring terms.
- Modify: `README.md` with final coverage.

**Interfaces:**
- Produces: reproducible coverage report for all four packs.

- [ ] Run `node tools/build-glossary.mjs` and resolve all conflicts.
- [ ] Run `node tools/build-lang.mjs`, `node tools/build-compendium-lang.mjs`, and `node --test tests/*.test.mjs`.
- [ ] Scan visible translated fields for English leakage while excluding formulas, proper identifiers and URLs.
- [ ] Load the four packs through Babele in Foundry and inspect console errors and representative documents.
