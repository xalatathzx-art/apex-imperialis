# Techno-miracles, cycle A — design

*2026-09-15*

## What this is

The machinery for DoomBC's techno-miracles (pp. 367–392): a new item type with
its own data model, sheet and activation cycle, plus the two Mechanicum resources
it spends.

**Cycle A ships no miracles.** It ships the frame, and the pack it will fill comes
out empty. Converting the ~160 miracles is later work, directed by the user, and
nothing here presumes how a given profile should be converted.

That order is deliberate: pouring content into a frame that then has to change
means rewriting the content, and there is a lot of content.

## Why this is not "psychic powers with a different name"

impmal's `power` is a *risk* mechanic: you roll, and Warp Charge accumulates until
it bites. A techno-miracle is a *resource* mechanic: two pools, spent in a fixed
order, with sustained effects charging upkeep every turn.

| | impmal `power` | techno-miracle |
| --- | --- | --- |
| Schema | discipline, rating, difficulty, range, target, duration, damage | school, path, XP, requirement, hardware, two costs, action, process, test, range, type tags, attack |
| Resource | Warp Charge accrues as risk | Cognition and Charge are spent |
| Sustain | a `duration` string | a Process with per-turn upkeep and forced shutdown |
| Cost | none | Cognition before the roll, Charge after it and only on success |
| Learning | flat 60/100 XP | 150–900 XP behind a prerequisite tree |

Inheriting from `power` would mean disabling half its schema and routing around
its Perils. Hence a new type.

## Decisions

Taken with the user during brainstorming:

1. **Cycle A is the frame alone.** No miracles. The user directs the conversion
   of content in a later cycle.
2. **The Noosphere is out of scope.** Infosight, infospeech, Noospheric control
   and scanning, infowarding, the Xenoosphere: all prose in the rules journal.
   Connection is assumed, never checked.
3. **Requirements follow impmal's talent pattern:** `requirement.value` (readable
   text) plus `requirement.script` (a check). The sheet shows whether they are
   met; nothing is ever blocked. The GM decides.
4. **Activation is fully automated:** spend, roll, spend again, sustain, attack,
   chat card.
5. **Own document type**, `apex-imperialis.technomiracle`, declared in
   `module.json` under `documentTypes` — the mechanism Species already uses.
6. **Damage is impmal's, not ours.** See below: the model is reused, not imitated.

### Simplifications, and what each one buys

The user's steer was explicit: do not be afraid to simplify for impmal. Five
mechanics from the book are cut, each for a stated reason.

| Cut | Reason |
| --- | --- |
| Fractional Process upkeep (½) | Summing halves and rounding the total is arithmetic for its own sake. A Process costs **0 or 1** Cognition. |
| Компенсатор (X) | A second roll per activation, where there is already a first. Its design role — "pay with your body" — is fully covered by the book's own "take Fatigue instead of a Charge", which stays. |
| Манипула (X) | A free-hand counter for one line of text. Stays as prose the GM reads. |
| Славословие (X) | Pre-compilation that is itself a Process and is lost when dropped: a second state machine. Stays as a preparation requirement in the text. |
| Capacity computed from implants | Coupling two packs in code for "+2 from Motive Banks". Capacity becomes an ordinary editable number, defaulting to the characteristic bonus. Install the implant, raise the number once. |

What survives is everything that makes a techpriest interesting at the table: two
pools with different behaviour, the spend order, Processes, the Doctrine limit,
and real attacks.

## Damage and traits are impmal's own

The requirement is that a techno-miracle's damage behave exactly like every other
damaging thing in the system. The way to get that is not to copy impmal's damage
shape into our schema — it is to **embed impmal's own classes**.

`game.impmal` exposes config, tables and `testClasses`, but not its data models.
They are reachable anyway, off the type that already uses them:

```js
const WeaponModel  = CONFIG.Item.dataModels.weapon;
const DamageModel  = WeaponModel.schema.fields.damage.model;
const TraitListModel = WeaponModel.schema.fields.traits.model;
```

Our model embeds those two. The consequence is that damage on a miracle has the
same fields as damage on a bolt pistol, computes through the same `compute()`,
renders with the same sheet widgets, and is read by the same code downstream.

An attacking miracle resolves through **impmal's own `WeaponTest`**, exposed at
`game.impmal.testClasses.WeaponTest`. Armour penetration, criticals, trait
handling and the damage pipeline are therefore the system's, not ours, and they
stay correct when impmal changes them.

**No damage conversion table lives in this spec.** How `2d10 + 2×I.b` becomes an
impmal profile is a content decision, and content is a later cycle.

