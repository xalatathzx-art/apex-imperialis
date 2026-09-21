# SDD ledger — plan: docs/superpowers/plans/2026-09-16-implants.md

Spec: `docs/superpowers/specs/2026-09-16-implants-design.md` (read, reachable).
Branch: `implants-cycle-a`, cut from `bf85975` on `main`.

## Setup

**Ruling: branch in place, no git worktree — cost if wrong: the working tree is
shared with the running game, so a bad commit is visible to Foundry immediately.**
Tasks 6, 9 and 11 are verified by launching the live world, and Foundry only
loads a module from `Data/modules/apex-imperialis`. A worktree elsewhere would
not be loaded at all, making those verification steps impossible. A branch gives
the isolation that matters (main is untouched, revert is one command) at the only
path Foundry will read.

## Pre-flight conflict scan

Every pair of tasks sharing a file or an interface, and every task against itself.

| Tasks | Produces → Consumes | Finding |
|---|---|---|
| 1 → 6, 9, 13 | `classify.js`: `SLOTS`, `classifyImplant`, `locationForSlot` | clean — T6 uses `SLOTS` for schema choices, T9 for the slot select, T13 for generator defaults |
| 2 → 3, 4, 7, 12 | `rules.js`: `capState`, `resolveQualityValue`, `QUALITY_LEVELS` | clean — all four consume only what T2 exports |
| 3 → 8, 11, 12 | `state.js`: `IMPLANT_TYPE`, `isImplantActive`, `isImplantFitted`, `implantsOf`, `actorCapState` | **F1** — T8 changes `actorCapState`'s signature |
| 4 → 5 | `targets.js`: `entryToChange`, `LIVE_KINDS` | clean |
| 5 → 8, 10 | `entries.js`: `changesFor`, `resolveEntries`, `pendingChoices`, `liveEntries` | **F2** — `liveEntries` is exported and tested but consumed by nobody |
| 6 → 9 | `index.js` imports `defineImplantSheet` from `./sheet.js` | **F3** — T6 imports a file T9 creates |
| 7 → 8 | `test-mods.js`: `testModScript`, `CAP_PENALTY_SCRIPT`, `talentBonuses` | clean |
| 8 → 11 | `apply.js` hooks react to `system.active`; T11 writes it | clean — coupling is through the document, not an import |
| 10 → 11 | `surgery.js`: `fitImplant`, `extractImplant` | clean |
| 12 → existing | `technomiracles/resources.js`: adds `energyCapacity`, rewrites header | clean — T12 owns the file outright |
| 13 → 14 | `make-implants.mjs`: `SECTIONS`, folder table | clean — T14 extends both |
| 13 → 7 | `check-implants.mjs` asserts `TALENT_NAMES` resolve in the talent pack | clean |

Self-consistency, per task: 1, 2, 3, 4, 5, 7, 10, 12 each specify tests that
exercise exactly the exports they specify — checked export by export against the
assertions. 6, 9, 11 specify no tests and say so (Foundry wiring, live checks
listed). 13, 14 specify audits rather than tests, also stated. Test counts in the
checkpoints add up: 9+13+8+12+10 = 52 at T5, 8+13 = 21 at T8.

Plan assumption verified before dispatch: T6 Step 4 says to extend an existing
`Hooks.once("ready")` block calling `registerSpeciesSheet` — it exists at
`module/apex-imperialis.js:85-89`.

### Rulings on the scan

**Ruling F1 (`actorCapState` signature): plan stands, no change — cost if wrong:
nothing, the change is additive.** T8 Step 1 already calls out the widening and
requires re-running T3's test to prove the one-argument call still works. The
defaults make it source-compatible. This is a planned migration, not a conflict.

**Ruling F2 (`liveEntries` dead export): keep it, no change — cost if wrong: one
unused export and three assertions carried until cycle B.** It became unused when
I rewrote T7/T8 to build scripts from `resolveEntries` directly. Deleting it would
mean editing T5's specified test, and the `script` entry kind — already recognised
in `LIVE_KINDS` — needs exactly this function when it is implemented. An unused
export with a passing test is cheaper than a plan edit plus a re-add later.

