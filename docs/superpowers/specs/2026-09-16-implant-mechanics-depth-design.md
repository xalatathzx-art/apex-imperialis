# Implant mechanics, cycle B — design

*2026-09-16*

## What this is

Cycle A gave implants a type, a gate, a surgery cycle, a Surgeon window and 136
authored items. What it did not give them is reach: the mechanics constructor
can change a characteristic, a skill, armour, wounds, speed and encumbrance, and
it can modify a test. Everything else in the rulebook — weapons grown into a
limb, damage, penetration, conditions inflicted on a hit, protection against
incoming damage — had nowhere to go, which is why **97 of the 136 implants ship
as prose only**.

This cycle closes that gap along two axes:

1. **More entry kinds**, one per thing impmal can actually be told at the right
   moment, grouped so a twenty-item list stays navigable.
2. **Integrated weapons**, the single largest family of prose-only content —
   every mechadendrite and five of the bionic arms.

It also implements the **grant machinery** that cycle A declared and never
built: `trait` and `talent` are entry kinds today whose `sourceUuid` nothing
reads. Weapons need that machinery, and the two dead kinds come alive with it.

## Why these and not others

The vocabulary is not invented. Read from the running system:

- **34 script triggers**, including `preRollWeaponTest`, `rollWeaponTest`,
  `preApplyDamage`, `takeDamage`, `computeCharacteristics`, `computeCombat`,
  `equipToggle`, and the four opposed-roll triggers.
- **21 weapon and armour traits** (`blast`, `burst`, `close`, `defensive`,
  `flamer`, `heavy`, `ineffective`, `inflict`, `loud`, `penetrating`,
  `rapidFire`, `reach`, `reliable`, `rend`, `shield`, `spread`, `subtle`,
  `supercharge`, `thrown`, `twohanded`, `unstable`), of which **8 carry a
  value**.
- **14 tiered conditions** (`ablaze`, `bleeding`, `blinded`, `deafened`,
  `fatigued`, `frightened`, `incapacitated`, `overburdened`, `poisoned`,
  `prone`, `restrained`, `stunned`, `unconscious`, `dead`).

What impmal has no word for stays prose. The book gives integrated weapons three
privileges — cannot be disarmed, needs no brace, counts as having the required
Talents — and impmal has no disarm concept and no brace concept. Those remain
descriptive text with an explicit marker, by the user's decision: the module
converts the book into the system's vocabulary, it does not invent rules on the
system's behalf.

## Design principles

- **Declarative entries, not free code.** An author picks a kind and fills
  fields. The `script` kind stays authorable-but-audited-out, as in cycle A.
  A rule that can be stated as data can be checked by `tools/check-implants.mjs`;
  a rule written as JavaScript cannot.
- **Every entry compiles to the mechanism cycle A already proved.** A numeric
  entry becomes an Active Effect change; a moment-of-play entry becomes an
  impmal script on a trigger, carried in the same `system.scriptData` as
  `testMod`. Nothing gets its own bespoke hook.
- **The gate stays the only switch.** A disabled effect contributes no changes
  and runs no scripts, so an implant that is unfitted, damaged or switched off
  goes quiet in one place — including its weapons.
- **Compilation is a pure function.** Entry plus quality in, script source and
  trigger out. Testable under plain node, as `testModScript` is.
- **Grants are owned by the granting implant.** Anything an implant creates on
  the actor carries a flag naming its origin, and leaves when the implant leaves
  or its gate closes.

## Entry kinds

Six groups. The first five exist in the constructor UI today; **Атака и урон**
is new, and the UI already sweeps unnamed kinds into the last group so nothing
can vanish silently while this lands.

| Group | Kinds |
|---|---|
| Характеристики и навыки | `characteristic`, `skill` |
| Броски | `testMod` |
| **Атака и урон** | `attackMod`, `damageBonus`, `weaponTrait` |
| Защита | `armour`, `armourAll`, `damageReduction`, `conditionImmunity` |
| Тело и движение | `wounds`, `criticals`, `speed`, `encumbrance`, `energy` |
| Выдачи | `weapon`, `weaponMount`, `trait`, `talent`, `script` |

