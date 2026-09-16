/**
 * Author the Hordes journal into src/packs/rules.
 *
 * The pack source everywhere else in src/packs is extracted JSON, which is fine
 * for a talent but miserable for six pages of rules prose. This writes that JSON
 * from readable HTML instead, so the rules can be edited as rules.
 *
 * Ids are fixed and hand-picked rather than random: the Babele translation keys
 * off them, so they have to survive a rebuild.
 *
 *   node tools/make-rules.mjs && node tools/build.mjs rules
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "src/packs/rules");

const JOURNAL_ID = "NavisHordeRules1";
const FOLDER_ID = "NavisRulesFolder";

const STATS = { systemId: "impmal", systemVersion: "3.3.0", coreVersion: "13.348" };

/** A heading that keeps a stable anchor, the way the translated journals do. */
const h = (level, slug, text) => `<h${level} id="${slug}">${text}</h${level}>`;
const p = (...parts) => `<p>${parts.join("")}</p>`;
const ul = (...items) => `<ul>${items.map(i => `<li><p>${i}</p></li>`).join("")}</ul>`;
const box = (header, ...body) =>
  `<section class="box-text light"><p class="box-header">${header}</p>${body.join("")}</section>`;
const U = (uuid, label) => `@UUID[${uuid}]{${label}}`;

const PAGE = id => `.NavisHordePage${id}`;

const table = (head, rows) =>
  `<table class="impmal"><thead><tr class="subheader">${head.map(c => `<td><p>${c}</p></td>`).join("")}</tr></thead>` +
  `<tbody>${rows.map(r => `<tr>${r.map(c => `<td><p>${c}</p></td>`).join("")}</tr>`).join("")}</tbody></table>`;