**Ruling F3 (T6 imports T9's file): T6 creates a stub `sheet.js` — cost if wrong:
one throwaway file, ~10 lines, replaced wholesale in T9.** As written, T6 leaves
the module unloadable until T9 lands, which would break T6's own live checkpoint
("confirm Имплант appears in the type list") and everything between. T6's
implementer must create `module/implants/sheet.js` exporting
`defineImplantSheet()` that returns the base augmetic sheet class unmodified — so
the type registers and opens with impmal's stock sheet — and T9 replaces it. This
ruling is carried into the T6 dispatch.

## Progress

Task 1: complete (commits bf85975..f7ca8fe, review clean — spec ✅, quality approved)
Task 1: minor (deferred): classify.js cortex regex `мозж` matches "мозжечок" but not "мозг"/"мозговой" — latent, no current name hits it
Task 1: minor (deferred): classify.js respiratory regex bare `легк` also matches "лёгкий" (lightweight) — false-positive risk for future content
  → both are content-authoring risks: carry a pointer into the Task 13 and Task 14 dispatches
Task 2: complete (commits f7ca8fe..7d4e959, review clean — spec ✅, quality approved)
  Reviewer note (not a finding): resolveQualityValue does not clamp negative resolved values.
  Intended — Task 12's energyCapacity clamps at the pool level (Math.max(0, base + added)),
  and a negative per-level value is a legitimate book effect (a worse implant at level 1).
Task 3: complete (commits 7d4e959..b23d9c9, review clean — spec ✅, quality approved)
  Verified independently: pass 9 (classify) + 13 (rules) + 8 (state) = 30, matching the plan.
  The implementer's report attributes these 14/8/8 — a prose miscount, total correct.
  Reviewer flagged an undeclared .gitignore change in the commit: that entry (.superpowers/)
  is MINE, added during setup, swept into their commit. Not implementer scope creep.

Task 4: review found Critical — `energy` routed through an Active Effect at a flag path.
**Ruling: the finding is right and the plan is wrong; `energy` joins the no-path kinds —
cost if wrong: none, and it REMOVES a double-count risk.**
The spec (Task 12 section) already states Заряд "lives in a flag, which an Active Effect
cannot reach — so this is recomputed by state.js when an implant's gate flips, not by the
effects pipeline", and `module/technomiracles/resources.js:6-8` records the same finding
from an earlier cycle. The spec is the binding authority and Task 4's brief contradicts it.
Worse than a no-op: if effects COULD reach the flag, `energy` would apply twice — once via
the effect, once via Task 12's energyCapacity — which is exactly the failure the plan's own
preamble cites from the reference system (wdbc-cy2, "the same bonus living in two places
doubled itself"). Entering fix round 1.
Task 4: fix round 1/5 (1 addressed, 0 open — energy no longer produces an Active Effect change; commits 7558ea2..8b3e6bd)
Task 4: complete (commits b23d9c9..8b3e6bd, re-review clean)
  Plan patched to match the ruling, so a re-run of Task 4 cannot reintroduce the defect.
Task 5: complete (commits 8b3e6bd..068bd6a, review clean — spec ✅, quality approved)
  Verified independently: all five implant test files together = pass 52, fail 0,
  matching the plan's projected count exactly.

**Ruling: the live-world checkpoints of Tasks 6, 9 and 11 are batched into one
verification pass after Task 11 — cost if wrong: a wiring defect in Task 6 is not
caught until three tasks later, making it harder to localise.**
Each of those checkpoints needs a running Foundry, and a change to module.json only
reaches a world at relaunch from Setup (recorded from an earlier cycle). Relaunching
the game between every task would serialise the whole plan behind manual restarts.
Mitigation, required of each implementer instead: static verification — every new
module resolves under `node --input-type=module`, every import path exists, and the
registration call sites are present in the entry point. That catches the import and
typo class of defect, which is most of what the live check would have caught at this
stage.
Task 6: complete (commits 068bd6a..3937078, review clean — spec ✅, quality approved)
  Static verification only, per the batching ruling above. Reviewer independently reproduced it.
Task 6: minor (deferred): registerImplantSheet does not guard on the data model being
  registered first, unlike registerSpeciesSheet and registerTechnoMiracleSheet
Task 6: minor (deferred): reportImplantState only console.warn()s; the sibling modules also
  raise a permanent ui.notifications.error so a GM sees the failure without opening the console
  → both originate in my brief, not implementer deviation. Both are worth doing before merge;
    surface them to the final whole-branch review for triage.
Also committed separately: 3b68e3e, my own correction of the plan and spec after the Task 4 ruling.

Task 7: review reported two Criticals. I verified both against the system source. One holds, one does not.

**Ruling A (advantage/disadvantage): finding upheld, fix required — cost if wrong: none,
this moves toward what the system itself does.**
`args.fields.advantage = true` ASSIGNS where impmal accumulates. impmal.js:90-107 makes
`advantage` a getter/setter over `fields.advantage`, and computeState (impmal.js:156-168)
compares the two counters numerically and computes excess as `(advantage - 1) - disadvantage`.
Every shipped impmal script uses `args.advantage++` / `args.disadvantage++` — 9 occurrences,
and `args.fields.advantage` appears ZERO times in the whole system. Assignment destroys any
advantage another source already contributed. Real bug, and CAP_PENALTY_SCRIPT has it too.

**Ruling B (args.skill): finding REJECTED — cost if wrong: skill-scoped test modifiers
silently never fire, which is the exact failure the reviewer described.**
The reviewer claimed `args.skill` is always undefined and only `args.data.skill` exists. That
is wrong: `SkillTestDialog` defines `get skill() { return this.data.skill; }` at impmal.js:338,
and impmal's own shipped effect script `09rrVrIIqAf1ZTEZ` reads `args.skill` directly. Both
spellings work on a skill test. `args.skill` also degrades correctly on a characteristic or
weapon dialog, where it is undefined and a skill-scoped guard should not fire anyway. Keeping
`args.skill`. Recorded with evidence so this is not re-litigated later.

Minor accepted alongside Ruling A: interpolate the skill key with JSON.stringify — one line,
removes the quote/backslash injection class outright.
Task 7: fix round 1/5 (2 addressed, 0 open — counters not flags; skill key JSON.stringify'd;
  guard correctly still reads args.skill, no regression; commits 69153c8..e5afca9)
Task 7: complete (commits 3b68e3e..e5afca9, re-review clean)
  Plan and spec corrected in the same commit (my edits, swept in by the implementer).
Task 8: complete (commits e5afca9..a028e25, review clean — spec ✅, quality approved)
  Resolved the reviewer's "cannot verify from diff" item myself: impmal uses CORE Foundry
  `changes` with {key, value, mode: 2} — grep of impmal.js finds zero uses of `system.changes`
  and several of `changes : [{key: ..., mode: 2}]`. This mattered because the reference system
  warhammer-dbc writes `system.changes` with type/phase instead; our {key, mode, value, priority}
  is right for impmal. No gap.
Task 8: minor (deferred): apply.js imports `implantsOf` and never uses it
Task 8: minor (deferred): the createItem/updateItem hooks chain
  `syncImplantMechanics(item).then(() => syncCapPenalty(item.parent))` with no .catch — a
  rejection is unhandled AND silently skips the cap-penalty sync. Invisible failure mode;
  SHOULD FIX before merge, flag to the final review as the highest-priority deferred minor.

Task 9: review — spec ✅, one Important (unserialized read-modify-write), six Minors.
**Ruling: the advantage-select ordering Minor is folded into the fix round — cost if wrong:
one extra trivial edit in a round already being dispatched.**
The reviewer graded it Minor as cosmetic, but the brief specified the order "Преимущество / — /
Помеха" explicitly, and JS integer-key ordering renders it "— / Преимущество / Помеха". An
unmet stated requirement is a spec item, not a preference. The other five Minors stay deferred.
Task 9: ⚠️ carried to the batched live pass: impmal's flat `static TABS` record is not core
  v13's `{group:{tabs:[]}}` shape; the module copies impmal's shape exactly, so it should behave
  identically, but WHICH of the five tabs opens first is only observable in a running world.
Task 9: minor (deferred): mechanics inputs have no name/id, so Foundry cannot restore focus —
  every mechanics edit drops focus to <body>. Most user-visible of the deferred set.
Task 9: minor (deferred): locationTouched lives on the sheet instance, so reopening the sheet
  re-arms the auto-overwrite of a hand-set location
Task 9: minor (deferred): auto-filled system.location is written after super._prepareSubmitData
  and so skips that call's document.validate()
Task 9: minor (deferred): system.category is free text but classifyImplant looks it up in a
  fixed table — a typo silently falls through to name matching
Task 9: minor (deferred): HIT_LOCATIONS lives in mechanics/constructor.js but is a placement
  concept; classify.js is its natural home
Task 9: minor (deferred): groups/entries authored before this task carry no id and become inert;
  no migration exists. Zero real data affected today — nothing has authored mechanics yet.
Task 9: fix round 1/5 (2 addressed, 0 open — writes serialized through a per-sheet promise
  chain that survives a rejection; advantage options now an ordered array; commits 3c36c5d..fdb21ce)
Task 9: complete (commits a028e25..fdb21ce, re-review clean)
  The implementer correctly widened the fix beyond my instruction: all NINE mutation helpers
  route through the one queue, not just the change handler, because the action handlers
  read-modify-write the same array and a click racing a field edit is the identical defect.
  Re-review confirmed no mutation path bypasses the queue.

Task 10: review — spec ✅, one Important. The reviewer carried the Task 7 counter lesson into a
place I had not thought of: `fields: { disadvantage: true }` in the Medicae test request.
**Ruling: finding upheld, fix to `disadvantage: 1` — cost if wrong: none.**
Coercion keeps the OUTCOME right (true behaves as 1), so this would never have been caught by
testing the roll. But impmal's dialog interpolates the raw value into the breakdown text
(impmal.js:208), so the table would read "Помеха: true". Plan corrected too.
Task 10: fix round 1/5 (1 addressed, 0 open — disadvantage passed as 1 with a comment
  explaining why coercion hides it; commits b8f56c5..4ac1fd4)
Task 10: complete (commits fdb21ce..4ac1fd4, re-review clean)

**Ruling: the repo's own lang guard is RED because of us, not pre-existing — cost if wrong:
none, I verified it both ways.**
Task 11's implementer reported the whole-suite failure "no flat key is also a branch of another
key" as pre-existing, confirmed by a git stash baseline. That conclusion is WRONG: stashing only
removed uncommitted work, while the offending keys were committed back in Task 6. I checked out
lang/ from the branch base bf85975 and the guard passes 5/0; with our lang/ it fails.
Root cause, and it is mine from the Task 6 brief: `NAVIS.Implant.Side` and `NAVIS.Implant.Slot`
exist as STRINGS while `NAVIS.Implant.Side.left` and `NAVIS.Implant.Slot.cortex` (and ten more)
exist as branches of the same path. Foundry merges dotted keys into nested objects, so a key
that is both a leaf and a branch clobbers itself. Both files affected, two keys each.
Fix folded into Task 11's round: rename the two LEAF labels (fewer edits than the thirteen
branch keys, and the branch keys are generated as `NAVIS.Implant.Slot.${key}` by SLOTS).

**Process ruling: every remaining checkpoint runs the WHOLE suite (`node --test tests/*.test.mjs`),
not just tests/implants-*.test.mjs — cost if wrong: a few seconds per task.**
I scoped every earlier run to the implant tests and so never saw this repo-wide guard go red.
It was red from Task 6 onward and I missed it for five tasks.
Task 11: review — spec ✅, three Important, four Minor. Fix round 1 dispatched with the three
  Importants plus the lang-key collision above (four items total).
Task 11: minor (deferred): a full paired slot still offers a sideless fit; the third implant then
  resolves to `internal` and vanishes from the figure. Cap is the real rule, so acceptable.
Task 11: minor (deferred): an empty offers array is cached for the session (`??=` only rejects nullish)
Task 11: minor (deferred): windows.set precedes render; a throwing first render leaks the entry and
  the window can never be reopened
Task 11: minor (deferred): the fitted row shows the DECLARED side while occupancy may have placed
  the item on the other one
Task 11: fix round 1/5 (4 addressed, 0 open — lang leaves renamed, placementFor introduced and
  used, offers cache invalidated by a pack-filtered hook, 17 new tests; commits f377383..f810797)
Task 11: complete (commits 2bca322..f810797, re-review clean)
  Whole suite now 179 tests, 178 pass, 1 fail. The single failure is the Voll translation test,
  and I confirmed rigorously this time: `git diff --name-only bf85975..HEAD` shows this branch
  never touched compendium/ or anything else that test reads. Genuinely pre-existing.

Task 12: review — spec ✅, two Important, plus an ENDORSED judgment call.
The reviewer traced every writer of block.energy and confirmed the implementer's
clamp-down-only policy matches the file's existing invariant (restoreAtTurnStart explicitly
skips Заряд: "он сам не растёт"). Recorded because the implementer flagged it as uncertain.
**Ruling: both Importants upheld — cost if wrong: none.**
(a) energyCapacity walked raw mechanics groups instead of resolveEntries, so an energy entry
offered inside an OR group would count whether or not the player chose it. Latent today
because no Mechanicum content exists yet; Task 13 authors exactly that content. My error —
the brief's example code did the raw walk. Plan corrected too.
(b) syncEnergyCapacity is an unqueued fire-and-forget read-modify-write called from three
batched hooks — the same race Task 9 fixed in the sheet, and untested. Fixing with a
per-actor promise chain plus tests.
Task 12: fix round 1/5 (2 addressed, 0 open — resolveEntries used, per-actor promise chain;
  commits 81a591d..42e614d). Plan corrected in 6178b78.
