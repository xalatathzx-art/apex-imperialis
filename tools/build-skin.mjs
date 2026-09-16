/**
 * Build the Navis Apexialis skin stylesheet.
 *
 * Concatenates the hand-written layers in src/skin/*.css and generates the
 * impmal overrides from src/skin/mirrors.mjs, writing styles/navis-skin.css.
 *
 * Fails, and writes nothing, when:
 *   - a mirror names an impmal rule that no longer exists
 *   - an impmal themed rule that paints with a literal (colour, texture,
 *     gradient, glow, radius, animation, filter), or that points a component
 *     variable at one of impmal's bright tokens, is neither mirrored nor
 *     deliberately ignored — i.e. a new impmal release added one
 *   - the output does not parse, or still mentions impmal-theme
 *
 *   node tools/build-skin.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "./lib/postcss.mjs";
import { mirrors, ignored } from "../src/skin/mirrors.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMPMAL_CSS = "D:/Foundry/DoomCrusade/Data/systems/impmal/impmal.css";
const OUT = path.join(ROOT, "styles/navis-skin.css");

const THEME = "body.impmal-theme";
const OURS = "body.navis-skin";

/** Literal paint that impmal's tokens cannot reach. */
const LITERAL = /(#[0-9a-fA-F]{3,8}\b|rgba?\(|url\(|gradient\(|box-shadow|text-shadow|border-radius|\bwhite\b|\bblack\b|darkred|animation|filter)/;

/**
 * Component variables impmal points at its bright tokens. These DO follow the
 * token remap, which is exactly the danger: a hover background or slot fill set
 * from --impmal-lightgreen becomes a solid rust-bright flood, a shape the skin
 * never uses and a contrast failure for any text on it. So they need a decision
 * too, same as a literal.
 */
const BRIGHT_VAR = /var\(--impmal-(lightgreen|darkgreen|orange)\)/;

/**
 * Text impmal colours with its DARK tokens. Teal text read on parchment; with
 * darkblue and lightblue remapped onto the skin's dark scale, it sinks into
 * the page. Found the hard way — journal headings went invisible.
 */
const TEXT_PROPS = /^(color|-webkit-text-fill-color|fill|caret-color|--color-text[\w-]*)$/;
const DARK_VAR = /var\(--impmal-(darkblue|lightblue|darkgreen)\)/;

const normalise = selector => selector.replace(/\s+/g, " ").trim();

/** impmal's selector, minus its theme prefix — the key a mirror names. */
function tailOf(selector) {
  return normalise(selector)
    .replace(/^body\.impmal-theme\s+body\s+/, "")   // impmal's own dead "body body" variant
    .replace(/^body\.impmal-theme\s+/, "");
}

/**
 * impmal's selector, re-prefixed with ours.
 *
 * impmal writes its chat-popout variants as `body.impmal-theme body #chat-popout`,
 * a body inside a body, which never matches anything. We emit the variant it
 * clearly meant, so the popped-out chat gets the same treatment as the docked one.
 */
function rewrite(selector) {
  const s = normalise(selector);
  if (s.startsWith(`${THEME} body `)) return `${OURS} ${s.slice(`${THEME} body `.length)}`;
  if (s.startsWith(`${THEME} `)) return `${OURS} ${s.slice(THEME.length + 1)}`;
  throw new Error(`Unexpected themed selector shape: ${s}`);
}

// ── Index impmal's themed rules by every tail they carry ────────────────────

const impmal = postcss.parse(fs.readFileSync(IMPMAL_CSS, "utf8"), { from: IMPMAL_CSS });
const byTail = new Map();
const literalRules = [];

impmal.walkRules(rule => {
  if (rule.parent.type === "atrule" && /keyframes/i.test(rule.parent.name)) return;
  if (!rule.selector.includes("impmal-theme")) return;

  const themed = rule.selectors.filter(s => normalise(s).startsWith(THEME));
  if (!themed.length) return;

  for (const selector of themed) {
    const tail = tailOf(selector);
    if (!byTail.has(tail)) byTail.set(tail, []);
    byTail.get(tail).push(rule);
  }

  let literal = false;
  rule.walkDecls(decl => {
    if (LITERAL.test(`${decl.prop}: ${decl.value}`)) literal = true;
    if (decl.prop.startsWith("--") && BRIGHT_VAR.test(decl.value)) literal = true;
    if (TEXT_PROPS.test(decl.prop) && DARK_VAR.test(decl.value)) literal = true;
  });
  if (literal) literalRules.push(rule);
});

// ── Generate the mirrored rules ─────────────────────────────────────────────

const problems = [];
const generated = [];
const coveredRules = new Set();

for (const mirror of mirrors) {
  const rules = byTail.get(mirror.tail);
  if (!rules) {
    problems.push(`mirror names a rule impmal does not have: ${mirror.tail}`);
    continue;
  }

  const selectors = new Set();
  for (const rule of rules) {
    coveredRules.add(rule);
    for (const s of rule.selectors) if (normalise(s).startsWith(THEME)) selectors.add(rewrite(s));
  }

  const body = Object.entries(mirror.decls).map(([prop, value]) => `  ${prop}: ${value};`).join("\n");
  generated.push(`/* ${mirror.why} */\n${[...selectors].join(",\n")} {\n${body}\n}`);
}

for (const entry of ignored) {
  const rules = byTail.get(entry.tail);
  if (!rules) {
    problems.push(`ignore list names a rule impmal does not have: ${entry.tail}`);
    continue;
  }
  rules.forEach(rule => coveredRules.add(rule));
}

// ── Audit: every literal-painting impmal rule has had a decision ────────────

const unreviewed = literalRules.filter(rule => !coveredRules.has(rule));
for (const rule of unreviewed) {
  const tail = tailOf(rule.selectors.at(-1));
  problems.push(`impmal rule at impmal.css:${rule.source.start.line} paints with a literal and has no decision: ${tail}`);
}

if (problems.length) {
  console.error(`Skin build FAILED — ${problems.length} problem(s):\n`);
  problems.forEach(p => console.error(`  - ${p}`));
  process.exit(1);
}

// ── Assemble ────────────────────────────────────────────────────────────────

const layer = name => fs.readFileSync(path.join(ROOT, "src/skin", name), "utf8").trim();

const output = [
  "/* ══════════════════════════════════════════════════════════════════════════",
  "   GENERATED by tools/build-skin.mjs — do not edit.",
  "   Edit src/skin/*.css and src/skin/mirrors.mjs, then rebuild.",
  "",
  "   Declared as a bare string in module.json \"styles\": Foundry's server puts",
  "   it in layer(modules), above impmal.css and warhammer-lib in layer(system).",
  "   ══════════════════════════════════════════════════════════════════════ */",
  "",
  layer("05-fonts.css"),
  "",
  layer("00-tokens.css"),
  "",
  layer("10-foundry.css"),
  "",
  layer("20-impmal-core.css"),
  "",
  "/* ══════════════════════════════════════════════════════════════════════════",
  "   50 IMPMAL MIRRORS — generated from src/skin/mirrors.mjs.",
  "   Each rule carries impmal's exact selector list with body.impmal-theme",
  "   swapped for body.navis-skin: identical specificity, later in the cascade.",
  "   ══════════════════════════════════════════════════════════════════════ */",
  "",
  generated.join("\n\n"),
  "",
  layer("60-impmal-extras.css"),
  "",
  layer("70-refit.css"),
  "",
  layer("72-character.css"),
  "",
  layer("73-item.css"),
  "",
  layer("74-species.css"),
  "",
  layer("75-dialog-warp.css"),
  "",
  layer("76-i18n.css"),
  "",
  layer("77-chargen.css"),
  "",
  layer("78-horde.css"),
  "",
  layer("79-environment.css"),
  "",
  layer("80-biomonitor.css"),
  "",
  layer("82-vehicle.css"),
  ""
].join("\n");

// ── Validate before writing ─────────────────────────────────────────────────

const parsed = postcss.parse(output, { from: OUT });

let ruleCount = 0;
const ungated = [];
parsed.walkRules(rule => {
  if (rule.parent.type === "atrule" && /keyframes/i.test(rule.parent.name)) return;
  ruleCount++;
  for (const s of rule.selectors) {
    if (s.includes("impmal-theme")) throw new Error(`Output selector still hangs on impmal's theme class: ${s}`);
    if (!s.includes("navis-skin")) ungated.push(s);
  }
});
if (ungated.length) {
  throw new Error(`Every rule must be gated on body.navis-skin. Ungated:\n  ${ungated.join("\n  ")}`);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, output);

const decided = literalRules.length;
const mirroredRules = literalRules.filter(r => coveredRules.has(r)).length;
console.log(`impmal themed rules painting with literals: ${decided}, all with a decision (${mirroredRules} covered)`);
console.log(`mirrors: ${mirrors.length}, ignored with a reason: ${ignored.length}`);
console.log(`output: ${path.relative(ROOT, OUT)} — ${ruleCount} rules, ${(output.length / 1024).toFixed(1)} KB, parses cleanly, every rule gated on body.navis-skin`);
