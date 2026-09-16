/**
 * Name → body system → hit location.
 *
 * Ported from warhammer-dbc `module/constants/body-map.mjs::classifyImplant`,
 * with one deliberate change: there the classifier is consulted live, so
 * renaming an implant moves it to another body part with no error. Here it is
 * a DEFAULT used at authoring time — the generator writes `slot` and
 * `location` into the item, and the sheet lets both be overridden. The name is
 * not an identifier.
 *
 * Order inside IMPLANT_SLOTS matters and is not alphabetical: `cortex` sits
 * above `skin` so "Сус-ан Мембрана" is not read as skin on the word
 * "мембрана", and above `circulatory` so "Железы Бетчера" is not read as
 * torso. First match wins.
 */

export const SLOTS = Object.freeze([
  { key: "cortex", label: "NAVIS.Implant.Slot.cortex" },
  { key: "ocular", label: "NAVIS.Implant.Slot.ocular" },
  { key: "respiratory", label: "NAVIS.Implant.Slot.respiratory" },
  { key: "circulatory", label: "NAVIS.Implant.Slot.circulatory" },
  { key: "skeleton", label: "NAVIS.Implant.Slot.skeleton" },
  { key: "skin", label: "NAVIS.Implant.Slot.skin" },
  { key: "arm", label: "NAVIS.Implant.Slot.arm" },
  { key: "leg", label: "NAVIS.Implant.Slot.leg" },
  { key: "mechadendrite", label: "NAVIS.Implant.Slot.mechadendrite" },
  { key: "fullbody", label: "NAVIS.Implant.Slot.fullbody" },
  { key: "other", label: "NAVIS.Implant.Slot.other" }
]);

/** "limb" means the location depends on which side the implant is fitted. */
export const SLOT_LOCATION = Object.freeze({
  cortex: "head",
  ocular: "head",
  respiratory: "body",
  circulatory: "body",
  skeleton: "body",
  skin: "body",
  arm: "limb",
  leg: "limb",
  mechadendrite: "body",
  fullbody: "body",
  other: "internal"
});

/** Slots whose location is decided by `side`, and the zones they resolve to. */
const LIMB_ZONES = Object.freeze({
  arm: { left: "leftArm", right: "rightArm" },
  leg: { left: "leftLeg", right: "rightLeg" }
});

/** Category values that already say the slot outright — more reliable than any regex. */
const CATEGORY_SLOT = Object.freeze({
  mechadendrite: "mechadendrite",
  "bionic-arm": "arm",
  "bionic-leg": "leg"
});

const FULLBODY = /всё тело|все тело|полностью|whole body|full body|all body/i;

const IMPLANT_SLOTS = Object.freeze([
  ["mechadendrite", /servo-manip|манипул|mechadendr|механодендр|мехатендр|servo-arm|dataspike|даташип|scribe-tine|писар|prehensile|цепк|gordii|гордий/i],
  ["ocular", /\beye\b|глаз|ocular|окуляр|visor|визор|auspex|ауспекс|оккулоб|occulobe/i],
  // Above skin and circulatory on purpose — see the file header.
  ["cortex", /cranial|черепн|cortical|кортикал|cerebr|мозж|mind|мысл|разум|memoranc|меморанс|\bmiu\b|neuro|нейро|skull|череп|infoslave|инфораб|volitor|волитор|catechism|катехиз|noospher|ноосфер|logic|логик|каталепт|catalepsean|сус-ан|sus-an|бетчер|betcher/i],
  ["circulatory", /heart|сердц|autosangu|автосангв|potentia|потенциа|гемастамен|haemastamen|ларраман|larraman/i],
  ["respiratory", /respirator|респират|breath|дыхан|воздух|противогаз|rebreath|lung|лёгк|легк/i],
  ["arm", /\barm\b|рук(а|у|и|е)|iron fist|железн[а-яё]* кулак|iron hand/i],
  ["leg", /\bleg\b|ног(а|и|у|е)|tracked|гусениц|digitigrad|дигитигр|all-?terrain|вездеход|talon|коготь|птераксии|pteraxii|arachnid|арахнид|serpentine|серпентин|repulsor|репульсор/i],
  ["skeleton", /skeletal|скелет|petrif|укреплен|spined|шипаст|\bbone\b|кост(ь|и|ей|ный)|adamant|адамант|sicarian efm|сикарианск|эфм|оссмодул|ossmodul/i],
  ["skin", /subdermal|подкожн|voidskin|пустотн[а-яё]* кож|synthmusc|синтемускул|\bdermal\b|scale skin|чешу|membrane|мембран|меланохром|melanochrom|мукраноид|mucranoid/i]
]);

/**
 * @param {string} name       the implant's name
 * @param {string} category   system.category, consulted first where precise
 * @param {string} installedText  free-text placement note, searched alongside the name
 * @returns {string} a SLOTS key — always one, never null
 */
export function classifyImplant(name = "", category = "", installedText = "") {
  if (CATEGORY_SLOT[category]) return CATEGORY_SLOT[category];

  const hay = `${name} ${installedText}`;
  if (FULLBODY.test(hay)) return "fullbody";

  for (const [slot, re] of IMPLANT_SLOTS) if (re.test(hay)) return slot;
  return "other";
}

/**
 * @param {string} slot  a SLOTS key
 * @param {string} side  "left" | "right" | ""
 * @returns {string} an impmal hit location, or "internal"
 */
export function locationForSlot(slot, side = "") {
  const rule = SLOT_LOCATION[slot];
  if (!rule) return "internal";
  // A limb with no side chosen is internal rather than guessing: guessing would
  // silently give the wrong arm its armour bonus.
  if (rule === "limb") return LIMB_ZONES[slot]?.[side] ?? "internal";
  return rule;
}
