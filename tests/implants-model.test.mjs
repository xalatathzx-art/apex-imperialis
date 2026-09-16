import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * model.js calls into `CONFIG.Item.dataModels` and `foundry.data.fields` at
 * module-evaluation time (inside `defineImplantModel`), so it cannot be
 * imported — let alone instantiated — outside a running Foundry client.
 * There is no way to build the actual DataModel here and ask it whether
 * `side: ""` validates.
 *
 * What IS testable without Foundry is the schema declaration itself, as
 * source text: that `side`'s `choices` list still includes the empty string
 * (the three-value constraint `classify.js` depends on is intact) and that
 * `blank: true` sits alongside it (so StringField's implicit `blank: false`
 * from having a `choices` list does not reject the very value `initial`
 * produces). This regression was invisible to every prior test because none
 * of them read the field options — they all called `classify.js` directly
 * with hand-written `side` strings, never through the schema that gates
 * document creation.
 */

const SOURCE = fs.readFileSync(new URL("../module/implants/model.js", import.meta.url), "utf8");

function fieldDeclaration(name) {
  const re = new RegExp(`schema\\.${name}\\s*=\\s*new fields\\.\\w+Field\\(([\\s\\S]*?)\\);`);
  const match = SOURCE.match(re);
  assert.ok(match, `schema.${name} declaration not found in model.js`);
  return match[1];
}

test("side keeps the three-value choices list, including the blank it initialises to", () => {
  const options = fieldDeclaration("side");
  assert.match(options, /choices:\s*\[\s*""\s*,\s*"left"\s*,\s*"right"\s*\]/,
    "side must still constrain to \"\", \"left\" or \"right\" — classify.js's locationForSlot depends on it");
  assert.match(options, /initial:\s*""/, "side's initial must stay the empty \"no side chosen\" state");
});

test("side's blank initial is legal against its own choices (the regression)", () => {
  const options = fieldDeclaration("side");
  // StringField treats a `choices` list as implying `blank: false` unless
  // told otherwise. Without `blank: true` here, `initial: ""` fails the
  // field's own validation — every generated implant emits side: "" and
  // createEmbeddedDocuments silently drops every one of them.
  assert.match(options, /blank:\s*true/,
    "side needs blank: true, or its own initial value (\"\") is invalid against its own choices");
});

test("every other field carrying `choices` has an initial value inside that list", () => {
  // slot: initial "other" must be one of SLOTS' keys, mirrored here as a
  // literal string check against the schema source (classify.js already has
  // its own tests proving SLOTS contains "other").
  const slotOptions = fieldDeclaration("slot");
  assert.match(slotOptions, /initial:\s*"other"/);
  assert.match(slotOptions, /SLOTS\.map\(s => s\.key\)/,
    "slot's choices are computed from SLOTS, so \"other\" is safe as long as classify.js lists it — see implants-classify.test.mjs");

  // Confirm no other field in the schema pairs `choices` with a `blank`-less
  // empty-string initial. If a future field adds `choices` and an `initial`
  // outside it (or a blank initial without blank: true), this test does not
  // catch the *new* field automatically — but it documents the trap so the
  // next person adding `choices` here knows to check both.
  const withChoices = [...SOURCE.matchAll(/schema\.(\w+)\s*=\s*new fields\.\w+Field\(([\s\S]*?)\);/g)]
    .filter(([, , options]) => /choices\s*:/.test(options));
  assert.deepEqual(withChoices.map(([, name]) => name).sort(), ["side", "slot"],
    "a new field with `choices` appeared — audit its initial against its own choices/blank the way side and slot are audited above");
});
