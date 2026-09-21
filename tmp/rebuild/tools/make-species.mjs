/**
 * Generate the Navis Species source tree.
 *
 * The DoomBC races written in Imperium Maledictum's own terms. The conversion
 * is deliberate, not arithmetic: DoomBC starts every character at 25 in every
 * characteristic and climbs with Unnatural (X) traits that add straight to the
 * characteristic bonus, where impmal treats a bonus of 5 as a strong human. So
 * a species here carries the difference from a human in impmal steps of five,
 * with the Unnatural rating folded into that difference rather than stacked on
 * top, and FFG wound bonuses divided by four to land on impmal's 9-14 scale.
 *
 * Everything the books leave without an impmal equivalent — Infamy, the Chaos
 * patronage economy, Fast Learner's XP percentages — is dropped and said so in
 * the species description rather than invented.
 *
 * Output is ordinary src/packs JSON, which tools/build.mjs compiles like every
 * other pack. Re-running rebuilds the tree from scratch.
 *
 *   node tools/make-species.mjs && node tools/build.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/packs/species");

const MODULE_ID = "navis-apexialis";
const SPECIES_TYPE = `${MODULE_ID}.species`;
const SUBSPECIES_TYPE = `${MODULE_ID}.subspecies`;

const CHARACTERISTIC_KEYS = ["ws", "bs", "str", "tgh", "ag", "int", "per", "wil", "fel"];

/**
 * impmal's own ceiling: "Humans can't raise a characteristic above 60 unless
 * stated" (core rules p.51). Every species states it rather than leaving the
 * field blank, so the sheet always shows what the limit actually is.
 */
const IMPMAL_CEILING = 60;
const PACK = `Compendium.${MODULE_ID}.navis-species.Item`;
const TALENTS = `Compendium.${MODULE_ID}.navis-talents.Item`;

// impmal-core is where the system's own talents live. Referenced, never copied:
// the module is paid content, and the scripts its effects call sit in the free
// system anyway, so a reference gets the whole mechanic and redistributes none
// of the text.
const CORE = "Compendium.impmal-core.items.Item";

const ICON = {
  species: "modules/impmal-core/assets/icons/generic.webp",
  trait: "modules/impmal-core/assets/icons/generic.webp",
  weapon: "modules/impmal-core/assets/icons/weapons/melee-weapon.webp",
  armour: "modules/impmal-core/assets/icons/generic.webp"
};

const FOLDERS = {
  species: { id: "navisSpFolder001", name: "Species", color: "#8b6a1f", sort: 100 },
  subspecies: { id: "navisSpFolder002", name: "Subspecies", color: "#6b5227", sort: 200 },
  traits: { id: "navisSpFolder003", name: "Species Traits", color: "#7a4a1f", sort: 300 },
  gear: { id: "navisSpFolder004", name: "Species Equipment", color: "#5e3a14", sort: 400 }
};

/* ══ TRAITS ════════════════════════════════════════════════════════════════
   Prose only. The figures a species moves live as effects on the species item,
   so there is one place to look when a number is wrong.
   ════════════════════════════════════════════════════════════════════════ */