Task 12: complete (commits f810797..42e614d, re-review clean). Whole suite 190/189/1.
Task 12: minor (deferred): energyQueues Map never drops entries for deleted actors — unbounded
  over a very long session, though each entry is one resolved-promise reference.

**Ruling: Task 13's "copy to the scratchpad before deleting" step is satisfied by git — cost if
wrong: none, this is strictly safer than what the plan asked for.**
The plan was written when this module was not under version control, so it required a scratchpad
copy before deleting the 118 augmetics and eight pipeline files. The repo now exists and those
files are committed at bf85975 and pushed to the public remote, so `git show bf85975:<path>`
recovers any of them permanently, which a session-scoped scratchpad does not.

**Task 13 agent hit the Opus session rate limit after 63 tool calls. State on interruption:
four pipeline tools written (1413 lines), generator never run, NO deletions performed.**

**Ruling: the agent's out-of-scope Voll translation work is stashed, not committed — cost if
wrong: 124 lines of translation sit in a stash until someone reviews them.**
It modified compendium/impmal-voll.journals.json and added four src/compendium sources, chasing
the pre-existing Voll test failure I had explicitly told it to ignore. That is a different
subsystem with its own spec, the work is unreviewed, and mixing it into Task 13 would make the
content-pipeline review answer for a paid-module translation. Recoverable with `git stash list`.

