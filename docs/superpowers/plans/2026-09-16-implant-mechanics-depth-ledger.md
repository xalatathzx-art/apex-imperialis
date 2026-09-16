# SDD ledger — plan: docs/superpowers/plans/2026-09-16-implant-mechanics-depth.md

Spec: `docs/superpowers/specs/2026-09-16-implant-mechanics-depth-design.md` (read, reachable).
Branch: `implants-cycle-a`, continuing from cycle A. BASE b8d026c.

## Setup

**Ruling: cycle B continues on the same branch as cycle A — cost if wrong: one branch
holds two cycles, so a partial revert takes a commit range rather than a branch drop.**
Cycle A is unmerged and cycle B builds directly on its type, gate and constructor. A second
branch would have to be cut from the first anyway and merged back before either could land.

## Pre-flight conflict scan

| Tasks | Produces → Consumes | Finding |
|---|---|---|
| 1 → 7, 8 | `targets.js`: ENTRY_KINDS, LIVE_KINDS | clean — T7 builds the picker from ENTRY_KINDS, T8 audits against it |
| 1 → 4 | grant-kind membership | **F2** — two lists of "grant kinds" in two files, with deliberately different membership |
| 2 → 3 | `compile.js`: compileEntry | clean |
| 2 → 7, 8 | `compile.js`: CONDITION_KEYS | clean — the picker and the audit share one source |
| 3 → 6 | `apply.js`: scriptsForImplant | clean — T3 adds a function, T6 adds hook calls to the same file, in order |
| 4 → 6 | `grants.js`: plannedGrants, diffGrants, grantKey, GRANT_FLAG | clean — T6's brief spells out that a planned item is `{entryId, kind, data}` |
| 5 → 6 | `weapon-profile.js`: weaponDataFromProfile | clean |
| 5 → 7, 8 | `WEAPON_TRAITS_WITH_VALUE` | clean — the trait picker and the audit share one source |
| 6 → 10 | `grants-apply.js` | clean |
| 7 → 9 | UI must render the kinds the content uses | clean — 7 precedes 9 |
| 8 → 9 | audit must exist before content is written to satisfy it | clean — 8 precedes 9 |
| 9 → 10 | content under live check | clean |

Self-consistency, per task: 1, 2, 3, 4, 5 each specify tests that exercise exactly the exports
they specify — checked export by export against the assertions. **F1** in Task 1's Interfaces
block. 6, 7, 8, 9 are prose-specified and say so. 10 changes nothing and produces a checklist.

### Rulings on the scan

**Ruling F1 (ENTRY_KINDS count): plan corrected, 13 → 20, not "grows to 18" — cost if wrong:
none, I counted the current array in the file.**
The Interfaces block claimed 18. `targets.js` holds 13 today and this task adds 7.

**Ruling F2 (two grant-kind lists): both stay, with a comment required — cost if wrong: one
comment line.**
`targets.js` keeps a private `GRANT_KINDS` meaning "has no data path" and containing
`weaponTrait`; `grants.js` gets `GRANTING_KINDS` meaning "creates a document on the actor" and
NOT containing it, because a weapon trait is applied TO a granted weapon rather than granted
itself. The distinction is real and both lists are correct, but the near-identical names invite
a future reader to "unify" them and silently start granting trait entries as documents. Task 4's
dispatch carries a requirement to name the distinction in a comment where the second list is
defined.

## Progress
Task 1: complete (commits b8d026c..2301520, review clean — spec ✅, quality approved, zero findings)
  Suite 218/217/1. The implementer also added the seven NAVIS.Implant.Kind.* keys that Task 2's
  Step 5 asks for; reviewer confirmed both lang files hold the same key set and both parse.
  Task 2's implementer must not re-add them.
Task 2: complete (commits 2301520..1f31d8b, review clean — spec ✅, quality approved)
  Suite 229/1. The reviewer verified every generated field and trigger against impmal.js and
  warhammer-lib.js rather than against the brief. Highest-value confirmation: `createCondition`
  IS a real dispatched trigger (impmal.js:4126, 4140, registered at :9499) — a script on a
  trigger that never fires would have been invisible to every test.
  Fact for later tasks: warhammer-lib consults activated()/hidden() only in the dialog-checkbox
  flow; non-dialog triggers execute unconditionally. So the ALWAYS guard on damageReduction and
  conditionImmunity is inert, not wrong — it satisfies the "every record carries one" rule.