const TRAITS = [
  // ── Space Marine ──
  ["gene-seed", "Gene-Seed", `<p>Nineteen implanted organs rebuild a boy into something that is no longer quite a man.</p>
    <p>At the start of your turn you may take an <strong>Average (+20) Fortitude</strong> Test to end one instance of <em>Bleeding</em> on yourself. You have Advantage on Tests to resist ingested poison, disease and airborne toxins, and you need three hours of sleep a night rather than eight. <em>Blinded</em> never lasts on you beyond the end of the round in which it was inflicted.</p>`],

  ["black-carapace", "Black Carapace", `<p>A subdermal interface shell that lets armour move as skin does.</p>
    <p>Power armour you wear imposes none of its usual weight or Strength requirement: treat its Encumbrance as 0 and ignore any Disadvantage it would cause. Against anyone else the same armour is a coffin.</p>`],

  // ── Ogryn ──
  ["brute-physiology", "Brute Physiology", `<p>A body built to take the kind of punishment that kills other people.</p>
    <p>At the end of your turn you automatically shed the <em>Stunned</em> condition. You cannot die from <em>Bleeding</em>, and you may eat anything organic without ill effect.</p>
    <p>Those hands were not made for fine work: you have Disadvantage on any Test of delicate manipulation, including most Tech (Engineering) work and any attempt at forgery, lockpicking or surgery.</p>`],

  ["bone-ead", "Bone-'ead", `<p>The implant raised your intelligence. It did not raise it to human.</p>
    <p>Any Intelligence-based Test takes you a full Action rather than whatever it would normally take, and on a success you count no more than <strong>1 SL</strong>, however well you rolled.</p>
    <p>In a Haywire field of intensity 3 or higher the implant falters: you automatically fail every Intelligence Test until you leave it.</p>`],

  ["ogryn-sized", "Ogryn-Sized", `<p>Everything built for human hands is a toy in yours.</p>
    <p>You have Disadvantage on Tests with any weapon not built at your scale, and <strong>two</strong> Disadvantage with a ranged one, whose guards and switches defeat your fingers. Using an unmodified melee weapon, roll 1d10 after the attack: on a 1-3 the weapon breaks and is useless until repaired.</p>
    <p>Grenades are the exception. Grenades work fine.</p>`],

  // ── Ratling ──
  ["barefoot", "Barefoot", `<p>The soles of your feet are tougher than boot leather and quieter than felt.</p>
    <p>While unshod you have Advantage on Stealth Tests to move silently and on any Test to cross Difficult Terrain. Only extreme heat or cold makes footwear worth the trouble.</p>`],

  ["runt", "Runt", `<p>You are half the size of the people who give you orders, and all of them forget it at least once.</p>
    <p>You cannot use a Two-Handed ranged weapon at all unless it carries the <em>Compact</em> modification, and every rifle counts as a long rifle in your hands. Weapons made for Ratlings already count as Compact.</p>
    <p>When there is a crowd or cover to hide in, you have Advantage on Stealth Tests to hide.</p>`],

  // ── Squat ──
  ["hard-as-stone", "Hard as Stone", `<p>Generations under heavy gravity, bred short and dense.</p>
    <p>You have Advantage on Fortitude Tests to resist poison, disease, radiation and vacuum, and on any Test to resist being knocked <em>Prone</em> or moved against your will.</p>`],

  ["sure-tread", "Sure Tread", `<p>You do not fall. It is a point of some pride.</p>
    <p>You ignore Difficult Terrain caused by rubble, scree, ice or a shifting deck, and you have Advantage on Athletics Tests to keep your footing.</p>`],

  ["void-in-veins", "Void in the Veins", `<p>Your people have lived in ships and holds since before the Imperium had a name for either.</p>
    <p>You have Advantage on Tech Tests to work on machinery you can put your hands on, and on Navigation Tests aboard a vessel or in a void station.</p>`],

  ["clever-hands", "Clever Hands", `<p>Thick fingers, and not one of them clumsy.</p>
    <p>Once per session you may treat a failed Tech (Engineering) Test to repair or jury-rig something as a success with 0 SL. The repair holds until the end of the scene.</p>`],

  // ── Beastman ──
  ["cloven", "Cloven", `<p>Hooves, and legs that bend the wrong way to human eyes.</p>
    <p>You have Advantage on Tests to cross Difficult Terrain and on Athletics Tests to run, climb or jump. Footwear made for humans does not fit you and never will.</p>`],

  ["aversion-to-order", "Aversion to Order", `<p>The machine spirits do not like you, and the feeling is mutual.</p>
    <p>You have Disadvantage on all Tech Tests. Every augmetic implanted in you costs you <strong>2 maximum Wounds</strong> rather than the usual price, and it never quite stops aching.</p>`],

  ["abhorrence", "Abhorrence", `<p>The Imperium does not debate what you are. It burns what you are.</p>
    <p>Your Influence with the Adeptus Ministorum and the Inquisition is reduced by 1, to a minimum of 0. Being seen unhooded in Imperial space is not a modifier on a Test; it is the start of a scene.</p>`],

  ["horns-and-hooves", "Horns and Hooves", `<p>You are armed even when you are stripped and chained.</p>
    <p>Your horns, hooves and teeth are a melee weapon dealing <strong>2 + Strength bonus</strong> damage. They are never <em>Useless</em> and cannot be disarmed or taken from you.</p>`],

  // ── Harpy ──
  ["flyer", "Flyer", `<p>Hollow-boned, broad-winged, and useless on the ground by comparison.</p>
    <p>You may fly at your normal Speed. You cannot fly while carrying more than your Strength bonus in Encumbrance, and you cannot fly at all in an enclosed space narrower than three metres.</p>`],

  ["hollow-bones", "Hollow Bones", `<p>Everything that lets you fly is a reason you break.</p>
    <p>When you suffer a Critical Wound to an arm or a leg, roll on the Critical table one step worse. You cannot wear armour heavier than mesh without losing the ability to fly.</p>`],

  // ── Naga ──
  ["multiple-arms", "Multiple Arms", `<p>Four arms, and the wiring to use all of them.</p>
    <p>You may hold and ready twice as many items as a two-armed character. You have Advantage on Athletics Tests to climb, grapple or hold something shut, and on Tests to resist being disarmed.</p>`],

  ["adaptive-venom", "Adaptive Venom", `<p>Glands behind your fangs that learn what they have tasted.</p>
    <p>Your bite is a melee weapon dealing <strong>3 + Strength bonus</strong> damage. Anyone it wounds must pass a <strong>Challenging (+0) Fortitude</strong> Test or gain the <em>Poisoned</em> condition. Against a creature of a species you have already envenomed this session, the Test is one step harder.</p>`],

  ["constrictor", "Constrictor", `<p>You do not need a weapon to finish what your arms have started.</p>
    <p>While you have a grappled target you may deal <strong>Strength bonus</strong> damage ignoring armour as a Free Action on your turn.</p>`],

  ["coiled", "Coiled Body", `<p>No legs. A great deal of everything else.</p>
    <p>You cannot be knocked <em>Prone</em>, and you ignore Difficult Terrain made of water, mud or undergrowth. Ladders, stairs built for human legs and anything requiring you to sit are a problem you solve slowly and with bad grace.</p>`],

  // ── Splice ──
  ["gene-splice", "Gene-Splice", `<p>Animal DNA laid over a human genome, by design or by accident.</p>
    <p>Choose three adaptations when this species is applied — one sensory, one defensive, one offensive — and write them into this trait. Typical choices: darksight, scent tracking or hearing; hide, scales or a fat layer worth 1 armour; claws, a bite or a goring horn worth 2 + Strength bonus damage.</p>
    <p>Whatever you pick shows. There is no passing for human.</p>`],

  ["bestial-frame", "Bestial Frame", `<p>The body works. It simply is not shaped the way the Imperium expects.</p>
    <p>You have Advantage on Athletics Tests that play to your animal build, and Disadvantage on Rapport Tests with anyone who has not met your kind before. Armour and clothing must be fitted to you at twice the usual cost.</p>`],

  // ── Replicant ──
  ["serum-hook", "Serum Hook", `<p>You were grown, and what grew you still owns the recipe.</p>
    <p>Without a dose of your serum each week you gain one level of <em>Fatigued</em> that no rest removes, cumulative. A dose costs 200 ₷ and cannot be bought from anyone but your maker or a very good chirurgeon.</p>`],

  ["expiration-date", "Expiration Date", `<p>Your cells were built to divide fast. They will not do it for long.</p>
    <p>You have Advantage on Fortitude Tests to recover from injury and heal at twice the usual rate. You also age at twice the usual rate, and the GM knows the year you were made.</p>`],

  ["hypno-scars", "Hypno-Scars", `<p>Skills laid straight into the meat, along with the obedience that came with them.</p>
    <p>You begin play knowing one Specialisation of the GM's choosing that your background cannot explain. When someone speaks a phrase from your conditioning you must pass a <strong>Challenging (+0) Discipline</strong> Test or obey it for one round.</p>`],

  /* ── Human subspecies ───────────────────────────────────────────────────
     The book gives these no characteristic modifiers at all. Every one of
     them is carried by what it does, so that is what they carry here.
     ─────────────────────────────────────────────────────────────────── */

  ["visible-mutation", "Visible Mutation", `<p>Something about you did not come out the way the templates say it should, and it shows.</p>
    <p>Work out the mutation with the GM — an extra arm, a tail, stalked eyes, a plated hide, a hybrid muzzle. It is obvious to anyone who looks. In the Imperium you hide it or you burn; among the Chaos-held it marks you for a greatness you may not have.</p>
    <p>You have Advantage on Stealth Tests to conceal what you are, or on Lore (Mutants) Tests, whichever you grew up doing.</p>`],

  ["blunted-soul", "Blunted Soul", `<p>Your soul is dimmer than a person's ought to be, and the Warp has trouble finding it.</p>
    <p>You have Advantage on any Test to resist a psychic power, and a psyker targeting you has Disadvantage. You can never manifest a psychic power, and no psychic power can heal, bless or benefit you — an ally's gifts slide off you the same way an enemy's do.</p>`],

  ["engineered-talent", "Engineered Talent", `<p>You were grown from the genes of someone who was very good at something.</p>
    <p>Choose two characteristics and three skills when this is applied: they were built into you. Advances in them cost <strong>10 XP less</strong> than the table says, to a minimum of 10.</p>`],

  ["cursed-luck", "Cursed Luck", `<p>Whatever powers object to men being copied have taken an interest in you.</p>
    <p>When a hazard would fall on nobody in particular — a collapsing gantry, a stray round, a sniper with no reason to prefer a target — it falls on you. If a thing can go wrong it does, and the GM is invited to be imaginative about it.</p>`],

  ["daemon-blood", "Daemon Blood", `<p>A Daemon Prince is somewhere in your ancestry, and occasionally remembers it.</p>
    <p>In sleep or meditation you receive visions from your forebear. With the GM's agreement these can stand in for a teacher, letting you buy an advance you have nobody to train you in.</p>`],

  ["ancestral-regard", "Ancestral Regard", `<p>Now and then the thing in your bloodline reaches through.</p>
    <p>When you spend Fate to escape death, roll any Corruption you would gain twice and take the lower. Something small and impossible happens at the same moment — a wound closes, a blade turns, a voice speaks a name.</p>`],

  ["untouchable-aura", "Untouchable Aura", `<p>Your soul is a hole, and it drinks.</p>
    <p>You carry the <strong>Blank</strong> talent, and everything it grants: you win opposed Tests against psychic powers outright, Psyniscience cannot find you, possession cannot take you, and you never gain Corruption. This trait is what DoomBC puts <em>on top</em> of that.</p>
    <p><strong>Your zone is cut off from the Warp, not merely hostile to it.</strong> Where Blank gives Disadvantage to manifest, nothing manifests at all: a power that reaches into your zone is lost with no effect. Nobody in your zone, yourself included, may spend Fate. Daemon weapons and possessed creatures lose what makes them daemonic while they are inside, and a ritual that comes into your zone simply stops, harmlessly — the gathered power goes into you.</p>`],



  ["soulless", "Soulless", `<p>People cannot bear your company and cannot say why.</p>
    <p>This <em>replaces</em> the Blank talent's Fellowship clause with a harder one: you have Disadvantage on every social Test except Intimidation against anyone with a soul, and <strong>two</strong> Disadvantage against a psyker. Animals will not approach you. Children cry. You are used to it.</p>`],



  ["anathema-touch", "Anathema Touch", `<p>What you are is worst at close range.</p>
    <p>Anyone who touches you must pass a <strong>Challenging (+0) Discipline</strong> Test or spend their next turn getting away from you. A psyker or a daemon fails automatically and takes <strong>Willpower bonus</strong> damage that ignores armour, with stigmata to show for it. Wounds your touch leaves cannot be closed by psychic powers, daemonic gifts or sorcery.</p>`],

  ["technological-contempt", "Aura of Technological Contempt", `<p>Machines fail around you and nobody has ever worked out why.</p>
    <p>Every powered device in your zone fails as though caught in a Haywire field. Purely mechanical work — a chrono, an autogun, a steam plant — jams or drifts out of true after a few rounds inside. Tech Tests in your zone are at Disadvantage, and a Mechanicus rite aimed at anything in your zone fails outright, however far away the tech-priest stands. Primitive things are untouched: a crossbow, a blade, a torch.</p>
    <p>Cloned and augmetic organs rot slowly in your presence, gene-seed included. Medicine spoils. Anyone who spends hours beside you pays for it.</p>`],

  ["hunted-by-the-machine", "Hunted by the Machine", `<p>Both Mechanicums build sensors to find your kind, and squads to end them.</p>
    <p>Your Influence with the Adeptus Mechanicus can never rise above 0, and you have Disadvantage on every social Test with any of its servants. Someone is always looking.</p>`],

  /* ── Beastman subspecies ────────────────────────────────────────────────
     The book gives these +5 and +5, a trait, and a compulsion. The
     Infamy-spending powers become once per scene: impmal has no Infamy, and
     inventing a currency for one trait would be worse than dropping the cost.
     ─────────────────────────────────────────────────────────────────── */

  ["digitigrade", "Digitigrade", `<p>Longer legs, and a gait that eats ground.</p>
    <p>Your Speed counts as one step faster when you Run or Charge, and you have Advantage on Athletics Tests to sprint or leap.</p>`],

  ["pincer-claw", "Pincer Claw", `<p>Slaanesh gave you a hand that can stop being a hand.</p>
    <p>Once per combat or scene, as an Action, one of your arms becomes a chitinous claw: a melee weapon dealing <strong>4 + Strength bonus</strong> damage with <em>Rend (3)</em>. Turning it back is free, and it reverts on its own when the scene ends. You cannot hold anything in that hand meanwhile.</p>`],

  ["hedonist", "Hedonist", `<p>Everything is worth doing if it can be felt.</p>
    <p>When something in front of you promises immediate pleasure — food, luxury, cruelty, a dance, a fight — and the cost is only later, pass a <strong>Challenging (+0) Discipline</strong> Test or take it.</p>`],

  ["toxic-flesh", "Toxic Flesh", `<p>Something foul weeps from your horns and your mouth, and it is contagious.</p>
    <p>Anyone who wounds you in melee with a natural weapon, or whom you wound with yours, must pass a <strong>Challenging (+0) Fortitude</strong> Test or gain the <em>Poisoned</em> condition.</p>`],

  ["grandfathers-endurance", "Grandfather's Endurance", `<p>Nurgle's gift is not feeling it.</p>
    <p>Once per combat or scene, as an Action, until the scene ends you cannot be knocked <em>Prone</em> or moved against your will, and you automatically pass Tests to resist Fear.</p>`],

  ["sloth", "Sloth", `<p>It will still be there tomorrow, and so, probably, will you.</p>
    <p>When a task is not urgent and someone else could do it, pass a <strong>Challenging (+0) Discipline</strong> Test or leave it. You will join in readily enough once somebody else has started.</p>`],

  ["brutal-charge", "Brutal Charge", `<p>Bronze horns and a running start.</p>
    <p>When you Charge, your melee attack deals <strong>+2</strong> damage. Once per combat or scene you may make that <strong>+4</strong> and gain Advantage on the attack.</p>`],

  ["blood-rage", "Blood Rage", `<p>The Blood God's temper, in a body that was never patient.</p>
    <p>Whenever you take damage, are insulted or are threatened, pass a <strong>Challenging (+0) Discipline</strong> Test or attack the nearest target until nothing near you is standing. You may choose to fail. Most Khorngor who live to adulthood are unusually polite, for exactly this reason.</p>`],

  ["schemer", "Schemer", `<p>Tzeentch's children climb, and the rungs are other people.</p>
    <p>When an act would raise your standing — a rival dead, a debt called in, a display of nerve in front of someone who matters — pass a <strong>Challenging (+0) Discipline</strong> Test or take it. The GM may let you test Logic first to see how badly it will cost you later.</p>`]
];