**Ruling: TALENT_NAMES in module/implants/test-mods.js is WRONG and must be corrected — cost if
wrong: none; verified against the book before deciding.**
I invented "Настройка Лат" and "Таинства Священного Кода" in the Task 7 brief. DoomBC p.102 names
them **Skitarii Alpha / Скитарий Альфа** ("увеличивает максимум своих установленных и активных
Модулей на 1" — the +1-to-both-caps talent) and **Shifting Mantle / Смещающаяся Мантия** (the
one whose description opens "Таинства священного кода…" and grants +2 INSTALLED only plus the
once-per-Turn toggle). My invented strings were a description phrase and a coinage; the cap
bonuses would never have applied, and no test could catch it because the talents did not exist.
The interrupted agent worked this out from the book and authored both talents correctly — its
two JSONs are kept. Correction folded into the resumed task, and into the plan and spec.
Task 13: complete (commits 6178b78..93e46a3, review clean — spec ✅, quality approved, ZERO findings)
  Verified independently: 21 implants, 68 ids all /^[A-Za-z0-9]{16}$/, regeneration byte-identical,
  audit names its 5 prose-only items aloud, suite 190/189/1, old pipeline gone.
  The reviewer confirmed check-implants.mjs genuinely ASSERTS rather than reports, and that
  import-dbc.mjs has no write path at all.
