/**
 * Let impmal's effect scripts keep finding an item after it has been renamed.
 *
 * impmal runs its talent and trait mechanics as 634 scripts in
 * `game.impmal.config.effectScripts`. Fifty-seven comparisons inside them
 * locate their subject by its English name:
 *
 *   return args.skillItem?.name == "Composure"
 *   return args.skillItem?.name != "Intimidation"
 *
 * Translate that specialisation and the script stops finding it. Nothing
 * throws — the talent simply never fires, which is the worst kind of bug at a
 * table: the sheet looks right and the number is wrong.
 *
 * Babele keeps the English on the translated document, at
 * `flags.babele.originalName`. So each comparison is widened to accept either
 * name. An `==` becomes "this one or the English one"; a `!=` becomes "neither
 * this one nor the English one", which is the same inversion and keeps the
 * meaning exact. Where Babele is not involved the extra term reads `undefined`
 * and the original comparison decides, unchanged.
 *
 * The rewrite is narrow on purpose: one regex, one shape of expression, every
 * result parsed before it is accepted, and a hard count — if the number of
 * rewrites is not the number of matches, nothing is installed. We are editing
 * someone else's rules code in memory, so it either does exactly what it says
 * or it does nothing.
 */

const MODULE_ID = "navis-apexialis";

/**
 * `receiver[?].name <op> "literal"`.
 *
 * The receiver is a plain dotted path — every one impmal uses is `i`, `spec` or
 * `args.skillItem`. The optional `?` is captured separately so it can be put
 * back in front of the flag lookup, keeping the short-circuit on an undefined
 * receiver.
 */
const COMPARISON = /([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)(\?)?\.name\s*(===|!==|==|!=)\s*"([^"\\$]+)"/g;

/** Build an AsyncFunction to check that a rewritten script still parses. */
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/**
 * Widen every name comparison in one script's text.
 *
 * Returns `{ text, count }` — the rewritten source and how many comparisons it
 * changed — or `null` when the script has none. Throws nothing: whether the
 * result still parses is the caller's question, because the two callers answer
 * it differently.
 */
export function widenNames(source) {
  const text = String(source);
  if (!text.match(COMPARISON)) return null;
  let count = 0;
  const widened = text.replace(COMPARISON, (whole, receiver, optional, operator, name) => {
    count++;
    const chain = `${receiver}${optional ?? ""}`;
    const join = operator.startsWith("!") ? "&&" : "||";
    return `(${chain}.name ${operator} "${name}" ${join} ${chain}.flags?.babele?.originalName ${operator} "${name}")`;
  });
  return { text: widened, count };
}

/** Whether a script body compiles, as either kind of function it may run as. */
function parses(text) {
  try { new AsyncFunction("args", text); return true; } catch { /* try sync */ }
  try { new Function("args", text); return true; } catch { return false; }
}

/**
 * The same widening for scripts that live on documents, not in impmal's table.
 *
 * `effectScripts` holds the system's shared scripts, but a script can also sit
 * inline on an item: a talent's `system.requirement.script` ("does the actor
 * already own Talented (Athletics)?"), or an effect's own script text. Those
 * reach warhammer-lib's WarhammerScript directly, and every one of them passes
 * through `_handleScriptId` before it is compiled — the method that swaps a
 * `[Script.id]` reference for the shared text. Wrapping it widens the inline
 * text at the one place all of it flows through, including copies already
 * sitting on actors in a world, which no fix to our packs could reach.
 *
 * Text that resolved to a shared script is left alone: that table was widened
 * above, and widening twice would nest the comparison inside itself. A script
 * that would not parse after widening runs unchanged. Results are cached by
 * source text, since the same requirement runs every time a talent is added.
 */
function widenInlineScripts() {
  const Script = globalThis.warhammer?.apps?.WarhammerScript;
  const original = Script?.prototype?._handleScriptId;
  if (typeof original !== "function" || original.navisWidened) return false;

  const cache = new Map();
  const wrapped = function (string) {
    const resolved = original.call(this, string);
    if (resolved !== string || typeof string !== "string") return resolved;
    if (!cache.has(string)) {
      const widened = widenNames(string);
      cache.set(string, widened && parses(widened.text) ? widened.text : string);
    }
    return cache.get(string);
  };
  wrapped.navisWidened = true;
  Script.prototype._handleScriptId = wrapped;
  return true;
}

export function registerScriptNames() {
  // On `i18nInit` rather than `init`, and only for the language check: at `init`
  // `game.i18n.lang` is still the server's default — Foundry loads the client's
  // own language between the two hooks — so an English-default server would read
  // "en" for a Russian client and leave every script comparing English names
  // against Babele's Russian ones. impmal has filled `effectScripts` by `init`,
  // so nothing is lost by waiting, and nothing runs a script this early.
  Hooks.once("i18nInit", () => {
    // Nothing is renamed unless Babele is translating, so nothing needs widening.
    if (!game.modules.get("babele")?.active || game.i18n.lang !== "ru") return;

    if (widenInlineScripts()) {
      console.log(`${MODULE_ID} | inline document scripts will compare names in both languages`);
    } else {
      console.error(`${MODULE_ID} | warhammer-lib's WarhammerScript not found; inline scripts keep English-only name checks`);
    }

    const scripts = game.impmal?.config?.effectScripts;
    if (!scripts) return;

    let expected = 0;
    let rewritten = 0;
    const rejected = [];
    const patched = {};

    for (const [id, source] of Object.entries(scripts)) {
      const text = String(source);
      const matches = text.match(COMPARISON);
      if (!matches) continue;

      expected += matches.length;

      const { text: widened, count } = widenNames(text);

      try {
        new AsyncFunction("args", widened);
      } catch (error) {
        rejected.push({ id, error: error.message });
        continue;
      }

      patched[id] = widened;
      rewritten += count;
    }

    if (rejected.length || rewritten !== expected) {
      console.error(
        `${MODULE_ID} | effect-script name widening abandoned: ${rewritten} of ${expected} comparisons, ` +
        `${rejected.length} script(s) would not parse.`,
        rejected
      );

      // The names are already translated by the time this runs, so failing
      // quietly would leave a table with talents that do nothing and no sign of
      // it. Say so where it cannot be missed.
      Hooks.once("ready", () => {
        ui.notifications.error(
          "Navis Apexialis: не удалось адаптировать скрипты эффектов impmal к переведённым названиям. " +
          "Часть талантов может не срабатывать. Отключите русский перевод компендиумов или сообщите об ошибке.",
          { permanent: true }
        );
      });
      return;
    }

    Object.assign(scripts, patched);
    console.log(
      `${MODULE_ID} | widened ${rewritten} name comparisons across ${Object.keys(patched).length} effect scripts, ` +
      `so translated items are still found by the code that looks for them`
    );
  });
}
