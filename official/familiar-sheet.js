class FamiliarSheet extends NPCSheet
{

    static DEFAULT_OPTIONS = {
        classes : ["familiar"]
    }

      
      static PARTS = {
        header : {scrollable: [""], classes : ["npc-header"], template : 'modules/navis-apexialis/assets/impmal-inquisition/templates/familiar-header.hbs' },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/npc/npc-main.hbs' },
        skills: { scrollable: [".sheet-list.skills .list-content"], template: 'systems/impmal/templates/actor/tabs/actor-skills.hbs' },
        powers: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-powers.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-effects.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/actor/npc/npc-notes.hbs' },
      }

}


Hooks.on("init", () => {

    foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "impmal-inquisition", FamiliarSheet, {
        types: ["impmal-inquisition.familiar"],
        makeDefault: true,
        label : "Familiar Sheet"
      });
})