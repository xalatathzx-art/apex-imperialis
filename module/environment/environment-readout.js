/**
 * Подписи и цвета для показаний среды.
 *
 * Только описание: ни сложностей, ни частот проверок, ни последствий — вся
 * автоматизация удалена, окружение сцены задаётся ГМом вручную и ничего не
 * бросает само. Названия зон адаптированы из warhammer-dbc, см. docs/CREDITS.md.
 */

const HEAT_ZONES = [
  { min: 61, zone: "heat4", tone: "#ff4d3a" },
  { min: 51, zone: "heat3", tone: "#ff7a3a" },
  { min: 41, zone: "heat2", tone: "#ff9a4a" },
  { min: 31, zone: "heat1", tone: "#ffcf5a" }
];
const COLD_ZONES = [
  { max: -31, zone: "cold4", tone: "#a0d8ff" },
  { max: -11, zone: "cold3", tone: "#7fc8ff" },
  { max: 0, zone: "cold2", tone: "#5ac8ff" },
  { max: 9, zone: "cold1", tone: "#7fe0e0" }
];

export function temperatureReadout(value) {
  const celsius = Number(value) || 0;
  const hot = HEAT_ZONES.find(row => celsius >= row.min);
  const cold = COLD_ZONES.find(row => celsius <= row.max);
  const zone = hot ?? cold;
  return {
    value: celsius,
    kind: !zone ? "comfort" : hot ? "heat" : "cold",
    labelKey: `NAVIS.Environment.Zone.${zone?.zone ?? "comfort"}`,
    tone: zone?.tone ?? "#8fe0b0",
    idle: !zone
  };
}

export function radiationReadout(value) {
  const level = Math.max(0, Math.min(10, Math.round(Number(value) || 0)));
  return {
    level,
    labelKey: level ? `NAVIS.Environment.Zone.rad${level}` : "NAVIS.Environment.Zone.radNone",
    tone: level >= 9 ? "#ff3a3a" : level >= 7 ? "#ff7a2a" : level >= 5 ? "#ffd23a" : level >= 1 ? "#b6e04a" : "#8fe0b0",
    idle: level === 0
  };
}

export function gravityReadout(value) {
  const g = Math.max(0, Number(value) || 0);
  if (g <= 0) return { value: 0, kind: "zero", labelKey: "NAVIS.Environment.Zone.gravZero", tone: "#b477ff", idle: false };
  if (g < 1) return { value: g, kind: "low", labelKey: "NAVIS.Environment.Zone.gravLow", tone: "#7fd0ff", idle: false };
  if (g > 1) return { value: g, kind: "high", labelKey: "NAVIS.Environment.Zone.gravHigh", tone: "#ff9a6a", idle: false };
  return { value: 1, kind: "norm", labelKey: "NAVIS.Environment.Zone.gravNorm", tone: "#8fe0b0", idle: true };
}

export function atmosphereReadout(atmosphere = {}) {
  const type = String(atmosphere.type ?? "normal");
  const intensity = Math.max(0, Math.min(10, Number(atmosphere.intensity) || 0));
  const tones = { normal: "#8fe0b0", thin: "#7fd0ff", unbreathable: "#ff9a6a", toxic: "#b6e04a", vacuum: "#b477ff" };
  return {
    type, intensity,
    labelKey: `NAVIS.Environment.${type}`,
    tone: tones[type] ?? "#8fe0b0",
    idle: type === "normal"
  };
}