**No new weapon traits are registered in this cycle.** The module already has the
mechanism — Gauss, Phase and Tesla live in
`module/config/weapon-trait-effects.js` and merge into `config.weaponTraitEffects`
— and DoomBC will need `arc`, `extreme`, `linger`, `smoke` and `rad` eventually.
They arrive with the content that calls for them, fully scripted, as the user
asked. The frame needs nothing for that beyond embedding `TraitListModel`, which
it does.

## Data model

Item type `apex-imperialis.technomiracle`.

```js
{
  school: "",                      // Мотивотеургия | Кибертеургия | Ноотеургия | Аниматеургия
  path: "",                        // sub-path inside the school
  xp: 0,

  requirement: { value: "", script: "" },
  hardware: [],                    // implant names from the Augmetics pack

  cost:    { cognition: 0, energy: 0 },   // a number, or "X" for player's choice
  action:  "free",                        // free | half | full | reaction | none
  process: { cognition: 0, unique: false } | null,
  test:    { auto: false, modifier: 0 },  // Tech, keyed to Intelligence
  range:   { kind: "self", value: "" },   // self | touch | formula

  types:   { doctrine: false, passive: false, reactive: false,
             unseen: false, anima: false },

  attack: {
    kind: "none",                         // ranged | melee | touch | none
    damage: <impmal DamageModel>,
    penetration: 0,
    traits: <impmal TraitListModel>,
    opposedDodge: false                   // dodger must match the priest's SL
  },

  effect: ""                              // the book's prose
}
```

**`opposedDodge`** is its own field because the rule recurs across the book and
impmal has no equivalent: the dodger must match the priest's SL on the activation
test, not merely succeed.

**Content will be Russian**, like the Augmetics pack and for the same reason.
Field names and keys stay English.

## Resources

Stored in a flag, because impmal's `character` schema cannot be extended without
patching the system, and this module does not patch the system.

```js
flags["apex-imperialis"].mechanicum = {
  cognition: { value: 3, max: 3 },
  energy:    { value: 2, max: 2 },
  processes: []
}
```

- **Cognition** — capacity defaults to the Intelligence bonus. At the start of the
  owner's turn it regains **half the Intelligence bonus, rounded up**.
- **Charge** — capacity defaults to the Toughness bonus. It does **not** regain on
  its own: power-system implants and Electoo inductors refill it, which is what
  those six implants in the Augmetics pack are for. This is the same resource that
  pack already describes, under the same name.

`max` is an ordinary editable number, seeded from the characteristic bonus when
the block is first created. Nothing recomputes it.

## Activation cycle

Seven steps. The order of steps 3 and 5 is the point of the whole subsystem.

1. **Gate.** Mechanicum Implants present? Required hardware present? If not,
   activation does not start and the message names what is missing.
2. **Variable cost.** If a cost is `"X"`, ask how much.
3. **Spend Cognition — before the roll.** Not enough, no activation. The book is
   explicit: a failed appeal to the sacred code still consumes the computation.
4. **Roll.** `actor.setupSkillTest({ key: "tech" })` with Intelligence and the
   miracle's modifier. Skipped when `test.auto` is set.
5. **Spend Charge — after the roll, only on success.** The player may pay from the
   Coil or take one Fatigue per Charge instead.
6. **Process.** If the miracle sustains, it joins the actor's active list.
7. **Attack.** If `attack.kind` is not `none`, resolve through impmal's
   `WeaponTest`.

A chat card reports: name, what was paid, the test, the effect, and any damage.

## Processes

Active miracles live in the same flag:

```js
processes: [ { itemId: "...", name: "", cognition: 1, unique: true } ]
```

Upkeep rides the `startTurn` script trigger that warhammer-lib already drives from
its combat hooks, so ordering against impmal's own turn-start effects is the
system's problem, not ours.

At the start of the owner's turn: restore Cognition first, then charge one
Cognition per active Process. If the total exceeds what is available, the owner is
asked which Processes to drop, and the turn does not proceed until they answer.

**Doctrine** is the one exclusivity rule kept: only one miracle tagged `doctrine`
may be active. Activating a second offers to replace the first.

## The sheet

**The miracle sheet** — a new sheet class for the item type, built the way the
Species sheets are: defined inside a factory function because it extends a class
warhammer-lib publishes at module-eval time, and registered at `ready`, because
Foundry fills `CONFIG.Item.sheetClasses` after the `setup` hook.

## The Techno-miracles tab

A tab of its own on the character sheet, beside Psychic Powers, **appearing only
when the actor carries at least one techno-miracle** — precisely the rule impmal
applies to its own Powers tab:

```js
_prepareTabs(options) {
    let tabs = super._prepareTabs(options);
    if (this.actor.itemTypes.power.length == 0) delete tabs.powers;
    return tabs;
}
```

So we do not invent a mechanism; we join the one that is already there. Our entry
is merged into the sheet class's static `PARTS` and `TABS`, and `_prepareTabs` is
wrapped to delete our tab when
`actor.itemTypes["apex-imperialis.technomiracle"]` is empty.

