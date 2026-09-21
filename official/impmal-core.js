Hooks.on("init", () => {

    CONFIG.Combat.fallbackTurnMarker = "modules/navis-apexialis/assets/impmal-core/ui/turn-marker.webp"


    CONFIG.Actor.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/xenos.webp";
    CONFIG.Item.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/faction-mechanicus.webp";
    CONFIG.JournalEntry.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/faction-administratum.webp";
    CONFIG.RollTable.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/hive-shootout.webp";
    CONFIG.Scene.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/palace.webp";
    CONFIG.Macro.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/rokarth.webp";
    CONFIG.Playlist.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/sisters-of-battle.webp";
    CONFIG.Adventure.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/macharius.webp";
    CONFIG.Cards.compendiumBanner = "modules/navis-apexialis/assets/impmal-core/banners/faction-rogue-trader.webp";

    CONFIG.JournalEntry.noteIcons = foundry.utils.mergeObject(CONFIG.JournalEntry.noteIcons, {
        "Agri World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/agri.webp",
        "Cemetary World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/cemetary.webp",
        "Dead World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/dead.webp",
        "Death World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/death.webp",
        "Feral World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/feral.webp",
        "Feudal World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/feudal.webp",
        "Forbidden World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/forbidden.webp",
        "Forge World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/forge.webp",
        "Frontier World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/frontier.webp",
        "Hive World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/hive.webp",
        "Knight World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/knight.webp",
        "Mining World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/mining.webp",
        "Naval World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/naval.webp",
        "Ocean World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/ocean.webp",
        "Penal World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/penal.webp",
        "Quarantined World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/quarantined.webp",
        "Reclaimed World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/reclaimed.webp",
        "Shrine World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/shrine.webp",
        "Special World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/special.webp",
        "Unclassified World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/unclassified.webp",
        "War World" : "modules/navis-apexialis/assets/impmal-core/icons/notes/war.webp"
    })

    CONFIG.fontDefinitions.CarolGothic = {editor : true, fonts : []};

    CONFIG.canvasTextStyle = new PIXI.TextStyle({
        fontFamily: "CarolGothic",
        fontSize: 36,
        fill: "#FFFFFF",
        stroke: "#111111",
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
        align: "center",
        wordWrap: false
    });
})

Hooks.on("preCreateScene", (scene) => 
{
    scene.updateSource({"grid.color" : "#42cf7d", "backgroundColor" : "#000000"});
});

Hooks.on("renderNoteConfig", (app) => 
    {
        app.element[0].classList.add("impmal");
    });
    
    Hooks.on("refreshNote", object => 
    {
        // Declared: impmal-core shipped this as a classic script, where the bare
        // assignment made a global. As an ES module it is strict mode, and the
        // hook threw on every note refresh.
        const icon = object.children[0];
        icon.bg.clear();
        icon.border.clear();
        let reticule = object.reticule;
        if (reticule)
        {
            reticule.clear();
        }
        if (object.hover || object.layer.highlightObjects)
        {

            icon.bg.beginFill(0x42cf7d, 0.3).drawRect(...icon.rect).endFill();
            let iconSize = object.size / 2 + 5;
            let lineSize = object.size / 2 - 10;
            reticule = reticule || new PIXI.Graphics();
            reticule.lineStyle({width: 2, color: "0x42cf7d"})

                // Top Left
                .moveTo(-iconSize ,-iconSize)
                .lineTo(-iconSize + lineSize , -iconSize)
                .moveTo(-iconSize, -iconSize)
                .lineTo(-iconSize, -iconSize + lineSize)

                // Top Right
                .moveTo(+iconSize, -iconSize)
                .lineTo(+iconSize - lineSize , -iconSize)
                .moveTo(+iconSize, -iconSize)
                .lineTo(+iconSize, -iconSize + lineSize)

                // Bottom Left
                .moveTo(-iconSize ,+iconSize)
                .lineTo(-iconSize + lineSize , +iconSize)
                .moveTo(-iconSize, +iconSize)
                .lineTo(-iconSize, +iconSize - lineSize)

                // Bottom Left
                .moveTo(+iconSize, +iconSize)
                .lineTo(+iconSize - lineSize , +iconSize)
                .moveTo(+iconSize, +iconSize)
                .lineTo(+iconSize, +iconSize - lineSize);

            if (!object.reticule)
            {
                object.reticule = object.addChild(reticule);
            }
        }
    });