Task 14: complete (commits 93e46a3..85565fc, review clean — spec ✅, quality approved, ZERO findings)
  136 implants across six families; 267 ids all 16-char; build packs 546 documents; suite 190/189/1.
  The review's central question was whether the 71% prose-only share is honest or an escape hatch.
  It sampled 15+ entries weighted to the two worst families, read each against the book, and found
  no case where a plain characteristic/armour/wound/testMod bonus was wrongly left as prose.
  Named mechanical counter-examples on the other side. Verdict: honest.

ALL 14 TASKS COMPLETE. Proceeding to the final whole-branch review.

## Final whole-branch review — VERDICT: DO NOT MERGE

Three defects make the feature inert in a live world. All three are "wrong key or wrong argument
into another package's contract" — invisible to static review and to 189 passing tests, because
nothing under test crosses into warhammer-lib. All three are mine, from the plan.

I verified each in the library/system source before acting:
- **C1** `warhammer-lib.js:2658 determineTransfer()` — `allowed = (type == "document" && documentType == "Actor")`.
  apply.js sets `transferData: { documentType: "Item" }` and no `type` at all, so the implant's
  effect NEVER transfers to the actor. Every numeric mechanic on the branch is dead, and
  `getScripts` uses the same generator so the testMod scripts are not even collected.
