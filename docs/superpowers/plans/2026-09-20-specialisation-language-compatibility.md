# Specialisation language compatibility

## Scope

Fix the Navis-to-Imperium Maledictum boundary where the system compares
specialisation labels as English strings while the Russian module stores the
same owned item under its Russian name.  This includes weapon attacks, the
system's Dodge action, and Navis' quick-specialisation catalogue.

## Design

1. Use the core translation source as the single English/Russian alias table.
2. Resolve an owned specialisation by its stable skill key plus either label;
   prefer the exact label when it exists.
3. Wrap the system's skill-test entry point so hard-coded English calls (such
   as `Dodge`) receive the owned item id.
4. Wrap the weapon model's `getSkill` so the stable weapon `spec` key resolves
   an owned Russian specialisation even in an English browser client.
5. Deduplicate aliases in Navis' catalogue and display the Russian label in a
   Russian client without renaming actor data.

## Verification

- Add focused Node tests for English/Russian aliases, catalogue deduplication,
  and rolling an owned translated item.
- Run the specialisation test file and the full test suite.
- Reload Foundry and inspect John "Kot": a pistol must resolve to the owned
  "Пистолеты" item and Dodge to "Уклонение" (68), even while the test browser
  uses English.
