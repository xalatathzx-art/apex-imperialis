import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { plainLine, truncateLine } from "../module/implants/sheet.js";
import { kindGroupsFor } from "../module/implants/mechanics/constructor.js";
import { ENTRY_KINDS } from "../module/implants/mechanics/targets.js";

/*
 * The compact Implant sheet folds its prose away, and a fold is only honest if
 * the collapsed row still says what is behind it. Everything here guards that
 * promise: the preview is real text and not markup, the ellipsis never eats a
 * string whole, no entry kind can fall out of the grouped picker, and every
 * string the folded rows print exists in both languages.
 */

const load = name => JSON.parse(fs.readFileSync(new URL(`../lang/${name}.json`, import.meta.url), "utf8"));
const RU = load("ru");
const EN = load("en");

test("a level note becomes one line of plain text", () => {
  const html = "<p>Дальность <strong>+10</strong> метров.</p>\n<p>Шум&nbsp;&mdash; помеха.</p>";
  assert.equal(plainLine(html), "Дальность +10 метров. Шум — помеха.");
});

test("the preview never carries markup through", () => {
  // An `<img>` or a stray attribute must not survive as a tag; a `<script>`
  // body must not survive as visible text either.
  assert.equal(plainLine('<img src="x.png"> a <script>alert(1)</script> b'), "a b");
  assert.ok(!plainLine("<div class='>'>text</div>").includes("<"));
});

test("empty prose reads as empty, so the row can say «как обычный» instead", () => {
  for (const blank of [undefined, null, "", "   ", "<p></p>", "<p>&nbsp;</p>"]) {
    assert.equal(plainLine(blank), "", `"${blank}" should be blank`);
  }
});

test("truncation only bites when it has to, and leaves an ellipsis when it does", () => {
  const short = "Дальность +10 метров.";
  assert.equal(truncateLine(short, 88), short);

  const long = "слово ".repeat(40).trim();
  const cut = truncateLine(long, 88);
  assert.ok(cut.length <= 89, `cut to ${cut.length}`);
  assert.ok(cut.endsWith("…"));
  assert.ok(long.startsWith(cut.slice(0, -1).trimEnd()));
});

test("one unbroken word longer than the limit is still cut, not returned whole", () => {
  const wall = "ф".repeat(200);
  const cut = truncateLine(wall, 20);
  assert.equal(cut.length, 21);
  assert.ok(cut.endsWith("…"));
});

test("the grouped kind picker offers every entry kind exactly once", () => {
  const offered = kindGroupsFor("skill").flatMap(group => group.options.map(o => o.value));
  assert.deepEqual([...offered].sort(), [...ENTRY_KINDS].sort());
  assert.equal(offered.length, new Set(offered).size, "a kind is listed twice");
});

test("the picker marks the entry's own kind, and only that one", () => {
  for (const kind of ENTRY_KINDS) {
    const selected = kindGroupsFor(kind)
      .flatMap(group => group.options)
      .filter(option => option.selected)
      .map(option => option.value);
    assert.deepEqual(selected, [kind]);
  }
});

test("every string the folded rows print is translated in both languages", () => {
  const keys = [
    "NAVIS.Implant.QualityAsOrdinary",
    "NAVIS.Implant.Mechanics.Kind",
    "NAVIS.Implant.Mechanics.Summary.Value",
    "NAVIS.Implant.Mechanics.Summary.Paren",
    "NAVIS.Implant.Mechanics.Summary.TestMod",
    "NAVIS.Implant.Mechanics.Summary.TestModAny",
    "NAVIS.Implant.Mechanics.Summary.Grant",
    "NAVIS.Implant.Mechanics.Summary.Empty",
    "NAVIS.Implant.Mechanics.Summary.None",
    ...kindGroupsFor("skill").map(group => group.label),
    ...ENTRY_KINDS.map(kind => `NAVIS.Implant.Kind.${kind}`)
  ];

  for (const key of keys) {
    assert.ok(key in RU, `ru.json is missing ${key}`);
    assert.ok(key in EN, `en.json is missing ${key}`);
    assert.ok(String(RU[key]).trim(), `ru.json has an empty ${key}`);
    assert.ok(String(EN[key]).trim(), `en.json has an empty ${key}`);
  }
});

test("the summary formats keep the placeholders their callers pass", () => {
  const required = {
    "NAVIS.Implant.Mechanics.Summary.Value": ["{what}", "{value}"],
    "NAVIS.Implant.Mechanics.Summary.Paren": ["{a}", "{b}"],
    "NAVIS.Implant.Mechanics.Summary.TestMod": ["{effect}", "{skill}"],
    "NAVIS.Implant.Mechanics.Summary.TestModAny": ["{effect}"],
    "NAVIS.Implant.Mechanics.Summary.Grant": ["{kind}", "{name}"]
  };

  for (const [key, tokens] of Object.entries(required)) {
    for (const lang of [["ru", RU], ["en", EN]]) {
      for (const token of tokens) {
        assert.ok(String(lang[1][key]).includes(token), `${lang[0]}.json ${key} lost ${token}`);
      }
    }
  }
});
