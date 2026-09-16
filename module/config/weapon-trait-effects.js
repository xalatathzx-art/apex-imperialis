/**
 * Scripted weapon traits.
 *
 * impmal looks these up as `game.impmal.config.weaponTraitEffects[trait.key]`,
 * by the key stored on the weapon and never by its display name — which is why
 * these still run after Maledictum Expanded's trait names were removed from
 * config/glossary.js.
 *
 * Only the three that something in the packs actually carries are kept; Accurate,
 * Fast and Grav were ported too, but no item or NPC has ever borne them.
 *
 * Ported from impmal-malexp v1.4.0. The scripts are the original author's work
 * and are kept verbatim; see docs/CREDITS.md.
 */

const item = { documentType: "Item" };

export const WEAPON_TRAIT_EFFECTS = {
  gauss: {
    name: "NAVIS.Trait.gauss",
    system: {
      transferData: item,
      scriptData: [
        {
          label: "NAVIS.TraitEffect.gaussSeverity",
          trigger: "preRollWeaponTest",
          script: "args.data.critModifier = (args.data.critModifier || 0) + 5;"
        },
        {
          label: "NAVIS.TraitEffect.gaussCrit",
          trigger: "rollWeaponTest",
          script: "if (args.result.outcome === 'success' && !args.result.critical && (args.result.roll % 10 === 9)) { args.result.critical = true; }"
        }
      ]
    }
  },

  phase: {
    name: "NAVIS.Trait.phase",
    system: {
      transferData: item,
      scriptData: [
        {
          label: "NAVIS.TraitEffect.phaseIgnore",
          trigger: "preApplyDamage",
          script: `
            args.ignoreAP = true;
            if (args.locationData) args.locationData.field = null;
          `
        },
        {
          label: "NAVIS.TraitEffect.phaseCtan",
          trigger: "preApplyDamage",
          script: `
            let isCtan = args.actor.items.some(i => i.name === "C'tan");
            if (!isCtan) return;

            args.value = 0; // The attack deals no damage to the C'tan

            new Roll("2d10").roll().then(heal => {
                heal.toMessage({ flavor: "Phase: the C'tan regenerates", speaker: { alias: args.actor.name } });
                let newWounds = Math.max(0, args.actor.system.combat.wounds.value - heal.total);
                args.actor.update({ "system.combat.wounds.value": newWounds });
            });

            this.item.delete();
          `
        }
      ]
    }
  },

  tesla: {
    name: "NAVIS.Trait.tesla",
    system: {
      transferData: item,
      scriptData: [
        {
          label: "NAVIS.TraitEffect.teslaArc",
          trigger: "applyDamage",
          script: `
            let attackerTest = args.opposed?.attackerTest;
            if (!attackerTest) return;

            let context = args.context;
            let isFirstLink = !context.teslaChain;
            context.teslaChain = context.teslaChain || new Set();

            let qualifies = args.excess > 0; // The hit incapacitates/kills
            if (isFirstLink) {
                let digit = attackerTest.result.roll % 10;
                qualifies = qualifies || digit === 9 || digit === 0;
            }
            if (!qualifies) return;

            let currentToken = args.actor.getActiveTokens()[0];
            if (!currentToken) return;
            context.teslaChain.add(currentToken.id);

            let regions = currentToken.document.regions;
            if (!regions || regions.size === 0) return; // No Region defined, cannot determine proximity

            let attackerToken = attackerTest.actor.getActiveTokens()[0];

            let candidates = canvas.tokens.placeables.filter(t =>
                !context.teslaChain.has(t.id) &&
                t.id !== attackerToken?.id &&
                t.document.regions.size > 0 &&
                [...t.document.regions].some(r => regions.has(r))
            );
            if (!candidates.length) return;

            let index = Math.floor(CONFIG.Dice.randomUniform() * candidates.length);
            let target = candidates[index];
            context.teslaChain.add(target.id);

            if (!target.actor?.applyDamage) return;

            ChatMessage.create({
                content: '<p><i class="fa-solid fa-bolt"></i> Tesla: the arc jumps to ' + target.name + '</p>',
                speaker: ChatMessage.getSpeaker({actor: attackerTest.actor})
            });

            target.actor.applyDamage(args.opposed.damage, {
                ignoreAP: false,
                location: 'body',
                message: true,
                opposed: args.opposed,
                context
            });
          `
        }
      ]
    }
  }
};
