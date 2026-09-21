Hooks.on("init", () => {
    game.settings.register("impmal-inquisition", "subtlety", {
        name: "Subtlety",
        scope: "world",
        config: false,
        default: 0,
        type: Number
    });

    game.settings.register("impmal-inquisition", "showSubtlety", {
        name: "Subtlety Tracker",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });


    if (game.settings.get("impmal-inquisition", "showSubtlety"))
    {
        game.impmal.resources.registerResource("IMPMAL.Subtlety", "impmal-inquisition", "subtlety", true);
    }
})

Hooks.on("init", () => {

    game.impmal.config.factions["inquisition-xenos"] = "IMPMAL.FactionOrdoXenos"
    game.impmal.config.factions["inquisition-malleus"] = "IMPMAL.FactionOrdoMalleus"
    game.impmal.config.factions["inquisition-hereticus"] = "IMPMAL.FactionOrdoHereticus"

    
    game.impmal.config.weaponCategoryEffects.null = {
            name : "IMPMAL.Null",
            system : 
            {
                transferData: {
                    type: "zone",
                    equipTransfer: true,
                    zone: {
                        type: "follow",
                        skipImmediateOnPlacement: true,
                    },
                    filter: "return this.actor.system.species != \"Daemon\";"
                },
                scriptData: [
                    {
                        script: "this.actor.applyDamage(5).then(data => ui.notifications.notify(\"Took \" + data.woundsGained + \" Damage from Null\"));",
                        label: "Damage",
                        trigger: "immediate",
                    },
                    {
                        script: "this.actor.applyDamage(5).then(data => ui.notifications.notify(\"Took \" + data.woundsGained + \" Damage from Null\"));",
                        label: "Damage (Start Turn)",
                        trigger: "startTurn",
                    }
                ]
            }
        },  

        game.impmal.config.weaponCategoryEffects.tainted = {
            name : "IMPMAL.Tainted",
            system : 
            {
                transferData: {
                    documentType : "Item",
                },
                scriptData: [
                    {
                        script: "",
                        label: "Bonus Damage",
                        trigger: "dialog",
                        options : {
                            hideScript : "return !args.actor.system.corruption.value",
                            activateScript : "return true;",
                            submissionScript : "args.data.additionalDamage += Math.min(args.actor.system.corruption.value, args.actor.system.characteristics.wil.bonus);"
                        }
                    },
                ]
            }
        },  
        
        game.impmal.config.weaponCategoryEffects.graviton = {
            name : "IMPMAL.Graviton",
            system : 
            {
                transferData: {
                    documentType : "Item",
                },
                scriptData: [
                    {
                        script: "let armour = args.locationData.armour\nif (armour)\n{\n\targs.modifiers.push({value : armour, label : this.effect.label})\n}",
                        label: "Add Damage",
                        trigger: "preApplyDamage",
                    },
                    {
                        script: "let SL = 0;\n\nlet armour = args.actor.itemTypes.protection.filter(i => i.system.isEquipped);\n\nif (armour.length)\n{\n\tSL--;\n}\nif (armour.some(a => a.system.traits.has(\"heavy\")))\n{\n\tSL--;\n}\n\nlet test = await args.actor.setupSkillTest({name : \"Endurance\", key : \"fortitude\"}, {fields : {SL}, title : {append : ` - ${this.effect.name}`}})\nif(test.failed) args.actor.addCondition(\"prone\");",
                        label: "Endurance Test",
                        trigger: "applyDamage",
                    }
                ]
            }
        },  

        game.impmal.config.weaponCategoryEffects.shuriken = {
            name : "IMPMAL.Shuriken",
            system : 
            {
                transferData: {
                    documentType : "Item",
                },
                scriptData: [
                    {
                        script: "args.fields.SL++;",
                        label: "Bonus SL",
                        trigger: "dialog",
                        options : {
                            activateScript : "return true;",
                        }
                    },
                ]
            }
        },  


    foundry.utils.mergeObject(game.impmal.config.rangedTypes, {
        crossbow : "IMPMAL.Crossbow",
        graviton : "IMPMAL.Graviton",
        kroot : "IMPMAL.Kroot",
        malefic : "IMPMAL.Malefic",
        pulse : "IMPMAL.Pulse",
        shuriken : "IMPMAL.Shuriken",
        splinter : "IMPMAL.Splinter"
    });

    foundry.utils.mergeObject(game.impmal.config.meleeTypes, {
        daemonbane : "IMPMAL.Daemonbane",
        null : "IMPMAL.Null",
        tainted : "IMPMAL.Tainted",
		exotic : "IMPMAL.Exotic"
    });

    game.impmal.config.instinctTypes = {
        combat : "IMPMAL.CombatInstinct",
        preservation: "IMPMAL.PreservationInstinct",
    };

    game.impmal.config.combatInstincts = {
        "melee" : {
            name : "IMPMAL.Instinct.Name.melee",
            description : "IMPMAL.Instinct.Description.melee",
            key : "melee"
        },
        "ranged" : {
            name : "IMPMAL.Instinct.Name.ranged",
            description : "IMPMAL.Instinct.Description.ranged",
            key : "ranged"
        },
        "stalker" : {
            name : "IMPMAL.Instinct.Name.stalker",
            description : "IMPMAL.Instinct.Description.stalker",
            key : "stalker"
        },
        "support" : {
            name : "IMPMAL.Instinct.Name.support",
            description : "IMPMAL.Instinct.Description.support",
            key : "support"
        }
    }

    game.impmal.config.preservationInstincts = {
        "fearless" : {
            name : "IMPMAL.Instinct.Name.fearless",
            description : "IMPMAL.Instinct.Description.fearless",
            key : "fearless"
        },
        "brave" : {
            name : "IMPMAL.Instinct.Name.brave",
            description : "IMPMAL.Instinct.Description.brave",
            key : "brave"
        },
        "wary" : {
            name : "IMPMAL.Instinct.Name.wary",
            description : "IMPMAL.Instinct.Description.wary",
            key : "wary"
        },
        "coward" : {
            name : "IMPMAL.Instinct.Name.coward",
            description : "IMPMAL.Instinct.Description.coward",
            key : "coward"
        }
    }
})    