/* ══ EQUIPMENT ═════════════════════════════════════════════════════════════
   Only the gear a species is unplayable without: Ogryn-scale weapons, and the
   war plate an Astartes is defined by.
   ════════════════════════════════════════════════════════════════════════ */

const WEAPONS = [
  {
    key: "ogryn-club",
    name: "Ogryn-Sized Slab Club",
    notes: `<p>A length of structural girder with a grip wound onto one end. Built at Ogryn scale, so it carries none of the <em>Ogryn-Sized</em> penalty for the abhuman swinging it — and none of it is usable by anyone smaller.</p>`,
    damage: "5", characteristic: "str", spec: "twoHanded", attackType: "melee",
    encumbrance: 4, cost: 150, availability: "Common",
    traits: [{ key: "heavy", value: "5" }]
  },
  {
    key: "ogryn-ripper",
    name: "Ripper Gun",
    notes: `<p>A drum-fed scattergun with a bayonet the size of a shovel, made for hands that cannot find a trigger guard. Built at Ogryn scale.</p>`,
    damage: "7", characteristic: "", spec: "longGun", attackType: "ranged",
    encumbrance: 5, cost: 900, availability: "Rare", range: "short", mag: 12, ammoCost: 20,
    traits: [{ key: "loud" }, { key: "spread" }, { key: "twohanded" }]
  },
  {
    key: "astartes-boltgun",
    name: "Astartes Pattern Boltgun",
    notes: `<p>The weapon the Imperium mythologises. Mass-reactive shells that punch through a body before detonating inside it. Built for transhuman hands and recoil no unaugmented human shoulder can absorb.</p>`,
    damage: "9", characteristic: "", spec: "longGun", attackType: "ranged",
    encumbrance: 4, cost: 8000, availability: "Rare", range: "long", mag: 30, ammoCost: 600,
    traits: [{ key: "loud" }, { key: "penetrating", value: "4" }, { key: "twohanded" }, { key: "burst" }]
  },
  {
    key: "astartes-knife",
    name: "Astartes Combat Knife",
    notes: `<p>A blade the length of a mortal's forearm, carried as a sidearm and used as one.</p>`,
    damage: "4", characteristic: "str", spec: "oneHanded", attackType: "melee",
    encumbrance: 1, cost: 500, availability: "Rare",
    traits: []
  }
];

