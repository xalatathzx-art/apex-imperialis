# Apex Imperialis

A global content module for **Imperium Maledictum**: playable species, expanded
talents, a xenos and heretic bestiary, the mechanics behind them, and a skin for
the whole interface.

Its talents and bestiary are re-catalogued and repaired against the system's
own data. See [docs/CREDITS.md](docs/CREDITS.md).

## Installing

Requires Foundry v13 and the `impmal` system (3.1.0 or later). Artwork comes
from `impmal-core`; without it every icon falls back to blank.

**Disable `impmal-malexp` when you enable this.** The two ship the same talents
and NPCs under different ids, so running both means each of them appears twice.
The module says so on load if it finds malexp active.

**One shelf in the sidebar.** Paste [docs/organise-compendiums.js](docs/organise-compendiums.js)
into the console as GM and every Imperium Maledictum compendium — this module's
and Cubicle 7's — is filed under one folder, a shelf per book. It copies
nothing: a compendium folder is a world-level label, so the books stay their own
modules and keep updating.

## What is in it

| Compendium | Contents |
| --- | --- |
| Species | 10 species and 10 subspecies, with the 46 traits and 5 items they grant |
| Talents | 221 talents across six colour-coded branches |
| Bestiary | 115 NPCs, filed by grand faction |

The module also registers, on `init`: the Species and Subspecies item types, the Nurglite Powers
discipline, the Master and Overseer NPC roles, 40 weapon and armour traits, and
six of those traits as scripted effects.

## Species

impmal prints Species on the character header as a text box, so a race is a word
and nothing else. This module adds **two item types, Species and Subspecies** —
through Foundry's own `documentTypes`, so the system is untouched — and turns
that box into a slot that behaves like Origin, Faction and Role, with a
Subspecies slot beside it.

They are separate types rather than one with a flag, because they are not the
same thing. A Species stands alone, states the characteristic ceilings and sets
the size. A Subspecies only ever attaches to one named species; it has no
ceilings at all, and moves the size only where it says so — so those fields are
absent from its sheet rather than sitting there empty.

Drag a species out of the compendium onto a character sheet and it pins itself
into the Species slot; drag a subspecies on top and it takes the cell next to it.
A subspecies refuses to attach without its own species, and removing a species
takes its subspecies with it.

Drop a species on a character and it applies the whole package: characteristic
modifiers on the starting values, starting skill advances, size, any starting
Corruption, and the traits, talents and equipment the race grants. Anything the
book leaves to the player is asked once, in a dialog, at the moment of the drop.
What was applied is recorded on the species item, so removing it can put the
character back — after asking, because by then XP may have been spent on top.

Wounds, critical wounds and armour ride on the species item as Active Effects
rather than as fields, so they are visible where every other modifier lives and
they leave with the item.

The content is the **DoomBC** roster converted to impmal's scale rather than
copied. DoomBC starts every character at 25 in everything and climbs with
Unnatural (X) traits that add straight to the characteristic *bonus*, where
impmal treats a bonus of 5 as a strong human. So a species carries the
difference from a human in steps of five, with the Unnatural rating folded into
that difference instead of stacked on top, and FFG wound bonuses divided by four
to land on impmal's 9-14 scale. Infamy, the Chaos patronage economy and Fast
Learner's XP percentages have no impmal equivalent and are dropped, which each
species says in its own description.

Two species are marked **restricted**: Space Marine and Pariah. The mark warns
and nothing more — it never blocks a drop. The Astartes entry ships with its
power armour, and says plainly in its description what that does to encounter
design: AP 10 against flak's 4 means a lasgun hit deals it no damage at all.

**Ceilings.** impmal caps a human at 60 "unless stated" (core rules p.51), so
every species states it: 60 across the board, and a different figure where the
race earns one — Ogryn Intelligence 40, Ratling Strength 40 and Ballistic Skill
70, Space Marine 80 throughout. DoomBC sets no ceilings of its own, so each of
those exceptions is marked in the species description as this module's rule
rather than the book's. Nothing in impmal enforces a maximum; they are a figure
the sheet shows the GM.

**Subspecies carry rules, not numbers.** DoomBC gives the human subspecies no
characteristic modifiers at all — a Pariah is its untouchable aura, an Afriel is
its engineered talent and its cursed luck — so that is what they are here too.
The four Beastman subspecies get the +5 and +5 the book prints, and nothing more.
A subspecies can also take a trait away: a Tzaangor loses the Beastman horns and
its aversion to order, and gets them back if the subspecies is removed.

**On balance.** Measured as the sum of characteristic modifiers, a Human is +5
(its free choice). Ogryn and Beastman come out at exactly +5 too — they trade,
they do not gain — and Ratling, Harpy, Pariah and the Nurgle and Slaanesh
subspecies land at or below it. The penalties are what make that true, and they
are close to permanent: a characteristic advance is +1 on a rising XP ladder, so
buying back an Ogryn's −15 Intelligence costs more XP than the whole of
character creation awards. Space Marine is the deliberate exception at +65.