### The new kinds, and where each lands

| Kind | Trigger or target | Fields |
|---|---|---|
| `attackMod` | `dialog`, guarded on `args.isAttack` | successes, advantage, optional `attackType` (melee/ranged) |
| `damageBonus` | `dialog`, `args.fields.damage += N` | value, same guards |
| `weaponTrait` | applied to the granted weapon at grant time | trait key from the 21, value where the trait takes one |
| `damageReduction` | `preApplyDamage`, `args.modifiers.push(…)` | value, optional damage-type guard |
| `conditionImmunity` | `createCondition` | condition key |

### Five kinds, not seven — checked against the system

An earlier draft of this table listed `penetration` and `inflictCondition` as
kinds of their own. They are not needed. Of impmal's 21 weapon and armour traits,
only six are implemented as scripts (`defensive`, `shoddy`, `mastercrafted`,
`gauss`, `phase`, `tesla`); **the other fifteen, including `penetrating`,
`inflict` and `rend`, the system handles natively** from the trait's presence and
value on the weapon. So "+4 penetration" is `weaponTrait` with key `penetrating`
and value 4, and "inflicts Bleeding" is `weaponTrait` with key `inflict`. Two
kinds that would each have needed their own compiler, their own tests and their
own audit rule collapse into one that already had to exist.

The same check settled the open question about `attackMod`'s guard. impmal's own
shipped scripts discriminate with **`args.isAttack`** and **`args.weapon`** — for
example `return args.isAttack && args.actor.type == "character" && args.weapon`.
That is the guard to use; the absence of `args.skill` is not a test, since a
characteristic test has no skill either.

`damageBonus` likewise needs no opposed-damage trigger: the `force` weapon
category does `args.fields.damage += args.actor.system.warp.charge` on the plain
`dialog` trigger, so damage is adjustable at the same moment as successes.

`conditionImmunity` follows the idiom impmal uses for its own immunities —
`this.actor.hasCondition(key)`, then a notification and `delete()` — rather than
inventing a suppression mechanism.

Every one carries the quality ladder, so a value may differ per level exactly as
`characteristic` already does.

**The trigger column is a starting point, not a verified fact.** Each was picked
from the trigger list by name, and names are not contracts: cycle A shipped a
`transferData` that read plausibly and transferred nothing, an `activateScript`
whose absence made every script opt-in, and `fields` passed one argument too far
along. Before implementing a kind, confirm in a live world which trigger
actually carries the value it needs to change and what the argument is called
there — `impmal.js`'s own shipped effect scripts are the reference, because they
are the only examples guaranteed to be correct. Where the table proves wrong,
the table is what changes.

`attackMod` fires on `dialog` like `testMod`, but it must guard on the dialog
being a weapon test rather than on `args.skill`. Establish what distinguishes
the two dialog classes at that moment and guard on that; do not assume the
absence of `args.skill` is a sufficient test, since a characteristic test has no
skill either.

`attackMod` is deliberately separate from `testMod` rather than a flag on it.
`testMod` guards on `args.skill`, which exists only on a skill-test dialog; a
weapon attack is a different dialog with no `skill`, which is why a skill-guarded
modifier is silently inert on attacks today. That is a known limitation recorded
at the end of cycle A, and `attackMod` is its answer.

## Integrated weapons

Two kinds, one outcome: a real impmal `weapon` item on the actor, owned by the
implant.

**`weapon`** carries the profile in the entry, because the book prints one —
Pteraxii Talons are "Dmg 1d10+2 R, Pen 4, Reinforced" on the page.

**`damage.base` is a string field that impmal reads as a NUMBER.**
`DamageModel.compute` does `this.value = (Number(this.base) || 0) + <characteristic
bonus>` (`impmal.js:8031`), so a die expression like `"1d10+2"` yields `NaN`, falls
to `0`, and the weapon silently does no damage. Imperium Maledictum does not roll
dice for weapon damage at all — it is a flat number plus a characteristic bonus,
which is why a real impmal weapon stores `"6"`. The book's dice must be converted
before authoring, using the module's own established rule (1d5→3, 1d10→5, 2d10→11,
flat addends unchanged). An earlier draft of this spec asserted the opposite and
would have shipped every weapon implant doing zero damage.