const ARMOUR = [
  {
    key: "astartes-power-armour",
    name: "Astartes Power Armour",
    notes: `<p>Ceramite plate over a powered exoskeleton, fused to its wearer through the Black Carapace. It is the best armour in the game and it is meant to be: a lasgun cannot meaningfully hurt the thing inside it.</p>
      <p>A GM allowing an Astartes into a campaign is allowing this. Without the <em>Black Carapace</em> trait it cannot be worn at all.</p>`,
    armour: 10, encumbrance: 9, cost: 1000000, availability: "Exotic",
    traits: [{ key: "loud" }]
  }
];

/* ══ SPECIES ═══════════════════════════════════════════════════════════════ */

const SPECIES = [
  {
    key: "human",
    name: "Human",
    category: "human",
    reference: "DoomBC p.4",
    size: "medium",
    notes: `<p>You are one of the uncounted quadrillions of Humanity, lifted out of the grey mass by chance or by the Gods into a champion of the Ruinous Powers — able to stand alongside the mighty Space Marines and the other monsters in Their service.</p>`,
    choice: { number: 1, value: 5, keys: ["ws", "bs", "str", "tgh", "ag", "int", "per", "wil", "fel"] },
    roles: ["Any"]
  },

  {
    key: "ogryn",
    name: "Ogryn",
    category: "abhuman",
    reference: "DoomBC p.8",
    size: "large",
    restricted: false,
    notes: `<p>You belong to the most widespread abhuman strain — a mighty and astonishingly hardy giant who towers even over a Space Marine, and who is as dull and as trusting as a child. On many worlds of the Imperium and of Chaos alike, Ogryns work mostly as loaders, labourers, bodyguards and bouncers.</p>
      <p>You stood out from the mass of your kind by unusual cleverness — the ability to count to five, say, and to write your own name — and they fitted you with brain implants to raise your intellect further still, so that you could grasp more complicated tasks. But with understanding you also became a fit target for the attention of the Dark Gods, and that let you rise further yet.</p>`,
    gmNotes: `<p><em>Conversion:</em> DoomBC gives the Ogryn S 40 and T 45 on a human baseline of 25, then adds Unnatural Strength (6) and Unnatural Toughness (6) on top. Folded into impmal's scale that is +15 to each, which is already the largest single modifier on any sheet. The book's +15 maximum Wounds becomes +4, because impmal characters run 9-14 Wounds rather than forty.</p>
      <p><em>House rule:</em> DoomBC sets no characteristic ceilings. The Intelligence cap of 40 is this module's, so that Bone-'ead stays true instead of being bought off with XP. Everything else is impmal's own 60.</p>`,
    modifiers: { str: 15, tgh: 15, ag: -10, int: -15, fel: -5 },
    maximums: { int: 40 },
    choice: { number: 1, value: 5, keys: ["str", "tgh", "wil"] },
    skills: { athletics: 2, fortitude: 1 },
    effects: { "system.combat.wounds.max": 4, "system.combat.criticals.max": 1, "system.combat.armourModifier": 1 },
    traits: ["brute-physiology", "bone-ead", "ogryn-sized"],
    equipment: ["ogryn-club", "ogryn-ripper"],
    roles: ["Warrior", "Zealot"]
  },

  {
    key: "ratling",
    name: "Ratling",
    category: "abhuman",
    reference: "DoomBC p.8",
    size: "small",
    notes: `<p>You belong to the physically smallest abhuman strain. Ratlings like you live on half a dozen worlds of their own and have settled in small communities across many worlds of the Imperium; after the Twelfth Black Crusade, billions of Ratlings were driven into slavery in the Eye of Terror.</p>
      <p>Though you are weaker than an ordinary human, a sharp eye, deft hands and an almost preternatural aim make your kind ideal scouts, thieves and snipers.</p>`,
    gmNotes: `<p><em>Conversion:</em> the book's Unnatural BS (2) and Unnatural P (2) fold into the same characteristics rather than stacking on the bonus, and Runt's −4 maximum Wounds becomes −2 on impmal's shorter scale.</p>
      <p><em>House rule:</em> DoomBC sets no characteristic ceilings. The Strength cap of 40 and the Ballistic Skill cap of 70 are this module's; everything else is impmal's own 60.</p>`,
    modifiers: { bs: 10, ag: 5, per: 5, str: -10, tgh: -5 },
    maximums: { str: 40, bs: 70 },
    choice: { number: 1, value: 5, keys: ["bs", "ag", "fel"] },
    skills: { stealth: 2, dexterity: 2, ranged: 1 },
    effects: { "system.combat.wounds.max": -2 },
    traits: ["barefoot", "runt"],
    talents: ["malExpTal0000003"],
    roles: ["Penumbra", "Savant", "Warrior", "Interlocutor"]
  },

  {
    key: "squat",
    name: "Squat",
    category: "abhuman",
    reference: "DoomBC p.9",
    size: "medium",
    notes: `<p>You call your people the Kin; humans call you Squats. Genetically modified for mining work in the regions of the Galactic Core that are hostile to all life, your kind is hardier and stronger than humans, if slightly shorter.</p>
      <p>Deep in the Core the Kin built a civilisation independent of the Imperium, but their prospecting expeditions, cut off from the Leagues of Votann during the Age of Strife, were taken in by the Imperium as Squats and classified as abhumans. Your kind rarely yields to the temptations of Chaos, because your souls resist Corruption — but it happens, and perhaps you had no choice at all, born into one of the few communities that already serve the Dark Gods.</p>`,
    gmNotes: `<p><em>Conversion:</em> Unnatural S (2) and Unnatural T (4) fold into the stat line. The book's Blunted (1) — a dampened warp presence — is carried by the subspecies of the same name rather than doubled here.</p>`,
    modifiers: { tgh: 10, int: 5, wil: 5, str: 5, ag: -5, fel: -5 },
    choice: { number: 1, value: 5, keys: ["tgh", "int", "wil"] },
    skills: { tech: 2, fortitude: 1, lore: 1 },
    effects: { "system.combat.wounds.max": 2 },
    traits: ["hard-as-stone", "sure-tread", "void-in-veins", "clever-hands"],
    talents: ["malExpTal0000068"],
    roles: ["Savant", "Warrior", "Zealot"]
  },

  {
    key: "beastman",
    name: "Beastman",
    category: "mutant",
    reference: "DoomBC p.10",
    size: "medium",
    notes: `<p>One of the most common stable human mutations turns a man into a half-man, half-beast that takes on many goatish traits: far stronger and hardier, but duller and more aggressive. The gravest change is to the mutant's mind, planting in it a deep aversion to order and a rejection of the fruits of civilisation, making him a creature of chaos and destruction. The hatred of technology can still be trained out of a Beastman; his indiscipline and his physiological incompatibility with bionics are a fundamental part of what he is.</p>
      <p>Most Beastmen live as primitive and warlike tribes, but from time to time the warbands of Chaos recruit them as sturdy, powerful and poorly controlled cannon fodder.</p>`,
    gmNotes: `<p><em>Conversion:</em> DoomBC starts a Beastman with 5 Corruption, which in impmal would be most of a career before play begins — Corruption there caps at Toughness bonus + Willpower bonus. It becomes 1.</p>`,
    modifiers: { str: 10, tgh: 10, int: -10, fel: -10 },
    choice: { number: 1, value: 5, keys: ["ws", "str", "tgh"] },
    skills: { melee: 1, awareness: 1, stealth: 1 },
    corruption: 1,
    traits: ["cloven", "aversion-to-order", "abhorrence", "horns-and-hooves"],
    roles: ["Warrior", "Zealot", "Penumbra"]
  },

  {
    key: "harpy",
    name: "Harpy",
    category: "mutant",
    reference: "DoomBC p.13",
    size: "medium",
    notes: `<p>A combination of Dark Age of Technology gene-craft and Warp mutation, Harpies are an unusual winged abhuman strain found almost exclusively on daemon worlds. They form small, primitive nomadic tribes and take their clothes, weapons and tools by robbing the other peoples of those worlds, favouring lightning raids that let them make the most of their speed and freedom of movement. Those raids also bring back slaves, who serve them both as labour and for the continuation of their line.</p>
      <p>Harpies can breed with every known human subspecies. Girls born of such a union are always Harpies; boys are of the same subspecies as the father.</p>
      <p>Cruel and vain, Harpies look down on "groundpounders" and hold themselves to be the higher beings. Now and then one leaves her tribe or is cast out and joins a Chaos warband, and now and then a warband lord conquers a whole tribe and folds it into his army.</p>`,
    gmNotes: `<p><em>Conversion:</em> Unnatural A (2) folds into Agility. Flight is kept whole, because it is the entire point of the species; the cost is carried by Hollow Bones and the armour limit.</p>
      <p><em>House rule:</em> DoomBC sets no characteristic ceilings. The Strength cap of 45 is this module's; everything else is impmal's own 60.</p>`,
    modifiers: { ag: 10, per: 5, tgh: -5, fel: -5 },
    maximums: { str: 45 },
    choice: { number: 1, value: 5, keys: ["ag", "per", "ws"] },
    skills: { reflexes: 2, awareness: 1, piloting: 1 },
    effects: { "system.combat.wounds.max": -2 },
    corruption: 1,
    traits: ["flyer", "hollow-bones"],
    talents: ["malExpTal0000116"],
    roles: ["Penumbra", "Warrior"]
  },

  {
    key: "naga",
    name: "Naga",
    category: "xenos",
    reference: "DoomBC p.13",
    size: "large",
    notes: `<p>The Naga are the result of a mad experiment by a cabal of Flesh Sculptors who tried to recreate the exterminated Laer — beloved of the Dark Prince — by transforming humans into half-serpent mutants. The monsters born of that achievement wiped out their creators, seized by fury that anyone had presumed to control them, and scattered across the Galaxy, each keeping well away from the rest.</p>`,
    gmNotes: `<p><em>Conversion:</em> Natural Armour (3) becomes +2 armour on every location, which is already a mesh vest worn under the skin. Nimble and the book's speed traits are dropped: impmal has no equivalent scale and inventing one would put the species outside the system rather than inside it.</p>`,
    modifiers: { tgh: 10, str: 5, ag: 5, int: -5, fel: -5 },
    choice: { number: 1, value: 5, keys: ["str", "tgh", "ag"] },
    skills: { melee: 1, athletics: 1, stealth: 1 },
    effects: { "system.combat.wounds.max": 2, "system.combat.armourModifier": 2 },
    corruption: 1,
    traits: ["multiple-arms", "adaptive-venom", "constrictor", "coiled"],
    talents: ["malExpTal0000109"],
    roles: ["Warrior", "Penumbra"]
  },

  {
    key: "splice",
    name: "Splice",
    category: "xenos",
    reference: "DoomBC p.14",
    size: "medium",
    notes: `<p>"Splices" is a collective name for abhuman strains carrying animal DNA. Some are fruits of Dark Age genetics, heirs of ancient colonists who grafted new genes onto themselves to survive an extreme environment; some are victims of the retrovirus weapons released in the Age of Strife; and some were made in the age of the Imperium by mad Genetors of the Mechanicum, by Flesh Sculptors, or by xenos experimenting on human captives.</p>
      <p>Splicing a human genome with an animal one is always a risky business, and the Galaxy is full of the legacies of errors in that process, or of altered DNA degrading over the generations after the modification. Many of the mindless and lethal monsters of the death worlds are built on human DNA with elements of an animal genome.</p>
      <p>This "species" is in essence a constructor for assembling those human-animal hybrids, including the sanctioned abhumans such as Felinids, Scalies and Pelagers.</p>`,
    gmNotes: `<p><em>Conversion:</em> DoomBC builds a Splice from three adaptation lists. Rather than hard-code one animal, this species carries no stat line of its own and hands the player the constructor — write the three choices into the Gene-Splice trait, and take the +5 wherever the animal argues for it.</p>`,
    choice: { number: 2, value: 5, keys: ["ws", "bs", "str", "tgh", "ag", "per"] },
    skills: { awareness: 1, athletics: 1 },
    traits: ["gene-splice", "bestial-frame"],
    roles: ["Warrior", "Penumbra", "Savant"]
  },

  {
    key: "replicant",
    name: "Replicant",
    category: "construct",
    reference: "DoomBC p.15",
    size: "large",
    notes: `<p>Known by dozens of different names on dozens of different worlds, Replicants are artificially grown humans, genetically modified for heavy and dangerous work and for rapid growth. A Replicant is not born but made, in great amniotic vats, growing from a zygote into a fully adult body in a matter of weeks, after which every piece of knowledge the work requires is implanted by hypno-indoctrination.</p>
      <p>As huge as Space Marines and comparable even in strength and endurance, Replicants are in most ways their exact opposite: instead of masterpieces of genetic optimisation and balance they are barely stable, needing constant doses of hormonal serum so that the imperfections of their bodies do not kill them — and even then most live no more than a couple of decades, degrading swiftly and dying of cancer at the end because of their unstable genome, if the dangerous work and the gang wars have not killed them first.</p>`,
    gmNotes: `<p><em>Conversion:</em> Unnatural S (4) and Unnatural T (4) fold into the stat line. The serum dependency is kept whole, because a Replicant without a leash is not the species the book wrote.</p>
      <p><em>House rule:</em> DoomBC sets no characteristic ceilings. The Intelligence and Fellowship caps of 45 are this module's; everything else is impmal's own 60.</p>`,
    modifiers: { str: 10, tgh: 10, int: -5, per: -5 },
    maximums: { int: 45, fel: 45 },
    choice: { number: 1, value: 5, keys: ["str", "tgh", "ws"] },
    skills: { athletics: 1, fortitude: 2 },
    effects: { "system.combat.wounds.max": 4, "system.combat.criticals.max": 1 },
    traits: ["serum-hook", "expiration-date", "hypno-scars"],
    talents: ["malExpTal0000055"],
    roles: ["Warrior", "Zealot"]
  },

  {
    key: "space-marine",
    name: "Space Marine",
    category: "transhuman",
    reference: "DoomBC p.6",
    size: "large",
    restricted: true,
    notes: `<p>You are one of the Space Marines of Chaos — whether an ancient veteran of the Horus Heresy, a fresher traitor, or a Marine created by the warbands of Chaos who was never loyal to the Emperor at all. You are a genetically enhanced warrior who towers over mortals and surpasses them in very nearly everything.</p>`,
    gmNotes: `<p><strong>Read this before allowing one.</strong> Even converted down to impmal's scale a marine is roughly 21 Wounds against a starting human's 12, and the power armour that comes with the species has AP 10 against flak's 4 — a lasgun hit does no damage to it at all, ever. The characteristics are survivable at a mixed table. The armour is not: encounters written for Imperium Maledictum stop working against it.</p>
      <p>Ship it, allow it deliberately, and expect to write combats differently. That is the trade, stated plainly.</p>
      <p><em>Ceilings:</em> impmal caps a human at 60 and puts an Astartes at "60+", so this entry states 80 across the board. The direction is the book's; the number is this module's.</p>`,
    modifiers: { ws: 10, bs: 10, str: 10, tgh: 10, ag: 5, int: 5, per: 5, wil: 5, fel: 5 },
    maximums: { ws: 80, bs: 80, str: 80, tgh: 80, ag: 80, int: 80, per: 80, wil: 80, fel: 80 },
    choice: { number: 1, value: 5, keys: ["ws", "bs", "str", "tgh", "wil"] },
    skills: { melee: 2, ranged: 2, athletics: 1, awareness: 1, discipline: 1, fortitude: 1 },
    effects: { "system.combat.wounds.max": 6, "system.combat.criticals.max": 1 },
    traits: ["gene-seed", "black-carapace"],
    equipment: ["astartes-power-armour", "astartes-boltgun", "astartes-knife"],
    talents: ["malExpTal0000061", "malExpTal0000113"],
    roles: ["Warrior", "Zealot"]
  }
];