The wrap uses the module's existing idiom — walk the prototype chain to whoever
owns the method, keep the original, patch idempotently — the same approach
`module/horde/horde-combat.js` already uses on impmal's damage code. No
lib-wrapper dependency, and no DOM surgery for the tab itself: an injected tab
would sit outside the application's own tab groups and we would end up
reimplementing tab switching.

The skin's tab row is already a grid of equal columns sized to however many tabs
impmal shows (`72-character.css`), so an extra tab needs no layout work.

### What the tab holds

- **Cognition and Charge**, each with its capacity, editable.
- **The animated line.** Cognition gets a bar built exactly like the Warp Charge
  bar on the Powers tab (`75-dialog-warp.css`): a vessel with an inset shadow, a
  filled bar carrying layered gradients, a flow animation whose period shortens as
  the bar fills, and a sheen crossing every few seconds. The palette is the
  Mechanicum's, not the Warp's — brass and red against the powers tab's violet —
  so the two read as siblings rather than copies. State classes intensify the
  animation as Cognition is committed to Processes.
- **The Processes list**, each with what it costs and a button to drop it.
- **The miracles themselves**, grouped by school, each with its activation button
  and a mark for whether its requirements and hardware are met.

### Two constraints on the bar

- **The skin is a per-client setting.** All of this lives in `src/skin/`, so with
  the skin off the tab must still be a legible list of numbers and buttons. The
  animation is decoration, never the only way to read the value.
- **`prefers-reduced-motion` is honoured**, the way the warp bar already honours
  it — a media query switching every animation on the bar to `none`.

## What ships

- The item type, its data model and its sheet.
- The Techno-miracles tab on the character sheet, with its animated Cognition bar,
  appearing only when the actor carries a miracle.
- The resource block and turn-start upkeep.
- The activation cycle end to end.
- An empty pack, `navis-technomiracles`, registered in `module.json` and
  `tools/build.mjs`, with its generator `tools/make-technomiracles.mjs` and
  validator `tools/check-technomiracles.mjs` in place and passing on an empty
  tree.

## Out of scope

- **Every miracle.** All four schools, ~160 entries, including Luminen.
- The Noosphere in all its parts.
- Registering `arc`, `extreme`, `linger`, `smoke` and `rad` — they come with the
  content that needs them.
- The XP economy: buying a miracle with experience is the GM's bookkeeping. The
  `xp` field is printed, never enforced.
- Компенсатор, Манипула and Славословие as mechanics (see Simplifications).
- **Императив (X)**, the tag that buffs several machine-natured allies at once.
  Not in the model; it arrives with the first school that needs it.
- Rituals, heritage weapons, daemon weapons, runic bindings, fetishes and Enuncia
  (pp. 393–436) — a separate subsystem entirely.

## Known risks

- **Flags carry no schema validation.** A malformed resource block fails at
  runtime, so the validator checks the generated tree at build time, including the
  16-character id rule that has already broken a world once.
- **We wrap a system sheet method.** `_prepareTabs`, plus a merge into static
  `PARTS` and `TABS`. If impmal restructures its tabs, ours goes with them. This is
  the same exposure the horde patch already accepts, and the wrap is idempotent
  and keeps the original, so the failure is a missing tab rather than a broken
  sheet.
- **We reach into impmal's internals for two model classes.** Lifting `DamageModel`
  off `CONFIG.Item.dataModels.weapon` is not a published API. It is still the best
  option — copying the shape would drift silently, while this breaks loudly — but
  the registration code must check that both classes were found and say so plainly
  if impmal ever moves them.
- **Capacity does not track implants.** Installing Motive Banks raises nothing by
  itself; someone must edit the number. Accepted to keep the two packs uncoupled.

## Verification

- Unit tests on the pure parts: cost resolution including `"X"`, Process upkeep
  arithmetic, and the turn-start restore-then-charge order.
- The validator passing on an empty tree, and failing on a fixture with a bad id.
- Live in the running game over chrome-devtools, as Species and Augmetics were
  verified. With no shipped content, the check uses **two hand-made fixture
  miracles** created in the world, not in the pack:
  1. a sustained one with a Cognition cost and a Process, to prove Cognition is
     spent on a failed roll, upkeep is charged at turn start, and a Process can be
     dropped;
  2. an attacking one with a Charge cost and a damage profile, to prove Charge is
     spent only on success and that the attack resolves through impmal's
     `WeaponTest` with armour and traits applied.

  The same pass checks the tab: absent on a fresh character, appearing the moment
  the first fixture is dropped on, gone again when the last one is deleted, the
  bar tracking Cognition as it is spent and restored, and the whole tab still
  readable with the skin switched off.
