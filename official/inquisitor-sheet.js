class InquisitorPatronSheet extends PatronSheet
{
    static DEFAULT_OPTIONS = {
        classes : ["inquisitor"]
    }

    static PARTS = {
        header : {scrollable: [""], classes : ["sheet-header"], template : 'modules/apex-imperialis/assets/impmal-inquisition/templates/inquisitor-header.hbs' },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/patron/patron-main.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/actor/patron/patron-effects.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/actor/patron/patron-notes.hbs' },
      }
}

Hooks.on("init", () => {
    Actors.registerSheet("impmal", InquisitorPatronSheet, { types: ["patron"], label : "Inquisitor Patron Sheet"});
})