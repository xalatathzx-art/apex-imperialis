import { byName as RUSSIAN_SPECIALISATIONS } from "../src/compendium/impmal-core.items.specialisations.mjs";

export function normaliseSkillSearch(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ");
}

export function levenshteinDistance(left, right) {
  if (left === right) return 0;
  if (!left) return right.length;
  if (!right) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_value, index) => index);
  for (let row = 1; row <= left.length; row++) {
    const current = [row];
    for (let column = 1; column <= right.length; column++) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[right.length];
}

function typoTolerance(word) {
  if (word.length >= 9) return 2;
  if (word.length >= 5) return 1;
  return 0;
}

/** Whether a skill row should remain visible for the typed query. */
export function matchesSkillSearch(query, labels = []) {
  const needle = normaliseSkillSearch(query);
  if (!needle) return true;

  let haystack = normaliseSkillSearch(labels.join(" "));
  for (const [english, data] of Object.entries(RUSSIAN_SPECIALISATIONS)) {
    if (haystack.includes(normaliseSkillSearch(data.name))) haystack += ` ${normaliseSkillSearch(english)}`;
  }
  if (haystack.includes(needle)) return true;

  // Fuzzy matching is deliberately word-only: it corrects a typo such as
  // "уклонене", but never makes a two-letter query match half the sheet.
  if (needle.includes(" ") || !typoTolerance(needle)) return false;
  return haystack
    .split(/[^\p{L}\p{N}]+/u)
    .some(word => levenshteinDistance(needle, word) <= typoTolerance(needle));
}
