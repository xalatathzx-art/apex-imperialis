# Environment and Biomonitor Design

**Date:** 2026-09-15  
**Module:** Apex Imperialis  
**System:** Imperium Maledictum 3.1+ on Foundry VTT 13  
**Status:** Approved in chat; awaiting review of this written specification

## Purpose

Add two connected subsystems to Apex Imperialis:

1. a scene environment that models weather, temperature, gravity, radiation, and atmosphere; and
2. a character biomonitor under Influence on the Main tab that presents wounds, critical damage, conditions, armour damage, augmetics, and environmental exposure in one place.

The visual and interaction reference is the environment and body-monitor work in Batonrain's `warhammer-dbc` system. The implementation will be adapted to Imperium Maledictum rather than copied as a parallel DBC rules engine. The source repository is MIT-licensed; any substantially reused code must retain appropriate attribution in `docs/CREDITS.md`.

## Design principles

- Use only Imperium Maledictum's mechanical vocabulary: Advantage, Disadvantage, difficulty, SL, existing skills, Wounds, Critical Wounds, conditions, armour damage, speed steps, and zone traits.
- Expanded environmental rules are allowed where the core book has no complete subsystem, but their outcomes must be expressed through those native mechanics.
- Keep scene conditions on the Scene and lasting consequences on the Actor.
- Do not create persistent Active Effects for temporary test modifiers. Compute them when a test dialog is prepared so leaving a scene removes them immediately.
- Persist real consequences: radiation dose, Wounds, Critical Wounds, and conditions.
- Reuse impmal's methods for tests, damage, armour damage, conditions, and derived statistics instead of duplicating their calculations.
- Only one elected client may apply scheduled consequences. Prefer `game.users.activeGM`; if no GM is active, do not mutate actors automatically.
- Make the feature usable without the Navis skin, while styling it as part of the Navis skin when enabled.

## Architecture

The feature is split into isolated units:

- `module/environment/environment-data.js`: defaults, normalization, Scene flag access, protection records, and actor exposure records.
- `module/environment/environment-rules.js`: pure functions for weather profiles, effective temperature, effective gravity, effective radiation, atmosphere, intervals, and consequences.
- `module/environment/environment-app.js`: GM-only `ApplicationV2` editor.
- `module/environment/environment-widget.js`: read-only scene summary visible to all users.
- `module/environment/environment-tests.js`: test-dialog modifiers, scheduled exposure tests, result application, and chat reporting.
- `module/environment/environment-derived.js`: effective encumbrance, speed, falling, and environmental protection adapters.
- `module/environment/index.js`: idempotent registration and hooks.
- `module/biomonitor/biomonitor-data.js`: a read-only view model assembled from the actor, current scene, and exposure flags.
- `module/biomonitor/biomonitor-sheet.js`: DOM insertion and listeners for the Main tab.
- `module/biomonitor/biomonitor-body.js`: body-zone and augmetic mapping.
- `module/biomonitor/index.js`: registration and exports.
- `templates/apps/environment.hbs`: environment editor.
- `styles/environment.css` and `styles/biomonitor.css`: scoped styling.

The entry point registers data and settings at `init`, safe system adapters at `setup`, and sheets/widgets at `ready`. Every wrapper carries a private idempotency marker and calls the original system method exactly once.

## Scene data

Environment is stored at:

```js
flags["apex-imperialis"].environment = {
  weather: {
    preset: "clear",
    severity: 0,
    customLabel: "",
    customIcon: "",
    customTone: "",
    effects: []
  },
  temperature: 20,
  gravity: 1,
  radiation: 0,
  atmosphere: {
    type: "normal",
    intensity: 0
  },
  isolatedFromWeather: false,
  note: ""
}
```

The normalizer clamps gravity to zero or greater, radiation and atmospheric intensity to 0–10, and weather severity to 0–3. It rejects unknown effect keys and supplies defaults for older or partial data. Environment is per Scene; this release has no scene-group inheritance.

## Environment editor and widget

The GM opens the editor from a new Environment control in the scene controls. The window follows the source interaction pattern: categories on the left and the selected editor with a live rules preview on the right. Its categories are Weather, Temperature, Gravity, Radiation, and Atmosphere.

Changes save immediately to the current Scene flag and refresh every open editor, widget, and character sheet. Non-GMs cannot edit the flag.

The compact widget is visible to all users while a canvas Scene is active. It shows weather/location, temperature, gravity, radiation, and atmosphere. A dangerous value is highlighted. The widget may be collapsed per client. It never exposes GM-only notes.

## Weather

Weather presets combine named effects. Custom weather may select the same effects and provide its own label, icon, and colour. The mechanical effect set is closed and validated; free text never executes rules.

