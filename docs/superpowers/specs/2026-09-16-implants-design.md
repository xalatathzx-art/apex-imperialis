# Implants, cycle A — design

*2026-09-16*

## What this is

The machinery for DoomBC's implants (pp. 49, 263–275, and the Skitarii module
limit on p. 269 / p. 102): a new item type with its own data model, sheet,
surgical install cycle and mechanics constructor, plus the Surgeon window that
drives it.

The reference implementation is Batonrain's `warhammer-dbc` system, MIT-licensed,
at `D:\Foundry\DoomCrusade\Data\dumbc\warhammer-dbc`. Its implant handling is
four layers — item schema, an install gate, a body-part classifier, and a shared
mechanics constructor — and this cycle ports that shape. Substantially reused
code keeps attribution in `docs/CREDITS.md`.

**This cycle replaces the existing augmetics pipeline outright.** The 118
generated `augmetic` items, `tools/make-augmetics.mjs` and
`tools/data/augmetics-*.mjs` are deleted, and the content is authored afresh
against the new schema. That is the user's explicit call, made after being shown
that ~1800 lines of finished Russian prose would be discarded.

**Families in scope:** bionics, cybernetics, mechadendrites, Mechanicum,
Skitarii, psybernetics. Drukhari bio-implants (135 items) and Astartes gene-seed
organs (20) are cycle B — they carry their own subsystems (the Best.Q effect
choice, organ implantation by age) and would otherwise force the item format to
prove itself on the hardest content first.

## Why impmal needs this at all

Imperium Maledictum's `augmetic` type is `notes + physical + equipped`
(`template.json:683`). The only rule attached to it is a count cap,
`augmetics.max = base + tgh.bonus` (`impmal.js:6618`). There is no quality axis,
no install location, no surgery, no distinction between carrying an implant and
having it fitted. Every mechanical effect has to be authored by hand as an
Active Effect.

DoomBC's implants are built on exactly the things impmal lacks. So the gap is
not content — it is the four layers.

## Design principles

- The native `augmetic` type keeps working and is not touched. Two independent
  types, two independent budgets. Official content and third-party modules that
  use `augmetic` must not break, and the module must stay switch-off-able.
- State lives in schema fields, not document flags. `warhammer-dbc` uses flags
  (`flags.warhammer-dbc.installed`); here the type is ours, and a data model is
  what fields are for. The biomonitor's existing
  `flags.navis-apexialis.location` reader stays as-is for native augmetics.
- Mechanics belong to the item, never to a lookup table keyed by name. This is
  the reference system's own hard-won lesson (`wdbc-9bzv`: renaming an implant
  in the pack silently zeroed its mechanics; `wdbc-cy2`: the same bonus living
  in two places doubled itself). The name is not an identifier.
- Arithmetic that can be checked without a running game lives in `rules.js` and
  is tested directly.
- Follow the module's established feature layout — `model.js` / `sheet.js` /
  `rules.js` / `index.js`, with Foundry wiring kept out of the pure files —
  the same shape as `module/technomiracles/` and `module/species/`.
- Conversion doctrine is declared once and applied everywhere (see below), the
  way `make-augmetics.mjs` declared it in its preamble.

## Conversion doctrine

Carried over from the deleted `make-augmetics.mjs`, because it was right and
the content must stay consistent with the species and techno-miracle ports that
already use it:

| DoomBC | Imperium Maledictum |
|---|---|
| ±10 on a d100 | +1 / −1 success |
| ±20 | +2 / −2 successes |
| ±30 and beyond | Advantage / Disadvantage |
| Unnatural (X) | +5 per two points (Unnatural S (4) = +10 Strength) |
| FFG Wounds | ÷4 |
| AP | AP, unchanged |
| Катушка Потенции | **Заряд**: capacity = Toughness bonus, does not refill on its own |
| Haywire, Ноосфера | prose only — neither exists in impmal |
| Poor / Comm / Good / Best | **Уровень 1 / 2 / 3 / 4**; 2 is the ordinary article |
| Rarity `R: −1…3` | `availability` (Common/Scarce/Rare/Exotic), book number kept in `rarity` |

Content text is **Russian**. That is a standing decision: the book's implant
descriptions carry most of the Mechanicum's flavour, and translating them to
satisfy the module's usual English convention throws it away. Vocabulary follows
`docs/rules/ru-glossary.md`.

