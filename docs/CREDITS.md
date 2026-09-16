# Credits

## Imperium Maledictum

The system, and everything the content below plugs into, is by **Moxy**.

## Maledictum Expanded

Every talent, weapon, NPC and scripted weapon trait shipped in version 0.1.0 of
Navis Apexialis comes from **Maledictum Expanded** by **Meins**
(<https://github.com/meins111/malexp_FoundryVTT>), imported from v1.4.0.

Navis Apexialis did not write this content. What it did was re-catalogue it into
a folder taxonomy, and repair the places where the data disagreed with the
system it runs on. The repairs are listed one by one in
[migration-report.md](migration-report.md), so anything this module changed can
be read back against the original.

The scripted weapon traits in `module/config/weapon-trait-effects.js` — Accurate,
Fast, Gauss, Grav, Phase and Tesla — are Meins' work and are kept verbatim, with
one correction: `Accurate` was registered under a capitalised key, and impmal
looks these up by the weapon's lowercase trait key, so those three scripts had
never once run.

## Artwork

All item and actor artwork paths point into **impmal-core**, which is a separate
paid module. Navis Apexialis ships no artwork of its own and shows blank icons
without it.

## Environment and biomonitor reference

The scene-environment workflow and medical readout were designed after studying
**warhammer-dbc** by Batonrain (<https://github.com/Batonrain/warhammer-dbc>),
released under the MIT License. The layered anatomy masks in
`assets/biomonitor/` are redistributed from that project; their license is in
`licenses/warhammer-dbc-MIT.txt`. The descriptive zone names shown in the
environment window — the heat and cold zones, the ten radiation levels and the
void locations — are adapted from that project's flavour text. Every mechanical
number beside them (Difficulty, test cadence, hazard thresholds) is ours and
follows Imperium Maledictum, not the warhammer-dbc corebook, and the window
describes what this module's own automation does;
`tests/environment-readout.test.mjs` and `tests/environment-explain.test.mjs`
keep those descriptions and the rules engine in step. The surrounding interface, data model and Imperium Maledictum automation
are Navis Apexialis implementations.

## Type

The skin sets its type in **Barlow** and **Barlow Condensed** by Jeremy
Tribby, from the Barlow Project (<https://github.com/jpt/barlow>). The fonts
are bundled in `fonts/` under the SIL Open Font License 1.1; the licence text
is `fonts/OFL.txt`.