## Russian

The module carries a full Russian translation of the interface — all 883 strings
impmal and warhammer-lib define, plus its own. Foundry merges translations in the
order core → system → modules → world, so the file overrides the system without a
single change to it: pick Русский in Foundry's language setting and the sheets,
dialogs and chat cards come up translated.

It is matched against the Russian edition of the core rulebook rather than
translated from the English keys, because the table reads that book. The
terminology, and the three places where a literal translation would be wrong,
are in [docs/rules/ru-glossary.md](docs/rules/ru-glossary.md) — the sharpest is
that English *Challenging* (+0) is «Средняя», not «Сложная», which is *Hard*
(−20).

`lang/ru.json` is generated: edit `src/lang/ru.mjs`, then run
`node tools/build-lang.mjs`. The build refuses to write a file that translates a
key impmal does not define, so a key the system renames fails loudly instead of
silently reverting to English, and it reports what is still untranslated.

**If another Russian translation is installed** — `ru-ru` and the like — it very
likely wins, because Foundry merges module translations in module order and that
order is decided by the install. Its vocabulary is not this one's: it reads the
difficulty ladder as cognates, which swaps Challenging (+0) and Hard (−20)
against the printed book, and renames Wounds, Presence, Fellowship and Rapport.
So the module re-applies its own strings afterwards, and the setting **«Терминология
по книге»** turns that off for anyone who prefers the other words.

Two pieces of Foundry's order make that fiddly, and `module/terminology.js`
documents both: `init` fires *before* translations load, so the merge waits for
`i18nInit`; and impmal bakes its own config — characteristics, skills,
difficulties — during `i18nInit` from a classic script, which always runs before
a module's, so the config is snapshotted at `init` while it still holds keys and
rebuilt after the merge.

**The character generator** is impmal's own wizard and is still an
ApplicationV1, which is why it arrives unpainted: every rule in this skin, and
in impmal's theme, targets `.application`, and a V1 window is `.window-app`. It
also comes up light while the rest of the table is dark. `77-chargen.css` paints
both its windows and gives the summary a shape — stages down the left, what the
character has become down the right — and `refitChargen` marks which stages are
done and which are still waiting on an earlier one, which impmal signals only by
refusing the click.

Four of its strings could not be reached by a translation file at all. Two are
passed to `localize` as literal English sentences with no key behind them, and
are translated by defining the sentence itself as the key. The other two —
"Allocate N Advances to the following Skills" and "Choose Equipment" — are
written into the templates as plain text and never localized, so `refitChargenStage`
replaces them in the DOM, reading the count back out of the sentence.

Its @UUID chips needed repainting too: Foundry draws them on a light grey for
parchment, and the wizard is full of them — every piece of starting gear a
faction lists is one.

This covers the interface only. Compendium documents — the names and text of
items, NPCs and journals, and this module's own species — are documents rather
than strings, and translating those needs Babele.

## The skin

Plate, brass and rust, after Dark Heresy 2e: near-black surfaces ordered by
depth, brass for structure, one rust accent for anything that can be pressed,
and corners cut on the diagonal like armour. It covers character, NPC and item
sheets, every window and dialog, journals, the chat log and its test cards, the
sidebar, hotbar, context menu, tooltips and notifications.

It is on by default. Each player can switch it off under
**Configure Settings → Apex Imperialis skin**; the setting is per-client, so one
player's choice never repaints the table for anyone else. It works whether or
not impmal's own theme is enabled.

Roll cards in chat are laid out as readouts: the SL on a plate, roll and target
on a 0–100 track, and the tier (marginal, impressive, astounding) as pips — green
on a pass, red on a fail, where impmal draws both in the same green. NPC sheets
get a stat-block Main tab: vitals in one row with a wounds meter, the actions
grouped into Attack / Defend / Other, skills as a two-column roll board, attacks
in columns, and each trait on its own plate. The roll dialog's advantage /
normal / disadvantage choice is a three-plate switch coloured by meaning, and
the warp charge bar is the one animated thing on the sheet: it drifts, surges
to a new value when the charge changes, runs hotter past the threshold, and
tears red when Perils are owed. It stops for reduced motion.

Type is Barlow and Barlow Condensed, shipped in `fonts/` (SIL Open Font License),
so the sheet looks the same on every OS. Text runs on a warm bone ladder instead
of white. Novarese, from impmal-core, is kept for the actor's name.

Turning the skin on or off reloads the client: the refit restructures sheets and
cards as they render, and that structure needs its stylesheet.

### How it attaches

`styles/apex-skin.css` is generated — edit `src/skin/`, then run
`node tools/build-skin.mjs`.

