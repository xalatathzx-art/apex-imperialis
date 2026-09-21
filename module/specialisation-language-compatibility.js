import { ownedSpecialisation } from "./skill-specialisations.js";

const PATCHED = Symbol.for("navis-apexialis.specialisation-language-compatibility");

function patchSkillTests() {
  const actor = game.actors?.contents?.[0];
  const prototype = actor && Object.getPrototypeOf(actor);
  if (!prototype?.setupSkillTest || prototype.setupSkillTest[PATCHED]) return;

  const original = prototype.setupSkillTest;
  function setupSkillTest(data = {}, ...args) {
    if (!data.itemId && data.key && data.name) {
      const specialisation = ownedSpecialisation(this, data.key, data.name);
      if (specialisation) data = { ...data, itemId: specialisation.id };
    }
    return original.call(this, data, ...args);
  }
  setupSkillTest[PATCHED] = true;
  prototype.setupSkillTest = setupSkillTest;
}

function patchWeaponSkill() {
  const prototype = CONFIG.Item.dataModels?.weapon?.prototype;
  if (!prototype?.getSkill || prototype.getSkill[PATCHED]) return;

  const original = prototype.getSkill;
  function getSkill(actor) {
    const resolved = original.call(this, actor);
    if (typeof resolved !== "string") return resolved;

    const skill = this.skillOverride?.value || this.attackType;
    const name = this.skillOverride?.spec || this.specialisation;
    return ownedSpecialisation(actor, skill, name) ?? resolved;
  }
  getSkill[PATCHED] = true;
  prototype.getSkill = getSkill;
}

/**
 * Imperium Maledictum identifies specialisations by display name in a few
 * client-side paths. Its English labels and our Russian actor data otherwise
 * miss each other; keep that translation at this boundary only.
 */
export function registerSpecialisationLanguageCompatibility() {
  if (game.system.id !== "impmal") return;
  patchSkillTests();
  patchWeaponSkill();
}