Weather severity is `0` (cosmetic), `1` (ordinary), `2` (strong), or `3` (extreme). A preset supplies its default severity, while a custom weather profile stores an explicit severity. A scheduled weather hazard uses the following common cadence: severity 1, Average (+0) once per hour; severity 2, Difficult (-10) once per 10 minutes; severity 3, Hard (-20) once per combat round. An effect that defines a more specific trigger below uses that trigger instead. As with other scheduled exposure, only the elected GM resolves it and a large time jump produces one catch-up test.

### Weather effects

- **Limited visibility:** Disadvantage on Awareness (Sight) and ranged attacks where the weather lies between attacker and target. Strong limited visibility uses impmal's Heavily Obscured semantics: a ranged target cannot be selected without an effect that explicitly bypasses sight.
- **Precipitation:** Advantage on a test made to remove Ablaze. In extreme precipitation, ordinary Ablaze is removed automatically at the end of its damage step; Major Ablaze is reduced to ordinary Ablaze.
- **Strong wind:** Disadvantage on ranged weapon tests and Athletics tests made to move against it. In extreme wind, moving against it also requires an Average (+0) Athletics test; failure ends movement and a Fumble also applies Prone.
- **Difficult surface:** Apply impmal's Difficult Terrain semantics: land speed falls one step and Athletics (Running) and Reflexes (Dodge) suffer Disadvantage.
- **Toxic air:** Schedule Fortitude tests using the Atmosphere rules. Weather intensity supplies the atmosphere intensity if it is higher than the Scene's base value.
- **Corrosive exposure:** Use the common weather-hazard cadence for a Fortitude test. On failure, damage one equipped protection item by 1 Armour at a random location it covers through `actor.damageArmour`. At extreme severity, an unsealed target also suffers 1 Wound through the normal damage pipeline with armour ignored.
- **Electrical storm:** On a Fumble of a Technology test involving exposed equipment, mark the involved item unequipped until reactivated. At extreme severity, the environment scheduler makes one lightning hazard check per interval, not per actor; a random exposed token makes a Hard (-20) Reflexes (Dodge) test and on failure takes 10 damage through `applyDamage`.
- **Radiation storm:** Add the preset's radiation value to the Scene intensity before protection, capped at 10.

The editor includes a clear rules preview of every active effect and its trigger. `isolatedFromWeather` preserves the exterior weather in the display but suppresses all weather effects on actors in that Scene.

### Presets

| Preset | Severity | Effects |
|---|---:|---|
| Clear, Cloudy | 0 | None |
| Rain | 1 | Precipitation |
| Downpour | 2 | Precipitation, Limited visibility, Difficult surface |
| Storm | 3 | Downpour plus Electrical storm |
| Fog | 1 | Limited visibility |
| Dense fog | 2 | Strong limited visibility |
| Snow | 1 | Precipitation; cold comes from Temperature |
| Blizzard | 2 | Limited visibility, Strong wind, Difficult surface |
| Severe blizzard | 3 | Strong limited visibility, Extreme wind, Difficult surface |
| Gale | 2 | Strong wind |
| Ash storm | 2 | Limited visibility, Strong wind, Toxic air |
| Acid rain | 2 | Precipitation, Corrosive exposure |
| Toxic smog | 2 | Limited visibility, Toxic air |
| Radiation storm | 2 | Limited visibility, Radiation storm |
| Decompression | 3 | Extreme wind; vacuum comes from Atmosphere |

Ship and void location presets from the reference UI remain display presets. They do not add mechanics unless their environment fields do so explicitly.

## Temperature

Temperature is recorded in Celsius. Clothing, armour, augmetics, and traits shift only the actor's effective temperature toward the comfort band; they do not change the Scene value.

| Temperature | Test |
|---|---|
| +10 to +30 | None |
| +31 to +40 or +1 to +9 | Average (+0) Fortitude (Endurance), every 8 hours |
| +41 to +50 or 0 to -10 | Difficult (-10), every hour |
| +51 to +60 or -11 to -30 | Hard (-20), every 10 minutes |
| Above +60 or below -30 | Very Hard (-30), every combat round |

Failure applies Fatigued. Failure by 2 or more SL applies Major Fatigued. In the lethal band it also deals `5 + negative SL` damage with armour ignored. Existing immunity and environmental protection are evaluated before scheduling the test.

Protection shifts effective temperature toward the comfort band: ordinary suitable clothing 10 degrees, environmental clothing 20, sealed specialised armour 30, and augmetics by their configured value. Heat and cold protection are separate values.

## Gravity

Gravity is recorded as G. Inventory encumbrance values remain unchanged. Effective carried encumbrance is `base encumbrance × G` and is used when deriving Overburdened and Restrained.