| Source | What it holds |
| --- | --- |
| `00-tokens.css` | the palette, and the reassignment of impmal's own colour tokens |
| `10-foundry.css` | Foundry surfaces impmal never themes: controls, directories, hotbar |
| `20-impmal-core.css` | the textures impmal-core adds on top of the system |
| `mirrors.mjs` | overrides for impmal's themed rules, by name |
| `05-fonts.css` | `@font-face` for the bundled Barlow files |
| `60-impmal-extras.css` | component variables, bevel nesting, the outcome colours |
| `70-refit.css` | roll-card readouts and the NPC stat block |
| `72-character.css` | the player sheet: header, Main (characteristics with advancement, resource tiles, patron, experience, influence scale) and Combat (readiness, armament, body map, wounds) |
| `73-item.css` | item sheets: height capped to the screen (the window itself follows its content), empty notes sections collapsed |
| `74-species.css` | the Species item sheet, and the species slot and card on the character sheet |
| `75-dialog-warp.css` | the roll dialog's state switch and the warp charge bar |
| `76-i18n.css` | room for Russian: the five places English measurements overflowed |
| `77-chargen.css` | the character generator, which is still an ApplicationV1 and so misses every `.application` rule |

The refit's DOM passes live in `module/refit.js` and, for the player sheet,
`module/refit-character.js`: plain functions over rendered
markup, run from `renderChatMessageHTML` and `renderActorSheetV2`. They move
impmal's own nodes into wrappers and add labels; they never replace a template,
and each pass marks what it touched so a re-render never applies it twice.

Two constraints hold the whole thing up, and both are easy to break:

- **The stylesheet must not be put in a layer below `modules`.** It is a bare
  string in module.json's `styles`, and Foundry's server assigns module styles
  without a layer to `layer(modules)` and system styles to `layer(system)`. That
  puts the skin above impmal.css and warhammer-lib outright. Declaring it in
  `system` or any earlier layer would hand the win back to impmal.
- **impmal overrides must use impmal's exact selectors.** Its lists repeat
  three times and some carry two ids; a shorter selector loses on specificity
  even though it loads later. `mirrors.mjs` names each rule and the build copies
  impmal's selector list verbatim, swapping only the theme prefix.

The build refuses to write the stylesheet when a mirror names a rule impmal no
longer has, or when impmal paints with a literal colour, texture or glow — or
with a token that would flood solid rust, or sink text into the page — and
nobody has decided what to do about it. After an impmal update, a failed build
is the list of what changed.

## Working on it

Content lives in `src/packs/` as one JSON file per document. **The directory a
file sits in is its folder in the compendium** — move the file, and the entry
moves. The packs under `packs/` are build output and are never edited by hand.

```
node tools/build.mjs           # src/packs/ -> packs/    (run after any edit)
node tools/verify.mjs          # packs/ vs upstream malexp, document by document
node tools/check-content.mjs   # traits registered, artwork present, enums valid
node tools/extract.mjs         # re-import from upstream; OVERWRITES src/packs/
node tools/build-skin.mjs      # src/skin/ -> styles/apex-skin.css
node tools/build-lang.mjs      # src/lang/ru.mjs -> lang/ru.json, with coverage
node tools/make-species.mjs    # regenerate src/packs/species/ from the conversion table
node tools/check-species.mjs   # every species reference resolves, every key is impmal's
```

Foundry must be closed for anything that touches a pack: it holds a lock on the
LevelDB directory while it runs.

The folder trees, including colours and sort order, are declared in
`src/taxonomy/*.json`. Changing one and re-running `extract.mjs` re-files
everything; nothing has to be moved by hand.

### Layout

```
module/          runtime code loaded by Foundry
  config/        system config this module extends
  skin.js        the skin setting and the render hooks
  refit.js       DOM passes for roll cards and NPC sheets
  refit-character.js  DOM passes for the player character sheet
  species/       the Species item type: data model, sheet, registration
templates/       Handlebars for the sheets this module adds
lang/            strings for those sheets
src/
  packs/         content, one JSON per document, foldered as it appears in game
  taxonomy/      folder trees: names, colours, sort order, routing rules
  skin/          skin sources
tools/           extract / build / verify / check scripts
packs/           build output — LevelDB, do not edit
styles/          build output — the skin stylesheet, do not edit
fonts/           Barlow and Barlow Condensed, with OFL.txt
docs/            migration report and credits
```

## Repairs

The import is not a copy. 382 changes were applied to the source data, each one
entailed either by the impmal system's own enums or by an identically-named item
in the official impmal-core compendium. Another 615 findings were judgement
calls and were deliberately left alone.

Both lists are in [docs/migration-report.md](docs/migration-report.md), item by
item, with the reasoning. `tools/verify.mjs` reads the machine-readable twin of
that report and fails if the built packs differ from upstream in any way the
report does not account for.