`rarity` is kept as its own field alongside `availability` because impmal's
four-step availability scale cannot express the book's "+1 Rarity per extra
Best.Q effect" rule without hitting its ceiling immediately. Cycle B needs the
number; cycle A stores it so cycle B does not have to re-derive it.

## Architecture

```
module/implants/
  model.js          ImplantModel — the navis-apexialis.implant schema
  sheet.js          item sheet: Description / Quality / Mechanics tabs
  rules.js          pure: limits, ½T.b, over-cap penalty, quality→number resolution
  state.js          the gate: installed/disabled/active, effect synchronisation
  classify.js       body-zone classifier by name (port of classifyImplant)
  surgery.js        the operation: Medicae test, damage, adaptation countdown
  surgeon-app.js    the Surgeon window (ApplicationV2)
  mechanics/
    entries.js      entry kinds and how each is applied and rolled back
    constructor.js  the Mechanics tab editor
    targets.js      entry kind → impmal data path
  index.js          registration

templates/apps/surgeon.hbs
templates/items/implant-sheet.hbs
styles/implants.css

tools/
  make-implants.mjs        generator (replaces make-augmetics.mjs)
  data/implants-*.mjs      authored source, one file per family
  import-dbc.mjs           pulls machine-readable hints out of warhammer-dbc
  check-implants.mjs       audit (replaces check-augmetics.mjs)
```

Registration follows the module's existing precedent exactly: the data model
goes into `CONFIG.Item.dataModels` at `init`, the sheet at `ready`, and
`reportState` says out loud when the module was enabled in an already-running
world — because types declared in the manifest only reach a world at launch.

## The item type

Declared in `module.json` under `documentTypes.Item.implant`, joining the
existing `species` and `subspecies`. The type id is `navis-apexialis.implant`.

```js
{
  description, rules,          // HTML — flavour and rules text
  page,                        // "DoomBC стр. 263"
  category,                    // bionic | cybernetic | mechanicum | skitarii |
                               // mechadendrite | psybernetic
  rarity,                      // book number, -1..3+
  availability,                // impmal enum, drives setupAvailabilityTest
  cost, encumbrance,

  quality,                     // 1..4, default 2
  qualityText: {1,2,3,4},      // HTML per level; only levels that differ are printed

  location,                    // head|body|leftArm|rightArm|leftLeg|rightLeg|internal
  slot,                        // cortex|ocular|respiratory|circulatory|skeleton|
                               // skin|arm|leg|mechadendrite|fullbody|other
  side,                        // left|right|""

  installed,                   // surgically fitted
  disabled,                    // damaged
  active,                      // switched on

  mechanics: [ /* groups */ ]
}
```

### Why `location` and `slot` are both needed

They answer different questions and neither can answer the other's.

`location` is one of impmal's six hit locations, plus `internal`. It is what the
armour entries target and what the biomonitor tints — the system's own
vocabulary, six zones, no finer.

`slot` is the body system the Surgeon window arranges its slots by: a cortical
implant and a memorance coil are both `head`, but they are not the same socket,
and the book limits them separately. This is `warhammer-dbc`'s `kind`, and the
Surgeon's whole layout is built from it.

Collapsing them would either give the Surgeon a single undifferentiated "head"
pile or give the biomonitor zones it cannot paint.

### Why `active` is separate from `installed`

The book separates them explicitly. p. 269: a Skitarii may fit no more than
½ T.b (rounded up) Modules, and if their T.b drops they must **switch off** the
excess or take −30 to everything. p. 102: the Mysteries of the Sacred Code let a
Skitarii fit **two more Modules than the limit**, which does not raise how many
may be active — it only lets them reconfigure on the fly, one off and one on per
Turn. A single boolean cannot express that, and dropping it would delete a
mechanic the book spends two paragraphs on.

## The gate

One predicate, in `state.js`:

```js
isImplantActive(item) === item.system.installed
                      && !item.system.disabled
                      && item.system.active
```

Everything the implant does hangs off it. Active Effects created on the item
have their own `disabled` synchronised to it; constructor entries are applied
when it becomes true and rolled back when it becomes false. This is the
reference system's `isItemActive` + `syncItemEffectsDisabled` pair, narrowed to
one type.

Rollback is by construction, not by bookkeeping: every effect an entry creates
is an embedded document **on the implant itself**, so removing the implant from
the actor removes them with it, regardless of how it was removed.