### Low gravity, 0.1–0.9G

- Advantage on Athletics tests to jump or lift.
- Multiply effective falling height by G before using impmal's falling rule.
- At 0.5G or lower, Running or a violent manoeuvre requires Average (+0) Athletics. Failure ends movement; Fumble also applies Prone.

### Zero gravity, 0G

- Carried encumbrance does not restrict drift.
- Without a handhold, magnetic boots, or a propulsion device, directed movement is unavailable.
- Melee attacks, attacks with a Heavy weapon that produces recoil, and violent manoeuvres require Average (+0) Athletics or Reflexes. Failure leaves the actor drifting; Fumble also applies Prone as loss of orientation.
- Magnetic boots restore directed movement but lower land speed one step.
- A relevant augmetic or training effect grants Advantage on these checks.

### High gravity, 1.1G or higher

- Effective encumbrance increases immediately.
- At 1.5G, physical Strength and Agility tests suffer Disadvantage.
- At 2G, land speed falls one step.
- At 3G, the actor makes a Hard (-20) Fortitude test at the start of each turn. Failure applies Fatigued; failure by 2 or more SL also deals Wounds equal to negative SL through `applyDamage` with armour ignored.
- Multiply falling height by G before applying the falling rule.

Gravity compensation reduces only gravity above 1G for the actor's tests, effective encumbrance, and speed: `effective G = max(1, scene G - compensation)` when Scene gravity is above 1G. It does not turn normal gravity into low gravity. Low- and zero-gravity assistance is represented separately by magnetic boots, propulsion, training, or an explicit low-gravity augmetic effect.

## Radiation

The Scene has intensity 0–10. Each character stores lasting dose at:

```js
flags["apex-imperialis"].exposure.radiationDose
```

Radiation protection reduces intensity before frequency and difficulty are selected. Protection stacks and the result is clamped at zero. Default protection values are: closed protection or chemical suit -1, void/radiation suit -2, sealed power armour -3, augmetics as configured, and a proper radiation shelter immunity.

| Effective intensity | Frequency | Fortitude difficulty |
|---:|---|---:|
| 0 | None | — |
| 1–2 | 8 hours | Routine (+20) |
| 3–4 | 2 hours | Average (+0) |
| 5–6 | 30 minutes | Difficult (-10) |
| 7–8 | 5 minutes | Hard (-20) |
| 9 | Start of each turn | Very Hard (-30) |
| 10 | Start and end of each turn | Very Hard (-30) |

Failure adds 1 Dose plus 1 for every full 2 negative SL. Dose is clamped to 10.

| Dose | Persistent consequence |
|---:|---|
| 0–2 | No mechanical consequence |
| 3–4 | Disadvantage on Fortitude tests other than the radiation-resistance test itself |
| 5–6 | Fatigued is maintained and returns after rest until Dose falls below 5 |
| 7–8 | Major Fatigued is maintained; each later failed radiation test also deals 1 Wound with armour ignored |
| 9 | Each later failed radiation test also deals `1d5` damage with armour ignored |
| 10 | On first reaching Dose 10, immediately resolve one torso Critical Wound through impmal's native Critical Wound table; each later failed radiation test resolves another |

Dose does not fall when changing Scene. Reducing it requires treatment, drugs, specialised equipment, or recovery explicitly granted by an item or GM action. The biomonitor includes owner/GM controls to adjust Dose with a required reason posted to chat.

## Atmosphere

- **Normal:** no effect.
- **Thin:** Disadvantage on Athletics and sustained physical tests; Average (+0) Fortitude each hour. Failure applies Fatigued.
- **Unbreathable:** Difficult (-10) Fortitude every 10 minutes. Failure applies Fatigued; failure by 2 or more SL also deals damage equal to negative SL with armour ignored.
- **Toxic:** frequency and difficulty use intensity bands matching Radiation. Failure applies Fatigued; failure by 2 or more SL deals `1 + negative SL` damage with armour ignored. Filters reduce intensity only when contaminants, rather than absent oxygen, are the cause.
- **Vacuum:** without sealed protection, make Hard (-20) Fortitude at the start of each turn. The first failure applies Major Fatigued. Later failures deal `5 + negative SL` damage with armour ignored. A Fumble also creates one torso Critical Wound. Speech and actions requiring breath are unavailable. Flames without their own oxidiser are removed.

Sealed protection or a suitable augmetic suppresses atmosphere effects while its air supply remains. This version records whether air is available but does not introduce a universal oxygen-consumption counter; equipment that already tracks charges or duration remains authoritative.

## Scheduling and automated resolution

