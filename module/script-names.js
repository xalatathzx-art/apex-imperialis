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

export function registerScriptNames() {
  Hooks.once("init", () => {
    // Nothing is renamed unless Babele is translating, so nothing needs widening.
    if (!game.modules.get("babele")?.active || game.i18n.lang !== "ru") return;

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

      let count = 0;
      const widened = text.replace(COMPARISON, (whole, receiver, optional, operator, name) => {
        count++;
        const chain = `${receiver}${optional ?? ""}`;
        const join = operator.startsWith("!") ? "&&" : "||";
        return `(${chain}.name ${operator} "${name}" ${join} ${chain}.flags?.babele?.originalName ${operator} "${name}")`;
      });

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