Task 2: minor (deferred): no test covers attackMod carrying BOTH a value and an advantage
Task 2: minor (deferred): the "compiles to nothing" test overlaps coverage other tests already give
Task 3: complete (commits 1f31d8b..7c0c83b, review clean — spec ✅, quality approved, zero findings)
  Suite 234/233/1. Reviewer read BOTH compilers to prove the no-double-count property rather than
  taking the ?? chain on faith, and confirmed scriptsForImplant goes through resolveEntries — the
  exact raw-walk bug this project shipped once before (energyCapacity, cycle A).
Task 4: complete (commits 7c0c83b..3cc912f, review clean — spec ✅, quality approved)
  Suite 244/243/1. Reviewer confirmed the GRANTING_KINDS comment explains WHY the two lists
  diverge and warns against the specific wrong refactor, rather than restating the code.
Task 4: minor (deferred): diffGrants defaults implantId = "", so a caller that forgot it would
  collide every entry under ":entryId". No such caller exists; Task 6 passes a real id.
Task 4: minor (deferred): a planned grant's `data` carries the whole entry, duplicating `id` and
  `kind` that already sit on the outer object. Cosmetic.

Task 5: review found Critical — a granted weapon un-equips itself.
**Ruling: finding upheld, `equipped.force` must be true; plan corrected too — cost if wrong: none,
I read both call sites in the system source before deciding.**
impmal.js:8757 `computeEquipped()`: for a character, when `!this.equipped.force`, it recomputes
`equipped.value` from `actor.system.hands.isHolding(id)` on every data prep. A weapon grown into a
limb is never in a hand, so `value` is forced back to false. impmal.js:7173 shows `force: true` is
what pins it. The plan said `force: false` and the code's own comment said the opposite of what
the data did. No test could catch it: the task's tests assert the creation object, never what the
actor does with it.
Task 5: fix round 1/5 (1 addressed, 0 open — force pinned, comment names impmal.js:8757, test now
  asserts force and would fail against the old version; commits 4ab17c8..2f04b3c)
Task 5: complete (commits 3cc912f..2f04b3c, re-review clean). Plan corrected in the same range.
Task 5: minor (deferred): traits.list[].value is a StringField but the mapper passes numbers,
  relying on Foundry's cast. The module's own doc comment cites a real weapon storing "Medium".
Task 6: complete (commits 2f04b3c..442bf5b, review clean — spec ✅, quality approved, zero findings)
  Suite 251/250/1. Reviewer re-ran the suite itself rather than trusting the pasted output, and
  confirmed no delete path touches a document without the grantedBy prefix for that implant.
  The implementer caught a real leak the brief did not name: on deleteItem the removed item's
  fields still read "active", and grants live on the ACTOR so they do not cascade like an embedded
  effect. Its `actor.items.has(item.id)` guard is correct — Foundry drops the document from the
  collection before firing the hook but leaves `item.parent` reachable.
Task 6: minor (deferred): the 3-line {key}/{key,value} trait mapper is duplicated in grants-apply.js
  because a mounted weapon comes from fromUuid and never passes through weaponDataFromProfile.
  Both copies share WEAPON_TRAITS_WITH_VALUE by import, so drift risk is low.
Task 7: complete (commits 442bf5b..340c715, review clean — spec ✅, quality approved)
  Suite 251/250/1. Reviewer cross-checked every UI field name against the compiler that reads it —
  a field written under a different name would look authored and do nothing. All seven match.
  Endorsed judgment calls: "КУ" over my "успеха" (the module really does translate IMPMAL.SL as КУ
  and NAVIS.Gravity.heavySL uses that shape — my example contradicted the glossary); the melee/ranged
  split of category/spec/range with setField clearing all three on a type flip; and the one-line
  sheet.js change, which sits inside the already-queued handler and adds no unqueued path.
Task 7: minor (deferred): a zero damageBonus renders «+0 урона» and a zero damageReduction
  «−0 входящего урона», while attackMod correctly falls back to «без изменений». Both compile to
  null, so the folded line claims an effect the entry does not have.
Task 7: minor (deferred): WEAPON_TRAITS_WITH_VALUE is a frozen copy of impmal's config.traitHasValue
  — the one impmal list in this feature not read from config. Pre-existing from Task 5, brief-mandated.
