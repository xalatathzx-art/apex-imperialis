# Apex Imperialis Module Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate the adjacent Imperium Maledictum content modules into `apex-imperialis` while preserving pack UUIDs, Babele translations, assets, and Foundry loading behavior.

**Architecture:** Treat `apex-imperialis` as the sole distributable module. Copy each source module's packs/assets into namespaced locations where collisions exist, merge manifests and translation registration explicitly, and keep the original modules untouched as rollback copies until runtime verification succeeds.

**Tech Stack:** Foundry VTT module manifests, LevelDB compendium packs, JavaScript ES modules, Babele JSON translation packs, PowerShell copy/inspection, Node build scripts.

**Spec:** Approved consolidation design in chat on 2026-09-17.

## Global Constraints

- Preserve every existing document `_id` and UUID.
- Do not delete or overwrite the source modules during the first pass.
- Do not merge duplicate pack names without recording the collision and choosing a deterministic namespace.
- Rebuild Babele output only after source pack inventories and manifest registrations are updated.
- Verify module parsing, compendium inventory, UUID references, and translation tests before declaring success.

---

### Task 1: Inventory and collision report

**Files:**
- Read: `impmal-core/module.json`, `impmal-inquisition/module.json`, `impmal-requisition/module.json`, `impmal-voll/module.json`, `impmal-malexp/module.json`, `apex-imperialis/module.json`
- Create: `docs/superpowers/plans/module-consolidation-inventory.json`

- [ ] Enumerate every pack, asset root, script, style, and translation file in the six modules.
- [ ] Record duplicate pack names, duplicate module hooks, and dependency declarations.
- [ ] Stop before copying if two packs would resolve to the same Foundry collection without an explicit namespace.

### Task 2: Copy immutable content with namespaces

**Files:**
- Create/modify: `apex-imperialis/packs/**`, `apex-imperialis/assets/**`, `apex-imperialis/content/**`

- [ ] Copy pack directories byte-for-byte, excluding lock files and temporary LevelDB files that are not part of a distributable pack.
- [ ] Use collection names based on the original package id when collisions occur.
- [ ] Preserve pack documents and all `_id` values; do not rewrite UUIDs.
- [ ] Keep source module directories untouched until verification passes.

### Task 3: Merge manifest and runtime registration

**Files:**
- Modify: `apex-imperialis/module.json`
- Modify/create: `apex-imperialis/module/*.js`, `apex-imperialis/scripts/*.js`, `apex-imperialis/styles/*.css`

- [ ] Merge pack declarations into one manifest with unique collection names.
- [ ] Merge compatible hooks and imports without duplicate registration.
- [ ] Preserve Babele registration for every consolidated translation directory.
- [ ] Keep module-specific runtime code namespaced to avoid global collisions.

### Task 4: Translation and source index migration

**Files:**
- Modify: `apex-imperialis/src/compendium/packs-index.json`
- Modify: `apex-imperialis/src/compendium/*.mjs`
- Modify: `apex-imperialis/tools/build-compendium-lang.mjs`

- [ ] Add the consolidated packs to the source index with original package/collection identities.
- [ ] Ensure existing Russian translations continue to resolve by original document ID.
- [ ] Rebuild `compendium/*.json` and fail on missing IDs, renamed documents, or duplicate collection output.

### Task 5: Verification and rollback checkpoint

**Files:**
- Test: `apex-imperialis/tests/**`
- Read-only compare: all source module pack inventories

- [ ] Parse the merged manifest and validate every declared pack path exists.
- [ ] Compare source and merged inventories: document counts, IDs, and UUID references.
- [ ] Run `node tools/build-compendium-lang.mjs`, existing translation tests, and `git diff --check`.
- [ ] Only after all checks pass, report the consolidation complete; otherwise retain the source modules and the inventory report for rollback.