/* ══ SUBSPECIES ════════════════════════════════════════════════════════════
   Attach on top of a species already on the sheet. Small by design: a
   subspecies is a twist on a race, not a second race.
   ════════════════════════════════════════════════════════════════════════ */

const SUBSPECIES = [
  {
    key: "mutant", name: "Mutant", requires: "Human", category: "mutant", reference: "DoomBC p.5",
    notes: `<p>You were born with an obvious bodily mutation. If you grew up in the Imperium you hid from society for fear of execution over something that is not your fault, or you found a way to conceal the mutation. If you grew up among the Chaos-held, everyone around you saw that you were marked by the Gods for greatness, and expected more of you than you could give.</p>`,
    gmNotes: `<p><em>Conversion:</em> the book grants +5 Corruption and one mutation rolled from a list. impmal Corruption caps at Toughness bonus + Willpower bonus, so +5 would be most of a career before play; it becomes 1, and the mutation is written into the trait rather than rolled on a table this system does not have.</p>`,
    corruption: 1,
    traits: ["visible-mutation"],
    roles: ["Any"]
  },
  {
    key: "blunted", name: "Blunted", requires: "Human", category: "human", reference: "DoomBC p.5",
    notes: `<p>You were born with a very dim soul, far weaker than other people's, and that grants you a measure of protection from psykers and from the creatures of the Warp. Often a gift, it is also a curse: it keeps you from using the gifts and the attention of the Dark Gods as fully as other men can, or from benefiting from an allied psyker.</p>`,
    gmNotes: `<p><em>Conversion:</em> the book scales this from Blunted (1) to (4) against a rising Infamy penalty. impmal has no Infamy and nothing to pay it with, so this ships at one strength, with the loss of every psychic benefit as its cost.</p>`,
    traits: ["blunted-soul"],
    roles: ["Warrior", "Penumbra", "Savant", "Interlocutor"]
  },
  {
    key: "afriel", name: "Afriel Strain", requires: "Human", category: "transhuman", reference: "DoomBC p.5",
    notes: `<p>You are a clone, an artificially grown human assembled by genetors from the DNA of great heroes or of geniuses in their field, so as to inherit their talent. Yet however great your inborn gift, it is often cancelled out by the curse of inexplicable misfortune that hangs over you and over every other Afriel. That curse is well enough known that cloning people is not popular at all, except for organs and for the gene-seed farms.</p>
      <p>Perhaps you were made by a madman, or by a fool who believed he could outplay the powers that send the curse; or perhaps you were made as an organ donor or a sacrificial lamb for a gene-seed farm, escaped somehow, and your original is walking somewhere in the Galaxy still.</p>`,
    gmNotes: `<p><em>Conversion:</em> DoomBC makes two characteristics and three skills "friendly", meaning cheaper to advance. impmal has one XP ladder and no friendly or unfriendly tiers, so the trait states a flat 10 XP reduction for the chosen five, applied by the GM.</p>`,
    traits: ["engineered-talent", "cursed-luck"],
    roles: ["Savant", "Interlocutor", "Warrior"]
  },
  {
    key: "heir", name: "Heir", requires: "Human", category: "human", reference: "DoomBC p.5",
    notes: `<p>In your veins runs the blood of a great Lord of Chaos, ascended to daemonhood for his uncounted deeds in the glory of the Gods. Your progenitor spends most of his time in the Warp, fighting the endless battles and intrigues of the Great Game, but from time to time he turns his gaze upon his heirs and grants those who have set out on the path of a champion of Chaos a portion of his power.</p>`,
    gmNotes: `<p><em>Conversion:</em> the book's +1 maximum Infamy has no impmal equivalent and is dropped. The visions and the re-roll on escaping death carry the subspecies instead.</p>`,
    traits: ["daemon-blood", "ancestral-regard"],
    roles: ["Zealot", "Interlocutor", "Mystic"]
  },
  {
    key: "pariah", name: "Pariah", requires: "Human", category: "human", reference: "DoomBC p.5",
    restricted: true,
    notes: `<p>You were born with a rare mutation — one in a billion — that turns your soul into a gaping black hole which draws psychic energy into itself. You grew up an outcast, perhaps even abandoned by your parents, because the curse makes other psychic beings, ordinary humans included, feel revulsion, unease and fear of you.</p>
      <p>A great many organisations of both the Imperium and the forces of Chaos find the anti-psychic abilities of Pariahs either useful or abhorrent, and on both sides there are those who seek your kind out as valuable agents and those who exterminate you as a dangerous blasphemy.</p>
      <p>The Gods alone know how you drew their attention, and why they should want a champion who denies their very nature.</p>`,
    gmNotes: `<p><strong>Read before allowing one.</strong> The aura is not a modifier, it is a rule that switches off an entire pillar of the game inside the Pariah's zone — psychic powers, Fate, daemons, rituals. At a table with a psyker it changes what that player can do whenever the two of them stand together. That is the whole point of the species, and it is why it ships marked.</p>`,
    coreTalents: [{ id: "PpidBBZ7dG6yziXg", name: "Blank" }],
    traits: ["untouchable-aura", "soulless", "anathema-touch"],
    roles: ["Penumbra", "Warrior"]
  },
  {
    key: "discordant", name: "Discordant", requires: "Human", category: "human", reference: "DoomBC p.5",
    restricted: true,
    notes: `<p>An exceedingly rare psychic mutation surrounds you with an aura of technological contempt that destroys any advanced technology. For reasons still unstudied, Discordants are born exclusively in places of technological abundance — voidships, or the forges of the Mechanicum. Both the loyal Mechanicus and the Dark Mechanicum hold the very existence of your kind to be an abomination, and methodically hunt down and destroy Discordants while they are still infants, or occasionally children.</p>
      <p>You escaped by a miracle, most likely under the protection of some radical luddite cult that reads the Discordant's curse as a blessing and as divine proof of its own anti-technological dogma — or else you fled the holdings of the Mechanicum and grew up in the wastes beyond the cities and the forges.</p>`,
    gmNotes: `<p><em>Conversion:</em> the book's aura is a radius in metres with a Haywire intensity. impmal fights in zones and has no Haywire scale, so the aura is your zone and the effect is stated in impmal's own terms.</p>`,
    traits: ["technological-contempt", "hunted-by-the-machine"],
    roles: ["Mystic", "Zealot", "Penumbra"]
  },

  /* The gor subspecies are the only ones the book gives a stat line, and it is
     +5 and +5. That is what they get. */

  {
    key: "slaangor", name: "Slaangor", requires: "Beastman", category: "mutant", reference: "DoomBC p.12",
    notes: `<p>Slaanesh's Beastmen are easily known by their elongated, graceful limbs and refined muzzles, often closer to a bull's than a goat's. Their hides are frequently hairless, showing pinkish skin drawn tight over bulging muscle. A Slaangor's mind undergoes further transformation, turning him into an obsessive hedonist who seeks pleasure at any price and in any form — food, luxury, dancing, sex, or violence done to others, and ideally some combination of these.</p>`,
    modifiers: { ag: 5, per: 5 },
    corruption: 1,
    traits: ["digitigrade", "pincer-claw", "hedonist"],
    roles: ["Warrior", "Interlocutor", "Penumbra"]
  },
  {
    key: "pestigor", name: "Pestigor", requires: "Beastman", category: "mutant", reference: "DoomBC p.12",
    notes: `<p>Nurgle's Beastmen are easily known by their bloated bodies, by the poisonous slime weeping from their horns and mouths, and by their ulcerated hides, through whose patchily shedding hair a yellow-green necrotic skin shows. Far more sedate and a little brighter than others of their kind, Pestigors are unhurried to the point of sloth, and are in no rush to act if not acting is an option.</p>`,
    modifiers: { tgh: 5, int: 5 },
    effects: { "system.combat.wounds.max": 2 },
    corruption: 1,
    traits: ["toxic-flesh", "grandfathers-endurance", "sloth"],
    roles: ["Warrior", "Zealot"]
  },
  {
    key: "khorngor", name: "Khorngor", requires: "Beastman", category: "mutant", reference: "DoomBC p.12",
    notes: `<p>Khorne's Beastmen are easily known by their muscled bodies and reddish hides, by bronze horns, claws and hooves, and by muzzles turned more predatory, mixing goat with wolf. A Khorngor's mind hangs forever on the edge of a mad fury, ready to fly at friends and allies over the slightest insult. Of those born Khorngor, that temper means only the strongest survive — and, remarkably, the most courteous and diplomatic, since even the finest fighter cannot live long while picking fights with everyone.</p>`,
    modifiers: { ws: 5, str: 5 },
    corruption: 1,
    traits: ["brutal-charge", "blood-rage"],
    roles: ["Warrior"]
  },
  {
    key: "tzaangor", name: "Tzaangor", requires: "Beastman", category: "mutant", reference: "DoomBC p.12",
    notes: `<p>Tzeentch's bird-like Beastmen, covered in shimmering blue feathers, form complex hierarchical societies on the worlds of Chaos, built on rising through betrayal and deceit. Tzaangors are obsessed with hoarding knowledge and with elaborate plans. Even the lowest slave in a tribe or work-gang of these mutants can rise by outwitting or killing someone above him and taking his place, which weeds out the stupid and the careless quickly.</p>
      <p>Lacking sharp claws, and with horns made for display rather than for fighting, Tzaangors are also free of many of the curses the other Beastmen carry — which makes them useful as ships' crews and as craftsmen, and not only as cannon fodder.</p>`,
    modifiers: { int: 5, fel: 5 },
    corruption: 1,
    removes: ["Horns and Hooves", "Aversion to Order"],
    traits: ["schemer"],
    roles: ["Mystic", "Savant", "Interlocutor"]
  }
];