const pages = [
  {
    id: "01",
    name: "Hordes",
    html:
      p("A horde is a body of identical NPCs that fights as one creature. It has no wounds. ",
        "Its only measure of endurance is its <strong>Strength</strong> — the number of bodies still standing.") +
      p("A horde rolls once in initiative, takes one Move and one Action, occupies a single zone, and may be in ",
        "Immediate range of several enemies in that zone at once. It uses the characteristics, skills, weapons, ",
        "armour, Resolve and traits of the NPC it is made of.") +
      h(3, "what-a-horde-does-not-do", "What a Horde Does Not Do") +
      ul(
        "It has no hit locations; every hit on a horde is a body hit, so the body's armour is the horde's armour.",
        "It takes no Wounds and no Critical Wounds. It loses Strength instead, and is destroyed at 0.",
        "It cannot be knocked Prone, cannot Aim, and makes no Called Shots.",
        "It gains no Advantage for outnumbering — its numbers are already counted, once, as its modifier.",
        "It cannot be Shoved by a single creature of Average size or smaller.",
        "It reaches, and is reached from, adjacent zones in melee, as an Enormous creature does."
      ) +
      box("Two rules, and no bonus SL",
        p("Everything below rests on a single asymmetry, and it is worth reading before the tables:"),
        p("<strong>Against</strong> a horde you attack with <strong>Advantage</strong>. A wall of people is hard to ",
          "miss — but it is not easier to hurt."),
        p("A horde's <strong>own</strong> Perception, Melee, Ranged and Fellowship tests take a ",
          "<strong>modifier</strong> for its numbers: its volume of fire, its many eyes, its many voices."),
        p("Neither side is handed bonus SL, and that is the point. Damage in Imperium Maledictum is weapon damage + ",
          "SL, so bonus SL quietly becomes damage. Granting it against a horde made every shot into a crowd hit ",
          "harder the bigger the crowd was — which is how a hundred gangers evaporate in two rounds.")) +
      p("Read on: ", U(PAGE("02"), "Tier and Numbers"), ", ", U(PAGE("03"), "Taking Losses"), ", ",
        U(PAGE("04"), "The Horde's Attacks"), ", ", U(PAGE("05"), "Breaking and Conditions"), ", ",
        U(PAGE("06"), "At the Table"), ".")
  },
  {
    id: "02",
    name: "Tier and Numbers",
    html:
      h(3, "attacking-a-horde", "Attacking a Horde") +
      p("Attack a horde <strong>with Advantage</strong>. That is the whole rule: no bonus SL, no modifier. ",
        "Advantage turns misses into hits without inflating the SL that becomes damage, which is exactly what being ",
        "an enormous, densely packed target should do.") +
      h(3, "the-horde-s-own-numbers", "The Horde's Own Numbers") +
      p("A horde adds a <strong>modifier</strong> to its own tests for the bodies it still has — to every test based ",
        "on <strong>Perception</strong>, to <strong>Melee</strong>, <strong>Ranged</strong> and thrown attacks, and ",
        "to <strong>Fellowship</strong>. The underlying characteristic tests take it too.") +
      table(["Strength", "Modifier"],
        [["1–4", "+0"], ["5–9", "+5"], ["10–19", "+10"], ["20–39", "+20"],
         ["40–59", "+30"], ["60–89", "+40"], ["90–119", "+50"], ["120 or more", "+60"]]) +
      p("Nothing else the horde does is modified: Discipline, Fortitude, Reflexes and the rest are rolled by the ",
        "NPC's own numbers, because a crowd is no steadier, tougher or quicker than the people in it.") +
      h(3, "tier", "Tier") +
      p("Tier is a coarser reading of the same Strength, and it does only two jobs: it sets how many targets one ",
        "attack can be applied to, and it is what falls to break the horde's morale.") +
      table(["Strength", "Tier"],
        [["1–9", "<strong>1</strong>"], ["10–24", "<strong>2</strong>"], ["25–49", "<strong>3</strong>"],
         ["50–99", "<strong>4</strong>"], ["100 or more", "<strong>5</strong>"]])
  },
  {
    id: "03",
    name: "Taking Losses",
    html:
      p("Resolve an attack against a horde exactly as any other attack, then read the damage against its armour.") +
      ul(
        "Make the attack test, with Advantage.",
        "Work out damage as usual: weapon damage + SL.",
        "Apply Penetrating to the horde's armour.",
        "Compare the damage to what is left of that armour."
      ) +
      box("The loss rule",
        p("<strong>Damage that meets or beats the horde's armour kills one of them. Every 2 points past the ",
          "armour kills another.</strong>"),
        p("Damage that falls short of the armour kills nobody. Armour is a threshold here, not a subtraction — ",
          "a weapon that cannot hurt one of them cannot hurt any of them.")) +
      table(["Damage, against armour 4", "Casualties"],
        [["1\u20133", "0"], ["4\u20135", "1"], ["6\u20137", "2"], ["8\u20139", "3"], ["10\u201311", "4"], ["12\u201313", "5"]]) +
      h(3, "the-area-rule", "The Area Rule") +
      box("Area fire",
        p("<strong>An attack that sweeps the formation spends 1 point per body past the armour instead of 2.</strong>"),
        p("That is <strong>Blast</strong> and <strong>Flamer</strong>, and nothing else. <strong>Spread</strong> ",
          "is not on the list: it sits on too much ordinary weaponry, and it splashes onto a neighbour rather ",
          "than covering ground.")) +
      p("No weapon needs a case of its own beyond that. Everything else a weapon does against a crowd, it already ",
        "does through its own numbers, and those numbers are damage:") +
      ul(
        "<strong>Burst</strong> grants its usual +1 SL, which is +1 damage. Nothing new is added here.",
        "<strong>Rapid Fire (X)</strong> grants Advantage and +X damage on that branch, and that is the whole of " +
          "its benefit against a horde.",
        "<strong>Blast</strong> needs no invented rating. Target the zone; the horde rolls Reflexes (Dodge) once; " +
          "it takes damage + the SL difference, and spends it a body per point.",
        "<strong>Ablaze</strong> ignores armour, so there is no threshold to beat: it kills one and then one more " +
          "per point. Fire in a packed formation is the one place the rule needs no argument.",
        "<strong>Ineffective</strong> counts the armour twice, which against a horde usually means the attack " +
          "never reaches the threshold at all."
      ) +
      h(3, "triumph", "Triumph") +
      p("A horde takes no Critical Wounds. Instead, a <strong>Triumph</strong> — doubles on a test with positive SL — ",
        "<strong>doubles the casualties</strong> of that attack. A critical hit would simply kill an ordinary minor ",
        "NPC, and a horde is made of them.")
  },
  {
    id: "04",
    name: "The Horde's Attacks",
    html:
      p("A horde attacks once, as its Action. It makes <strong>one</strong> attack test and applies the result ",
        "against up to <strong>Tier</strong> targets within reach, chosen by the GM. Each defender defends ",
        "separately — with Melee, or Reflexes (Dodge) — so the SL difference, and the damage, can differ for each.") +
      p("Damage against each target is <strong>weapon damage + SL</strong>, as it is for anyone. The horde's numbers ",
        "are already in that SL, through the modifier on the test — they are not counted a second time as damage.") +
      p("A horde may Charge, with Advantage, by the usual rule. It gains no Advantage for outnumbering.") +
      h(3, "engulf", "Engulf") +
      p("If a character ends their turn in the horde's zone, the horde may spend its Action to close over them. ",
        "The character is <strong>Restrained (Minor)</strong> and automatically suffers the horde's attack at the ",
        "start of each of its turns until they break free.") +
      p("This is what makes a horde a hazard of position rather than a bag of damage: the answer to it is to not be ",
        "standing in the middle of it.")
  },
  {
    id: "05",
    name: "Breaking and Conditions",
    html:
      h(3, "breaking", "Breaking") +
      p("A horde needs no morale subsystem of its own. Imperium Maledictum already has Resolve and Superiority, and ",
        "they carry it:") +
      box("Breaking",
        p("<strong>Every time the horde's Tier falls by one, it loses 1 Resolve.</strong>"),
        p("At Resolve 0 the horde is <strong>Desperate</strong>, and the GM chooses Flee!, Surrender! or Charge! by ",
          "the standard rule.")) +
      p("Because the party's Superiority already works against enemy Resolve, nothing about a horde sits outside the ",
        "rules the table already uses — and the players get a visible tactical goal: break a band, not grind a ",
        "number. A gang leader with Resolve 1 shatters on the first band lost; fanatics with Resolve 3 have to be ",
        "taken apart.") +
      p("A horde whose Resolve cannot fall — Fearless, in the old phrasing — simply never loses it.") +
      h(3, "conditions", "Conditions") +
      box("Conditions",
        p("<strong>A condition that covers a zone, or that does not depend on any one body, applies normally. A ",
          "personal condition instead costs the horde 1 Tier for its duration, to a minimum of 1.</strong>")) +
      table(["", "On a horde"],
        [["Ablaze, Haze, Darkness, Difficult Terrain, Hazard, Cover", "Apply normally"],
         ["Stunned, Frightened, Blinded, Deafened, Overburdened", "−1 Tier while they last"],
         ["Bleeding, Prone, a single member Grappled", "Ignored"]]) +
      p("The GM has the last word on anything not listed. The test is simple: could this reach a meaningful part of ",
        "the unit?")
  },
  {
    id: "06",
    name: "At the Table",
    html:
      p("Navis Apexialis automates the arithmetic. Open any NPC, go to the <strong>Effects</strong> tab, and enter a ",
        "Strength in the <strong>Horde</strong> row. That is the whole of the setup — a horde is a flag on an ",
        "ordinary NPC, so any stat block from any compendium can be fielded as one without being copied or ",
        "imported.") +
      h(3, "what-runs-by-itself", "What Runs by Itself") +
      ul(
        "Targeting a horde gives you Advantage, and the tooltip says where it came from.",
        "The horde's own Perception, Melee, Ranged and Fellowship tests take its numbers modifier, tooltip and all.",
        "Damage becomes casualties, after the system's own armour, Penetrating, Ineffective and force-field maths.",
        "Blast and Flamer spend a point per body instead of two; a Triumph doubles the result.",
        "A falling Tier spends Resolve, and the chat announces when the horde goes Desperate.",
        "Bleeding and Prone are refused; Stunned, Frightened, Blinded, Deafened and Overburdened cost a Tier.",
        "A horde at 0 Strength is marked dead, and so is any NPC driven to maximum Wounds.",
        "The token carries the number of bodies still standing, and it follows every loss.",
        "The chat card says how many of them fell, above the damage line."
      ) +
      h(3, "what-stays-with-the-gm", "What Stays with the GM") +
      p("Choosing up to Tier targets for one attack — the system already applies one test to every token you have ",
        "targeted, so the row tells you the number and stays out of the way. Engulf. And which of Flee!, Surrender! ",
        "or Charge! a broken horde does.") +
      h(3, "two-settings", "Two Settings") +
      p("Both are in <em>Configure Settings → Navis Apexialis</em>, because both are a table's taste rather than a ",
        "rule:") +
      ul(
        "<strong>Horde: damage bonus</strong> — extra damage on the horde's own attacks, on top of its modifier. " +
          "Off by default, because the modifier already counts those bodies once, through SL. Raise it only if you " +
          "want hordes deadlier still.",
        "<strong>Mark dead NPCs</strong> — an NPC at maximum Wounds, and a horde at 0, take the dead status. A " +
          "house rule: impmal itself kills only through Critical Wounds. It never touches player characters."
      ) +
      h(3, "an-example", "An Example") +
      p("<strong>A horde of 30 gangers. Tier 3. Armour 2. Ranged 40, lasguns (6).</strong>") +
      p("A veteran lobs a frag grenade (6, Blast). The horde fills the zone, so it rolls Reflexes (Dodge) once and ",
        "loses by <strong>3 SL</strong>. Damage is 6 + 3 = 9 against armour 2: the armour is beaten, which is one ",
        "body, and the 7 points past it are spent a body apiece because Blast sweeps \u2014 <strong>8 casualties</strong>. ",
        "Strength falls 30 \u2192 22, which drops it out of its band: <strong>Tier 3 \u2192 2</strong>, and the horde's ",
        "Resolve of 1 is spent with it. It is Desperate.") +
      p("His squadmate's bolter would have done less. Eight damage plus a point of SL, with Penetrating 4 stripping ",
        "the armour outright, is nine against nothing: one body for beating the armour, then 9 \u00f7 2 more. ",
        "<strong>Five.</strong> Excellent shooting. Not a grenade.") +
      p("The GM rolls Charge! Twenty-two gangers still standing is a <strong>+20</strong> modifier, so the mob ",
        "shoots at 40 + 20 = <strong>60</strong> \u2014 and it applies that one test against <strong>two</strong> ",
        "targets, Tier 2, for damage 6 + SL each.") +
      p("The lesson the table takes away is the one worth having: against a crowd, bring something that covers ",
        "ground. And what is left of the crowd still shoots better than any one ganger ever could.")
  }
];

const journal = {
  _id: JOURNAL_ID,
  name: "Hordes",
  folder: FOLDER_ID,
  sort: 100,
  ownership: { default: 0 },
  flags: {},
  _stats: STATS,
  pages: pages.map((page, index) => ({
    _id: `NavisHordePage${page.id}`,
    name: page.name,
    type: "text",
    title: { show: true, level: 1 },
    image: {},
    text: { format: 1, content: page.html },
    video: { controls: true, volume: 0.5 },
    src: null,
    system: {},
    sort: (index + 1) * 100,
    ownership: { default: -1 },
    flags: {},
    _stats: STATS
  }))
};

const folders = [{
  _id: FOLDER_ID,
  name: "Rules",
  type: "JournalEntry",
  folder: null,
  description: "",
  color: "#7a2020",
  sorting: "a",
  sort: 100,
  flags: {},
  _stats: STATS
}];

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "_folders.json"), `${JSON.stringify(folders, null, 2)}\n`);
fs.writeFileSync(path.join(DIR, "hordes.json"), `${JSON.stringify(journal, null, 2)}\n`);

console.log(`wrote src/packs/rules/hordes.json — ${pages.length} pages`);
