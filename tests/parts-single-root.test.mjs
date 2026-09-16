import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/*
 * Regression guard for the bug that put "Surgeon window does not open" in
 * front of a live world: `templates/apps/surgeon.hbs` was a PART template
 * with two root elements (`<header>` and `<div>`), and ApplicationV2 refuses
 * to render a PART whose template does not produce exactly one root element.
 * `node tools/build.mjs`'s Handlebars precompile does not catch this — it
 * only checks the template compiles, not what it renders — so the failure
 * only ever surfaces live, inside `app.render()`.
 *
 * What this guard covers: every template below is a real PART template
 * declared by an ApplicationV2 sheet/app in this module (surgeon-app.js,
 * implants/sheet.js). For each, it asserts the file's first non-whitespace,
 * non-comment character opens exactly one HTML tag at the very start of the
 * file, and that this tag's matching closing tag is the last non-whitespace
 * content in the file — i.e. one root element wraps everything.
 *
 * What this guard does NOT cover: it is not a general single-root-element
 * parser. It does not understand a top-level `{{#if}}...{{else}}...{{/if}}`
 * that could produce a different root per branch, and it does not validate
 * anything about elements *inside* the root (nesting correctness, void
 * elements, etc. are left to the browser/Handlebars). It only proves that
 * *these specific templates*, as written today, start with one opening tag
 * and end with that same tag's closing tag. A future edit that wraps the
 * root in a Handlebars block, or adds any markup before/after the root
 * element, would not be caught unless it also broke this start/end shape.
 */

const PART_TEMPLATES = [
  "../templates/apps/surgeon.hbs",       // SurgeonWindow PARTS.body
  "../templates/item/implant.hbs",       // ImplantSheet PARTS.implant
  "../templates/item/implant-mechanics.hbs", // ImplantSheet PARTS.mechanics
  "../templates/apps/environment.hbs"    // EnvironmentApp PARTS.form (known-good precedent)
];

function stripHandlebarsComments(source) {
  return source.replace(/\{\{!--[\s\S]*?--\}\}/g, "").replace(/\{\{![\s\S]*?\}\}/g, "");
}

function assertSingleRoot(source, label) {
  const stripped = stripHandlebarsComments(source).trim();
  assert.ok(stripped.length > 0, `${label}: template is empty after stripping comments`);

  const openMatch = stripped.match(/^<([a-zA-Z][a-zA-Z0-9-]*)\b/);
  assert.ok(openMatch, `${label}: does not start with an opening HTML tag at the top`);
  const tagName = openMatch[1];

  const tagRe = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}>`, "g");
  let depth = 0;
  let match;
  let closeEndIndex = -1;
  while ((match = tagRe.exec(stripped))) {
    if (match[0].startsWith("</")) {
      depth--;
      if (depth === 0) {
        closeEndIndex = match.index + match[0].length;
        break;
      }
    } else {
      depth++;
    }
  }

  assert.ok(closeEndIndex !== -1, `${label}: no matching closing </${tagName}> found for the root tag`);

  const trailing = stripped.slice(closeEndIndex).trim();
  assert.equal(
    trailing, "",
    `${label}: content follows the root </${tagName}>, meaning the template renders more than one root element:\n${trailing.slice(0, 120)}`
  );
}

for (const relPath of PART_TEMPLATES) {
  test(`PART template has exactly one root element: ${relPath.replace("../", "")}`, () => {
    const source = fs.readFileSync(new URL(relPath, import.meta.url), "utf8");
    assertSingleRoot(source, relPath);
  });
}

test("the guard itself fails on a template with two root elements", () => {
  const twoRoots = `<header class="a"></header>\n<div class="b"></div>\n`;
  assert.throws(() => assertSingleRoot(twoRoots, "fixture"));
});

test("the guard passes once the two roots are wrapped in one container", () => {
  const wrapped = `<div class="wrap">\n<header class="a"></header>\n<div class="b"></div>\n</div>\n`;
  assert.doesNotThrow(() => assertSingleRoot(wrapped, "fixture"));
});