/* ══ EMIT ══════════════════════════════════════════════════════════════════ */

const pad = (prefix, index, width) => prefix + String(index + 1).padStart(width, "0");

const traitId = key => pad("navisSpTrait", TRAITS.findIndex(([k]) => k === key), 4);
const gearIndex = key => [...WEAPONS, ...ARMOUR].findIndex(item => item.key === key);
const gearId = key => pad("navisSpGear0000", gearIndex(key), 1);

const stats = () => ({
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.348",
  systemId: "impmal",
  systemVersion: "3.3.0"
});

const flags = () => ({ [MODULE_ID]: { source: "DoomBC_Core", generated: "tools/make-species.mjs" } });

const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Talent grants point into the module's own talents pack, so the reference can
 * carry the real name rather than an empty label the sheet would render blank.
 */
const talentNames = (() => {
  const names = {};
  const root = path.join(ROOT, "src/packs/talents");

  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".json") && entry.name !== "_folders.json") {
        const document = JSON.parse(fs.readFileSync(full, "utf8"));
        names[document._id] = document.name;
      }
    }
  })(root);

  return names;
})();

/** A reference the DiffReferenceListModel understands. */
const reference = (uuid, id, name) => ({ uuid, id, name, diff: {} });

function traitDocument([key, name, notes], index) {
  return {
    name,
    type: "trait",
    _id: pad("navisSpTrait", index, 4),
    img: ICON.trait,
    folder: FOLDERS.traits.id,
    sort: (index + 1) * 100,
    system: {
      notes: { player: notes.replace(/\s+/g, " ").trim(), gm: "" },
      category: "standard"
    },
    effects: [],
    flags: flags(),
    _stats: stats(),
    ownership: { default: 0 }
  };
}