Hooks.on("init", () => {
    game.impmal.config.factions = {
        "adeptus-administratum": "IMPMAL.FactionAdeptusAdministratum",
        "adeptus-astra-telepathica": "IMPMAL.FactionAdeptusAstra",
        "adeptus-mechanicus": "IMPMAL.FactionAdeptusMechanicus",
        "adeptus-ministorum": "IMPMAL.FactionAdeptusMinistorum",
        "astra-militarum": "IMPMAL.FactionAstraMilitarum",
        "imperial-fleet": "IMPMAL.FactionImperialFleet",
        "infractionists": "IMPMAL.FactionInfractionists",
        "rogue-trader-dynasty": "IMPMAL.FactionRogueTraderDynasty",
        "the-inquisition": "IMPMAL.FactionTheInquisition",
    }

    game.impmal.config.age = {
        recruit : {
            name : "Recruit",
            formula : "17 + 1d10",
        },
        veteran : {
            name : "Veteran",
            formula : "17 + 2d10",
        },
        rejuvenat : {
            name : "Rejuvenat",
            formula : "50 + 5d10",
        },
        augmented : {
            name : "Augmented",
            formula : "100 + 5d10",
        }
    }

	game.impmal.config.vehicleActions.evasiveManeuvers.description = `<p><strong>Difficulty</strong>: Varies</p>
    <p>The Driver takes evasive manoeuvres, dodging, weaving, and generally making the vehicle a more difficult target to hit. The Driver makes a <strong>Pilot</strong> Test. On a successful Test, the SL achieved are subtracted from ranged attacks made against the vehicle until the Driver’s next turn. The Difficulty of this Test is based on the vehicle's handling and how fast it is currently travelling</p>
    <table class="impmal">
        <thead>
            <tr class="title">
                <td colspan="2">
                    <p>Evasive Manoeuvers Difficulty Table</p>
                </td>
            </tr>
            <tr class="subheader">
                <td>
                    <p>Speed</p>
                </td>
                <td>
                    <p>Difficulty</p>
                </td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <p>Slow</p>
                </td>
                <td>
                    <p>Difficult (-10)</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Normal</p>
                </td>
                <td>
                    <p>Challenging (+0)</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Fast or better</p>
                </td>
                <td>
                    <p>Routine (+20)</p>
                </td>
            </tr>
        </tbody>
    </table>`;
	game.impmal.config.vehicleActions.ram.description = `<p><strong>Difficulty</strong>: <strong>Challenging (+0)</strong>, opposed by the target's Dodge or Pilot.</p>
    <p>The Driver attempts to ram an enemy. The Driver must be able to enter the Zone their target is in. Treat this as a @UUID[.Rjw4KykpjGJlGYEk#melee-attack]{melee attack}, though characters on foot can only oppose it using their Reflexes (Dodge) Skill.</p>
    <p>If the vehicle is size Large or greater, the attack benefits from the @UUID[JournalEntry.wqlquQ8Njtd5fb4Y.JournalEntryPage.wsM53RDPPrqwS3Te#spread]{Spread} Trait. If made against a vehicle, both the target and the ramming vehicle take Damage. Damage to the ramming vehicle is always resolved against its front Armour.</p>
    <table class="impmal">
        <thead>
            <tr class="title">
                <td colspan="2">
                    <p>Vehicle Ram Damage Table</p>
                </td>
            </tr>
            <tr class="subheader">
                <td>
                    <p>Vehicle Size</p>
                </td>
                <td>
                    <p>Damage</p>
                </td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <p>Small or below</p>
                </td>
                <td>
                    <p>1</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Medium</p>
                </td>
                <td>
                    <p>5+SL</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Large</p>
                </td>
                <td>
                    <p>10+SL</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Enormous</p>
                </td>
                <td>
                    <p>15+SL</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Monstrous</p>
                </td>
                <td>
                    <p>20+SL</p>
                </td>
            </tr>
        </tbody>
    </table>`;

})


Hooks.on("preCreateItem", (item, data) => {
    if (!data.img) {
        let img = "modules/navis-apexialis/assets/impmal-core/icons/blank.webp"
        if (item.type == "protection")
            img = "modules/navis-apexialis/assets/impmal-core/icons/protection/armour.webp"
        if (item.type == "forceField")
            img = "modules/navis-apexialis/assets/impmal-core/icons/protection/field.webp"
        else if (item.type == "equipment")
            img = "modules/navis-apexialis/assets/impmal-core/icons/equipment/equipment.webp"
        else if (item.type == "power")
            img = "modules/navis-apexialis/assets/impmal-core/icons/powers/minor-power.webp"
        else if (item.type == "weapon")
            img = "modules/navis-apexialis/assets/impmal-core/icons/weapons/melee-weapon.webp"
        else if (item.type == "talent")
            img = "modules/navis-apexialis/assets/impmal-core/icons/generic.webp"
        else if (item.type == "boonLiability")
            img = "modules/navis-apexialis/assets/impmal-core/icons/generic.webp"
        else if (item.type == "specialisation")
            img = "modules/navis-apexialis/assets/impmal-core/icons/generic.webp"
        else if (item.type == "augmetic")
            img = "modules/navis-apexialis/assets/impmal-core/icons/augmetics/augmetic.webp"
        else if (item.type == "ammo")
            img = "modules/navis-apexialis/assets/impmal-core/icons/ammo/ammo.webp"
        else if (item.type == "modification")
            img = "modules/navis-apexialis/assets/impmal-core/icons/modification/modification.webp"
        else if (item.type == "corruption")
            img = "modules/navis-apexialis/assets/impmal-core/icons/corruption/corruption.webp"
        else if (item.type == "injury")
            img = "modules/navis-apexialis/assets/impmal-core/icons/injuries/broken-bone.webp"
        item.updateSource({ "img": img })
    }
})

Hooks.on("preCreateActor", (actor, data) => {
    if (!data.img) {
        let img = `modules/navis-apexialis/assets/impmal-core/tokens/unknown.webp`
        actor.updateSource({ "img": img, "prototypeToken.texture.src": img })
    }
})