Task 8: complete (commits b2aa1da..81ffde0, review clean — spec ✅, quality approved)
  Suite 266/265/1, audit exit 0 on the existing 136. The reviewer FAULT-INJECTED every validator
  rather than reading them, and verified the main() refactor keeps the audit's teeth by corrupting
  an _id in a scratch copy and confirming exit 1 with the same message. Also byte-checked the
  hardcoded 21 traits and 8 valued traits against the live impmal bundle — exact match.
Task 8: minor (deferred): hasTraitValue treats "" as absent, matching weapon-profile.js's own
  traitFromEntry — correct but the tie is implicit, worth an inline comment.

**Ruling: the implementer is right and my spec was wrong about damage.base — cost if wrong: none,
I read DamageModel.compute myself before deciding.**
I asserted repeatedly that `damage.base` is a string holding `"1d10+2"`. It IS a StringField, but
impmal.js:8031 computes `this.value = (Number(this.base) || 0) + <char bonus>`. `Number("1d10+2")`
is NaN, `|| 0` makes it zero, and the weapon does NO damage with no error anywhere. Imperium
Maledictum does not roll dice for weapon damage — flat number plus characteristic bonus. The
evidence was in front of me the whole time: the real Фраг-граната stores `"6"`.
Had this shipped, all thirteen converted implants would have dealt zero damage and every test
would still have been green. The implementer converted with the module's own house rule
(1d5→3, 1d10→5, 2d10→11) and left `characteristic` empty because стр. 277 says a mechadendrite's
profile already includes its own Strength. Spec corrected.
Task 9: complete (commits 81ffde0..f5347dd, review clean — spec ✅, quality approved)
  13 converted, 4 left prose-only; module-wide prose-only falls 97 -> 84 of 136.
  The reviewer read стр. 277's profile table itself and verified ALL ELEVEN mechadendrite profiles
  row by row against the book under the dice-to-average rule, plus that the four left prose really
  have no printed profile. Zero dice survive anywhere in the pack. The honesty test passed.
  Resolved both "cannot verify from diff" items myself: a second generator run leaves 0 changes
  (deterministic), and `node tools/build.mjs` now SUCCEEDS — 546 documents into 5 packs. Foundry
  had released the LevelDB lock that blocked it earlier in this cycle.
Task 9: minor (deferred): the report's quoted audit output was hand-reordered rather than verbatim.
  Nothing misstated, but transcript evidence is the one thing a reviewer must take at face value.
Task 9: for the user, not a defect: Серво-Коготь lands at 29 damage, the highest in the module.
  Faithful to the book's 2d10+18 / Pen 10, but worth seeing before a player buys one.

**Ruling: Task 10's checklist-writing dispatch is skipped; I run the nine checks directly — cost if
wrong: none.** The plan has the implementer write a checklist to a file for me to execute. I hold
the live world and the checklist is already in the plan text; a subagent round-trip to restate it
would add a seat and no information.

**Ruling: Task 10's live checks are NOT run in this session; I do not start the user's Foundry
server — cost if wrong: the nine live checks stay outstanding and the user must run them.**
Foundry shut down partway through this cycle (which is why build.mjs finally succeeded — the
LevelDB lock was released). Launching a VTT server is a side effect outside the working copy and
the user may run it through a launcher or a pinned runtime. The checklist goes to them instead.
Everything else in the plan is complete; the final whole-branch review needs no game.

## Final whole-cycle review

Two Criticals, both on the weaponMount path, both verified by me in the source before dispatch:
(1) `equipped.value` set without `force`, repeating the Task 5 defect on the second path — the
correction had reached weapon-profile.js and my plan line 804, but not plan line 840 or this code;
(2) `system.traits.list` OVERWRITTEN rather than merged, so every weapon dropped into a socket was
granted with an empty trait list — a bolt pistol losing `loud`, a chainsword losing `rend`. Silent,
and invisible to tests because no test passed a real source document.
Plus: grants were create/delete only and never updated, so re-pointing a mount left the old weapon
and never made the new one; and a third hand-inlined copy of the queue helper (my plan told the
implementer to copy the shape).
One fix wave, commit 010bf32. Re-review: all five addressed, no new Critical/Important breakage.
Suite 279/278/1, audit exit 0, generator deterministic, build 546 documents into 5 packs.

Release note for the user: existing grants carry hash-less keys, so each is deleted and recreated
once on the first sync after this update. The rebuilt document matches its entry exactly, but the
ITEM ID changes — a macro or token action hard-coding a granted weapon's id breaks once.

TASK 10 NOT DONE — Foundry is shut down and I do not start it. The nine live checks stand outstanding.