function weaponDocument(weapon, index) {
  return {
    name: weapon.name,
    type: "weapon",
    _id: pad("navisSpGear0000", index, 1),
    img: ICON.weapon,
    folder: FOLDERS.gear.id,
    sort: (index + 1) * 100,
    system: {
      notes: { player: weapon.notes.replace(/\s+/g, " ").trim(), gm: "" },
      encumbrance: { value: weapon.encumbrance },
      cost: weapon.cost,
      availability: weapon.availability,
      quantity: 1,
      equipped: { value: false, hand: "", force: false },
      damage: { base: weapon.damage, characteristic: weapon.characteristic, SL: true, ignoreAP: false },
      traits: { list: weapon.traits },
      attackType: weapon.attackType,
      spec: weapon.spec,
      category: "",
      range: weapon.range ?? "",
      rangeModifier: { value: 0, override: "" },
      mag: { value: weapon.mag ?? 0, current: null },
      ammoCost: weapon.ammoCost ?? 0,
      ammo: { id: "" },
      mods: { list: [] },
      slots: { list: [], value: 0 }
    },
    effects: [],
    flags: flags(),
    _stats: stats(),
    ownership: { default: 0 }
  };
}

function armourDocument(armour, index) {
  return {
    name: armour.name,
    type: "protection",
    _id: pad("navisSpGear0000", WEAPONS.length + index, 1),
    img: ICON.armour,
    folder: FOLDERS.gear.id,
    sort: (WEAPONS.length + index + 1) * 100,
    system: {
      notes: { player: armour.notes.replace(/\s+/g, " ").trim(), gm: "" },
      encumbrance: { value: armour.encumbrance },
      cost: armour.cost,
      availability: armour.availability,
      quantity: 1,
      equipped: { value: false, hand: "", force: false },
      category: "power",
      armour: armour.armour,
      locations: { list: ["head", "body", "leftArm", "rightArm", "leftLeg", "rightLeg"], label: "all" },
      traits: { list: armour.traits },
      damage: {},
      destroyed: {},
      mods: { list: [] },
      slots: { list: [], value: 0 }
    },
    effects: [],
    flags: flags(),
    _stats: stats(),
    ownership: { default: 0 }
  };
}

