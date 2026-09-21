/**
 * Deterministic repairs for content imported from impmal-malexp.
 *
 * Two tiers, and the line between them is deliberate:
 *
 *   APPLIED    - the correct value is entailed by the impmal system enums or by
 *                an identically-named item in the official impmal-core pack.
 *   REPORTED   - something is clearly wrong but the right answer is a judgement
 *                call. We leave the data alone and write it to the report.
 *
 * Every applied change is logged with a reason, so the whole diff against
 * upstream is auditable.
 */

// Enums, verbatim from the impmal system config (impmal.js).
export const MELEE_TYPES = ["mundane", "chain", "force", "shock", "power"];
export const RANGED_TYPES = ["bolt", "flame", "las", "launcher", "melta", "plasma", "solid", "specialised", "grenadesExplosives"];
export const MELEE_SPECS = ["oneHanded", "twoHanded", "brawling"];
export const RANGED_SPECS = ["pistol", "longGun", "ordnance", "thrown", "engineering"];

/** Misspellings that map onto exactly one real enum key. */
const CATEGORY_SPELLING = {
  specialized: "specialised"
};

/**
 * Trait keys that differ from the system's own by case or a typo.
 *
 * impmal looks traits up by exact key, so `twoHanded` finds nothing where the
 * system defines `twohanded`, and the trait renders blank on the sheet. Each
 * entry here is a key that exists in impmal under a slightly different spelling.
 */
const TRAIT_KEY_SPELLING = {
  twoHanded: "twohanded",  // impmal.config.weaponArmourTraits uses all lowercase
  louod: "loud"            // transposition of "loud"
};

/**
 * Keys that fold a trait and its value into one string.
 *
 * impmal stores a rated trait as the key plus a separate value, and declares
 * `rapidFire` in traitHasValue, so "rapidFire5" is the pair written as one word.
 */
const TRAIT_KEY_VALUE = {
  rapidFire5: { key: "rapidFire", value: "5" }
};

/**
 * Artwork the source module points at but which does not exist.
 *
 * impmal-core ships generic `melee-weapon` and `ranged-weapon` icons precisely
 * for this case, so a broken path resolves to the system's own stand-in for that
 * kind of weapon rather than to a broken-image glyph.
 */
const ICONS = "modules/impmal-core/assets/icons";
const FALLBACK_ART = {
  melee: `${ICONS}/weapons/melee-weapon.webp`,
  ranged: `${ICONS}/weapons/ranged-weapon.webp`,
  default: `${ICONS}/generic.webp`
};

/**
 * Repoint artwork that is not installed.
 *
 * @param {object} doc
 * @param {(img: string) => boolean} exists  Resolves an img path against the data directory.
 * @param {RepairLog} log
 */
export function repairArtwork(doc, exists, log, origin = doc.name) {
  let fixed = 0;

  if (doc.img?.startsWith("modules/") && !exists(doc.img)) {
    const replacement = FALLBACK_ART[doc.system?.attackType] ?? FALLBACK_ART.default;
    if (exists(replacement)) {
      log.fix(origin, "img", doc.img, replacement, "the original artwork is not installed; fell back to the impmal-core generic icon");
      doc.img = replacement;
      fixed++;
    } else {
      log.flag(origin, "missing artwork", `${doc.img} is not installed and no fallback is available`);
    }
  }

  for (const child of doc.items ?? []) fixed += repairArtwork(child, exists, log, child.name);
  return fixed;
}

/** Correct trait keys on any document that carries them. Returns the fix count. */
export function repairTraitKeys(doc, log, origin = doc.name) {
  let fixed = 0;

  for (const trait of doc.system?.traits?.list ?? []) {
    const split = TRAIT_KEY_VALUE[trait.key];
    if (split) {
      log.fix(origin, "system.traits.list[].key", trait.key, `${split.key} (${split.value})`, "impmal stores a rated trait as a key plus a value, not as one word");
      trait.key = split.key;
      trait.value = split.value;
      fixed++;
      continue;
    }

    const corrected = TRAIT_KEY_SPELLING[trait.key];
    if (!corrected) continue;
    log.fix(origin, "system.traits.list[].key", trait.key, corrected, "impmal defines this trait under a different spelling; the original key renders blank");
    trait.key = corrected;
    fixed++;
  }

  // Embedded documents are logged under their own name, because that is how
  // tools/verify.mjs matches a logged repair back to the document it changed.
  for (const child of doc.items ?? []) fixed += repairTraitKeys(child, log, child.name);
  return fixed;
}

export class RepairLog {
  constructor() {
    this.applied = [];
    this.reported = [];
  }

  fix(name, field, from, to, reason) {
    this.applied.push({ name, field, from, to, reason });
  }

  flag(name, issue, detail) {
    this.reported.push({ name, issue, detail });
  }
}

/**
 * Repair one weapon in place.
 *
 * @param {object} weapon   The weapon document (mutated).
 * @param {Map<string,object>} core  impmal-core weapons keyed by lowercased name.
 * @param {RepairLog} log
 */
