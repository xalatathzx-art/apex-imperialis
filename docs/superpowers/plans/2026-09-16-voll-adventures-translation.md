# Voll Adventures Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete Russian Babele translation for every translatable document in `impmal-voll`, using the established Imperium Maledictum terminology of Apex Imperialis.

**Architecture:** Keep the paid source module untouched. Read copied LevelDB packs into a reproducible source index, translate and edit every passage manually under `src/compendium`, and compile Babele JSON with the existing guarded builder. Preserve document IDs, HTML structure, Foundry UUIDs, inline rolls, active-effect scripts, and automation syntax exactly. Machine translation services and local translation engines are forbidden.

**Tech Stack:** Node.js ES modules, Foundry VTT LevelDB packs, Babele translation JSON, `node:test`.

**Spec:** The installed `impmal-voll` module plus `docs/rules/ru-glossary.md` and `docs/rules/ru-terms.json`.

## Global Constraints

- Do not modify or redistribute the original `impmal-voll` packs.
- Translate all 46 actors, 2 items, 7 journals with 48 embedded pages, 10 roll tables with 78 rows, and the single scene where it contains user-facing text.
- Preserve every document and embedded-document ID.
- Preserve HTML tags, UUID targets, inline rolls, rewards, formulas, scripts, and automation markup.
- Prefer the Russian Core Rulebook v1.01 terminology already captured by Apex Imperialis.
- Build must fail on missing IDs, stale English source names, untranslated required entries, or damaged protected markup.

---

### Task 1: Index and coverage contract

**Files:**
- Modify: `tools/dump-installed-pack.mjs`
- Modify: `src/compendium/packs-index.json`
- Create: `tests/voll-translation.test.mjs`

- [ ] Generalise the installed-pack dumper for `impmal-voll`, including scenes and embedded journal/table documents.
- [ ] Add exact source metadata for all five Voll collections.
- [ ] Add a failing test that requires exact top-level and embedded ID coverage and protected-markup parity.
- [ ] Run the Voll test and confirm it fails because translation sources do not yet exist.

### Task 2: Interface, items, actors, and scene

**Files:**
- Modify: `src/lang/ru.mjs`
- Create: `src/compendium/impmal-voll.items.mjs`
- Create: `src/compendium/impmal-voll.actors.*.mjs`
- Create: `src/compendium/impmal-voll.scenes.mjs`

- [ ] Translate the module language key and both standalone items.
- [ ] Reuse already translated core and Inquisition embedded items by stable English name and type.
- [ ] Translate every actor name, species, role, notes, and Voll-only embedded item.
- [ ] Translate scene and embedded user-facing labels without touching coordinates or links.
- [ ] Build and run the Voll coverage test.

### Task 3: Roll tables

**Files:**
- Create: `src/compendium/impmal-voll.tables.*.mjs`

- [ ] Translate all ten table names and all 78 result texts.
- [ ] Preserve ranges, weights, referenced document IDs, UUID targets, dice formulas, and HTML.
- [ ] Build and run table coverage and protected-markup checks.

### Task 4: Journal framework and setting material

**Files:**
- Create: `src/compendium/impmal-voll.journals-setting.*.mjs`

- [ ] Translate the Voll overview, appendix, and shared setting/reference pages.
- [ ] Preserve page order, heading anchors, images, UUIDs, and journal CSS classes.
- [ ] Build and run journal structure checks.

### Task 5: Adventure journals

**Files:**
- Create: `src/compendium/impmal-voll.journals-eye-of-voll.*.mjs`
- Create: `src/compendium/impmal-voll.journals-illicit-fabrications.*.mjs`
- Create: `src/compendium/impmal-voll.journals-interminable-devotion.*.mjs`
- Create: `src/compendium/impmal-voll.journals-paradigm-shift.*.mjs`
- Create: `src/compendium/impmal-voll.journals-implacable.*.mjs`

- [ ] Translate every remaining journal page in page order.
- [ ] Post-edit rules, tests, dialogue, names, lore terms, and cross-page references against the project glossary.
- [ ] Build after each adventure and run exact page/markup coverage checks.

### Task 6: Final audit and build

**Files:**
- Modify: `module.json`
- Modify: `README.md`
- Modify: `docs/CREDITS.md`

- [ ] Declare the optional `impmal-voll` relationship and document translated coverage.
- [ ] Scan generated output for surviving English prose and invalid placeholders.
- [ ] Run the full build and every test.
- [ ] Compare generated translation IDs to the copied source packs and confirm complete coverage.