/** The figures a species moves, as one Active Effect riding on its item. */
function speciesEffect(species, id) {
  const changes = Object.entries(species.effects ?? {}).map(([key, value]) => ({
    key,
    mode: 2, // ADD
    value: String(value),
    priority: 20
  }));

  if (!changes.length) return [];

  return [{
    _id: id.slice(0, 16),
    name: `${species.name} — physiology`,
    img: ICON.species,
    changes,
    disabled: false,
    transfer: true,
    origin: null,
    duration: {},
    description: "",
    statuses: [],
    flags: flags(),
    _stats: stats()
  }];
}

function speciesDocument(species, index, { subspecies = false } = {}) {
  const id = pad(subspecies ? "navisSpSub000" : "navisSpc00000", index, 3);
  const folder = subspecies ? FOLDERS.subspecies.id : FOLDERS.species.id;

  const characteristics = {
    modifiers: Object.fromEntries(
      CHARACTERISTIC_KEYS.map(key => [key, species.modifiers?.[key] ?? 0])
    ),
    choice: species.choice ?? { number: 0, value: 5, keys: [] }
  };

  // impmal caps a human at 60 "unless stated" (core rules p.51), so every
  // species states it: 60 across the board, and a different number wherever the
  // race earns one. A subspecies has no ceilings of its own — the field does
  // not exist on that type.
  if (!subspecies) {
    characteristics.maximums = Object.fromEntries(
      CHARACTERISTIC_KEYS.map(key => [key, species.maximums?.[key] ?? IMPMAL_CEILING])
    );
  }

  const document = {
    name: species.name,
    type: subspecies ? SUBSPECIES_TYPE : SPECIES_TYPE,
    _id: id,
    img: ICON.species,
    folder,
    sort: (index + 1) * 100,
    system: {
      notes: {
        player: species.notes.replace(/\s+/g, " ").trim(),
        // Conversion notes, house rules and the "read before allowing" warnings.
        // They are for whoever runs the table, not for the entry's reader, so
        // they live in impmal's GM-notes block rather than in the description.
        gm: (species.gmNotes ?? "").replace(/\s+/g, " ").trim()
      },
      category: species.category,
      reference: species.reference,
      restricted: species.restricted ?? false,
      characteristics,
      skills: species.skills ?? {},
      size: species.size ?? "",
      corruption: species.corruption ?? 0,
      roles: species.roles ?? [],
      removes: species.removes ?? [],
      grantedTraits: {
        list: (species.traits ?? []).map(key => {
          const trait = TRAITS.find(([k]) => k === key);
          return reference(`${PACK}.${traitId(key)}`, traitId(key), trait[1]);
        })
      },
      talents: {
        list: [
          ...(species.talents ?? []).map(talentId => {
            const name = talentNames[talentId];
            if (!name) throw new Error(`Unknown talent ${talentId} granted by ${species.name}`);
            return reference(`${TALENTS}.${talentId}`, talentId, name);
          }),
          ...(species.coreTalents ?? []).map(({ id, name }) => reference(`${CORE}.${id}`, id, name))
        ]
      },
      specialisations: { list: [] },
      equipment: {
        list: (species.equipment ?? []).map(key => {
          const item = [...WEAPONS, ...ARMOUR].find(entry => entry.key === key);
          return reference(`${PACK}.${gearId(key)}`, gearId(key), item.name);
        })
      }
    },
    effects: speciesEffect(species, `navisSpFx${id.slice(-7)}`),
    flags: flags(),
    _stats: stats(),
    ownership: { default: 0 }
  };

  // Only a subspecies names the species it attaches to.
  if (subspecies) document.system.requires = species.requires ?? "";

  return document;
}

/* ── Write the tree ──────────────────────────────────────────────────────── */

fs.rmSync(OUT, { recursive: true, force: true });

const folders = Object.values(FOLDERS).map(folder => ({
  _id: folder.id,
  name: folder.name,
  type: "Item",
  folder: null,
  description: "",
  color: folder.color,
  sorting: "m",
  sort: folder.sort,
  flags: {},
  _stats: { systemId: "impmal", systemVersion: "3.3.0", coreVersion: "13.348" }
}));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "_folders.json"), `${JSON.stringify(folders, null, 2)}\n`);

const write = (dir, document) => {
  const target = path.join(OUT, dir);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(
    path.join(target, `${slug(document.name)}_${document._id}.json`),
    `${JSON.stringify(document, null, 2)}\n`
  );
};

TRAITS.forEach((trait, index) => write("Species Traits", traitDocument(trait, index)));
WEAPONS.forEach((weapon, index) => write("Species Equipment", weaponDocument(weapon, index)));
ARMOUR.forEach((armour, index) => write("Species Equipment", armourDocument(armour, index)));
SPECIES.forEach((species, index) => write("Species", speciesDocument(species, index)));
SUBSPECIES.forEach((species, index) => write("Subspecies", speciesDocument(species, index, { subspecies: true })));

console.log(
  `species: ${SPECIES.length}, subspecies: ${SUBSPECIES.length}, ` +
  `traits: ${TRAITS.length}, equipment: ${WEAPONS.length + ARMOUR.length}`
);
console.log(`written to ${path.relative(ROOT, OUT)}`);