The elected active GM watches `updateWorldTime`, `updateCombat`, Scene activation, token creation, and relevant actor updates. Each actor exposure stores the last resolved timestamp per hazard. At most one test is made when a large world-time jump crosses multiple intervals; that catch-up test has Disadvantage.

Combat-round hazards resolve at the defined turn boundary. Intensity 10 radiation is the sole environment that resolves at both start and end of turn.

Automated tests use impmal's own test model and script pipeline. They are rolled publicly unless the world's standard roll mode requires privacy. The result then applies conditions or damage through system APIs. A single chat card names the actor, source, effective intensity or temperature, protection, difficulty, roll result, and consequences.

If no active GM is connected, persistent automatic consequences pause. Test-dialog and derived-stat modifiers remain available locally because they are non-mutating. On GM return, the normal one-test catch-up rule applies.

## Biomonitor

The biomonitor is inserted immediately after the Influence partial on a character's Main tab. It is a character-sheet interface for everyone, not a benefit gated by owning an Internal Bio-monitor augmetic.

### Collapsed view

One compact strip shows health state, Wounds, Critical Wounds, dangerous conditions, Dose, effective temperature, G, atmosphere, and time until the next exposure test. Its status is Stable, Wounded, Severe, Critical, or Dead. Reduced-motion preference disables the scan and pulse animations.

### Expanded view

The left side is a six-zone body diagram matching impmal's hit locations. A zone changes presentation when it has damaged armour, an Injury, a Critical Wound, an amputation/severe effect, or an augmetic. Selecting a zone filters the detail lists.

The right side contains Wounds and Critical Wounds, active conditions, Injuries and Critical Wounds, environmental readings, augmetics, pending exposure timers, and a short log of recent environmental consequences. Clicking a document opens its normal sheet.

The biomonitor reads all ordinary health data from impmal. It does not store duplicate Wounds, Critical Wounds, conditions, injuries, armour, or augmetics.

### Augmetic placement and environmental capabilities

Augmetics are read from `actor.itemTypes.augmetic`. Placement priority is:

1. native augmetic slots;
2. an explicit location supplied by an effect;
3. a Navis location flag on module-authored content;
4. Internal Systems when no location is known.

Names are never used to guess placement. Visual categories include limbs, organs/internal systems, cranial systems, subdermal systems, frames/skeletal reinforcement, mechadendrites, and general systems.

Optional structured Navis flags express heat protection, cold protection, radiation protection, gravity compensation, sealing, breathing support, or immunity. These values are inert unless explicitly present. Existing Navis augmetics receive them only where their written rules unambiguously grant the capability.

## Permissions and controls

- Only a GM edits Scene environment.
- An actor owner may expand the biomonitor and open owned documents.
- Owners and GMs may request an exposure test manually; only the elected GM applies a scheduled mutation.
- Dose adjustment is available to owner and GM, requires a short reason, and posts the old and new values to chat.
- A GM may suppress automation for an individual actor with a flag. The current environment still displays on that actor's biomonitor.

## Compatibility and failure behaviour

- Missing Scene data resolves to safe defaults.
- Missing system APIs disable only the dependent automation and produce one console error, not repeated notifications.
- The environment editor and biomonitor remain readable with the Navis skin disabled.
- Scene changes and re-renders are idempotent; duplicate widgets, DOM blocks, modifiers, tests, and Active Effects are forbidden.
- Hordes and NPCs may receive scene test modifiers, but the biomonitor is character-only. Scheduled lasting exposure is character-only in the first release.
- Vehicles display environment in the widget but receive no derived gravity or biological exposure rules in the first release.

## Testing

Pure rule tests cover every boundary in the temperature, gravity, radiation, and atmosphere tables; protection stacking; large time jumps; dose thresholds; and weather composition.

Adapter tests cover:

- one modifier per test despite multiple render hooks;
- modifiers disappearing after Scene change;
- active-GM election and no double mutation;
- encounter start/end and start/end-turn scheduling;
- native condition, damage, armour-damage, and Critical Wound calls;
- effective encumbrance without mutating item encumbrance;
- augmetic placement priority;
- DOM insertion exactly once under Influence;
- widget refresh and permissions;
- no health-data duplication.

Manual Foundry verification covers two clients, Scene transitions, world-time jumps, combat timing, skin enabled/disabled, reduced motion, character ownership, and interaction with the existing Horde patches.

## Delivery order

Implementation proceeds in two reviewable stages:

1. Environment data, rules, GM editor, player widget, test modifiers, derived statistics, and scheduled consequences.
2. Biomonitor view model, body diagram, augmetic integration, exposure controls, and environmental log.

Both stages are part of this specification; the split controls implementation risk and review size rather than reducing scope.
