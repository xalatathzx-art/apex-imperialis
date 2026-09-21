# Credits

## Imperium Maledictum

The system, and everything the content below plugs into, is by **Moxy**.

## Content

The talents, bestiary and scripted weapon traits were re-catalogued into a
folder taxonomy and repaired where the data disagreed with the system they run
on. Every repair is listed in [migration-report.md](migration-report.md), so
anything this module changed can be read back against what it started from.

One correction worth naming: `Accurate` was registered under a capitalised key,
and impmal looks these up by the weapon's lowercase trait key, so that script
had never once run.

## Artwork

All item and actor artwork paths point into **impmal-core**, which is a separate
paid module. Apex Imperialis ships no artwork of its own and shows blank icons
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
keep those descriptions and the rules engine in step. The implant classifier in
`module/implants/classify.js` is a port of that project's
`module/constants/body-map.mjs::classifyImplant` — the name-to-body-system
keyword map and its match order — reworked from a live lookup into an authoring
default that the item stores and the sheet can override. The surrounding interface, data model and Imperium Maledictum automation
are Apex Imperialis implementations.

## Type

The skin sets its type in **Barlow** and **Barlow Condensed** by Jeremy
Tribby, from the Barlow Project (<https://github.com/jpt/barlow>). The fonts
are bundled in `fonts/` under the SIL Open Font License 1.1; the licence text
is `fonts/OFL.txt`.
