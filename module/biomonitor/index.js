import { renderBiomonitor } from "./biomonitor-sheet.js";
import { registerAugmeticLocation } from "./augmetic-slot.js";
let registered = false;
export function registerBiomonitor() {
  if (registered) return;
  registered = true;
  Hooks.on("renderActorSheetV2", (sheet, root) => renderBiomonitor(sheet, root, sheet.document));
  registerAugmeticLocation();
}

