/**
 * Wiring for the Horde subsystem.
 *
 * Nothing here is declared in the manifest: a horde is a flag on an ordinary
 * NPC, so any actor in any of the paid compendia can be fielded as one without
 * being migrated, duplicated or re-imported.
 *
 * Order matters. The settings must exist before the patches read them, and the
 * damage patch must be installed before the first attack resolves, so both go in
 * at `init`. The sheet row rides the existing render hook in skin.js.
 */

import { MODULE_ID } from "./horde-data.js";
import {
  blockPersonalConditions,
  patchApplyDamage,
  patchTestDialog,
  SETTING_DAMAGE_SHARE
} from "./horde-combat.js";
import { registerDeathMarking } from "./horde-death.js";
import { registerHordeToken } from "./horde-token.js";

export { refitHordeRow } from "./horde-sheet.js";
export { readHorde, isHorde, writeSize } from "./horde-data.js";
export { shouldBeDead } from "./horde-death.js";
export { refitHordeCard } from "./horde-token.js";

export function registerHorde() {
  registerSettings();

  const damage = patchApplyDamage();
  patchTestDialog();
  blockPersonalConditions();
  registerDeathMarking();
  registerHordeToken();

  console.log(`${MODULE_ID} | horde rules installed${damage ? "" : " (damage conversion unavailable)"}`);
}

/**
 * The two places the written rules leave a deliberate choice, exposed rather
 * than hard-coded, because both are a table's taste and neither is a bug.
 */
function registerSettings() {
  game.settings.register(MODULE_ID, SETTING_DAMAGE_SHARE, {
    name: "NAVIS.Horde.SettingDamage",
    hint: "NAVIS.Horde.SettingDamageHint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      none: "NAVIS.Horde.SettingDamageNone",
      half: "NAVIS.Horde.SettingDamageHalf",
      full: "NAVIS.Horde.SettingDamageFull"
    },
    default: "none"
  });
}