Fields map
onto impmal's own weapon schema, read from a live document rather than guessed:

```js
{
  name, img,
  attackType,          // "melee" | "ranged"
  category, spec,      // from config.rangedTypes / config.rangedSpecs
  range,               // from config.ranges
  damage: { base, characteristic, SL, ignoreAP },
  traits: [ { key }, { key, value } ]   // config.weaponArmourTraits
}
```

**`weaponMount`** carries no profile. It marks the implant as a socket and gives
its sheet a drop target; a weapon dropped there is stored by UUID and granted
from that. This is Weapon-Arm and the Universal Port, which the book says take a
weapon "acquired separately".

Both are granted the same way and are indistinguishable once fitted. The
difference is only where the profile comes from.

### Grants

A new module in `module/implants/grants.js`:

- On the gate opening, every grant entry creates its document on the actor with
  `flags.apex-imperialis.grantedBy` naming the implant's id and the entry's id.
- On the gate closing or the implant leaving, everything carrying that flag for
  that implant is removed.
- The sync is idempotent and queued per implant id, reusing the promise-chain
  pattern already in `mechanics/apply.js` — the same batched-hook race that
  produced doubled effects in cycle A applies here and would produce doubled
  weapons.

A granted weapon is created equipped, because a weapon grown into an arm is not
something the character chooses to draw.

`trait` and `talent` grants ride the same machinery and stop being dead kinds.
`tools/check-implants.mjs` drops them from `UNSUPPORTED_KINDS`, keeping only
`script`.

## The sheet

The UI work that preceded this spec gave the constructor five optgroups and a
summary line per entry. **Атака и урон is the sixth and does not exist yet** —
adding it is part of this cycle. `kindGroupsFor` already sweeps any kind it does
not recognise into the last group, so the new kinds are visible from the moment
they are declared even before the group is named. Two further additions:

- A `weapon` entry expands into the profile fields, laid out as impmal's own
  weapon sheet lays them, so an author is not learning a second vocabulary.
- A `weaponMount` entry expands into a drop target showing the mounted weapon's
  name and image, with a control to clear it.

Both follow the rules already established for this sheet: real focusable
controls, progressive disclosure that still states what is collapsed, tooltips
on truncated text, and no meaning carried by colour alone.

## Content

This cycle ships the machinery and converts **only the families whose prose-only
share it directly explains**: the 12 mechadendrites and the 5 bionic arms whose
book text is a weapon profile. Converting the remaining prose-only implants is
later work, directed by the user, and out of scope here.

`tools/check-implants.mjs` gains assertions per new kind: trait keys resolve
against `config.weaponArmourTraits`, condition keys against the 14, a trait that
takes a value has one, `weapon` entries carry a legal `attackType`, and a
`weaponMount` entry has either a stored UUID or an explicit "empty socket" note.

## Testing

Pure and unit-tested: the compiler for each new kind (entry plus quality in,
script and trigger out), the profile-to-weapon-data mapping, and the grant
diffing — which documents should exist for a given set of entries and gate state.

Verified in a live world, because it crosses into another package's contract and
cycle A proved that nothing else catches those: a granted weapon appears equipped
and can be attacked with; its damage bonus and penetration land on the roll; an
inflicted condition appears on the target; removing the implant removes the
weapon; and switching the implant off silences it without deleting it.

That last division is the lesson cycle A paid for. Its final review found three
defects that made the whole feature inert — a wrong `transferData`, missing
`activateScript`, and fields passed in the wrong argument — and all three were
invisible to 189 passing tests because no test crossed into warhammer-lib.

## Out of scope

- Converting the other prose-only implants.
- The `script` entry kind, which stays authorable and audited-out.
- Drukhari bio-implants and Astartes gene-seed organs.
- The book's three integrated-weapon privileges, which impmal has no vocabulary
  for.
- Any change to the native `augmetic` type or `system.augmetics.max`.