## Limits

`rules.js`, pure functions over numbers:

- `installedCap(toughnessBonus, talentBonus)` → `ceil(tgh.bonus / 2) + talentBonus`
- `activeCap(...)` → the same base, without the Sacred Code's +2
- `overCapPenalty(installed, active, caps)` → which of the two caps is breached

Breaching a cap gives **Disadvantage on all tests** — the book's −30 under this
module's own ±30 → Disadvantage doctrine. It is applied as a roll-time
modifier, not a stored Active Effect, so it disappears the moment the player
switches a module off.

`system.augmetics.max` is left alone. It belongs to the native `augmetic` type,
which this module does not touch.

## Quality

Level 1–4, where 2 is the ordinary article. Quality is **numbers, not only
prose**: a constructor entry may carry a value per level, `{1: n, 2: n, 3: n,
4: n}`, the shape `warhammer-dbc` uses for `energyMax` and `compensator`. The
sheet prints `qualityText` for the current level beside it, and only for levels
that differ from 2 — which is how the book writes them.

## The Mechanics constructor

`system.mechanics` is an array of groups:

```js
{ id, operator: "AND" | "OR", entries: [ entry, ... ] }
```

An AND group applies all of its entries. An OR group asks the player, on
install, which single entry to apply. The OR group is also the mechanism cycle B
needs for the Best.Q effect choice, which is why it is here now rather than
being invented later.

Entry kinds, chosen as the set the in-scope families actually need:

| Kind | Target |
|---|---|
| `characteristic` | `system.characteristics.<k>.modifier` |
| `skill` | `system.skills.<k>.modifier` |
| `armour` | `system.combat.hitLocations.<zone>.armour` |
| `armourAll` | `system.combat.armourModifier` |
| `wounds` / `criticals` | `system.combat.{wounds,criticals}.max` |
| `speed` | `system.combat.speed.{land,fly}.modifier` |
| `encumbrance` | `system.encumbrance.{overburdened,restrained}` |
| `trait` / `talent` | grants an item, by drag-and-drop reference |
| `energy` | no target — Заряд is computed, see below |
| `testMod` | live request — +N successes or Advantage/Disadvantage on a named test |
| `script` | free JS, with optional throttle |

`targets.js` holds the kind → path table and nothing else, so adding a target is
a one-line change in one file.

All kinds except `testMod`, `script` and `energy` create an Active Effect on the
item at install time. The first two are **live requests**: they write nothing,
and are read at the moment of the roll — `testMod` by a script hooked into test preparation,
which is how impmal expresses success bonuses and Advantage (`args.fields`),
since neither is an effect key. This mirrors the reference system's
`terrainIgnore` / `reroll` entries, which are live for the same reason.

`testMod` is the largest single kind by usage: most book implant effects are
test modifiers, and without it "faithful to the book" is not achievable.

### `energy` reverses an earlier decision, deliberately

`module/technomiracles/resources.js` says, in as many words, that Заряд capacity
is read once from the Toughness bonus and never recalculated — *"установка
Двигательных банков сама по себе ничего не поднимет. Так задумано — иначе этот
пак и пак аугметики оказались бы связаны кодом ради одной строки."*

That reasoning was sound when the coupling would have bought one line. It no
longer holds: Mechanicum is in this cycle's scope, and it brings Manipulus
Motive Banks (+5 capacity), Electoo inductors (refill), Actuator Banks (+1 from
the Skitarii War Plate) and the techno-miracles that spend the same pool. The
`energy` entry kind is the general form of what would have been a special case.

Заряд stays where it is, in `flags.navis-apexialis.mechanicum.energy`, and stays
the single pool — implants do not get a second counter meaning the same thing.
What changes is that its capacity becomes derived: base Toughness bonus plus the
sum of `energy` entries from active implants. Because it is a flag, an Active
Effect cannot reach it, so the recalculation is done by `state.js` when an
implant's gate flips, not by the effects pipeline.

The comment in `resources.js` is updated in the same change. A reversed decision
that leaves its old reasoning standing is how the next session gets misled.

## Surgery

`surgery.js`, driven from the Surgeon window.

Fitting an implant runs a Medicae test through impmal's own engine
(`actor.setupSkillTest`), at Disadvantage — the book's −30 (p. 49). Outcomes:

- **Failure** — `1d10` damage applied by impmal's own method, ignoring armour.
- **Success** — an adaptation state with a countdown of `1d10+3 − T.b` days,
  minimum 1.

Either way a card goes to chat. A "fit without a test" button exists for the GM
and for starting equipment; it is the only path that skips the roll.

Consequences are applied through impmal's methods rather than recalculated, so
the healing and damage engines stay the single source of truth.

## The Surgeon window

An `ApplicationV2`, one instance per actor, keyed on actor id — the reference
system's own guard against a second window sharing a DOM id.

Figure in the centre, body-system slots down both sides — one slot per `slot`
value, which is what the field exists for. Each slot lists what is fitted, what
is owned but not fitted, and what the compendium offers. Paired systems
(`ocular`, `arm`, `leg`) take two — one per side — with a "both sides in one
action" button that is offered only while both sides are free.

Slots are read from the stored `slot` field, never re-derived from the name at
render time. An implant whose `slot` is empty lands in `other` and is visible
there rather than vanishing — the failure the reference system hit when
`fullbody` had no slot to land in, and the implant silently could not be fitted
at all.

Fitting from the compendium creates the item on the actor with `installed`
already true. Extracting clears `installed`; the item stays in the character's
gear rather than being destroyed.

It reuses the biomonitor's existing assets: the PNG zone layers, the measured
hit zones in `BODY_HIT_ZONES`, and the lung / heart / brain organ overlays. The
biomonitor itself stays read-only and gains only display — fitted implants
tinted by category colour — which keeps the principle its own spec set out.

## The body-zone classifier

`classify.js` ports `classifyImplant`: a regex list over Russian and English
names, first match wins, `category` consulted first where it is already precise.
It resolves a name to a `slot`, and each `slot` maps to a `location` — `cortex`
and `ocular` to `head`, `arm` to `leftArm`/`rightArm` by side, `respiratory`,
`circulatory`, `skeleton` and `skin` to `body`, and so on.

The classifier is a **default at authoring time, not a runtime authority**: the
generator uses it to fill `slot` and `location`, and the sheet lets both be
overridden. This is deliberately weaker than the reference system, where the
classifier is consulted live and a rename therefore moves an implant to another
body part with no error — the same class of failure as keying mechanics by name.

## Content pipeline

`tools/make-implants.mjs` writes `src/packs/items/Implants/` from
`tools/data/implants-*.mjs`, one file per family, and `tools/build.mjs` packs it
as before.

`tools/import-dbc.mjs` reads the 298 implant JSONs in
`warhammer-dbc/packs-src/implants/` and extracts machine-readable hints —
`system.effects` numbers and Active Effect `changes` — as draft constructor
entries. It is an aid to authoring, not a content source: the prose is written
fresh from the book.

`tools/check-implants.mjs` audits the generated pack: every implant has a `slot`
and a `location` that agree with each other, a rarity, an availability, at least
one quality level of text, and either mechanics entries or an explicit "prose
only" marker. Unconverted
mechanics are reported rather than passed over silently, in the style of
`docs/migration-report.md`.

### Deletions

- `src/packs/items/Augmetics/` (118 items)
- `tools/make-augmetics.mjs`
- `tools/check-augmetics.mjs`
- `tools/data/augmetics-{bionics,cybernetics,mechadendrites,mechanicum,psybernetics,skitarii}.mjs`

The module is not under version control, so these are unrecoverable once
removed. A copy goes to the session scratchpad before deletion.

## Testing

`rules.js` and `classify.js` are pure and tested directly in `tests/`, following
the module's existing test layout: cap arithmetic at each Toughness bonus,
the boundary where a dropping T.b puts a character over the cap, quality
resolution across all four levels, and classification of a sample drawn from
every family.

`state.js` is tested through its predicate rather than through Foundry: given
the three booleans, is the implant active.

The Surgeon window, the surgery cycle and the constructor editor are verified in
a live world, because they are Foundry wiring — the same division the
techno-miracle cycle used.

## Out of scope

- Drukhari bio-implants and Astartes gene-seed organs (cycle B).
- The Best.Q multi-effect choice and its "+1 Rarity per extra effect" rule. The
  OR group that will carry it exists; the rule does not.
- Haywire and the Noosphere. Neither exists in impmal, and inventing them would
  put these items outside the system.
- Any change to the native `augmetic` type or to `system.augmetics.max`.