export function repairWeapon(weapon, core, log) {
  const sys = weapon.system;
  const name = weapon.name;
  const twin = core.get(name.toLowerCase());

  // 1. Spelling. "specialized" is the American spelling of a real enum key.
  if (CATEGORY_SPELLING[sys.category]) {
    const to = CATEGORY_SPELLING[sys.category];
    log.fix(name, "system.category", sys.category, to, "enum spelling: impmal uses the British form");
    sys.category = to;
  }

  // 2. "thrown,Ordnance" is not a key, it is two keys that got concatenated.
  //    impmal-core is inconsistent about which of the two a grenade takes
  //    (Frag Grenade is ordnance, Krak Grenade is thrown), which is almost
  //    certainly where the ambiguity came from. Prefer the core twin's answer.
  if (sys.spec === "thrown,Ordnance") {
    if (twin) {
      log.fix(name, "system.spec", sys.spec, twin.system.spec, `adopted from impmal-core item of the same name`);
      sys.spec = twin.system.spec;
    } else {
      log.fix(name, "system.spec", sys.spec, "thrown", "not a valid key; remaining items are all hand-thrown grenades");
      sys.spec = "thrown";
    }
  }

  // 3. Specs that exist in neither enum cannot be salvaged without inventing a
  //    rule. impmal has no psychic weapon specialisation at all.
  if (sys.spec && !MELEE_SPECS.includes(sys.spec) && !RANGED_SPECS.includes(sys.spec)) {
    log.flag(name, "unknown weapon specialisation", `system.spec = "${sys.spec}" matches no impmal enum; left as-is, item lands in Unclassified`);
  }

  // 4. attackType vs spec. A spec belongs to exactly one attack type, so a
  //    mismatch means one of the two fields is wrong. impmal-core settles it:
  //    grenades, mines, charges and missiles are ranged there, with thrown /
  //    ordnance / engineering specs. So the spec is right and attackType is not.
  const specIsMelee = MELEE_SPECS.includes(sys.spec);
  const specIsRanged = RANGED_SPECS.includes(sys.spec);

  if (specIsRanged && sys.attackType === "melee") {
    const reason = twin
      ? `impmal-core ships "${twin.name}" as ranged/${twin.system.spec}`
      : `system.spec "${sys.spec}" is ranged-only in impmal`;
    log.fix(name, "system.attackType", "melee", "ranged", reason);
    sys.attackType = "ranged";
  } else if (specIsMelee && sys.attackType === "ranged") {
    // The mirror case: a melee spec on a ranged item. Only act when the damage
    // formula agrees (melee damage in impmal scales off Strength).
    if (sys.damage?.characteristic === "str") {
      log.fix(name, "system.attackType", "ranged", "melee", `system.spec "${sys.spec}" is melee-only and damage scales off Strength`);
      sys.attackType = "melee";
      if (sys.range) {
        log.fix(name, "system.range", sys.range, "", "melee weapons carry no range band");
        sys.range = "";
      }
    } else {
      log.flag(name, "attackType / spec mismatch", `ranged item with melee spec "${sys.spec}" and no Strength-based damage; left as-is`);
    }
  }

  // 5. Category is validated only after attackType is settled, because fixing
  //    the attack type turns grenadesExplosives from invalid into correct.
  const validTypes = sys.attackType === "melee" ? MELEE_TYPES : RANGED_TYPES;
  if (sys.category && !validTypes.includes(sys.category)) {
    if (twin && validTypes.includes(twin.system.category)) {
      log.fix(name, "system.category", sys.category, twin.system.category, "adopted from impmal-core item of the same name");
      sys.category = twin.system.category;
    } else {
      log.fix(name, "system.category", sys.category, "", `"${sys.category}" is not a valid ${sys.attackType} type in impmal`);
      sys.category = "";
    }
  }

  // 6. Gaps we refuse to guess at.
  if (!sys.category) {
    log.flag(name, "no weapon category", `system.category is empty; impmal offers ${validTypes.join(", ")}`);
  }
}

/**
 * Find documents that are the same item twice over.
 * Compares everything except identity and bookkeeping fields.
 */
export function findExactDuplicates(docs) {
  const seen = new Map();
  const duplicates = [];
  const variants = new Map();

  for (const doc of docs) {
    const fingerprint = JSON.stringify({ ...doc, _id: undefined, _key: undefined, _stats: undefined, folder: undefined, sort: undefined });
    if (seen.has(fingerprint)) duplicates.push({ doc, original: seen.get(fingerprint) });
    else seen.set(fingerprint, doc);

    if (!variants.has(doc.name)) variants.set(doc.name, []);
    variants.get(doc.name).push(doc);
  }

  const sameNameDifferentStats = [...variants.entries()]
    .filter(([, group]) => group.length > 1)
    .filter(([, group]) => !duplicates.some(d => d.doc === group[1]));

  return { duplicates, sameNameDifferentStats };
}
