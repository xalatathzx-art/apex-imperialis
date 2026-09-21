import { locationForSlot } from "../implants/classify.js";

export const BODY_ZONES = Object.freeze([
  { key: "head", label: "Head" }, { key: "leftArm", label: "Left Arm" },
  { key: "rightArm", label: "Right Arm" }, { key: "body", label: "Body" },
  { key: "leftLeg", label: "Left Leg" }, { key: "rightLeg", label: "Right Leg" }
]);

// Абсолютный путь — как в warhammer-dbc (constants/body-map.mjs, bodyDir()).
// Относительный резолвится от base URL документа и зависит от route prefix.
const BODY_ASSET_ROOT = "/modules/apex-imperialis/assets/biomonitor";
export const BODY_SCAN_LAYERS = Object.freeze([
  { zone: "leftLeg", src: `${BODY_ASSET_ROOT}/left-leg.png` },
  { zone: "rightLeg", src: `${BODY_ASSET_ROOT}/right-leg.png` },
  { zone: "leftArm", src: `${BODY_ASSET_ROOT}/left-arm.png` },
  { zone: "rightArm", src: `${BODY_ASSET_ROOT}/right-arm.png` },
  { zone: "body", src: `${BODY_ASSET_ROOT}/body.png` },
  { zone: "head", src: `${BODY_ASSET_ROOT}/head.png` }
]);
export const BODY_ORGAN_LAYERS = Object.freeze([
  { key: "lungs", src: `${BODY_ASSET_ROOT}/lungs.png` },
  { key: "heart", src: `${BODY_ASSET_ROOT}/heart.png` },
  { key: "brain", src: `${BODY_ASSET_ROOT}/brain.png` }
]);

// Рисунок занимает не весь холст 1000x1600: замеренный по альфе общий bbox —
// x 5.8..94.2%, y 6.3..90%. Панель облегает именно его, а фигура выступает за
// панель ровно на поля холста, поэтому силуэт заполняет рамку без пустоты.
export const BODY_FIGURE_BOX = Object.freeze({ x0: 5.8, x1: 94.2, y0: 6.3, y1: 90 });

// Маска не обрезает хит-тест: слои лежат друг на друге во всю панель, и клик
// всегда достаётся верхнему. Кликабельные части тела — это отдельные зоны,
// посчитанные из bbox каждой маски и пересчитанные в координаты панели.
// Порядок = приоритет снизу вверх: на бедре выигрывает нога, на плече — рука.
const span = (x0, x1, y0, y1) => {
  const w = BODY_FIGURE_BOX.x1 - BODY_FIGURE_BOX.x0, h = BODY_FIGURE_BOX.y1 - BODY_FIGURE_BOX.y0;
  const to = (v, base, size) => +(((v - base) / size) * 100).toFixed(1);
  return { x0: to(x0, BODY_FIGURE_BOX.x0, w), x1: to(x1, BODY_FIGURE_BOX.x0, w),
           y0: to(y0, BODY_FIGURE_BOX.y0, h), y1: to(y1, BODY_FIGURE_BOX.y0, h) };
};
export const BODY_HIT_ZONES = Object.freeze([
  { zone: "body", ...span(37.0, 63.0, 18.8, 47.3) },
  { zone: "leftArm", ...span(5.8, 39.0, 20.0, 48.9) },
  { zone: "rightArm", ...span(61.0, 94.2, 20.0, 48.9) },
  { zone: "leftLeg", ...span(26.0, 49.2, 41.1, 90.0) },
  { zone: "rightLeg", ...span(50.6, 73.8, 41.1, 90.0) },
  { zone: "head", ...span(42.8, 57.2, 6.3, 19.0) }
]);

const known = new Set(BODY_ZONES.map(zone => zone.key));
function valid(value) { return known.has(value) ? value : null; }

export function augmeticLocation(item) {
  const native = valid(item?.system?.slot) || valid(item?.system?.location?.value);
  if (native) return native;
  for (const effect of item?.effects ?? []) {
    for (const change of effect.changes ?? []) {
      if (["system.location.value", "system.slot"].includes(change.key) && valid(change.value)) return change.value;
    }
  }
  return valid(item?.flags?.["apex-imperialis"]?.location) ?? "internal";
}

/**
 * Where a fitted implant shows on the figure.
 *
 * `system.location` wins when it names a real zone: the implant sheet lets an
 * author override the placement by hand, and that choice is not to be second
 * guessed. Otherwise the zone follows the stored slot and side — never the
 * name.
 */
export function implantLocation(item) {
  const chosen = valid(item?.system?.location);
  if (chosen) return chosen;
  return locationForSlot(item?.system?.slot, item?.system?.side);
}

/**
 * A stable colour per implant category, for display only.
 *
 * Categories are free text written by the content pipeline, so there is no
 * fixed table to colour from: the hue is hashed from the string instead. Two
 * implants of the same category always read the same, and a category nobody
 * anticipated still gets a colour of its own instead of falling back to the
 * same brass as everything else.
 */
export function implantTint(category) {
  const raw = String(category ?? "").trim();
  if (!raw) return "var(--navis-brass-dim, #806633)";

  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  return `hsl(${hash % 360} 58% 62%)`;
}
