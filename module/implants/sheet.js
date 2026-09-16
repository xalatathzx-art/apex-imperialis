/**
 * Task 6 placeholder — Task 9 replaces this file wholesale.
 *
 * Task 9 owns the real Implant sheet. Until then this stub returns impmal's
 * own augmetic sheet class unmodified, so the item type registers and opens
 * with the stock sheet rather than leaving the module unable to load because
 * `index.js` imports a sheet factory that does not exist yet.
 *
 * Modelled on `module/species/species-sheet.js`'s lookup of a base class from
 * `CONFIG.Item.sheetClasses`, but looking up `augmetic` instead of `talent`,
 * and returning that class as-is with no subclassing.
 */

const MODULE_ID = "navis-apexialis";

let sheet = null;

/**
 * The registry only exists once Foundry has run `initializeSheets()`, which is
 * after the setup hook — so this must not be called earlier than `ready`.
 */
function findBaseSheet() {
  const registered = CONFIG.Item.sheetClasses?.augmetic ?? {};
  const cls = Object.values(registered).find(entry => entry?.cls)?.cls;

  if (!cls) {
    console.error(
      `${MODULE_ID} | no impmal item sheet is registered for "augmetic", so the Implant sheet cannot fall back to one. ` +
      "This means registerImplantSheet ran before Foundry initialised CONFIG.Item.sheetClasses."
    );
  }

  return cls;
}

/** Build (once) and return the sheet class, or null if it cannot be built. */
export function defineImplantSheet() {
  if (sheet) return sheet;

  sheet = findBaseSheet();
  return sheet;
}
