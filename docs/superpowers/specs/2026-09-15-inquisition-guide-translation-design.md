# Inquisition Guide Russian translation

## Goal

Translate the installed `impmal-inquisition` 3.0.1 module through Navis
Apexialis without modifying Cubicle 7's packs. The Russian core rulebook v1.01
and `docs/rules/ru-glossary.md` control terminology; existing settled names in
`docs/rules/ru-terms.json` control repeated content.

## Delivery

The translation is a Babele overlay built from reviewable ES modules under
`src/compendium/`. Separate source slices cover interface strings, items,
actors, tables and journals. Generated JSON goes to `compendium/`; original
paid content remains untouched.

## Fidelity rules

- Preserve document ids, embedded ids, HTML structure, anchors, rolls and UUIDs.
- Translate visible prose and labels, never paths, keys, formulas or scripts.
- Use the printed Russian IM terminology; mark only genuinely new terms as ours.
- Reuse an existing glossary translation before inventing another wording.
- Preserve `flags.babele.originalName` compatibility for name-driven scripts.
- Translate table-result labels consistently with their target documents.

## Work cycles

1. Refresh a complete pack index from read-only pack copies and add coverage
   reporting for the four Inquisition Guide packs.
2. Translate the module interface and pack labels.
3. Translate all 227 items, including descriptions and requirements.
4. Translate all 46 actors and their genuinely actor-local embedded content.
5. Translate all 41 tables and reconcile linked result names.
6. Translate all 17 journals page by page, retaining HTML and UUID targets.
7. Build, validate coverage and search for leaked English in visible fields.

## Verification

The build must reject missing ids, stale English source names, broken UUID
targets, duplicate translations and unresolved glossary conflicts. Completion
requires every visible translatable field in all four packs to be covered, all
automated tests to pass, and the Babele output to load without browser errors.