- **C2** `warhammer-lib.js:681 activated()` — returns false with no `activateScript`, so every
  dialog script renders as an unticked opt-in row. Including the over-cap PENALTY. This module's
  own `module/environment/gravity-rules.js:89` documents the rule in Russian.
- **I1** `impmal.js:229` — `dialogData = {data:{}, fields: context.fields || {}}`. Fields come from
  the SECOND argument. surgery.js passes them third, so the book's −30 silently vanished.

**Ruling: deferred minor #6 is promoted to Important and the reviewer's diagnosis beats mine —
cost if wrong: none, the fix is strictly safer.**
I called it "a missing .catch". The reviewer found the real defect: `_onFit` fires three item
updates back to back (side → chosenEffects → installed), each starting an unawaited
syncImplantMechanics that reads ownEffects before the previous create lands, so an implant ends
up with TWO effects and doubled numbers. These are the only read-modify-writes on the branch
without a queue.

Triage of the other 16 deferred minors: 15 stand, one (unused import) folded into the fix wave.

## Final fix wave — complete
Commit bf2c1a7. Re-review: all findings addressed, no new Critical/Important breakage,
merge recommended. Suite 193/192/1, audit exit 0, build 546 documents.

**Carried to cycle B (out-of-scope observation from the re-review, NOT fixed):**
`args.skill` exists only on SkillTestDialog (impmal.js:338). A skill-guarded testMod is therefore
inert on WEAPON and CHARACTERISTIC dialogs — an implant that boosts Melee would not apply to a
weapon attack. gravity-rules.js uses `args.data.skill` / `args.data.characteristic` for that case.
Pre-existing semantics of this design, unchanged by the fix wave, and a real limitation.

**Live verification: NOT DONE.** Foundry is not running (localhost:30000 refused). Nothing on this
branch has ever executed inside the game. The three checks that matter, per the final review:
(a) fit an implant and confirm a characteristic modifier moves on the actor sheet;
(b) roll a test and confirm the implant's modifier applies WITHOUT the player ticking it;
(c) exceed the cap and confirm Disadvantage appears unasked.
