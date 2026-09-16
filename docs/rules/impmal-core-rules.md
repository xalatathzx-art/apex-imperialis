# Imperium Maledictum — core rules digest

Working notes from the Core Rulebook (Russian translation v1.01, 2023-06-14;
`D:/Imperium_Maledictum_Core_Rulebook_2023_06_14_на_русском_v_1_01.pdf`, PDF page
numbers = book page numbers). Written to design new mechanics for Navis
Apexialis against, not to replace the book. English terms follow the impmal
Foundry system; Russian terms from the translation in brackets.

**Coverage.** Read in full: Introduction basics (p.6–7), Patron (16–45), Character
creation (46–90), Skills and Talents (91–117), Armoury (118–157), Psychic Powers
(158–184), Rules (185–227), Between Missions (228–234), Gamemaster (304–314), bestiary
frame and NPC rules (315–318), Appendices (355–362). **Not digested:** setting chapters
(The Imperium 235–248, Macharian Sector 249–303) and individual bestiary stat blocks
(319–354) — no rules there beyond per-creature traits; read them when a mechanic touches a
specific faction, world or creature. The PDF's text layer scrambles multi-column tables:
where a table was reconstructed it says so; exact item and critical-wound numbers should be
checked against the impmal / impmal-core compendiums.

| § | Topic | § | Topic |
| --- | --- | --- | --- |
| 1 | Tests, SL, advantage, opposed, extended | 11 | Character creation, origins, factions, roles, advancement |
| 2 | Influence | 12 | Skills |
| 3 | Superiority and Resolve | 13 | Talents |
| 4 | Combat: turns, zones, terrain, actions, attacks | 14 | Armoury: trade, traits, weapons, armour, gear, augmetics |
| 5 | Wounds, criticals, death, injuries, environment | 15 | Psychic powers, warp charge, perils |
| 6 | Healing | 16 | Between missions |
| 7 | Fate | 17 | GM guidance, encounters, rewards, optional rules |
| 8 | Corruption, mutations, malignancies | 18 | NPC roles and stat blocks |
| 9 | Vehicles | 19 | Fumbles, critical wound tables, conditions |
| 10 | Dice conventions | 20 | Patron: duties, boons, liabilities |

---

## 1. Tests (Проверки) — p.185–191

- **Roll d100 ≤ target** (skill / specialisation / characteristic, after difficulty).
- **Three kinds:** simple; opposed (встречная); extended (длительная).
- **SL (КУ):** tens digit of target − tens digit of roll. Counted on failures too
  (negative). Example: target 72, roll 26 → +5. Target 54, roll 94 → −4.
- **Outcome table:**
  | SL | Result |
  | --- | --- |
  | +5 or more | Astounding success («Да, идеально») |
  | +3…+4 | Impressive success («Да, и…») |
  | +1…+2 | Success |
  | +0 | Marginal success («Да, но…») — a pass with SL 0 |
  | −0 | Marginal failure («Нет, но…») — roll over target but not a full −1 |
  | −1…−2 | Failure |
  | −3…−4 | Impressive failure («Нет, и…») |
  | −5 or less | Astounding failure |
- **SL adjustment:** talents, influence, superiority, powers add/remove SL after the
  roll; can flip pass/fail. An adjustment landing exactly on 0 = marginal *success* (+0).
- **Quick play option:** auto-pass Average (+0) tests with ≥1 advance in the skill;
  if SL matters, +1 SL per advance.
- **No re-tests** until consequences are dealt with or circumstances change.
- **Automatic:** 01–05 always succeeds, 96–00 always fails (even if target >96 or <05);
  such results count as marginal. **99 and 00 are always a fumble** (sidebar).
- **Difficulty:** Very Easy +60, Easy +40, Routine +20, Average +0 (default; most
  combat), Challenging −10, Difficult −20, Very Hard −30.
- **Advantage / Disadvantage (Преимущество / Помеха):**
  - Advantage: *may* swap tens and units digits if better (72 → 27).
  - Disadvantage: *must* swap if worse (28 → 82).
  - Each advantage cancels one disadvantage. Extra advantages beyond the first:
    +10 each; extra disadvantages beyond the first: −10 each.
  - Sources: terrain, range, surprise, Fate spend, help.
- **Help (Помощь):** GM allows; the helper usually needs ≥1 advance in the skill
  and must be nearby; the character with the higher skill rolls with Advantage.
  Not for resisting disease/poison/fear/hazards (GM call).
- **Opposed:** both roll; more SL wins; final SL = winner's SL − loser's SL. You can
  win while failing (−1 vs −3 → win by 2). Tie → higher skill value; still tied → GM.
- **Extended:** GM sets required SL, roll interval, skill(s) and difficulty, and
  a deadline. A success adds ≥1 SL to the pool, a failure removes ≥1. Fail if
  out of attempts or the pool drops below 0 (may retry with less time).
  Helpers roll their own tests and add SL (instead of giving Advantage);
  different skills can feed one pool. Difficulty design: required SL ÷ attempts.
- **Terms:** *Doubles* (дубль: 11, 22…) drive criticals/fumbles in combat.
  *Reroll* — take the second result. *Swap* — reverse digits. *Modifiers* —
  applied to the target before rolling. *Bonus SL* — applied after the roll.

## 2. Influence (Влияние) — p.192–195

- Standing with a faction, **−5…+5**. Adds (or removes) SL equal to its value on
  **social tests** with that faction's members; sets initial attitude; can gate
  access to goods and services.
- Ladder: +5 Reverence (fights for you, resources, intel) · +4 Respect (secrets,
  introductions) · +3 Trust (unusual gear, hire people, overlook minor crimes) ·
  +2 Favour (lend common gear, services) · +1 Goodwill (some info, faster
  service) · 0 Indifference · −1 Suspicion (watches, demands rules) · −2
  Distrust (refuses help) · −3 Dislike (actively hinders) · −4 Contempt (sends
  agents against you) · −5 Hatred (destroys you given a chance).
- **Patron influence** is tracked **secretly by the GM**. Showing proof of
  patronage (insignia, seal) lets you use the patron's influence instead of your
  own with a faction that recognises it — risky, the patron may have hidden
  enemies. Tell the GM you invoke it; they secretly add/subtract SL.
- **Personal influence:** characters start with **+1 with one faction**. Grow it
  through **contacts** (influence with individual members). Dealing with a
  contact uses both personal-with-contact and faction influence (they sum:
  −2 faction + +3 contact = +1).
- **Accumulating:** +1 with three different contacts in one faction → spend an
  Endeavour to raise faction influence by +1 and lower those three contacts by −1.
  −1 or worse with three contacts in one faction → at mission end faction
  influence drops −1 automatically and each of those contacts loses 1 negative.
- Several characters with influence on the same faction: use the one leading;
  **no stacking**.
- **Changes only at mission end** (debrief, «разбор полётов»). Hard to gain
  (usually max +1 per mission), easy to lose:
  +1 protected key members / advanced interests · −1 broke rules needlessly,
  caught lying, cover blown · −2 attacked members or damaged property/resources ·
  −3 betrayed or killed an ally from it, seriously crippled its goals.
  Campaign completion can give +2.
- Stealth / proxies / no traces → no change. If the patron's influence wasn't
  used, only personal influence can change; if it was, both can.
- **Temporary influence:** bribes (+1/+2 SL), leverage/secrets (+2 SL or more) on
  social tests with a contact; lost the first time a social test against that
  contact fails.
- Scale matters: easier to sway a skitarii cohort than the whole Mechanicus.

## 3. Superiority (Превосходство) — p.196–197

- A **group** value vs a specific enemy. Each turn you may add **+SL equal to
  current Superiority to one test of your choice**; then not again until your
  next turn.
- **Before combat, max +3**, from: Know your enemy (+1, valuable hidden
  intel), Know the battlefield (+1, scouting/position/ambush prep), Know the
  players (+1 for a clever plan). Shock and awe can also grant it.
- **Resolve (Решимость):** NPC-only. A leader present → others use the leader's
  resolve. Home ground +1, nothing to gain −1. Resolve 0 → won't fight except in
  self-defence.
- **Superiority ≥ enemy Resolve → enemy becomes Desperate (Отчаяние)**: Flee!,
  Surrender!, or Charge! (last mad attack). A signal to end the fight.
- **Gain in combat:** defeat an enemy leader; defeat an elite; defeat X+ troops in
  one turn (X = their resolve). Surprise round ending grants +1.
- **Lose 1 when:** a character takes their first Critical Wound; a character is
  defeated; sudden reinforcements / drastic battlefield change; a character
  Panics (−1); disagreement over Retreat (−2). Being surprised removes it.
- Enemy defeated = surrendered, panicked or dead.

## 4. Combat structure (Бой) — p.198–213

### Rounds, initiative, turns
- Rounds of a few seconds. **Initiative = Perception bonus + Agility bonus**
  (characters). Ties: higher Reflexes; still tied → opposed roll.
- Pre-combat actions (draw weapons, talents, powers) may alert enemies; GM
  decides when combat starts.
- **Turn = one Move + one Action.** Move may be before or after the action.
- **Free actions:** trivial things (open door, step within zone, draw). Rule of
  thumb: if it needs a test, it's an Action.
- **Reactions:** in others' turns, **one per round** (until your next turn)
  unless stated: Dodge ranged attacks, Deny the Witch (psykers), attacks of
  opportunity when someone leaves melee.
- **Surprise round:** only the surprisers act (in initiative order), with Move +
  Action, **Advantage on Melee**, target can't defend; at its end surprisers gain
  +1 Superiority (surprised PCs lose theirs). Unaware targets can be hit with
  Surprise Attacks.

### Zones and distance — p.200–206
- Battlefield of **zones** (≈5–10 m each; 5–10 zones recommended; can be created
  or destroyed mid-fight; air can be zones).
- Distances: **Immediate** (arm's reach) · **Close** = same zone (moving there is
  free) · **Medium** = adjacent zone (costs Move) · **Long** = two zones (Move +
  Run) · **Extreme** = three+ zones.
- **Size:** Tiny (<0.5 m) · Small (≤1 m) · Average (≤2.5 m; humans, marines) ·
  Large (≤5 m; ogryn, tyrant) · Enormous (≤10 m; occupies a whole zone, enemies
  can't end turn in it unless climbing; melee reaches/is reachable from adjacent
  zones) · Monstrous (10+ m, several zones).
- **Speed:** Normal (PCs: free within zone, Move to adjacent) · Fast (Move = two
  zones) · Slow (Move needed within zone, Run to adjacent).
- **Prone (Сбит с ног):** dropping prone is free; standing costs Move; crawl only.
- Climb/crawl/sneak/squeeze/swim: speed −1 step (min Slow), tests at GM call.
- **Falling:** prone; from more than own height → a Critical Hit to a random
  location, +1 on the critical roll per 5 m; short controlled fall (≤10 m) may be
  avoided with Average (+0) Athletics or Reflexes.
- **Flying:** normal move rules at the flight speed; ignores Difficult Terrain;
  vertical zones; falls if flight fails.
- **Jumping:** standing high jump = Str bonus in feet (×2 with run-up); long jump =
  2×Str bonus in feet (×2 with run-up); beyond that Average Athletics, +1 ft per SL.
- **Mounts:** one size larger; mounting costs Move, dismount free (Action with
  harness); rider uses mount speed; unwilling mount → Athletics (Riding) or
  Rapport (Animals) or fall prone (harness auto-passes); mount knocked down →
  Reflexes to land on feet (harness auto-fails); enemies choose rider or mount;
  trained mount acts on your initiative, free to direct its movement, Rapport
  (Animals) to make it act; untrained/intelligent acts on its own, keep-seat
  test each turn (opposed vs its Athletics (Might) if it bucks).

### Terrain properties (Свойства местности) — p.204–206
- **Obstacle (Преграда):** crossing costs an Action with a GM-set test; turn ends
  regardless of outcome.
- **Cover (Укрытие):** vs ranged, Light +2 AP all locations, Medium +4, Heavy +6;
  only one cover at a time. Start turn in a cover zone → spend Move to take cover;
  entering a cover zone → Take Cover action needed that turn. Called Shots can
  ignore cover AP.
- **Chase (Погоня):** gap 0–10 set by GM (0 caught, 10 escaped). Everyone spends
  Move on Average Athletics (Running) / Athletics (Riding) / Piloting. Compare the
  quarry's worst SL with the pursuers' best; gap changes by the difference.
  Gap 0 → quarry abandons its slowest or fights. Superiority adds SL when fleeing
  after a Retreat.
- **Darkness (Темнота):** ambush allowed, Advantage on Stealth (Hide); Awareness
  (Sight) and ranged attacks into it succeed only on 01–05; Disadvantage on
  Dexterity, Melee, Reflexes, Tech and anything light-dependent.
- **Difficult Terrain (Пересечённая местность):** start turn there → speed −1 step;
  Athletics (Running) and Reflexes (Dodge) with Disadvantage; entering it ends
  remaining movement (Run needed to continue).
- **Features (Элементы):** interactive objects that add/remove zone properties
  (valve → Heavy Haze, cogitator → remove Obstacle, promethium → Deadly Hazard).
- **Hazard (Опасность):** entering or starting a turn: Minor 5 damage · Serious
  10 · Deadly 15.
- **Haze (Марево):** Light — ambush, Advantage Stealth (Hide), Disadvantage on your
  Awareness (Sight) and Ranged; outsiders get Disadvantage seeing/shooting into
  it. Heavy — you are Blinded; outsiders can't see into or shoot into it
  (grenades still possible).
- **Poorly Lit (Скверное освещение):** ambush; Disadvantage on Awareness (Sight)
  and on ranged attacks at targets in it.
- **Warp-touched (Прикосновение варпа):** Advantage on Psychic Mastery to manifest;
  powers generate extra Warp Charge = SL (pass or fail); minor Corruption source —
  end turn there → Routine (+20) Fortitude or 1 Corruption; GM may roll Psychic
  Phenomena for the zone.

### Actions (Действия) — p.207–210
- **Aim (Прицеливание):** next turn weapon range +1 step and choose hit location
  without penalty; lost if you move before shooting; not with Burst/Rapid fire.
- **Attack.**
- **Charge (Натиск):** move up to speed and melee attack with **Advantage**; not
  against enemies already in your zone; until your next turn Disadvantage on
  Melee/Reflexes to defend yourself (rider and mount both).
- **Defend (Защита):** pick an ally in Immediate range — attacks against them go
  to you until your next turn. Or defend a zone: entering it requires an Action
  and an opposed Athletics (Might) vs yours (you get Advantage with a shield or a
  defending ally); losers can't enter; winner pushes you aside (defence ends).
  Enemies in adjacent zones may melee you.
- **Disengage (Выход из боя):** leave Immediate range without an attack of
  opportunity; then Move to another zone or into cover.
- **Dodge (Уклонение):** until your next turn Advantage on the next Melee or
  Reflexes (Dodge) test to defend; and you may Dodge ranged attacks from known
  enemies **without spending your reaction**.
- **Flee / Panic (Паника):** declared at the start of your turn, uses Move + Action;
  you leave combat and initiative; Superiority −1.
- **Grapple (Захват):** opposed Athletics (Might) or Melee (Brawling) vs Athletics
  (Might), Melee (Brawling) or Reflexes (Dodge); win → target Restrained (Minor).
  Release anytime. Target escapes with an Action (opposed again). Hold with an
  Action (no test); if you do anything else or take a wound the target may use a
  reaction to escape without the Restrained disadvantage. Size: one step bigger →
  Advantage; two steps → Advantage and the other Disadvantage. Grappling
  something 2+ sizes bigger holds only a limb: arm/tail → Disadvantage with it;
  legs → speed −1.
- **Help (Помощь):** ally gets Advantage on their next test.
- **Hide / Ambush (Засада):** Stealth test in a zone with Cover or Haze etc.; record
  SL; enemies need more SL on Awareness. Speed becomes Slow while hidden.
  Can be attacked only after winning Awareness vs Stealth or Search. Revealed by
  loud actions. **A successful attack from hiding (Surprise Attack) is an automatic
  Critical Hit.**
- **Run (Бег):** move one more zone.
- **Search (Поиск):** Awareness (Sight) at GM difficulty (terrain modifies); can
  oppose an Ambush; can sense warp disturbances with Awareness (Psyniscience) or
  Intuition (Surroundings).
- **Seize the Initiative (Перехват инициативы):** do nothing now; act first from
  next round and stay first until someone else seizes it.
- **Shove (Толчок):** opposed Athletics (Might) vs Athletics (Might) or Reflexes
  (Dodge) of a target in Immediate range; push them metres equal to SL
  difference and leave melee; win by 3+ → push into an adjacent zone (or off a
  ledge — falling damage).
- **Manifest (Сотворение психосилы).**
- **Hold / Overwatch (Контроль):** declare a trigger and an action; if it doesn't
  trigger this turn, take another action at the end of the initiative order.
- **Reload (Перезарядка).**
- **Retreat (Отступление):** ends your turn; each ally at their turn start may join;
  if all agree the group leaves combat (skip ahead or a chase). Retreating
  characters add Superiority as SL on escape tests in the chase. An ally
  refusing → the group may stay or abandon them; the rift costs −2 Superiority.
- **Called Shot (Точечная атака):** choose a location, attack with Disadvantage;
  on success hit that location (units digit ignored); can ignore cover AP
  (usually head and arms exposed, GM decides).
- **Take Cover (В укрытие!).**
- **Use an Item / Feature.**
- **Improvise** — describe it; GM rules.

### Making attacks — p.211–213
- **Melee:** target in Immediate range; **opposed Melee vs Melee** (matching
  specialisations) or the defender's **Reflexes (Dodge)** — defending **doesn't
  use a reaction**. Defender with no melee weapon or shield rolls with
  Disadvantage. If the defender does nothing, the attacker gets Advantage.
  Attacker wins → **damage = weapon damage + SL difference**. The defender deals
  no damage by winning (except via a Critical).
- **Ranged:** target in sight and range; **Average (+0) Ranged** of the right
  specialisation; target may oppose with Reflexes (Dodge) using a reaction or
  after the Dodge action. **Damage = weapon damage + SL.** Dodge success reduces
  the attacker's SL by the dodger's SL; attacker at +0 or lower → miss. Can't
  dodge unseen shooters. Track ammo.
- **Hit location (units die):** 1 Head · 2 Left Arm · 3 Right Arm · 4 Left Leg ·
  5 Right Leg · 6–0 Body. Armour on that location reduces damage; the rest
  becomes Wounds. Unknown location (fall, blast, phenomenon) → GM rolls 1d10.
- **Range:** Close (own zone), Medium (own or adjacent), Long (within two zones);
  shooting beyond → Disadvantage. **Shooting at Immediate range → Disadvantage**
  (except Handy (Удобное) weapons). Ranged weapon used in melee = improvised.
- **Engaged (Схватка):** attacking something in Immediate range engages you;
  leaving lets it make a melee attack as a reaction (if armed).
- **Doubles:**
  - **Critical (Триумф):** doubles on a Melee/Ranged test with positive SL (+0
    counts). The opponent takes a **Critical Hit** even if you lost the opposed
    test. Defending with Melee and rolling a critical = counterattack crit.
  - **Fumble (Фиаско):** doubles with negative SL (−0 counts) → roll on the Fumble
    table (p.355), even if you won the opposed test (both can be hurt).
- **Surprise Attack:** attack with Advantage; success = automatic Critical Hit.
- **Outnumbering:** a side with twice as many in a melee gets Advantage on Melee.
- **Two weapons:** any one-handed melee and pistols; attack with either; or both at
  once, each with Disadvantage (defender rolls separately). **Off-hand attacks
  have Disadvantage** unless Ambidextrous. Dual Wield or Gunslinger talents
  remove the two-weapon penalty; pistol + blade without penalty needs both.

## 5. Wounds, criticals, death — p.214–218

- **Max Wounds = Str bonus + 2 × Toughness bonus + Willpower bonus.**
- Each point of damage = 1 Wound. **At max Wounds:** only Move *or* Action per
  turn (until ≥1 wound healed); **Average (+0) Fortitude (Pain) or fall
  Unconscious** — repeat on every new wound; no waking until a wound heals.
  Can't exceed max: further wounding attacks inflict Critical Wounds.
- **Critical Wounds:** from any wounding attack while at max Wounds, or from a
  Critical Hit.
  - **Overflow (Избыточный урон):** damage beyond max → Critical Wound; roll
    **1d10 + overflow** on the location's critical table.
  - **Critical Hit** (critical doubles or surprise attack): location from the
    attack (or roll); normal damage applies; roll 1d10 on the critical table
    **without** adding overflow (unless the damage also pushed past max).
- **Death:** unhealed Critical Wounds **exceeding Toughness bonus** → die at the end
  of the round. Unconscious → anyone adjacent with a non-Useless weapon kills you
  with an Action, no test. Some critical results kill outright.
- A critical counts as unhealed until someone does the treatment its table entry
  names; entries without treatment don't count toward death.
- **Sudden death (Внезапная смерть):** minor NPCs die from any one critical; tougher
  foes follow PC rules.
- **Non-lethal blows:** declare before attacking; damage as normal but no
  Critical Wounds (even from critical hits) and no wounds past max; the target
  still makes Average Fortitude (Pain) or falls Unconscious.
- **Critical wound effects (general):**
  - Body: Disadvantage on Str and Ag tests, speed −1 step.
  - Arms: Disadvantage on anything using that arm.
  - Legs: Disadvantage on mobility (Reflexes, Athletics), speed −1 step.
- **Fractures:**
  - Minor — Eye: Disadvantage on Awareness (Sight). Jaw: Disadvantage on Rapport
    and all speech. Nose: Disadvantage on Awareness (Smell). Heals in 30+1d10
    days, then Routine (+20) Fortitude or a permanent −5 on the matching tests
    (Body: Str and Ag; arm: tests with that arm; legs: mobility). A Routine
    Medicae test within a week and a splint (counts as amputated while splinted)
    avoid the Fortitude test.
  - Major — Eye: Disadvantage on Awareness (Sight) and blind in that eye. Nose: no
    smell. Jaw: can't speak for weeks. Body: every physical action needs Average
    Fortitude (Pain) → success acts with Disadvantage, failure helpless until
    next day or Average Medicae. Arm: arm useless, Disadvantage on two-handed
    tests, no Two-Handed weapons. Legs: as minor but mobility tests no easier
    than Difficult (−20). Heals in 40+2d10 days; failure → −10 permanent.
- **Injuries / amputations (Увечья):** persist after the critical heals; need
  surgery (a physician or Surgeon talent) before criticals of that type heal.
  - Ear: both lost → Disadvantage Awareness (Hearing).
  - Eye: Disadvantage Awareness (Sight) for 5d10 weeks of adjustment; both → blind.
  - Finger: fumble on units die 1 per lost finger (1, 1–2, …) on tests with that
    hand; 4+ fingers → as hand.
  - Arm: Disadvantage on two-handed tests, no Two-Handed weapons.
  - Hand: same, can strap a shield; losing the dominant hand → Disadvantage with
    the other hand until Ambidextrous.
  - Foot: speed −1, Disadvantage on mobility.
  - Leg: speed −1, Disadvantage on mobility, mobility tests no easier than −20.
  - Nose: Disadvantage Awareness (Smell).
  - Teeth: −1 Rapport per two lost; 16+ lost → slow eating.
  - Toes: −1 Agility and Melee per toe, permanently.
  - Tongue: can't speak; Disadvantage on Rapport; speech tests only on 01–05.
- **Suffocation:** hold breath 10 × Toughness bonus seconds if prepared (none if
  surprised); then 1 wound per round ignoring armour; at max wounds → unconscious,
  dead after Toughness-bonus rounds.
- **Weather:** every 4 h in hostile conditions Average Fortitude (Endurance).
  Cold: 1st failure Disadvantage on Ranged and Agility tests, 2nd all tests,
  3rd+ 1d10 armour-ignoring damage; at max wounds unconscious and keeps taking
  damage and criticals until dead or safe. Effects last until 4 h out of it.

  Toxic fumes: 1st failure Disadvantage on Stealth and Awareness (Hearing,
  Smell); 2nd Poisoned (Minor); 3rd Poisoned (Major). Rebreathers etc. help.
  Heat: 1st Disadvantage on Int and Wil tests; 2nd all tests + Fatigued; 3rd+
  1d10 armour-ignoring damage; at max wounds Fatigued again and continues.
  Stripping armour and outer clothes ignores one failure.
- **Hunger / thirst:** no wound recovery or Fatigue removal while deprived.
  Water: daily Average Fortitude (Endurance), −10 cumulative each time; 1st
  failure Disadvantage on Int, Wil, Fel tests; later all tests + 1d10 damage.
  Food: every 3 days Routine (+20), cumulative −10; 1st failure Disadvantage on
  Str and Tgh tests; later all tests + 1d5 damage.

## 6. Healing (Медицинская помощь) — p.219

- Good rest (6–8 h sleep) once a day: heal **Toughness bonus** wounds; a full day
  of rest: **2 × Toughness bonus**.
- Ally with ≥1 Medicae advance: **Routine (+20) Medicae** (Average (+0) in
  combat) heals **SL + healer's Int bonus** wounds; failure heals nothing. Once
  per day, plus once more after each new Critical Wound.
- Critical wounds: treatment named per entry on the critical tables (p.359+).
  Injuries: long-term penalties, each with its own treatment.

## 7. Fate (Судьба) — p.220

- A new character has **3 Fate**. Spent Fate returns **at the start of each
  mission**. Burnt Fate is gone permanently (regained only by great deeds or
  sacrifice).
- **Spend 1** (choose one): reroll a failed test · +1 SL on a rolled test ·
  choose when you act at the start of a round regardless of initiative · ignore
  all critical wound effects (including conditions and injuries) until your next
  turn · remove one condition (removing Prone also heals 1 wound).
- **Burn 1** (choose one):
  - *Not today:* you survive a death (left for dead, thrown off a spire…), still
    wounded; you leave the scene.
  - *The Emperor protects:* avoid all damage and effects of this hit.
  - *Steel your soul:* refuse a mutation you just rolled (Corruption stays).
  - *For the Emperor!:* choose the dice result instead of rolling, even after a
    failed test; always win an opposed test by at least 1 SL; pick the location
    of a critical hit.
  - *Turn the tide:* your group gains +1 Superiority (+2 if it was 0).

## 8. Corruption (Порча) — p.220–225

- Gained when exposed to corrupting things. Resist with **Fortitude** (physical)
  or **Discipline** (spiritual), GM picks; **reduce the Corruption gained by SL**
  (min 0).
- **Minor source (1):** a lesser daemon; a few pages of a forbidden tome; contact
  with a mutant or Chaos artefact; a flash of strong passion tied to a Dark God
  (despair Nurgle, rage Khorne, excess Slaanesh, secret knowledge Tzeentch);
  long dealings with Chaos followers, their temples and lairs. Talents tied to
  such passions: Nurgle — Медик-вольнодумец (p.113); Khorne — Hatred (p.112),
  Frenzy (p.111); Slaanesh — Человек искусства (p.103), Бесцеремонный (p.107);
  Tzeentch — Forbidden Lore / Запретные тайны (p.110).
- **Moderate source (2):** several daemons; contact with a daemon or unholy
  artefact; giving in to a strong Dark-God passion; brief time where a Chaos rite
  was held; reading an unholy tome.
- **Major source (4):** a greater daemon; studying or obsession with an unholy
  tome; prolonged contact with a daemon or artefact; a daemonic pact; long stay in
  a warp-saturated place.
- **Threshold:** Corruption **> Toughness bonus + Willpower bonus** → at a
  GM-chosen moment next adventure, Average (+0) Fortitude or Discipline. Pass →
  held back, but test again the next time Corruption is gained. **Fail → remove
  Corruption equal to Willpower bonus, roll 1d10: even → Mutation (d100), odd →
  Malignancy (d100).** Reroll duplicates.
- **Lost to Chaos:** mutations > Toughness bonus, or malignancies > Willpower
  bonus → the character becomes a Chaos Spawn under GM control.
- Onset speed follows the source: minor weeks–months, moderate hours–days, major
  seconds–minutes.
- **Absolution:** penance set by the GM, never simple (pilgrimage to Macharia,
  cleanse a desecrated temple, destroy an artefact, hunt a traitor marine).
- Non-Chaos mutants exist too (chemicals, environment) — equally hated, no
  corruption risk. Mutants should hide.

### Mutations (d100, 5-point bands in order)
01–05 Witch-mark (brand on a random location) · 06–10 Withered (−10 Toughness
permanently; Athletics and Fortitude advances cost double) · 11–15 Lashing
tentacle (random location, replaces a limb; unarmed attacks gain Reach (Длинное)
and Condition (Restrained)) · 16–20 Inhuman beauty (+10 Fellowship when your
face is seen; never scars) · 21–25 Iron skin (+2 AP everywhere, −10 Agility) ·
26–30 New mouth (whispers in unknown tongues) · 31–35 Corrosive blood (when you
take wounds or Bleeding, everything in Immediate range takes that much damage)
· 36–40 Living shadow · 41–45 Bloated brute (Advantage on opposed Athletics) ·
46–50 Extra eye (counts as photo-visor when used) · 51–55 Horns (unarmed attacks
lose Useless) · 56–60 Daemonic visage (−2 SL on Fellowship tests when seen, +2
SL on Rapport (Intimidation)) · 61–65 Digitigrade legs (Advantage on Athletics
for running, jumping) · 66–70 Feathers · 71–75 Warp claws (unarmed lose Useless,
gain Rend (1)) · 76–80 Light-inconsistent (no reflection or visual recording) ·
81–85 Festering wound (always counts one unhealed Critical Wound) · 86–90
Swollen tongue (−10 on speech tests) · 91–95 Metal flesh (armour and augmetics
fuse and regrow; repair them with Fortitude; Tech repairs with Disadvantage;
can't change armour) · 96–00 Warp healing (lose all Fate permanently; heal 1
wound at the start of each turn; lost limbs regrow in a day).

### Malignancies (d100)
01–05 Black heart (+1 extra Corruption whenever you gain Corruption) · 06–10
Unnatural appetite (unfed a week → Fatigued until sated) · 11–15 Mania
(Challenging (−10) Discipline to do an Endeavour between missions) · 16–20 Hex
(spending Fate: d10, on 7–10 it is spent with no effect) · 21–25 Holy sickness
(holy things, laughter, fresh food → Stunned until end of next turn) · 26–30
Paranoia (can't give or receive Help) · 31–35 Dark whispers (Disadvantage on
Awareness (Hearing)) · 36–40 Phantom memories · 41–45 Irrational fear (a phobia:
Average Discipline (Fear) or Frightened) · 46–50 Blackouts (on each fumble,
Average Fortitude (Endurance) or Helpless 1d10 rounds) · 51–55 Death
fascination (critical wound in your zone → Average Discipline or Stunned until
end of next turn) · 56–60 Wheels within wheels (Advantage on Intuition (People))
· 61–65 Endless itch · 66–70 Warp sense (one Awareness (Psyniscience) advance
even without Psyker) · 71–75 Eyes in the dark (Challenging Discipline (Fear) to
enter dim or dark places or Frightened) · 76–80 Void stare (meeting your gaze:
Average Discipline (Fear) or Frightened of you) · 81–85 Taste of ash · 86–90
Dark visions (once a day auto-avoid an attack that would crit you; gain 1
Corruption) · 91–95 Warp patron (+1 Fate; every spend or burn is a minor
Corruption source) · 96–00 Psychic awakening (gain Psyker and a random minor
power; each warp breach (прорыв Варпа) gives +1 Corruption).

## 9. Vehicles (Техника) — p.225–227

- Profile: **Armour front / side-rear**, **Speed** (Slow, Normal, Fast, and
  **Lightning (Стремительная)** — up to three zones per Move), **Crew** (driver
  included; fewer crew than listed and it moved last turn → loses control),
  **Passengers** (Average-size), **Size**, traits, weapons.
- **Attacks on vehicles:** melee unopposed unless stated; ranged normal (Evasive
  Manoeuvres can reduce SL). **No wounds:** any damage past armour → roll on the
  vehicle critical table, **+1 per point of damage past armour**.
- **Loss of control:** on the driver's next turn it moves in a random direction;
  into an impossible zone → crash and stop; crew and passengers take 1d10 to a
  random location. Control tests are Piloting.
- **Actions** happen on the driver's turn; normal movement needs no test.
  - *Evasive Manoeuvres:* Piloting, difficulty by speed (Slow −10, Normal +0,
    Fast+ +20); SL subtracted from enemy ranged attack SL until the driver's next
    turn.
  - *Ram:* opposed Average Piloting vs the target's Piloting or Reflexes (Dodge)
    (on foot only Dodge); counts as a melee attack; Large+ gains Blast (Разлёт);
    vehicle vs vehicle both take damage (rammer against its front armour). Ram
    damage by size (extracted table, alignment uncertain): Small or less 1 ·
    Average 5+SL · Large 10+SL · Enormous 15+SL · Monstrous 20+SL.
- **Vehicle critical table (d10 + excess):** 2–3 Scratch (no effect) · 4–7 Rattle
  (further rolls on this table +1 until repaired, stacks) · 8–9 Crew/passenger hit
  (a random occupant takes a hit from the same weapon, adding vehicle armour;
  non-attack cause 1d10) — Average (+0) control test if the driver was hit · 10
  Cargo hit (else crew hit), Routine control · 11 Weapon hit (random weapon
  disabled; a second hit destroys; none → crew hit), Routine control · 12–13
  Armour weakened (front or side −1d5), Average control · 14–15 Drive damaged
  (speed −1 step; below Slow → immobile; aircraft fall), Challenging control ·
  16+ Destroyed (occupants Ablaze and 1d10+10 damage to a random location).
- **Motorcycle:** wheeled, 6/3, Lightning, crew 1, passengers 1, Average size;
  Manoeuvrable (+1 SL on control tests); Open (occupants targetable, crew hits
  ignore vehicle armour, loss of control → Average Reflexes or thrown, occupants
  may defend against melee on the vehicle).
- **Cargo hauler:** wheeled, 10/6, Slow*, crew 1, passengers 3, Large; Hauler (200
  encumbrance or eight people); Simple build (roll criticals twice, take lower);
  Sluggish (starts Slow, +1 speed step per consecutive moving turn up to Fast);
  heavy stubber (passenger): Ranged (Stubber) dmg 8, Extreme range, Loud,
  Penetrating (3), Rapid Fire (4).
- Chases can use Piloting instead of Athletics.

## 10. Dice conventions — p.6–7

- Only d10s. d100: tens die + units die, 00 = 100. **1d5 = 1d10 ÷ 2, rounded up.**
- Game-term style in the book: tests in bold with difficulty, skill and
  specialisation ("Routine (+20) Awareness (Sight)").

## 11. Character creation (Создание персонажа) — p.46–90

Eight steps: 1 Characteristics · 2 Origin · 3 Faction · 4 Role · 5 Equipment ·
6 Details · 7 Bring to life · 8 Final touches. Randomising a step gives XP
(up to **+200 XP** if everything is rolled).

### Sheet basics — p.48–49
- **Skill advance = +5.** At creation: max **2 advances per skill** and **1 per
  specialisation**. A skill can never exceed **4 advances (+20)**; past that buy
  specialisation advances (also max 4 each).
- **Influence:** start +1 with your faction (+1 SL per point on social tests with
  its NPCs); contacts tracked separately.
- **Talents** from faction and role ignore requirements (only at creation).
- **Fate** (spent ones return at the next session/mission; burnt lost) and
  **Corruption** (leads to mutations).
- **Encumbrance limit = Str bonus + Toughness bonus.** Worn items (armour, clothes)
  count 1 less.

### Characteristics (Характеристики) — p.50–51
- Ten characteristics, 1–100; ordinary human 30–40, Astartes 60+. **Bonus = tens
  digit.** Abbreviations in book: ББ WS (Weapon Skill / Ближний бой), ДБ BS
  (Ballistic Skill / Дальний бой), Сил Str, Вын Tgh, Лов Ag, Инт Int, Вос Per,
  СВ Wil, Тов Fel. (impmal has nine: ws, bs, str, tgh, ag, int, per, wil, fel.)
- **Generation:** roll **2d10+20** each, in order → keep as rolled **+50 XP**; or
  swap all freely once **+25 XP**; or reroll/swap until happy (no XP); or
  point-buy: 20 base each + 90 points, 4–18 per characteristic (no XP).
- Origin and faction bonuses are not advances. Option: take **+1d10 instead of +5**
  for origin and faction bonuses (no XP).
- Characteristic advance = **+1**. Humans can't raise a characteristic above 60
  unless stated.

### Origin (Происхождение) — p.51–54
d100 or choose (random **+25 XP**). Each gives +5 to one fixed characteristic and
+5 to one of three, plus a trinket:

| d100 | Origin | Fixed | +5 to one of | Item |
| --- | --- | --- | --- | --- |
| 01–10 | Agri World | Str | Tgh, Ag, Wil | crude entrenching tool |
| 11–20 | Feral World | Tgh | WS, Str, Per | crude survival kit |
| 21–30 | Feudal World | WS | Str, Wil, Fel | crude writing kit |
| 31–40 | Forge World | Int | BS, Tgh, Ag | vial of sacred oil |
| 41–70 | Hive World | Ag | BS, Per, Fel | ugly filter plugs |
| 71–80 | Schola Progenium | Fel | WS, BS, Tgh | chrono |
| 81–90 | Shrine World | Wil | Int, Per, Fel | holy symbol |
| 91–00 | Voidborn | Per | Ag, Int, Wil | crude magboots |

### Factions (Служба) — p.54–73
Choose or roll on the origin-indexed table (random **+75 XP**). Each faction:
+5 fixed characteristic and +5 to one of three; **five skill advances** spread
among six listed skills; faction talent(s); **+1 Influence** with it (Administratum
also a contact); gear and solars. "Duties" are pre-built packages of the same
benefits.

| Faction | Chars | Skills pool | Talent | Gear / money |
| --- | --- | --- | --- | --- |
| Adeptus Administratum | Int; Per/Wil/Fel | Dexterity, Linguistics, Logic, Lore, Medicae, Navigation | Инфоархеолог (Data-delver) | robes, data-slate, writing kit, 800 ₷; one of autoquill, surgeon's tools, pict-recorder, vox-caster. Duties: Clerk, Officio Medicae, Scribe |
| Adeptus Astra Telepathica | Wil; Int/Per/Tgh | Awareness, Discipline, Intuition, Linguistics, Navigation, Psychic Mastery | one set: Psyker + Sanctioned Psyker · Blank (Пустой) · Witch-hunter (Смерть ведьме!) + Psychic Fortitude | knife with Monoblade upgrade, robes, divination kit, 500 ₷. +1 Influence may go to a former faction. Duties: Black Ship voidsman, Sanctioned Psyker, Sister novitiate (Blank) |
| Adeptus Mechanicus | Int; Tgh/Ag/Per | Dexterity, Logic, Lore, Medicae, Piloting, Tech | — | robes, data-slate, sacred oil, 100 ₷; one of augur array, vox implant, augmetic respiratory system, augmetic senses; one of augmetic arm, augmetic wheels/tracks, augmetic heart. Duties: Enginseer, Genetor, Logis apprentices |
| Adeptus Ministorum | Wil; Int/Per/Fel | Discipline, Intuition, Lore, Medicae, Presence, Rapport | Faith (Imperial Cult) | robes, holy symbol, satchel, 600 ₷; two of carapace breastplate, chainsword, surgeon's tools, loudhailer, fine staff, fine robes. Duties: Missionary, Preacher, Sister novitiate |
| Astra Militarum | Tgh; WS/BS/Str | Athletics, Ranged, Discipline, Fortitude, Melee, Stealth | Combat Formation (Боевое слаживание) | knife, Guard flak armour, frag grenade, 300 ₷; two of lasgun, laspistol, lascarbine, entrenching tool, chameleoline cloak, chainsword. Duties: Close-combat trooper, Scout, Infantry |
| Imperial Fleet (Navis Imperialis) | Ag; Str/Tgh/Per | Awareness, Logic, Navigation, Piloting, Reflexes, Tech | Void Legs (Походка пустохода) | laspistol or pump shotgun; void suit or flak vest; magboots; las-cutter or photo-visor; 500 ₷. Duties: Aeronautica pilot, Armsman, Fleet officer |
| Infractionists (Одиночки) | Ag; Tgh/Per/Fel | Athletics, Dexterity, Fortitude, Rapport, Reflexes, Stealth | Well-prepared (Хорошая подготовка) | knife, backpack, 5d10 ₷; stub pistol or stub revolver; light or heavy leather armour; a mundane weapon and a common tool, both Ugly and Shoddy. Duties: Fixer, Ganger, Hive courier |
| Inquisition | Per; Tgh/Int/Wil | Awareness, Discipline, Intuition, Logic, Lore, Presence | Always Ready (Всегда начеку) | laspistol, bodyglove, stablight, manacles, 400 ₷; one of auspex, comm-leech, pict-recorder. Duties: Acolyte, Exorcist, Sage |
| Rogue Trader Dynasties | Fel; Ag/Int/Per | Intuition, Linguistics, Navigation, Presence, Piloting, Rapport | Dealmaker (Делец) | bodyglove, multicompass, 1200 ₷. Duties: Adventurer, Cataloguer, Diplomat |

### Roles (Роль) — p.74–80
Choose, or let the patron assign (**+50 XP**). Each role: talents from a list
(ignore requirements), **three skill advances**, **two specialisation advances**,
gear. **Blanks can't be Mystics.** Skipping the role (an ordinary subject in a
prologue) is allowed.

- **Interlocutor (Переговорщик):** 4 talents of Aura of Authority (Аура власти),
  Bribery (Подкуп), Gothic Gibberish (Готическая тарабарщина), Dealmaker,
  Unscrupulous (Бесцеремонный), Gallows Humour (Висельный юмор), Sycophant
  (Подхалим), Mentor (Наставник). Skills: Awareness, Discipline, Intuition,
  Linguistics, Presence, Rapport. Specs: Intuition, Presence, Rapport. Gear:
  knife, laspistol or stub revolver, survival kit, vox-bead, one of loudhailer,
  pict-recorder, vox-caster.
- **Mystic (Мистик):** Psyker (if already a Psyker: one minor power + one power of
  a known discipline) + 2 of Witch-hunter (Смерть ведьме!), Chosen by Destiny
  (Избранник судьбы), Forbidden Lore, Psychic Fortitude, Sanctioned Psyker.
  Skills: Awareness, Discipline, Intuition, Lore, Navigation, Psychic Mastery.
  Specs: Discipline (Fear), Linguistics (Forbidden), Lore (Forbidden); may buy any
  Psychic Mastery specialisations and Awareness (Psyniscience). Gear: knife or
  staff, laspistol or stub revolver, survival kit, vox-bead, psy-focus or auspex.
- **Penumbra (Полутень):** 2 of Burglar (Взломщик), At Home (Я здесь как дома),
  Lip Reading, Second Identity (Вторая личность), Shadow (По пятам), Unremarkable
  (Непримечательный). Skills: Awareness, Dexterity, Ranged, Reflexes, Stealth.
  Specs: Ranged, Reflexes, Stealth. Gear: two knives, autopistol or laspistol,
  lasgun or sniper rifle, silencer, smoke grenade, survival kit, vox-bead, two of
  auspex, comm-leech, disguise kit, grapnel, magnoculars, multikey, pict-recorder,
  photo-visor, signal jammer.
- **Savant (Эрудит):** 2 of Artistic (Человек искусства), Caring Assistant
  (Заботливый помощник), Surgeon (Хирургеон), Data-delver, Eidetic Memory
  (Идеальная память), Servant of the Law (Слуга закона). Skills: Logic, Lore,
  Medicae, Navigation, Piloting, Tech. Specs: Lore, Medicae, Tech. Gear: knife,
  laspistol or stub revolver, satchel, data-slate, survival kit, vox-bead, two of
  auspex, autoquill, surgeon's tools, combi-tool, diagnostor, multicompass,
  multikey.
- **Warrior (Воин):** 2 of Eagle Eye (Орлиный глаз), Disarm, Combat Formation,
  Duellist, Tactical Movement (Тактическое передвижение), Wide Swing (Широкий
  замах). Skills: Athletics, Fortitude, Medicae, Melee, Ranged, Reflexes. Specs:
  Melee, Ranged, Reflexes. Gear: knife, any mundane melee weapon or chainsword,
  laspistol or stub revolver, lasgun or combat shotgun, frag grenade, improvised
  armour or flak coat, backpack, survival kit, vox-bead.
- **Zealot (Фанатик):** 2 of Faith (Imperial Cult), Flagellant, Frenzy, Hatred,
  Icon Bearer (Икононосец), Martyrdom (Мученичество). Skills: Discipline,
  Fortitude, Linguistics, Lore, Melee, Presence. Specs: Discipline, Lore, Melee.
  Gear: knife, two-handed weapon or chainsword, laspistol or hand flamer, heavy
  leather armour or robes, holy symbol, vox-bead, loudhailer or writing kit.

- **Random talent table** (optional, whole group agrees), d100: 01–10 Heightened
  Senses · 11–13 Adrenaline Surge · 14–15 Ambidextrous · 16–17 Artistic · 18–19
  Gothic Gibberish · 20–21 Hidden Pockets · 22–23 Contortionist (Человек-змея) ·
  24–25 Unscrupulous · 26–27 Fearsome Voice (Пугающий голос) · 28–29 Eidetic
  Memory · 30–31 At Home · 32–35 Chosen by Destiny · 36–42 Flagellant · 43–44
  Forbidden Lore · 45–48 Frenzy · 49–54 Hatred · 55–60 Sycophant · 61–64 Heir
  (Наследник) · 65–66 Second Identity · 67–75 Unremarkable · 76–88 Tough
  (Живучий) · 89–92 Honest Labourer (Честный труженик) · 93–94 Void Legs · 95–98
  Well-prepared · 99 roll twice · 00 Psyker or Blank. (Column alignment of the
  extracted table is reconstructed; verify before relying on exact bands.)
  Duplicate → any talent whose requirements you meet.

### Equipment and details — p.81–87
- Starting weapons are loaded with **one spare magazine**. You may also buy any
  number of Common items and **one Uncommon** item (chapter 5).
- Names (Low / High / Archaic / Informal / Secret Gothic tables), appearance, age
  (warp travel distorts age), bonds with other PCs and the patron (d100 table),
  ten questions.
- **Goals:** short-term (2–3 sessions) → **50 XP** on completion, pick a new one
  at session end. Long-term → **500 XP** and a new goal, **or retire** the
  character to the GM; your next character gets **half the retiree's XP**.

### Final touches — p.88–89
- **Max Wounds = Str bonus + Wil bonus + 2 × Tgh bonus.**
- **Critical Wounds capacity = Tgh bonus.** (p.88 says more criticals than Tgh
  bonus at the end of a turn → die at the start of the next turn; p.215 says die
  at the end of the round.)
- **Initiative = Per bonus + Ag bonus.** **Fate 3.** **Handedness:** tests using
  only the off hand have Disadvantage.
- **Prophecy (d100):** optional grim maxim; if the character's death ties into it,
  the next character gets **half the dead character's XP**.

### Advancement (Развитие) — p.90
- **Characteristic advance +1**, cost by the new value: 20–25: 20 · 26–30: 25 ·
  31–35: 30 · 36–40: 40 · 41–45: 60 · 46–50: 80 · 51–55: 110 · 56–60: 140 ·
  61–65: 180 · 66–70: 220 · 71–75: 270 · 76–80: 320 XP.
- **Skill or specialisation advance +5**, max 4: 1st 50 · 2nd 100 · 3rd 150 ·
  4th 200 XP (cumulative 50 / 150 / 300 / 500).
- **Talent 100 XP.** Requirements must be met (except creation grants).
- **Experienced characters:** agree extra XP; per 500 XP +200 ₷; per 1000 XP +1
  Influence with a faction of choice. Taking −1 Influence with a faction gives
  +100 XP per point.

## 12. Skills (Умения) — p.91–101

- **Skill value = characteristic + 5 per advance** (max 4). **Specialisation value
  = skill value + 5 per specialisation advance** (max 4). You don't need 4 skill
  advances before buying specialisations. Example: Ag 42, Reflexes 4 advances,
  Dodge 1 → Reflexes 62, Dodge 67.
- Specialisation lists are open-ended; new ones by GM agreement, kept narrow.
- **(Special)** entries need story events, talents, factions or origins.

| Skill (char) | Specialisations |
| --- | --- |
| Athletics (Str) | Climbing · Might (can stand in for Presence (Intimidation)) · Riding · Running · Swimming |
| Awareness (Per) | Sight · Smell · Hearing · Taste · Touch · Psyniscience (Special: Psyker; long warp exposure may grant one advance) |
| Dexterity (Ag) | Lock Picking (complex spirit-locks use Tech (Security)) · Pickpocketing (vs Awareness (Touch)) · Sleight of Hand (hide Concealed (Незаметное) weapons even when searched; vs Awareness (Sight)) · Defusing (Special: needs ≥1 Tech advance) |
| Discipline (Wil) | Composure (vs charm, threats, pressure) · Fear · Psychic (resist mind powers) |
| Fortitude (Tgh) | Endurance · Pain · Poison |
| Intuition (Per) | Group (Various: tech-priests, Astartes, xenos…) · People (vs Rapport (Deception)) · Surroundings |
| Linguistics (Int) | Ciphers · High Gothic · Forbidden (Various, Special: Forbidden Lore talent per language). Everyone speaks Low Gothic. |
| Logic (Int) | Evaluation (appraise) · Investigation (crime scenes, forensics) |
| Lore (Int) | Academics · Adeptus Terra · Planet (choose) · Sector (choose) · Theology (Special: ≥1 Linguistics (High Gothic)) · Forbidden (Various, Special: Forbidden Lore) |
| Medicae (Int) | Animals · Humans (also ogryns, ratlings, Votann) · Forbidden (Various, Special: Forbidden Lore) |
| Melee (WS) | Brawling (fists, knuckles, power fists) · One-Handed · Two-Handed (incl. polearms) |
| Navigation (Int) | Surface · Tracking · Void (in-system) · Warp (Special: Heir (Navis Nobilite)) |
| Piloting (Ag) | Aeronautica (to orbit) · Civilian · Military (Special) · Small Voidcraft (Special) · Large Voidcraft (Special). No test outside tense situations. |
| Presence (Wil) — «Командование» | Interrogation (vs Discipline (Composure) or Fortitude (Pain)) · Intimidation (vs Discipline (Composure); larger size gets Advantage) · Leadership (Лидерство) |
| Psychic Mastery (Wil) | Special: Psyker. Disciplines: Biomancy · Divination · Pyromancy · Telekinesis · Telepathy; others (Special, may need Forbidden Lore) |
| Ranged (BS) | Long Guns (lasguns, shotguns, autoguns, meltas) · Heavy · Pistols · Thrown |
| Rapport (Fel) | Animals · Charm (vs Discipline (Composure)) · Deception (vs Intuition) · Haggle (vs Discipline (Composure) or Logic (Evaluation)) · Inquiry (vs Discipline (Composure) or Presence (Intimidation)) |
| Stealth (Ag) | Conceal (hide places and objects; vs Awareness (Sight) or Intuition (Surroundings)) · Hide (vs Awareness (Sight)) · Move Silently (vs Awareness (Hearing)) |
| Reflexes (Ag) | Acrobatics (cross difficult terrain fast) · Balance · Dodge (defend vs ranged and melee) |
| Tech (Int) | Augmetics (Special: ≥1 Medicae advance) · Engineering (build and repair devices, weapons, explosives; Mechanicus punishes amateurs) · Security (machine spirits, doors, data vaults) |

- impmal key names: athletics, awareness, dexterity, discipline, fortitude, intuition, linguistics, logic, lore, medicae, melee, navigation, piloting, presence, psychic, ranged, rapport, reflexes, stealth, tech.
- **Repair with Tech:** extended Tech test, **1 SL per 100 solars of item value**,
  one roll per hour (a damaged flak vest: Average Tech (Engineering), 5 SL, hourly).
  GM may adjust.
- **Optional rule — silent takedown:** opposed Stealth vs target's Perception; if
  the attacker's SL ≥ target's Toughness bonus, the target is silently removed.

## 13. Talents (Таланты) — p.102–117

- Bought for **100 XP**; requirements must be met (characteristic thresholds,
  skill or specialisation advances, absence of advances, creation-only, mutually
  exclusive talents like Psyker/Blank). Several can be taken multiple times.

One line each (Russian name → working English name; requirements in brackets):

- **Обострённые чувства — Heightened Senses:** Perception tests to notice
  normally imperceptible things with one chosen sense.
- **Прилив адреналина — Adrenaline Surge:** on taking a Critical Wound, speed +1
  step for the scene; Advantage on Athletics in chases and panic.
- **Проворные удары — Deft Strikes** [Ag 45, Melee 2]: use Ag bonus instead of
  Str bonus for damage with Concealed (Незаметное) melee weapons.
- **Аура власти — Aura of Authority** [Presence 2]: first meeting with a group,
  Average Rapport or Presence → +1 Influence with it until mission end.
- **Амбидекстрия — Ambidextrous:** no off-hand penalty; one-handed melee + pistol
  together without penalty.
- **Практическая анатомия — Anatomical Knowledge** [Medicae 2]: add Medicae
  advances to the critical severity roll when you cause a critical.
- **Человек искусства — Artistic** (multiple): Literator / Painter / Musician /
  Actor — +2 SL on related tests.
- **Заботливый помощник — Attentive Assistant:** Help without advances in the
  skill; with advances your help also gives +1 SL.
- **Пустой — Blank** [creation only; not Psyker]: auto-win opposed tests vs powers
  (count as +1 SL); invisible to Psyniscience; immune to possession; **gains no
  Corruption**; Disadvantage on Fellowship tests with anyone non-blank; powers
  manifested into your zone or within Close range of you have Disadvantage; your
  zone is a Minor Hazard for daemons; hive-mind creatures entering/starting in
  your zone: Average Discipline (Composure) or Stunned.
- **Костолом — Bonebreaker** [2 advances in one Medicae specialisation]: Action →
  inflict a Minor Fracture (or upgrade to Major) on a restrained foe of that
  specialisation's type.
- **Эгида Императора — Emperor's Aegis** (sidebar; non-psykers with GM leave): use
  Deny the Witch with Discipline (Psychic).
- **Подкуп — Bribery** [Intuition (People) 2]: Advantage to judge if someone takes
  bribes; bribes cost −10% per Rapport (Haggle) advance.
- **Щитоносец — Shieldbearer** [Reflexes 3]: with a shield, Defend protects a
  second ally, or an ally and your zone.
- **Взломщик — Burglar** [Athletics 1, Stealth 1]: Advantage on breaking and
  entering.
- **Хирургеон — Surgeon** [Medicae 2]: with surgeon's tools perform surgery,
  amputations, treat criticals others can't; Advantage treating criticals in
  combat.
- **Огневая дисциплина — Close Quarters Discipline** [Discipline 2, Ranged 2]: no
  Disadvantage shooting at Immediate range.
- **Мастер рукопашной — Combat Master** [Melee 2] (multiple): count as two people
  for outnumbering.
- **Смерть ведьме! — Witch-hunter / Deny-kill** [Wil 40, Psyker — as printed]: a
  successful Deny the Witch deals wounds equal to the power's Warp Rating to the
  caster. (Printed requirement "Psyker" looks odd given Astra Telepathica gives it
  to non-psykers; check the English book.)
- **Человек-змея — Contortionist:** squeeze through tiny spaces; Advantage vs
  Restrained and grapples.
- **Контратака — Counterattack** [Melee 3] (multiple): win an opposed Melee test
  as the defender → deal damage as if attacking; once per round per purchase.
- **Последний удар — Coup de Grâce** [Reflexes 3]: with ≥2 Superiority take two
  turns in a row now, skipping your next round's turn.
- **Инфоархеолог — Data-delver** [Logic (Investigation) 2]: Advantage finding
  information in documents/archives; read twice as fast. Second purchase:
  Advantage on determining where, by whom, how and when information was made.
- **Орлиный глаз — Eagle Eye** [Ranged 1]: +1 SL on a ranged attack after Aim.
  Second: Advantage on Called Shots.
- **Делец — Dealmaker** [Intuition (People) 1, Rapport (Haggle) 1]: in
  negotiations Intuition (People) → learn what bribe they'd take, or −10% buying,
  or +10% selling.
- **Сапёр — Demolitionist** [Ranged (Heavy) 2 or Dexterity (Defusing) 2]: an hour
  and a Tech (Engineering) test removes Unstable (Непредсказуемое) from
  explosives; timed charges +Int bonus damage. Second: exclude one character
  from your Blast.
- **Честный труженик — Honest Labourer:** pick a trade (farmer, janitor,
  performer, hunter — can feed Per-bonus people in familiar terrain, tailor,
  manufactorum worker, mason, cook) → Advantage on related tests.
- **Точные удары — Precise Strikes** [Melee 3]: no Disadvantage on melee Called
  Shots.
- **Грязный бой — Dirty Fighting** [Melee (Brawling) 2]: melee damage may also
  Blind or Deafen; with 3+ SL Stun instead.
- **Разоружение — Disarm** [Melee 2]: melee attack vs same-or-smaller size deals no
  damage but disarms (item flies to a random adjacent zone; 2 SL choose zone; 4 SL
  catch it with a free hand).
- **Пугающий голос — Fearsome Voice (Unsettling Voice):** +2 SL on Presence
  (Interrogation, Intimidation) when speaking; −2 SL on Fellowship tests with
  those it frightens.
- **Бесцеремонный — Unscrupulous / Distracting:** once per scene impose
  Disadvantage on someone else's test (reaction in combat). Second: *Centre of
  attention* (a non-ally in Immediate range has Disadvantage on tests toward
  anyone but you) or *Brazen interference* (once per scene also Stunned (Minor)
  until end of their next turn).
- **Боевое слаживание — Combat Formation / Drilled** [Discipline 1]: Advantage vs
  Frightened; +1 SL on Discipline per ally with this talent in your zone. Second
  (needs another holder in the group): *Kill team* — act immediately after that
  ally in the same zone, +1 SL on all tests.
- **Парные клинки — Dual Wielder** [Ambidextrous, Melee (One-Handed) 2]: no
  Disadvantage attacking with two melee weapons at once.
- **Дуэлянт — Duellist** [Melee (One-Handed) 2] (multiple): one-handed melee
  weapons without Concealed gain Defensive. Extra: *Feint* (successful attack
  deals no damage, target has Disadvantage attacking you until end of your next
  turn) or *Guard* (attack with Disadvantage to also take the Dodge action).
- **Идеальная память — Eidetic Memory:** perfect recall, no tests.
- **Всегда начеку — Always Ready (Vigilant)** [Awareness 2]: +1 SL finding hidden
  enemies; no Unconscious/Blinded penalties while asleep; GM secretly rolls
  Awareness for clues you walked past.
- **Болевые точки — Weak Points** [Intuition (People) 2]: after Know Your Enemy,
  choose the location of your first successful attack.
- **Связь с машиной — Machine Empathy** [Piloting specialisation 3]: always know
  the vehicle's size, position, failures; no Blinded penalty on that Piloting;
  counts as two crew.
- **Набожность (Имперский культ) — Faith (Imperial Cult)** [Ministorum member, or +2
  Ministorum Influence and Lore (Theology) 2]: once per session add Wil bonus SL to
  a faith-related test (intimidating heretics, an attack after crying the
  Emperor's blessing, recalling scripture). **Imperial Saints sidebar:** with GM
  leave buy it a second time → miracles: *Spend Fate* — Action touch heals 1+Wil
  bonus wounds; let a seen person ignore a condition for the scene; reduce a
  caster's Psychic Mastery SL by your Wil bonus at Long range. *Burn Fate* —
  feats beyond mortals (raise the dead, lift a slab). With no Fate left, one great
  deed at the cost of your life (martyrdom).
- **Ложное отступление — Feigned Retreat** [Rapport (Deception) 3]: Action to fake
  Panic (−1 Superiority, leave the scene); next turn reappear hidden anywhere
  within Long range; returning to the fight restores +1 Superiority.
- **Я здесь как дома — At Home / Home Turf** (multiple): pick terrain (Rural, Feudal,
  Forge, Hive, Wilderness, Shrine, Warzone, Wastes, Voidships) → Advantage on
  Stealth there and +1 cover AP.
- **Избранник судьбы — Chosen by Destiny** [creation only, once]: +1 Fate.
- **Полевой врачеватель — Field Medic** [Medicae 2]: Medicae healing tests are
  never harder than Average (+0).
- **Флагеллант — Flagellant:** Advantage resisting pain and interrogation; on a
  Critical Wound, Average Lore (Theology) → ignore its effects for Wil-bonus
  rounds.
- **Фланкирующий огонь — Flanking Fire** [Ranged 2]: shooting a foe in the same zone
  as a (non-hidden) ally → target's cover AP −2.
- **Плоть слаба — Flesh is Weak** [Tech 2]: augmetic limit = 2 × Tgh bonus.
- **Запретные тайны — Forbidden Lore** [creation or GM leave] (multiple): access to
  one of Linguistics (Forbidden), Lore (Forbidden), Medicae (Forbidden). Studying
  heresy may cost Corruption and draws Inquisition attention.
- **Поддельные документы — Forgery** [Linguistics 2, Lore 2]: a day forging papers
  for a faction (Administratum: Lore (Adeptus Terra); Ministorum: Lore
  (Theology); Inquisition: Linguistics (Ciphers); Rogue Trader: Linguistics
  (High Gothic)); Challenging −10 → +1 Influence, Difficult −20 → +2, Very Hard −30
  → +3. Record SL; inspectors roll opposed Logic (Evaluation) against it.
- **Фанатичный обстрел — Fanatical Barrage (Spray and Pray)** [Ranged 3]: with Rapid
  Fire spend double the ammo to hit every enemy in a zone; with Blast it affects
  Close range of each target, not Immediate.
- **Готическая тарабарщина — Gothic Gibberish** [Linguistics 1]: out of combat,
  opposed Rapport (Charm) vs Discipline (Composure) → target Stunned while you keep
  talking; retests each turn end.
- **Спаситель — Guardian (Bodyguard)** [Reflexes 3]: at combat start choose an ally
  within Medium range to Defend; if attacked while you're within Medium range, move
  to protect them; enemies attacking you as you leave melee have Disadvantage.
- **Акимбо — Gunslinger** [Ambidextrous, Ranged (Pistols) 2]: no Disadvantage firing
  two pistols at once.
- **Неистовство — Frenzy:** free action Average Willpower test → Frenzied: +1 Str
  bonus, immune to Frightened, must engage the nearest enemy each turn; ends when no
  enemies or Stunned/Unconscious. Extras: *Cold* (Action, Challenging Discipline
  (Composure) to end it) · *Fearless* (instead of Frightened you frenzy) ·
  *Unstoppable* (once per turn a kill grants an immediate Move or Action).
- **Висельный юмор — Gallows Humour** [Rapport (Charm) 2]: Action + Average Rapport
  (Charm): remove Fatigued or Frightened, or Stunned, from an ally; a dying ally
  lives 1+SL more rounds.
- **Ненависть — Hatred:** choose a hated group; on meeting them Challenging (−10)
  Discipline (Composure); failure → Advantage on Discipline (Fear), +1 SL on all
  attack tests, must kill them fast; retest at the end of each turn.
- **Ударил-отступил — Hit and Run** [Reflexes (Acrobatics) 3]: after dealing a
  wound, free-action Reflexes (Acrobatics) to Disengage and move to an adjacent zone.
- **Потайные карманы — Hidden Pockets:** hide one palm-sized item; searchers need
  Difficult (−20) Awareness (Touch), Dexterity (Pickpocketing) or Logic
  (Investigation) (Average with auspex or cyber-mastiff).
- **Гипнообучение — Hypno-indoctrination** (once): roll twice on the random talent
  table.
- **Икононосец — Icon Bearer** [Lore (Theology) 1, Presence 1]: holding a holy
  symbol, allies within Medium range also get its benefits.
- **Неведение – щит мой — Ignorance is my Shield** [Int < 30, no forbidden
  specialisations]: +4 SL resisting Corruption, powers and daemonic influence; −4 SL
  researching, tracking or recalling daemons, psykers, xenos.
- **Вдохновляющее присутствие — Inspiring Presence** [Presence (Leadership) 2]:
  allies in your zone who can see you get Advantage on Discipline.
- **Наследство / Наследник — Inheritance / Heir** [Heir: creation only]: +1
  Influence with the relevant faction; GM may grant an inheritance (5000 ₷ of gear,
  holdings, investments); may mean Navis Nobilite (Navigation (Warp)) or a
  genestealer-tainted bloodline.
- **Слуга закона — Legalist (Servant of the Law)** [Lore (Adeptus Terra) 2]: cite
  the law on Rapport/Presence against lawbreakers for +SL equal to Lore (Adeptus
  Terra) advances.
- **Подхалим — Sycophant:** Advantage on tests to flatter superiors.
- **Мученичество — Martyrdom** [Fortitude 2]: while carrying an untreated Critical
  Wound gained in His service, +Wil-bonus SL on tests directly opposing enemies.
- **Медик-вольнодумец — Maverick Medic** [Medicae (Forbidden) 1]: Action, ally in
  Immediate range: turn a major fracture into minor or cure a minor, but the patient
  gains +1 Critical Wound (fracture effects gone). Tied to Nurgle passion.
- **Психическая крепость — Psychic Fortitude (Mental Fortress)** [Discipline
  (Psychic) 2]: thoughts can't be read; damage from powers reduced by Wil bonus.
- **Подражатель — Mimic** [Awareness (Hearing) 2, Rapport (Deception) 2]: imitate a
  voice heard for an hour (only in languages you know).
- **Наставник — Mentor** [Presence (Leadership) 2]: Action + Average Presence
  (Leadership) → an ally uses your skill value for their next test.
- **Патологоанатом — Pathologist** [Medicae (Humans) 2]: Advantage on autopsies.
- **Кровопускатель — Bloodletter (Phlebotomist)** [Medicae 3]: a successful melee
  attack may inflict Bleeding instead of damage.
- **Носильщик — Pack Mule** [Fortitude (Endurance) 2]: carry limit 2 × Str bonus +
  Tgh bonus.
- **Психическое проклятие — Psychic Backlash (Psychic Curse)** [Psyker]: winning an
  opposed Willpower test against an enemy power deals wounds equal to the SL
  difference to the caster.
- **Психический поток — Psychic Surge (Warp Conduit)** [Psyker]: when manifesting,
  optionally gain Warp Charge equal to Wil bonus; on success +1 SL per charge
  gained this way.
- **Псайкер — Psyker** [not Blank]: manifest powers; Psychic Mastery and Awareness
  (Psyniscience) available; learn one minor power and one power from a chosen
  discipline. **Extra minor powers 60 XP, discipline powers 100 XP.** Can be bought
  up to Wil-bonus times, each time a new discipline and one power from it.
  *Latent psykers* sidebar: a purchasable awakening; unsanctioned by default —
  Black Ships or Ordo Hereticus trouble.
- **Быстрое выхватывание — Quick Draw** [Reflexes 2, Ranged (Pistols) 2]: at combat
  start draw and fire a pistol before initiative; if surprised needs Difficult
  (−20) Reflexes.
- **Быстрая перезарядка — Rapid Reload** [Dexterity 2, Ranged 2] (multiple, per
  Ranged specialisation): reload that weapon type as a free action.
- **Чтение по губам — Lip Reading** [Awareness (Sight) 1, Linguistics 1].
- **Зарегистрированный торговец — Registered Trader** [Logic (Evaluation) 2, Rapport
  (Haggle) 2]: base sell price rises from 50% to 100%; tax or tribute visits between
  missions.
- **Санкционированный псайкер — Sanctioned Psyker** [Psyker; creation only]: **Warp
  Threshold = 2 × Wil bonus**; a sanctioning mark.
- **Вторая личность — Second Identity:** a cover in another faction; while dressed
  and acting the part +1 Influence with it; Rapport (Deception) tests with some
  members.
- **Неожиданный удар — Sudden Strike (Shadow Strike)** [Ag 45, Stealth 3]: two Actions
  on your turn in a surprise round.
- **По пятам — Shadow (Tail)** [Navigation 1, Stealth 1]: tailing with Navigation
  (Tracking) needs no Stealth tests unless you blunder.
- **Отскок — Slippery (Step Aside)** [Reflexes 2]: attacks of opportunity when you
  leave melee have Disadvantage. Second: Disengage as a free action.
- **Превосходный командир — Superior Commander (Tactician)** [Presence (Leadership)
  4]: Action → allies equal to current Superiority each take an immediate Move or
  Action (not this talent), once per round each.
- **Огонь на подавление — Suppressing Fire** [Ranged 2]: with Rapid Fire, instead of
  damage targets make Discipline (Composure) opposed by your Ranged; losers are
  Restrained until the start of your next turn. (Printed "Обездвиживание" —
  Restrained; likely Pinned/Suppressed in English.)
- **Незыблемый — Sure-footed (Unshakeable)** [Athletics 1, Fortitude 1, Reflexes 1]:
  with ≥1 Superiority speed becomes Fast; Advantage vs Prone and forced movement;
  once per turn stand up from Prone as a free action (unless Restrained).
- **Тактическое передвижение — Tactical Movement** [Athletics 1, Discipline 1]: Take
  Cover as a free action.
- **Живучий — Tough (Resilient):** when Stunned, Average Fortitude (Endurance) to
  shake it off.
- **Широкий замах — Wide Swing (Sweeping Strikes)** [Melee (Two-Handed) 2]
  (multiple): Two-Handed melee weapons gain Blast and never hit you. Extras:
  *Brutal* (Two-Handed also Rend (+1)) · *Leg sweep* (hitting a leg with Two-Handed:
  half damage, Difficult (−20) Reflexes or Prone).
- **Заразительная отвага — Unbreakable Courage (Rallying Presence)** [Presence
  (Leadership) 3]: whenever the group would lose Superiority, Difficult (−20) Presence
  (Leadership) to prevent it.
- **Непримечательный — Unremarkable** [no Presence advances, except from random
  talents]: blend into crowds without tests in the right clothes; powerful people
  ignore you; Disadvantage on Presence and Rapport vs high-ranking people;
  **the group loses no Superiority when you take a Critical Wound or die.**
- **Походка пустохода — Void Legs** (multiple): no void-caused Disadvantage
  (weightlessness, pitching). Extras: *Zero-G control* (Fast speed in zero-g) ·
  *Void fighter* (Advantage in melee vs characters without Void Legs).
- **Хорошая подготовка — Well-prepared:** once per mission pull a weight-0 item you
  plausibly could have bought; pay its price then.

## 14. Armoury (Арсенал) — p.118–157

> Exact per-item stats also live in the impmal-core `items` compendium; use it for
> numbers. The table extraction below is best-effort (columns in the PDF text layer
> are scrambled) — rules text is reliable, figures should be checked against the
> compendium before building on them.

### Money, buying, selling — p.118–121
- Currency: **Macharian solar (₷)**; local currencies exist at GM-set rates.
- **Availability:** Common (always on sale) · Uncommon / Rare (availability test,
  d100 ≤ chance) · Exotic (only by GM will, commissions or crafting).

| | Feral | Feudal | Agri | Shrine | Hive | Forge |
| --- | --- | --- | --- | --- | --- | --- |
| Uncommon | 15% | 30% | 45% | 60% | 75% | 90% |
| Rare | — | 5% | 15% | 25% | 35% | 45% |

  Failed: retry on another world, or after a week if trade routes run. Voidships
  use the worlds they serve. Quantity: feral/feudal 1; shrine/agri 1d10; hive/forge
  as GM likes; ×2 for Common, ÷2 for Rare.
- **Influence** ("I know a guy") can shift availability one step or price 10%.
- **Buying:** Logic (Evaluation) reveals true value and flaws; Rapport (Haggle)
  (usually opposed) cuts **5% per SL, max 20%**; failure may do nothing, raise price
  10%, or end the deal.
- **Selling:** find a buyer with the availability test; base sale price **50%**
  (Registered Trader: 100%). Halving your asking price makes it one availability step
  easier to sell.
- **Barter:** equal-value lots; exchange rate by availability gap (same 1:1, one
  step 2:1, two steps 4:1, three 8:1).

### Craftsmanship — p.121–122
Each **quality** doubles price and makes availability one step harder; each **flaw**
halves price (round up) and one step easier (Exotic never gets easier). Average (+0)
Logic (Evaluation) spots flaws.
- Qualities: **Lightweight** (−1 weight; at 0 GM may grant Concealed) ·
  **Masterwork** (+1 SL on related tests; armour +2 AP; min 500 ₷) · **Fine**
  (stackable; GM may give +1 SL on Fellowship tests with those who appreciate it) ·
  **Durable** (weapons gain Reliable; other gear ignores its first failure/AP loss).
- Flaws: **Bulky** (+1 weight, loses Concealed) · **Shoddy** (−1 SL on related tests;
  armour −2 AP, min 1) · **Ugly** (−1 SL Fellowship with the discerning) ·
  **Unreliable** (gains Unstable; armour destroyed by a critical hit to its location;
  other gear breaks on a fumble).

### Encumbrance — p.122–123
- Items weigh **0–3** (0 knives, coins, data-slate · 1 sword, pistol, satchel · 2
  chainaxe, lasgun, demolition kit · 3 eviscerator, rocket launcher, portable
  reliquary); ten weight-0 items ≈ 1; weight 4+ = one such item, both hands.
- **Carry = Str bonus + Tgh bonus**; worn items −1 weight (armour weight in table
  already worn/carried).
- **Overburdened (Перегрузка):** Disadvantage on Agility tests, speed −1 step. Over
  **2 × (Str bonus + Tgh bonus)** → Restrained until you drop gear.
- Backpack or satchel worn: **+4 carry**.

### Weapon traits (Свойства) — p.124–125
- **Blast (Взрыв):** target a zone in range; one Ranged (Heavy/Thrown) test;
  everyone in the zone rolls Reflexes (Dodge) against it; each loser takes damage +
  SL difference. *Simple blasts:* GM may roll once for identical foes.
- **Burst (Короткая очередь):** +1 SL, −1 ammo. Rapid Fire weapons also have Burst;
  never both at once. Burst/Rapid weapons only spend ammo on bursts (single shots
  aren't counted).
- **Close (Удобное):** ranged weapon without Disadvantage at Immediate range.
- **Defensive (Оборонительное):** Advantage on opposed tests defending in melee.
- **Flamer (Огнемёт):** ignores cover; the attack gains Spread (Разлёт); or target a
  whole zone in range, making it a Minor Hazard until end of your next turn.
- **Heavy (X) (Тяжёлое):** needs Str bonus ≥ X; else armour → Disadvantage on Ag
  tests, melee → Disadvantage on Melee, ranged → Disadvantage on Ranged. Bracing a
  heavy ranged weapon instead of moving ignores Heavy until you move.
- **Ineffective / Useless (Бесполезное):** target's armour doubled.
- **Inflict (X) (Состояние):** a wounding hit (or any hit if no damage) applies
  condition X, one round unless stated.
- **Loud (Громкое):** heard at Long range; loud armour → Disadvantage on Stealth.
- **Penetrating (X) (Бронебойное):** ignore X armour.
- **Rapid Fire (X) (Длинная очередь):** spend X ammo: either gain Spread, or Advantage
  and +X damage; can't if fewer than X rounds left. GM advice: enemies use it once
  per fight or must reload after.
- **Reach (Длинное):** attack foes in your zone without becoming engaged; defending
  with it while engaged → Disadvantage on Melee.
- **Reliable (Безотказное):** on a fumble roll 1d10, 4+ no fumble.
- **Rend (X) (Разрывающее):** after wounding, AP on the hit location −X until
  repaired; stacks; 0 = armour destroyed.
- **Shield (X) (Щит):** +X AP when you take fire on it.
- **Spread (Разлёт):** everyone in Immediate range of the target: Average Reflexes
  (Dodge) or take half damage; gaining Spread twice → failures take full damage.
- **Subtle / Concealed (Незаметное):** weapons: Disadvantage on Awareness to notice
  use or find it. Armour: Disadvantage to notice it; can be worn under other armour,
  AP stacking.
- **Supercharge (X) (Сверхзаряд):** +X damage, double ammo use.
- **Thrown (X) (Метательное):** melee weapon can be thrown to range X.
- **Two-Handed (Двуручное).**
- **Unstable (Непредсказуемое):** on a fumble roll 1d10, 5+ on the fumble table it
  explodes, dealing its damage to the wielder's dominant arm (random arm if
  two-handed). All explosives are Unstable.

### Weapon groups — p.126–131
- Chain, power and shock weapons need switching on (free action).
- **Mundane** — usually one trait. **Chain** — on: Rend and Loud, Disadvantage on
  Stealth. **Power** — high damage, Penetrating. **Force** — in a Psyker's hands +damage
  equal to current Warp Charge (×2 vs daemons). **Shock** — on: Inflict (Stunned).
- **Bolt** — Penetrating and Spread with standard rounds. **Flame** — Flamer, Inflict
  (Ablaze), tiny magazines. **Las** — big magazines, Reliable. *Rite of the
  Undying Light:* recharge packs free at Imperial power; in the field Routine (+20)
  Tech and 4 h (8 h on failure), fumble ruins the pack. **Launchers** — per grenade or
  missile. **Melta** — short range, high damage, Rend. **Plasma** — high damage,
  Supercharge, Unstable; a supercharged plasma weapon that fumbles automatically
  fails its Unstable roll and explodes. **Solid projectile (stub)** — varied, special
  ammo. **Exotic** — needle (Inflict Poisoned; Major on a head hit) and web (Inflict
  Restrained Minor; Major with 4+ SL).

### Melee weapons (damage + Str bonus, weight, ₷, availability, traits) — p.128
- **Chain:** chainaxe One-Handed 3+SB, 1, 600 R, Loud, Rend (3) · chainsword One-Handed
  3+SB, 1, 500 U, Loud, Rend (2) · eviscerator Two-Handed 5+SB, 3, 800 R, Loud, Rend
  (4), Heavy (4), Two-Handed.
- **Force:** force staff Two-Handed 1+SB, 2, 7000 E, Defensive, Two-Handed · force
  sword One-Handed 2+SB, 1, 8000 E.
- **Mundane:** axe 2+SB, 1, 80 C, Rend (1) · knuckleduster Brawling 0+SB, 0, 30 C,
  Concealed · flail Two-Handed 3+SB, 2, 200 C, Heavy (3), Two-Handed · two-handed
  weapon 4+SB, 2, 300 U, Heavy (4), Two-Handed · hammer/mace 2+SB, 1, 25 C ·
  improvised one-handed 1+SB, Useless · improvised two-handed 2+SB, 3, Useless,
  Two-Handed · knife 0+SB, 0, 50 C, Concealed, Thrown (Close) · staff 1+SB, 2, 25 C,
  Defensive, Two-Handed · sword 2+SB, 1, 150 C · unarmed Brawling 0+SB, Useless ·
  whip 0+SB, 1, 60 U, Loud, Reach.
- **Shock:** electro-whip 0+SB, 1, 500 U, Loud, Reach, Inflict (Stunned) · shock maul
  2+SB, 1, 250 U, Loud, Inflict (Stunned).
- **Power:** power axe Two-Handed 6+SB, 2, 3400 R, Penetrating (6), Heavy (4),
  Two-Handed · power fist Brawling 6+SB, 2, 4000 R, Penetrating (6), Heavy (4) · power
  knife 2+SB, 1, 2000 R, Penetrating (2), Concealed, Thrown (Close) · power mace
  5+SB, 1, 3000 R, Penetrating (2) · power sword 4+SB, 1, 3000 R, Penetrating (4).

### Ranged weapons (spec, dmg, range, mag, weight, ₷ (mag), avail, traits) — p.132–133
- **Bolt:** bolt pistol Pistol 8, Medium, 2, 2, 4000 (400) R, Burst, Close, Loud,
  Penetrating (4), Spread · boltgun Long Gun 8, Long, 4, 3, 5000 (500) R, Loud,
  Penetrating (4), Rapid Fire (2), Spread, Two-Handed · heavy bolter Heavy 10, Long,
  6, 4, 9000 (900) R, Heavy (4), Penetrating (5), Loud, Rapid Fire (3), Spread,
  Two-Handed.
- **Flame:** hand flamer Pistol 7, Close, 2, 1, 500 (25) R, Close, Flamer, Inflict
  (Ablaze), Loud · flamer Long Gun 8, Medium, 4, 2, 1000 (50) U, Flamer, Inflict
  (Ablaze), Loud, Two-Handed.
- **Las:** laspistol Pistol 5, Medium, 4, 0, 400 (100) C, Burst, Close, Loud, Reliable
  · lasgun Long Gun 6, Long, 8, 2, 600 (150) C, Burst, Loud, Reliable, Two-Handed ·
  lascarbine Long Gun 5, Medium, 6, 1, 800 (200) C, Rapid Fire, Loud, Reliable,
  Two-Handed · long-las Long Gun 6, Extreme, 4, 2, 1000 (250) U, Burst, Penetrating
  (1), Reliable, Two-Handed · hot-shot laspistol Pistol 8, Medium, 2, 1, 900 (225) R,
  Burst, Close, Loud, Penetrating (2) · hot-shot lasgun Long Gun 8, Long, 4, 3, 1000
  (250) R, Burst, Loud, Penetrating (2), Two-Handed · lascannon Heavy 18, Extreme, 5,
  4, 8000 (2000) R, Heavy (4), Loud, Penetrating (10), Two-Handed.
- **Launchers:** grenade launcher Heavy —, Long, 6, 2, 1000 R, Loud, Two-Handed ·
  portable missile launcher Heavy —, Extreme, 1, 3, 2000 R, Heavy (4), Loud,
  Two-Handed.
- **Melta:** inferno pistol Pistol 16, Close, 3, 1, 8000 (400) E, Close, Loud, Rend (5)
  · meltagun Long Gun 16, Medium, 5, 2, 9000 (450) R, Loud, Rend (5), Two-Handed.
- **Plasma:** plasma pistol Pistol 10, Medium, 6, 1, 7000 (500) R, Close, Loud,
  Penetrating (6), Supercharge (4), Unstable · plasma gun Long Gun 10, Long, 12, 2,
  8000 (550) R, Loud, Penetrating (6), Supercharge (4), Two-Handed, Unstable.
- **Solid projectile:** autopistol Pistol 5, Medium, 3, 0, 400 (20) C, Close, Loud,
  Rapid Fire (3) · autogun Long Gun 6, Long, 5, 2, 600 (30) C, Loud, Two-Handed, Rapid
  Fire (3) · hand cannon Pistol 8, Medium, 4, 1, 550 (12) U, Close, Heavy (4), Loud,
  Penetrating (2) · heavy stubber Heavy 8, Extreme, 8, 3, 2000 (60) U, Heavy (4),
  Loud, Penetrating (3), Two-Handed, Rapid Fire (4) · combat shotgun Long Gun 6,
  Medium, 12, 2, 600 (15) U, Spread, Inflict (Prone), Loud, Two-Handed · pump shotgun
  Long Gun 6, Medium, 8, 1, 400 (10) C, Spread, Inflict (Prone), Loud, Two-Handed ·
  sniper rifle Long Gun 8, Extreme, 6, 2, 1000 (40) U, Loud, Two-Handed · stub pistol
  Pistol 6, Medium, 2, 0, 250 (20) C, Burst, Close, Loud · stub revolver Pistol 6,
  Medium, 6, 0, 200 (5) C, Close, Loud, Reliable.
- **Exotic:** needle pistol Pistol 1, Medium, 4, 1, 1500 (200) E, Close, Inflict
  (Poisoned), Penetrating (6), Concealed · needle rifle Long Gun 1, Long, 6, 2, 1700
  (220) E, Inflict (Poisoned), Penetrating (6), Concealed, Two-Handed · web pistol
  Pistol —, Close, 3, 1, 1300 (130) R, Close, Inflict (Restrained) · webber Long Gun —,
  Medium, 6, 2, 1500 (150) R, Inflict (Restrained), Two-Handed.
- **Ammo:** standard ammo is one availability step easier than the weapon; buying a
  weapon gives **two** standard magazines (character creation: loaded + one spare).
  Special ammo (dmg, price multiplier, avail, fits, effect): **Bleeder** +0, ×2, R,
  stub (not shotguns), Inflict (Bleeding) · **Executioner** +0, ×2, R, bolt and
  shotguns, range Extreme (shotguns lose Spread) · **Hot-shot pack** +2, ×3, U, Reliable
  las weapons, Penetrating (2), half magazine, lose Reliable · **Inferno** +0, ×2, R,
  bolt and shotguns, Inflict (Ablaze) · **Armour-piercing** +0, ×3, U, stub (not
  shotguns), Penetrating (3) · **Toxic** +0, ×3, U, bolt and stub (not shotguns),
  Inflict (Poisoned).

### Explosives — p.134–136
- All Unstable. *Thrown* = by hand (fumble → it goes elsewhere); *Heavy* = launcher;
  *Engineering* = placed charge (remote detonator or timer).
- **Timed detonation:** Challenging (−10) Tech (Engineering); failure → blows X rounds
  early or late (X = SL, GM secret); harder for complex or >10 min delays.
- **Grenade over cover:** Ranged (Heavy/Thrown) becomes −10 vs light cover, −20
  medium, −30 heavy (to lob past it).
- Table (spec, dmg, weight, ₷, avail, traits): mining charge Thrown 10, 0, 40 C,
  Loud, Spread, Thrown (Medium) · choke grenade Thrown/Heavy —, 0, 40 U, Inflict
  (Stunned)*, Thrown (Medium) — zone: Difficult (−20) Fortitude (Endurance) or Stunned
  (Minor) 3 rounds, same test for 3 rounds on entering/starting there · demolition
  charge Engineering 16, 2, 50 C, Loud, Spread (includes remote detonator) · fire bomb
  Thrown —, 1, 10 C, Blast, Loud, Inflict (Ablaze)*, Thrown (Medium) — or make a zone
  a Minor Hazard 3 rounds · frag grenade Thrown/Heavy 6, 0, 50 C, Blast, Loud, Thrown
  (Medium) · frag missile Heavy 8, 1, 200 U, Blast, Loud · krak grenade Thrown/Heavy 12,
  0, 60 U, Loud, Penetrating (4), Spread, Thrown (Medium) · krak missile Heavy 16, 1,
  400 U, Loud, Penetrating (6), Spread · melta bomb Engineering 16, 2, 1000 E, Rend
  (12), Spread (only the attached target) · photon flash Thrown/Heavy —, 0, 200 R,
  Blast, Loud, Inflict (Blinded) — zone: Difficult (−20) Reflexes or Blinded 3 rounds ·
  smoke grenade Thrown/Heavy —, 0, 30 C, Blast*, Thrown (Medium) — zone gains Heavy
  Haze · web grenade Thrown —, 0, 150 R, Loud, Blast, Inflict (Restrained)* — zone:
  Difficult (−20) Reflexes or Restrained (Minor); escape = extended Average Athletics
  (Might), 10 SL, one roll per turn.

### Weapon upgrades — p.136–138
One sight, one combat upgrade, non-duplicate auxiliaries. Fitting: an hour and
Average/Challenging Tech (Engineering) (book prints "средней (−10)").
- **Combi-flamer / Exterminator** 100 C (any Two-Handed): a one-shot flamer, fire as an
  Action (ranged attack), reload 5 min, 5 ₷.
- **Bayonet** 50 U (Two-Handed ranged): Action to fix/unfix; fixed = mundane sword,
  loose = knife; counts as a melee weapon for defence.
- **Monoblade** 250 R (bladed mundane melee): Penetrating (2) or +2 to existing.
- **Laser sight** 50 U (not Blast/Flamer): +1 SL on ranged attacks; target gets
  Advantage spotting you; an aware target may oppose with Reflexes (Dodge).
- **Omnispex** 200 R: no Disadvantage shooting into Darkness or Poorly Lit.
- **Telescopic sight (Omni-scope)** 50 C: range +1 step, loses Close; works as
  magnoculars.
- **Backpack ammo supply** (price and availability as the weapon): magazine ×4, +1
  weight, 5-min reload (refill = 4 magazines); wearer takes a critical hit → 1d10, 7+
  detonates for 2× weapon damage to the body, pack destroyed.
- **Bipod** 30 C: brace Heavy weapons anywhere.
- **Ammo selector** 140 R (bolt, launcher, low-tech, stub): load three ammo types,
  switch as a free action; loses Reliable.
- **Silencer** 400 C (stub): removes Loud.

### Armour — p.138–141
Types: **Mundane**; **Flak** (+1 AP vs Blast and Spread); **Mesh** (light);
**Carapace** (usually Heavy); **Power** (powered: weight 0 and **+10 Strength**;
unpowered loses both; non-Astartes/Sororitas suits run AP-value hours; a critical hit
that deals no wounds is ignored).

AP, worn weight (carried), ₷, traits (availability column not reliably extracted):
- **Mundane:** robes / light leather 1, 1 (2), 10 · heavy leather 2, 2 (3), 60 ·
  bodyglove 2, 1 (2), 1200, Concealed · armoured greatcoat 2, 2 (3), 500, Concealed ·
  improvised armour (body) 3, 4 (5), 300, Heavy (3) · improvised shield —, 1, 50,
  Shield (1) · combat shield —, 1, 300, Shield (2) · boarding shield —, 2, 800, Shield
  (4) · xenohide vest (body) 6, 1 (2), 5000.
- **Flak:** boots (legs) 2, 1 (2), 100 · helmet (head) 2, 1 (2), 150 · gauntlets (arms)
  2, 0 (1), 100 · vest (body) 3, 2 (3), 500 · coat (body, arms) 3, 2 (3), 800 · Astra
  Militarum flak armour (all) 4, 4 (5), 1000, Loud.
- **Mesh:** boots 3, 1 (2), 600 · hood 3, 1 (2), 800 · gloves 3, 0 (1), 600 · vest (body)
  4, 1 (2), 500 · xeno-mesh (arms, body, legs) 4, 2 (3), 5000.
- **Carapace:** helm 5, 1 (2), 400 · gauntlets 5, 1 (2), 300 · greaves 5, 1 (2), 300 ·
  breastplate (body) 6, 3 (4), 800, Heavy (4), Loud · enforcer carapace (all) 5, 4 (5),
  1800, Heavy (4), Loud · Tempestus carapace (all) 6, 5 (6), 4000, Heavy (4), Loud.
- **Power:** light power armour (all) 8, 7 (8), 500 000, Loud · power armour (all) 10,
  9 (10), 1 000 000, Loud.

**Shields** — p.142: no melee-defence Disadvantage without a weapon; with a melee
weapon it becomes Defensive; Advantage on Athletics (Might) to defend a zone; **once
per round take a ranged attack from outside your zone on the shield → +Shield AP
against it and all further attacks from that zone until your next turn**; blocking a
Rend attack destroys the shield (Rend above shield value → damage goes through).

**Force fields** — p.142: cover all locations, all attacks, toggle free, one at a
time. On damage roll the field's dice and reduce damage by the total **before armour**.
Damage ≥ **overload** → absorbed but the field fails until repaired (Very Hard (−30)
Tech, 8 h+). **Refractor** 1d10 / overload 10, 1000 ₷ Exotic — glows, most Stealth
tests auto-fail. **Conversion field** 2d10 / 20, 6000 ₷ Exotic — absorbing 10+ from
one attack Blinds everyone else in the zone for a round.

### Clothing and tools — p.143–151
- Backpack/satchel +4 carry (20 ₷) · **chameleoline cloak** (500 R): didn't move this
  turn → +2 SL Stealth until you move or make noise · **explosive collar** (150 U):
  1 minute to fit on an unconscious/helpless victim; Very Hard (−30) Tech
  (Engineering) to remove, Disadvantage if self · **filter plugs** (20 C): +2 SL on
  Fortitude vs gases · **photo-visor / lenses** (300 U): no Poorly Lit/Darkness
  penalties, Advantage vs Blinding · **rebreather** (200 U, 1): immune to bad air,
  breathe underwater, 1 h canister (20 ₷, Action to swap) · **remote detonator** ·
  **respirator / gas mask** (50 C): auto-pass vs airborne pathogens, Disadvantage on
  Awareness (Sight) · **survival kit** (50 C, 3): with Fortitude (Endurance) vs weather
  · **synskin** (3000 E): counts as bodyglove; alone +1 SL Stealth (Hide) · **void suit**
  (2000 U, worn 4): vacuum and pathogens, 10 h air, micro-thrusters and magboots, 2 AP
  all locations.
- **Tools** — generally, having the right tool avoids Disadvantage. **Auspex** (1000 U):
  Action to detect energy, life, movement at Medium range and hidden ambushers; Tech
  tests for specific phenomena · autoquill · **surgeon's tools** (500 R, 5 uses;
  restock half price): needed for many criticals and injuries and Surgeon; one use +
  Easy (+40) Medicae stops non-critical Bleeding; healing, injuries or Poisoned need
  Average Medicae; failed uses still count · chrono · climbing kit (50 m, Action, stops
  falls) · combi-tool · **comm-leech** (1000 R): Average Tech, intercept signals within 3
  miles for SL minutes; failure alerts the source · **data-slate** (100 C): connect to
  machines with Routine (+20) Tech; biometric lock Difficult (−20) Tech ·
  **diagnostor** · **disguise kit** (10 min; posing as a faction member or specific
  person may need Average+ Dexterity) · **Emperor's Tarot** (10 000 R): 1 h, Challenging
  (−10) Discipline, no Fate on it; 2+ SL → regain 1 Fate; −2 SL or worse → lose 1 Fate;
  fumble → burn 1 Fate; once per session; can read for another (their Fate) ·
  entrenching tool (improvised; sharpened = axe) · torture tools (Presence
  (Interrogation)) · **stablight / lamp**: removes Poorly Lit and Darkness from your
  zone, 5 h · **grapnel** (Action + Routine (+20) Ranged (Pistols), 50 m, pulls two
  Average creatures 5 m/round) · **grav-chute** (10 min, no falling damage) · **holy
  symbol** (with enough faith +1 SL Discipline (Fear)) · injector / inhaler · divination
  kit · **las-cutter** (Tech (Engineering) through obstacles; as a weapon improvised
  one-handed, Inflict (Ablaze), Loud, Rend (3)) · loudhailer (100 m) · **magboots**
  (Action; ignore zero-g, speed Slow; walls/ceilings Average Athletics (Climbing) or
  Reflexes (Acrobatics)) · magnoculars (Awareness (Sight) at Long range) · **manacles**
  (Action on a non-resisting, Restrained (Minor), Stunned or unconscious target →
  Helpless; escape Very Hard (−30) Dexterity (Lock Picking), Athletics (Might) or Tech
  (Security), Disadvantage if self; 10 damage breaks them) · vox-bead (1 mile) ·
  **mono-task servo-skull** (2000 R): lumen (stablight), herald (loudhailer), medicae
  (+10 Medicae in Immediate range), scanner (auspex for Close range), artisan
  (combi-tool) · multicompass (Navigation (Surface)) · multikey (Dexterity (Lock
  Picking) on Imperial locks) · pict-recorder (Action per round) · **psy-focus** (100 E):
  **+1 SL on Psychic Mastery**, one at a time · regicide set · **sacred unguent** (5
  uses): Action + Average Tech (Engineering) → reroll the next failed test with that
  item (dries after the reroll or a day) · **screamer alarm**: Routine (+20) Tech
  (Security); success arms it for its zone and adjacent; intruders' Stealth SL reduced
  by your SL; alarm heard at Long range · **signal jammer** (free action, 1 mile, 2 h
  battery) · **silencer field (Молчун)**: Awareness to hear unexpected sounds in the zone
  three steps harder, 20 min · vox-caster (100 miles) · writing kit.

### Augmetics — p.152–154
- Installing is medical care (service price + implant price). **Max implants = Tgh
  bonus** (Flesh is Weak: 2 × Tgh bonus). Mechadendrites count individually.
- Augmetic injuries are repaired with **Tech (Engineering)** at the critical table's
  difficulty (combi-tool instead of surgeon's tools). Fractures don't heal alone: Minor
  = extended Routine (+20) Tech (Augmetics), 5 SL, hourly, parts ¼ implant price;
  Major = extended Average (+0), 5 SL, parts ½. Amputation → replace.
- **Prosthetics:** arm (1000 U): +1 AP on that arm, +1 SL on Str tests using it, +1
  melee damage with it; two arms +2 SL on two-handed Str tests and +2 damage with
  Two-Handed melee · heart (3000 R): Action + Average Fortitude removes Bleeding
  (Minor), Difficult (−20) removes Major · leg (1000 U): +1 AP on that leg, +1 SL on Str
  tests using it · respiratory system (2000 R): +2 SL Fortitude vs gases and airborne
  toxins · senses (eye, nose, ear; 4000 R): +1 SL on that sense (+2 with a pair) ·
  wheels / tracks (1500 U): +1 AP legs, Fast speed in clear zones (cluttered may be
  Difficult Terrain for you), leg critical rules apply.
- **Mechanicus-only implants:** augur array (6000 R): auspex senses at Medium range,
  +5 Per · ballistic mechadendrite (2000 R): a laspistol that never reloads · logis
  calculus (10 000 R): +1 SL Logic (mathematics), +5 Int · binaric link (10 000 R): +1 SL
  Tech when interfacing or commanding servitors · manipulator mechadendrite (1400 R):
  +2 SL Str tests, −1 SL Dexterity, improvised two-handed weapon · medicae
  mechadendrite (1400 R): unlimited surgeon's tools · optical mechadendrite (1200 R):
  +1 SL Awareness (Sight), built-in lamp, look around corners · utility mechadendrite
  (1000 R): counts as combi-tool, +2 SL Tech, improvised one-handed weapon · vox implant
  (400 R): voice heard at 100 m. Using a mechadendrite takes an Action; a body critical
  on a character with mechadendrites: 1d10 < working count → one is damaged.

### Services — p.155–157
- **Travel** per person (Low/Average/Good/Excellent): city 3 / 8 / 20 / 50 · planetary
  200 / 500 / 1000 / 5000 · in-system 500 / 1000 / 5000 / 10 000 · interstellar
  5000 / 10 000 / 50 000 / 100 000.
- **Lodging** per day: 20 / 50 / 100 / 200 (Good and Excellent may need Influence 1–2).
- **Food** per day: 5 / 10 / 40 / 80. A week of Low-quality food → Average Fortitude
  (Endurance) or Fatigued until better food.
- **Medical care** per Medicae test: Low 100 ₷, Medicae 30 · Average 200, 40, surgeon's
  tools · Good 600, 50, tools + Surgeon · Excellent 1200, 70, tools + Surgeon + medicae
  servo-skull.
- Amasec bottle 80 ₷; recaf mug 5 ₷.

## 15. Psychic powers (Психосилы) — p.158–184

### Access
- **Psyker talent** = can manifest; **Sanctioned Psyker** (creation only) = Warp
  Threshold 2 × Wil bonus and a sanctioning mark. Unsanctioned psykers risk the Black
  Ships and the Ordo Hereticus.
- **Disciplines:** Biomancy, Divination, Pyromancy, Telekinesis, Telepathy, plus
  **Minor powers** everyone can learn. **Minor 60 XP, discipline power 100 XP** (only
  from disciplines unlocked by Psyker purchases). **All psykers know Psychic Blast.**
- Each minor power names the Psychic Mastery specialisation used for it; discipline
  powers use their discipline.

### Manifesting (Сотворение) — p.161–162
1. Choose a power; you must know the target exists and where it is (usually in sight).
2. **Manifest test** = Psychic Mastery at the power's difficulty (an Action unless
   stated).
3. **Gain Warp Charge:** success → charge equal to the power's **Warp Rating**;
   failure → 1 charge per point of negative SL, max the Warp Rating.
4. On success apply the effect. **Powers can't be dodged** unless stated. Failure
   usually does nothing (some list failure effects).
- **Critical (doubles, positive SL):** Warp Rating reduced by Wil bonus (min 1).
  **Fumble:** double the Warp Charge gained. Powers never cause Critical Hits but can
  inflict Critical Wounds normally.
- **Sustained powers:** when the duration ends, extend it as a free action, any number
  of times while conscious, no test. **Warp Charge can't drop below the total Warp
  Rating of powers you sustain** (not even by purging). A warp breach ends all
  sustained powers.
- **Push (Усилие):** declare before rolling → Advantage on the manifest test, but
  **+1d10 Warp Charge** regardless; failing with a fumble → an immediate Warp breach.
- **Overt powers (*)** are obviously psychic and attributable to the caster; others
  are near-impossible to notice without Psyniscience.

### Deny the Witch (Отвергни ведьмовство) — p.163
- Any psyker can oppose a manifest test by a psyker within **Close range**: **Average
  (+0) Psychic Mastery**, each SL removes one SL from the manifest test. It's a
  reaction. One normal attempt per round; each further attempt that round −1 SL,
  cumulative. (Emperor's Aegis lets non-psykers use Discipline (Psychic).)

### Warp Charge, Threshold, Purging — p.163
- **Threshold = Wil bonus** (Sanctioned: 2 × Wil bonus). At or below → safe.
- **Purge (Очищение):** Action + **Average (+0) Discipline (Psychic)**; success removes
  charges of your choice up to **Wil bonus + SL**; failure removes none. Can't go below
  0 or below sustained Warp Ratings. After a successful purge roll **Psychic
  Phenomena +10 per charge removed**. Outside tense scenes: no test, remove all
  charges, one unmodified Phenomena roll.
- Phenomena affect the psyker's zone for 1d10 minutes or the scene; a phenomenon
  landing where the same one is active becomes a permanent **Anomaly**.

### Warp breach (Прорыв Варпа) — p.166
- **End of your turn with Warp Charge above Threshold → Average (+0) Psychic
  Mastery.** Pass: contained, but all your powers count as overt (eyes spark, you
  float). **Fail:** the warp tears through you (Routine (+20) Intuition reveals you've
  lost control); **at the start of your next turn roll Perils of the Warp +10 per charge
  above Threshold** and gain the listed Corruption. Then lose all Warp Charge and end
  all sustained powers.

### Psychic Phenomena (d100 + modifiers) — p.164
Bands as extracted (verify): 11–45 Frost / Hoarfrost (anomaly: permanently cold) ·
46–49 Banshee howl (anomaly: daily familiar screams) · 50–52 Tears of blood (icons
weep; anomaly: drinking it gives prophetic nightmares) · 53–55 Breath thief (Average
Fortitude (Endurance) or Stunned 1 round; anomaly: permanent choke-grenade air) ·
56–58 Dark foreboding (anomaly: Average Discipline (Fear) or Frightened on entering) ·
59–62 Distorted reflections · 63–67 Falling upward (Average Reflexes (Acrobatics) or
fall 10 m; anomaly: gravity shifts, Overburdened) · 68–71 Grave chill (anomaly: cold
rules) · 72–76 Memory worm · 77–81 Creeping paranoia · 82–85 Rot and decay (anomaly:
disease spreads) · 86–95 Veil of darkness (zone Poorly Lit; anomaly: permanent) ·
96–100 Warp echo (Average Discipline or Stunned) · 101–125 Psychic breach (roll again,
reroll 101+, apply effect and its anomaly) · 126+ Warp breach (roll on Perils as if
you failed to contain).

### Perils of the Warp (d100 + 10 per charge over Threshold; Corruption) — p.165
11–40 Fright (Frightened (Minor)), 1 · 41–45 Gritted teeth (3 wounds), 1 · 46–50
Psychic discharge (all your batteries drained), 1 · 51–55 Cascade of light (everyone
within Close range 1d10+6, dodgeable as a 1-SL ranged attack), 1 · 56–60 Backlash
(Stunned), 2 · 61–65 Stolen tongue (mute 1d10 h), 2 · 66–70 Light sensitivity (1d10
h: ignore Haze and Poorly Lit, Blinded in bright light), 2 · 71–75 Body warp (subtle
permanent change), 2 · 76–80 Agonised screams (Stunned + a moderate Corruption
source), 2 · 81–85 Soul burn (no powers 1d10 h), 2 · 86–90 Locked in (Restrained 1d10
rounds by an unseen Str 50 entity), 2 · 91–95 Deafening blast (you fall Unconscious;
everyone within Close range Average Fortitude or Stunned), 3 · 96–100 Blood rain (zone
psychic storm; powers there generate double Warp Charge), 3 · 101–105 Time slip
(vanish 1d10 rounds), 3 · 106–110 Daemonic manifestation (d10: 1–3 plaguebearer, 4–6
bloodletter, 7–8 daemonette, 9–10 pink horror, within Close range), 3 · 111–140
Catastrophic blast (you and everyone within Close range 3d10 energy damage; your gear
destroyed), 3 · 141–150 Mass possession (d10 each turn start, 8+ ends; no Move, Action
spent resisting; you're a moderate Corruption source), 5 · 151–170 Daemonhost (Very
Hard (−30) Discipline or possessed; effectively dead), 10 · 171+ Eye of Terror (a
greater daemon or space hulk arrives), 5.

### Power format
Warp Rating · Test difficulty · Range (Self, Immediate, Close, Medium, Long, special) ·
Target · Duration (Instant, time, Sustained) · Effect. "Your zone" moves with you.

### Minor powers — p.166–171
(WR, difficulty, range, duration; spec)
- **Summon Vermin (Призыв вредителей)** WR2, +0, Medium, Sustained (Telepathy): a swarm
  fills a zone in Medium range (crawlers → Difficult Terrain, fliers → Light Haze),
  move it a zone per turn (free), or command one creature to do simple tasks.
- **Ignite (Возгорание)** WR2, +20, Medium, Instant (Pyromancy): a flammable object bursts
  into flame; its holder drops it by end of next turn or becomes Ablaze.
- **Aura of Dread* (Аура ужаса)** WR2, +0, Self/your zone, Sustained (Telepathy):
  enemies in your zone (first entry or turn start each round) oppose Average
  Discipline (Fear) or Frightened; winners immune 1 h.
- **Dull Pain (Приглушение боли)** WR2, +20, Close, SL creatures, Sustained (Biomancy):
  +1 AP all locations, feel no pain.
- **Flight* (Полёт)** WR2, +20, Self or touched object, Sustained (Telekinesis): hover and
  move at Slow speed in any direction ignoring Difficult Terrain; or reduce a touched
  object's weight by 1 per SL.
- **Flame in the Palm* (Пламя на ладони)** WR1, +40, Self, Sustained (Pyromancy): a real
  flame in your hand that doesn't burn you.
- **Ill Omen (Дурное знамение)** WR2, +0, Medium zone, Sustained (Divination): roll
  Phenomena SL times, choose one, it manifests in the zone.
- **Hex / Evil Eye (Сглаз)** WR2, +0, Medium, Instant (Divination): target's first test
  in the next hour has Disadvantage.
- **Luck (Удача)** WR1, +0, Self, Instant (Divination): manifest before a test → success
  Advantage, failure Disadvantage; not for Psychic Mastery; once per round.
- **Sleep (Покой)** WR3, −10, Close, Sustained (Biomancy): opposed vs Challenging (−10)
  Fortitude (Endurance) (Advantage if fighting or straining) → Unconscious until your
  next turn; damage ends it.
- **Nova* (Нова)** WR3, −10, Self/your zone, Instant (Pyromancy): everyone else in your
  zone takes 4 + Wil bonus + SL and opposes Routine (+20) Athletics (Might) or Prone.
- **Preternatural Senses (Сверхъестественные чувства)** WR2, +20, Self, Sustained
  (Biomancy): ignore Darkness/Poorly Lit, see heat through walls at Medium, Advantage
  on Perception tests; 5+ SL ignore Blinded.
- **Psy-analysis (Пси-анализ)** WR1, +40, Close, Instant (Divination): one fact per SL
  (current/max wounds; highest and lowest characteristic; one characteristic; best
  skill; a talent or trait).
- **Psychic Noise / Cloak (Психические помехи)** WR1, +40, Self, Sustained (Telepathy):
  creatures and devices notice you only by winning opposed Easy (+40) Awareness vs your
  manifest test; broken by damage or interaction.
- **Scorching Gaze (Обжигающий взгляд)** WR2, +0, Medium, Sustained (Pyromancy): boil 20
  gallons of liquid per SL (not inside living creatures; vessels may burst).
- **Mend Wounds* (Затворение ран)** WR2, +20, Immediate (touch), Instant (Biomancy): heal
  Wil bonus + target's Tgh bonus + SL wounds and remove Bleeding; a second application
  without rest → Fatigued.
- **Heat (Нагрев)** WR3, −10, Medium, Sustained (Pyromancy): an object of weight ≤ SL
  glows hot; touching deals Wil bonus damage (again if still touching at turn end);
  heated worn armour gives no protection against it.
- **Psychic Blast* (Психический удар)** WR2, −10, Medium, Instant (Telepathy): 2 + Wil
  bonus + SL damage ignoring armour. Known by all psykers.
- **Soulsight (Духовное зрение)** WR2, +0, Medium, Sustained (Divination): sense living
  minds in Medium range (+1 how many, +2 species, +3 count per zone, +4 exact positions);
  exclude chosen creatures; Advantage on Psyniscience to detect daemons and psykers.
- **Spasm (Спазм)** WR2, +20, Close, Sustained (Biomancy): opposed vs Routine (+20)
  Fortitude (Endurance); a limb of your choice is unusable (leg: speed −1; drops held
  items, ends grapples); target retests at its turn end.
- **Spectral Hands (Призрачные руки)** WR2, +20, Close, Sustained (Telekinesis): move
  objects of total weight ≤ SL within your zone (free action each turn); attack with
  them using Psychic Mastery (Telekinesis) instead of Melee, 1 damage per weight, Useless.

### Biomancy — p.171–173
- **Affliction (Недуг)** WR3, −10, Close, Sustained: opposed Challenging (−10) Fortitude
  (Endurance) or Blinded, Deafened, Fatigued, Poisoned or Stunned (your choice); retest at
  its turn end (or an Action to retest at +20); winner immune 1 h.
- **Haemorrhage (Кровоизлияние)** WR2, +0, Close, Instant: opposed Average Fortitude
  (Endurance) or 2 armour-ignoring damage and Bleeding (Major) until treated.
- **Iron Arm* (Железная десница)** WR1, +40, Self, Sustained: Advantage on Strength and
  Melee tests; use SL instead of Str bonus where needed (e.g. damage).
- **Leech* (Пиявка)** WR4, −30, Medium, Sustained: opposed vs Very Hard (−30) Fortitude
  (Endurance) → link; free action each turn: 3 + Wil bonus unreducible damage, heal half
  (round up); target retests at turn end; winner immune 1 h.
- **Biolightning* (Биомолния)** WR3, −20, Medium, Instant: target and all in Immediate
  range take 4 + Wil bonus + SL; opposed Difficult (−20) Fortitude (Endurance) or Stunned
  until your next turn.
- **Purge / Cleanse* (Очищение)** WR3, −10, touch, Instant: removes Poisoned and Stunned;
  add SL to the next test against a disease.
- **Ferrocrete Flesh* (Ферробетонная плоть)** WR3, +0, touch, Sustained: +Tgh bonus AP all
  locations; if Tgh bonus > Str bonus, speed −1 and Disadvantage on Agility tests.
- **Metabolic Overload* (Метаболическая перегрузка)** WR2, +0, Close, SL creatures,
  Sustained: speed +1 step, Advantage on Reflexes.
- **Flesh Sculptor* (Скульптор плоти)** WR1, +40, touch, Permanent: 10 minutes reshaping
  (+1–2 minor features; +3–4 weight, height, build; +5 major restructuring, cause or heal
  injuries, amputate or restore limbs); unwilling target resists with Easy (+40)
  Fortitude (Endurance); pain Stuns 1d5 rounds; impersonation → detection tests −10 per SL.
- **Wither* (Увядание)** WR2, +20, Self/your zone, Instant: everyone in your zone opposes
  Routine (+20) Fortitude (Endurance); losers take the SL difference as armour-ignoring
  damage; more than their Tgh bonus → Poisoned until your next turn.

### Divination — p.174–176
- **Armour Bane (Губитель брони)** WR2, +0, Close, one weapon, Sustained: gains
  Penetrating (SL) (use the higher if it already has it).
- **Dowsing (Лозоходец)** WR3, −10, special, Sustained: direction and distance to a
  specific thing you've seen within SL miles; or whether a type/material/species is
  present within Long range.
- **Forewarning (Предупреждение)** WR2, +20, Self, Sustained: Dodge as a free action on
  your turn.
- **Perfect Timing (Идеальный расчёт)** WR2, +0, Close, SL allies, Instant: each may Seize
  the Initiative as a free action at the end of their next turn and gets Advantage on
  their first test before the end of it.
- **Prescience (Боевое предвиденье)** WR1, +40, Self, special: a 10-minute trance during
  rest → **foresight points = SL**; spend one per test to reroll one or both dice
  (advantage/disadvantage then applies); unspent points vanish when you cast it again.
- **Ask the Warp* (Вопрос Варпу)** WR1, +0, Self, 1 minute: ask a question you don't know
  the answer to; GM rolls 1d10 secretly vs Wil bonus + SL (max 9): lower → true answer,
  otherwise a lie; never the same question twice.
- **Psychometry* (Психометрия)** WR1, +40, touch or your zone, 1 minute trance: +1 vague
  recent strong emotions · +2 how long ago · +3 blurry vision of the events · +4 clear
  vision · +5 identities · +6 ask the GM one question, answered truthfully.
- **Scrying Gaze* (Ясновиденье)** WR1, +40, special, 1 minute: see and hear a creature,
  object or place you've seen; 4+ SL also direction, distance and its surroundings.
  Psykers/daemons with Per bonus > your Wil bonus notice and may spend an Action on an
  opposed Easy (+40) Discipline (Psychic) to end it (winner immune 1 h).
- **Twist of Fate (Поворот судьбы)** WR2, +20, Close, Instant, reaction once per round:
  a creature's test with Advantage or Disadvantage is rolled with neither; failing the
  manifest → you roll everything with Disadvantage until your Warp Charge is 0.
- **Watchward (Охота на охотника)** WR2, +20, Self, Sustained: sense observers (+1 that
  you're watched · +2 how many · +3 by what means · +4 distance and direction · +5 exact
  location · +6 what they look like); exclude allies.

### Pyromancy — p.177–179
- **Firestorm* (Огненная буря)** WR3, −20, Medium, one zone, Instant: everyone there
  takes 6 + SL and opposes Difficult (−20) Reflexes (Dodge) or Ablaze until someone
  spends an Action to beat it out; flammables ignite (zone may become Minor Hazard).
- **Inferno* (Инферно)** WR3, −20, Long, SL zones, Sustained: zones become Minor
  Hazards; those damaged: Difficult (−20) Reflexes (Dodge) or Ablaze; fire ends with the
  power.
- **Cauterise* (Прижигание)** WR3, −10, touch, Instant: removes Bleeding, Frightened,
  Stunned, Unconscious; target takes 4 − SL armour-ignoring damage to the touched
  location.
- **Flame Control (Управление пламенем)** WR3, −10, Long, Instant: free action on your
  turn, SL of: extinguish all fire in a zone (removes Ablaze, hazard −1 step); double or
  halve light from flames in a zone; recolour flames; intensify fires so a zone becomes a
  Minor Hazard; spread fire to an adjacent zone (Minor Hazard if fuel); shape flames into
  figures until your next turn.
- **Melta Beam* (Плавящий луч)** WR3, −20, Long, Instant: 7 + SL damage, choose the hit
  location; the armour hit permanently loses AP equal to Wil bonus.
- **Plasma Torch* (Плазменный факел)** WR2, +0, Self, Sustained: your hand cuts and welds
  metal, lights the zone; melee profile Brawling 4 + Wil bonus, weight 0, Inflict
  (Ablaze), Loud, Rend (Wil bonus).
- **Pyrolight* (Пиросвет)** WR3, −20, special, Self, Sustained: you glow (bright in your
  zone, dim adjacent); free action to flare: bright light at Medium range, your zone a
  Minor Hazard (harmless to you), creatures entering or starting there oppose
  Difficult (−20) Fortitude (Endurance) or Blinded until your next turn.
- **Smouldering Cloud* (Тлеющее облако)** WR2, +0, Medium, SL zones, Sustained: zones get
  Heavy Haze; ending a turn there starts suffocation.
- **Sunburst* (Солнечная вспышка)** WR2, +0, Long, one zone, Instant: Average Fortitude
  (Endurance) opposed or Blinded; retest each turn end; three failures in a row →
  permanently blind.
- **Thermal Shield* (Тепловой покров)** WR2, +20, Close, allies in range, Sustained:
  fire/heat damage to you and allies in Close range reduced by Wil bonus + SL before
  armour; invisible to thermal auspex.

### Telekinesis — p.179–181
- **Shatter / Collapse (Коллапс)** WR2, +0, Medium, one object (Large or smaller),
  Instant: break it if SL suffices (+1 fragile · +2 ordinary · +3 sturdy (lasgun, wooden
  door) · +4 very durable (bolt pistol, gas canister) · +5 heavy-duty (plasteel wall,
  ferrocrete pillar) · +6 near-indestructible (ceramite, adamantium)); or target a piece of
  armour: −1 AP per SL.
- **Machine Curse (Проклятие механизмов)** WR2, +20, Close, one mechanism, Instant: +1
  malfunctions (d10 6+ fails each use until your next turn) · +2 jams until your next turn
  · +3 breaks until repaired · +4 destroyed · +5 explodes for 4 damage in Immediate
  range. Large machines may count as several mechanisms.
- **Gate of Infinity* (Врата вечности)** WR2, +0, one mile per SL, Sustained: two
  portals (one adjacent to you, one within SL miles at a place you see, remember or can
  locate); crossing or shooting through counts as between adjacent zones.
- **Gravity Well* (Гравитационный колодец)** WR1, +40, Self/your zone, Sustained: your zone
  is Difficult Terrain for others; leaving requires winning opposed Easy (+40) Athletics
  (Might); when you move zones, others come with you unless they win.
- **Crush / Vice (Тиски)** WR3, −20, Medium, Sustained: 3 + Wil bonus + SL damage;
  opposed Difficult (−20) Athletics (Might) or Restrained while sustained; retest each
  turn end.
- **Deflection* (Отражение)** WR1, +40, Self, Sustained: +SL AP all locations against
  solid objects (not energy weapons).
- **Push (Бросок)** WR2, +20, Close, Instant: throw an object of weight ≤ SL into an
  adjacent zone; or a creature opposes Routine (+20) Athletics (Might) or is pushed into
  an adjacent zone and Prone.
- **Psychic Barrier (Психическая преграда)** WR3, −10 (book prints "средняя (−10)"),
  Medium, one zone, Sustained: crossing the barrier needs an Action and winning opposed
  Challenging (−10) Athletics (Might); ranged attacks entering or leaving the zone deal 2
  less damage per SL.
- **Psychic Maelstrom* (Психическая буря)** WR2, +20, Self/your zone, Sustained: zone is
  Difficult Terrain; creatures entering or starting there oppose Routine (+20) Athletics
  (Might) or Prone; attacks from or through the zone have Disadvantage; loose objects of
  weight ≤ SL are knocked over, weight-0 ones whirl.
- **Warp Vortex* (Погибельный вихрь)** WR4, −30, Medium, one zone, Sustained: zone gains
  Difficult Terrain, Warp-touched and Deadly Hazard; damaged creatures oppose Very Hard
  (−30) Discipline (Psychic) or Stunned. When you stop sustaining, 1d10 ≥ Wil bonus → the
  vortex stays until a psyker within Medium range spends an Action and passes Very Hard
  (−30) Psychic Mastery (Telekinesis).

### Telepathy — p.182–184
- **Beacon (Маяк)** WR3, −20, Medium, Sustained: know the target's exact location within
  SL miles; Advantage on all attacks against it.
- **Command (Приказ)** WR2, +20, Close, Instant: opposed Routine (+20) Discipline
  (Psychic); win → dictate one Action or Move it must do first on its turn; it knows it was
  compelled.
- **Dominate (Господство)** WR3, −20, Medium, Sustained: opposed Difficult (−20)
  Discipline (Psychic) or you control it until end of your next turn; retests on damage
  and at its turn end; winner immune 1 h; it knows.
- **Memory Wipe (Стирание памяти)** WR2, +20, Close, Instant: opposed Routine (+20)
  Discipline (Psychic); erase one memory up to 10 × Wil bonus minutes long; unnoticed gap.
- **Mind Probe (Пси-допрос)** WR2, +0, Close, Sustained: opposed Average Discipline
  (Psychic) (Disadvantage if unconscious, Advantage if hostile); if you win but it also
  passed, it notices. SL difference: +1 name, age, mood, health, surface thoughts, lies ·
  +2 an important object, place or person and why · +3 last day's memories · +4 last year's
  memories · +5 innermost thoughts, fears, secrets, plans · +6 an open book. Ends if it
  moves beyond Close. Free action per turn: extract memories equal to your Int bonus (real
  time).
- **Shroud of Night* (Покров ночи)** WR2, +0, Self/your zone, Sustained: Heavy Haze that
  you and allies inside ignore; an outsider may spend an Action on opposed Average
  Discipline (Psychic) to see through (immune 1 h).
- **Psychic Fortitude (Психическая стойкость)** WR3, −20, Close, SL allies (not you),
  Sustained: Advantage on Willpower tests and they may use your Willpower.
- **Psychic Shriek* (Психический вопль)** WR3, −10, Medium, your zone and one other,
  Instant: everyone else opposes Challenging (−10) Discipline (Psychic); losers take Wil
  bonus + SL armour-ignoring damage; daemons and psykers double; Blanks and soulless
  (necrons) immune.
- **Telepathic Link (Телепатическая связь)** WR3, −20, Long, SL allies, Sustained: silent
  mind-speech; **while linked the group's Superiority can't drop below 1**.
- **Terrify / Nightmare Visions (Кошмарные видения)** WR3, −20, Medium, Sustained:
  opposed Difficult (−20) Discipline (Fear) or terrified (translator: likely Frightened
  (Major)) of a phantom only it sees; retest at its turn end; winner immune 1 h.

## 16. Between Missions (Между заданиями) — p.228–234

Optional downtime rules. Usually **two Endeavours** per interval (GM adjusts). Each
player first rolls an **Event**. Influence can grant bonus SL on Endeavour tests.

### Events (d100) — p.230–231
01–05 **Arrested** (an ally may spend an Endeavour and pass Routine (+20) Lore to clear
them; otherwise the group spends two extra Endeavours; the patron may intervene, costing
its standing with that faction −1) · 06–14 **Fortunate meeting** (next Consult an Expert
counts as already met) · 15–19 **Discord** (a bad run-in with another faction, remembered)
· 20–25 **Death in the shadows** (a contact under threat; spend an Endeavour to help or
they resent you or die) · 26–29 **Under watch** (start next mission Fatigued) · 30–32
**Unrest** (all Endeavour tests this interval −2 SL) · 33–37 **Outbreak** (Challenging
(−10) Fortitude or start next mission Poisoned until treated) · 38–45 **Crackdown**
(Disadvantage on illicit Endeavours and tests) · 46–49 **Disgruntled machine spirits** (a
valuable item stops working and resists repair) · 50–53 **Favour returned** (an old
acquaintance helps with the next Endeavour or mission) · 54–57 **Prophecy** (+1 Fate
next mission, not regained) · 58–62 **Unexpected gift** (a useful Common item) · 63
**Patron's misfortune** (once per interval: wound, illness or political humiliation →
patron −1 Influence with that faction) · 64–74 **Bounty hunter** (a hunter strikes at the
worst moment next mission; half the group targeted → a venator gang) · 75–79 **Old
debts** (a big favour asked) · 80–85 **Tempting opportunity** (Earn Money doubles this
interval) · 86–91 **Festival** (ignore the first Fatigued gained) · 92–95 **Tithe
burden** (lose half unhidden funds, or each donates a Common/Uncommon weapon) · 96–00
**Very important guest** (Very Hard (−30) social test: +1 Influence with their faction, max
+2; failure −1).

### Group Endeavours — p.229
- **Chorus of whispers:** each member contributes to a Difficult (−20) extended Rapport
  (Charm), 8 SL, one roll per Endeavour → patron +1 Influence with a chosen faction (needs
  access to its influential members). Can be used to smear the patron instead (−1); each
  time roll 1d10 ≤ number of smear attempts ever made → treachery discovered,
  catastrophically.
- **Combat drills:** next mission start one fight at +1 Superiority.
- **Fortify base:** +1 Superiority if the base is attacked (stack to +3; may erode).

### Personal Endeavours — p.231–234
Others may help (as normal Help) by spending their own Endeavour.
- **Investment:** pick 1–20; next interval GM rolls d100: above the number → capital grows
  by that percentage; at or below → lost. Withdrawing costs another Endeavour.
- **Commission gear:** find a tech-priest (or Consult an Expert first); pay full price (or
  services); qualities cost extra; Common/Uncommon ready next mission, Rare/Exotic weeks to
  years.
- **Accumulate Influence:** +1 with three contacts of one faction → Average Rapport:
  faction Influence +1 and those contacts −1 (still effectively +1 through the faction);
  fumble → one contact −1. Normally a faction can't be raised above **+3** this way; beyond
  that the faction tries to recruit you — consider making the character a patron.
- **Crafting** (usually tech-priests): materials ¼ of item price; extended Tech
  (Engineering) at difficulty by availability (Common +0, Uncommon −10, Rare −20, Exotic
  −30), SL required by price (500 → 5, 1000 → 10, 3000 → 15, 6000 → 20+), one roll per
  interval; on completion another Tech (Engineering) test: failure adds a flaw (GM),
  critical adds a quality (player).
- **Worship:** Average Lore (Theology) → +1 Fate until the end of the next mission.
- **Weapon familiarity:** choose a weapon; ignore all fumbles with it next mission.
- **Medicae in extremis:** with a known surgeon (or Consult an Expert), the physician makes
  three separate tests to treat injuries or fit augmetics (costs p.155–156).
- **Make friends:** a week courting a faction you've dealt with; Average Rapport (Charm) →
  +1 Influence with it until the end of the next mission; a fumble makes future attempts
  Challenging (−10), a second fumble −1 Influence.
- **Earn money:** a skill with advances, agreed use; Average test → 100 ₷ per SL (150 ₷ per
  SL with a specialisation).
- **Training rites:** a skill with ≥1 advance, Average test → mark it; once next mission
  gain Advantage with it (stackable marks).
- **Explore the area:** an area no larger than a city, station or hive district →
  Advantage on Lore and Navigation about it next mission.
- **Consult an Expert:** Average Rapport (Inquiry) (Challenging (−10) for Special fields,
  Difficult (−20) for heretical) → next mission +2 SL on one test with the expert's skill;
  the expert can be reused for Commission, Crafting, Medicae in extremis.

## 17. Gamemaster guidance and toolkit (Ведущий) — p.304–314

### Tone the rules are built for
- Grim, dangerous, **grounded anti-heroes** (Warhammer Crime), decay and corruption, **no
  happy endings**. PCs are ordinary humans: one bolt round kills. Preparation is
  rewarded mechanically (Influence, Superiority); recklessness dies; fleeing is often right.
- **Golden rule:** change anything that stops the fun. Session zero; lines and veils.
- **Investigations:** call to action → gather clues → work the suspects → justice. **Every
  key clue reachable three ways, one of them sure.** Tests interpret clues, they don't gate
  finding them. Wrong conclusions: escalate (new crimes → new clues), a scolding NPC,
  natural consequences, or adopt the players' better theory.
- **Factions:** put **2–3 opposed factions** with a stake in each mission; influence shifts
  at mission end create allies, enemies and dilemmas.
- **Superiority** as reward for clever prep, especially for non-combat characters; players
  learn to feel underprepared without it.
- **Resolve** tuning: exhausted, alone, nothing to gain → lower; armed, fed, together, led,
  defending home → higher. Use Superiority ≥ Resolve to skip trivial fights (narrate the
  quick takedown).

### Encounter building — p.310–311
- New characters: **1 troop per PC + 1–2 leaders/elites**. 500–1500 XP: **1.5 troops per
  PC + 1–3**. 2000+ XP: **2 troops per PC + 2–4**. Calibrate with escalating waves and
  offer an escape.
- Enemies use the same actions (cover, aim, called shots, shove, grapple, dodge, orders).
- **Combat complications (d6 row, d6 column):** 1 Environment — spreading Hazard, Haze,
  collapsing floor/ceiling, great height or rickety structures, everything shaking,
  predatory flora/fauna · 2 Enemy — xenotech/heretech, defending and awaiting reinforcements,
  ambushes and traps, controls environmental hazards, unstoppable numbers, several enemy
  groups unite · 3 Time — deliver an urgent message or package, area soon destroyed or
  uninhabitable, reach a point to stop the enemy, hold until reinforcements, catch or kill
  one foe before escape, perform a purification rite or tech-rite · 4 Protect — a building or
  war machine to fortify, frightened innocents, a witness or captive heretic for trial, an
  immobile ally / fragile device / sorcerous artefact, a captured beast or prisoner wanting
  freedom, a large vehicle or beast crossing enemy ground · 5 Key target — kill the enemy
  commander, an enemy holds a warp or tech artefact, seize a point, grab a foe or free an ally
  in the middle of enemy lines, hack a cogitator in a hazardous zone, a monstrous enemy hiding
  among innocents · 6 Interaction — flickering lights, a tank of water or toxic waste that
  can flood, explosive plasma conduits, controllable blast doors or void shields, deadly
  galvanic servo-haulers, unstable structures.

### Rewards — p.312–313
| Type | Amount | When | Notes |
| --- | --- | --- | --- |
| XP | **50–80** | end of each session or mission | always some; scale by progress |
| Solars | **5 × payment** | each successful mission | patron's payment level (p.29); more if they gained resources |
| Gear | 1 item | successful mission | Uncommon or Rare the patron can get; Exotic only for exemplary work |
| Services | — | successful mission | Good/Excellent lodging or transport |
| Augmetics | — | serious injury that hampers service | quality reflects the patron's investment |
| Special specialisations | — | proven loyalty | Lore, Medicae, Linguistics the patron can grant |
| Patron opportunities | — | advancing the patron's plan | new Boon-like opportunities (p.29) |
Handing out rewards at mission end or during downtime explains new talents and money.

### Optional rules — p.313–314
- **Tactical map:** free move 2 m; Move = speed in metres (Slow 4, Normal 8, Fast 12), Run
  again; difficult terrain halves. Zone effects → 4 m radius sphere; Spread → 1 m. Ranges:
  Immediate 2 m, Short 6 m, Close 12 m, Medium 24 m, Long 36 m, Extreme 72 m; up to double
  with Disadvantage. Grid: 1 square = 1 m²; Tiny shares, Small/Average 1, Large 2×2, Enormous
  3×3, Monstrous 4×4+. Tabletop: 1 m = 1 inch. Realistic sniping: Aim lets range ×10.
- **Shooting into melee:** −1 SL per creature engaged with the target; if the penalty turns a
  pass into a fail, you hit another participant (GM picks).
- **Counting every round:** magazine ×5; single shot 1, Burst 5, Rapid Fire 5 × X.
- **Resisting conditions** (instead of automatic Inflict): Ablaze — Reflexes (Dodge);
  Bleeding — Fortitude (Endurance)?; Deafened — Fortitude (Pain)?; Fatigued — Fortitude
  (Endurance); Frightened — Discipline (Fear); Helpless — Fortitude (Endurance);
  Overburdened — Athletics (Might); Poisoned — Fortitude (Poison); Prone — Reflexes
  (Balance); Restrained — Athletics (Might); Stunned — Fortitude (Pain); Unconscious —
  Fortitude (Endurance). (Column pairing from the extracted table; order verified by count,
  two middle entries uncertain.)

## 18. NPCs and the bestiary frame — p.315–318

- **Stat block:** name · size, faction, role, type · characteristics · Armour (one value for
  all locations; force fields as 2+1d10 etc., rerolled per hit), Wounds, Critical Wounds,
  Initiative, Speed, Resolve · skills (without a skill, test the characteristic) · traits ·
  attacks (skill, value, damage + SL, range, traits; melee adds Str bonus) · possessions.
  Example Ganger: WS 35 BS 35 Str 30 Tgh 40 Ag 40 Int 20 Per 30 Wil 20 Fel 20; Armour 2,
  Wounds 13, Crits 0, Init 7, Normal, Resolve 1; Melee 40, Presence 40, Ranged 40, Stealth 50;
  *Ambush* (Stealth test during its move in a Cover zone), *Our turf* (+1 Resolve and
  Advantage on Discipline on gang territory); autogun, stub pistol, knife.
- **Roles:**
  - **Troops (Рядовые):** characteristics ≤ 50, total ≈ 280, ≈ 5 advances, **0 Critical
    Wounds — defeated by any critical**.
  - **Elites (Элита):** ≤ 60, total ≈ 380, ≈ 15 advances, **survive one critical, the
    second defeats them** (option: die only at Tgh-bonus criticals like leaders).
  - **Leaders (Лидеры):** ≤ 70, total ≈ 480, ≈ 25 advances, criticals as PCs; often traits
    to rally or direct troops.
- **Promotion:** +10 all characteristics and +10 to advanced skills turns troop → elite,
  elite → leader (update criticals).
- **"Look out, sir!":** a loyal troop or elite in Immediate range of a targeted leader, not in
  melee, may spend its reaction on Average Reflexes (Dodge) to take the ranged hit.
- **Resolve modifiers (+1 or more):** outnumber the PCs; cornered; captivity means death;
  reinforcements believed near; commander present and fighting; mindless beasts or broken
  minds. A clear commander → everyone uses its Resolve.
- NPC abilities that lower PC Superiority, when used by an allied NPC, lower enemy Resolve by
  1 (once per fight).

## 19. Appendices — p.355–362

### Fumble table (d10) — p.355
1 Fall over: last in initiative next round · 2 Overbalance: Disadvantage on all tests until
end of your next round · 3 Drop the weapon (anyone picks it up as a free action) · 4 Knocked
down: Prone · 5 Twisted ankle: speed Slow until the fight ends (not a critical) · 6 Jarred
machine spirit: weapon becomes Unstable until repaired with Difficult (−20) Tech
(Engineering) · 7 Blind or deafen yourself (GM picks) · 8 Damage own armour: −1 AP on a random
location until repaired (no armour there → 1 wound) · 9 Graze yourself: Stunned or Bleeding
(GM picks) · 10 Hit an ally: a random ally in range takes an attack at +0 SL, roll location;
no ally → yourself.

### Trinkets — p.355
Every character starts with one or more worthless keepsakes (d100 table of 50 items: empty
bolt casing, brass cog, broken chrono…). Also loot for pockets.

### Critical wounds — p.356–361
- Treatment difficulties are **for treatment during combat; out of combat one step easier**.
  "None" = needs no treatment and **doesn't count toward death**. Injuries persist after the
  critical is healed and don't count toward death.
- Roll 1d10 (+ overflow damage for overflow criticals; see §5).

**Head (1 … 15+):** 1 Bruise (Disadvantage Awareness (Sight) and Ranged 1 h; none) · 2 Hard
blow (Stunned until end of next turn; none) · 3 Cut cheek (Bleeding; Routine Medicae, bandage,
or closes in an hour) · 4 Mangled ear (Deafened until end of next turn, Bleeding; Average) · 5
Dislocated jaw (Stunned until end of next turn, Disadvantage on speech Rapport; injury: Minor
Fracture (jaw); Average Medicae to reset) · 6 Forehead blow (Bleeding, Blinded; Average) · 7
Damaged eye (Disadvantage Awareness (Sight), Bleeding, one eye → blind; injury: Minor Fracture
(eye socket); Challenging) · 8 Damaged ear (Deafened; again → permanently deaf; Challenging
with drugs) · 9 Knocked-out teeth (Bleeding, Average Fortitude (Pain) or Prone; injury: lose
1d10 teeth; Challenging by a Surgeon) · 10 Broken nose (Bleeding (Major), Blinded until end of
next turn, Average Fortitude (Pain) or Stunned until end of next turn; injury: Major Fracture
(nose); Difficult with surgeon's tools) · 11 Severed ear (Bleeding (Major), Deafened, Average
Fortitude (Pain) or Stunned; injury: Amputation (ear); Difficult by a Surgeon) · 12 Concussive
blow (Bleeding, Deafened, Stunned one minute; injury: Fatigued 1d10 days, rest doesn't help;
Difficult with tools) · 13 Burst eye (Bleeding (Major), Disadvantage Awareness (Sight), one eye
→ blind; injury: Amputation (eye); Very Hard by a Surgeon) · 14 Smashed jaw (Bleeding (Major),
Average Fortitude (Pain): pass Stunned until end of next turn, fail Prone and Helpless until end
of next turn; injury: lose 1d10 teeth, Major Fracture (jaw); Very Hard by a Surgeon) · 15+
Split skull — dead.

**Arm (1–10 … 20+):** 1 Wrenched joint (drop held item; none) · 2 Dead arm (Disadvantage with
that arm one minute; none) · 3 Cut (Bleeding; Routine) · 4 Wounded hand (Bleeding, drop item;
Average) · 5 Dislocated shoulder (arm useless until reset; each turn Average Fortitude (Pain) or
Stunned; Average reset) · 6 Severed finger (Bleeding (Major); injury: Amputation (finger);
Average by a Surgeon) · 7 Clean break (drop, arm useless, Average Fortitude (Pain) or Stunned a
minute; injury: Minor Fracture (arm); Challenging treats shock not the break) · 8 Deep cut
(Bleeding (Major), Disadvantage with that arm; Challenging with tools) · 9 Mangled hand (Bleeding
(Major), drop; injury: Major Fracture (hand), lose 1d10−5 fingers; Challenging by a Surgeon) ·
10 Shattered elbow (drop, arm useless, Challenging Fortitude (Pain) or Stunned a minute; injury:
Major Fracture (arm); Difficult treats shock) · 11–12 Cleaved hand (Bleeding (Major), drop,
Challenging Fortitude (Pain) or Stunned a minute; injury: lose a finger, one more per untreated
minute, all → Amputation (hand); Difficult by a Surgeon) · 13–14 Severed arteries (drop,
Bleeding (Major), Fatigued, arm useless; injury: Fatigued 1d10 days; Difficult with tools) ·
15–16 Severed hand (Bleeding (Major), Stunned an hour; injury: Amputation (hand); Very Hard by a
Surgeon) · 17–19 Arm hanging by a thread (drop, useless, Stunned an hour, Bleeding (Major); any
further damage to that arm → the 20+ result; injury: Amputation (arm); Very Hard by a Surgeon to
amputate) · 20+ Brutal dismemberment — dead.

**Body (1–11 … 18+):** 1 Winded (Stunned until end of next turn; none) · 2 Low blow (Average
Fortitude (Pain) or Prone; none) · 3 Cut (Bleeding; Routine) · 4 Gut punch (Bleeding, Prone;
Average) · 5 Cracked rib (Disadvantage on Str and Ag tests, speed −1; injury: Minor Fracture
(body); none) · 6 Crushing blow (Bleeding, Stunned a minute; Average by a Surgeon) · 7 Broken
collarbone (drop item on that side, Disadvantage with that arm, Average Fortitude (Pain) or
Stunned a minute; injury: Minor Fracture (counts as broken arm); Challenging treats shock) · 8
Deep wound (Bleeding (Major), speed −1; Challenging with tools) · 9 Cracked hip (Prone,
Disadvantage on mobility, speed −1, Average Fortitude (Pain) or Stunned a minute; injury: Minor
Fracture (counts as broken leg); Challenging treats shock) · 10 Broken ribs (Disadvantage on all
physical tests, speed −2 steps; injury: Major Fracture (body); Challenging treats shock) · 11
Punctured lung (Bleeding (Minor), Fatigued; injury: Challenging Medicae by a Surgeon repairs and
removes Fatigued; Challenging to stop bleeding and stitch) · 12–13 Severed arteries (Prone,
Bleeding (Major), Fatigued, speed −1, Disadvantage on mobility; injury: Fatigued 1d10 days;
Difficult with tools) · 14–15 Flayed (Prone, Bleeding (Major), Stunned an hour; injury:
Challenging by a Surgeon repairs tissue; Very Hard by a Surgeon) · 16–17 Broken spine (Prone,
Bleeding (Major); injury: Major Fracture (body); Very Hard by a Surgeon) · 18+ Torn apart — dead,
creatures in Close range drenched.

**Leg (1–10 … 20+):** 1 Twisted ankle (Prone; none) · 2 Dead leg (speed −1 for a minute; none) ·
3 Cut (Bleeding; Routine) · 4 Wounded calf (Bleeding, Prone; Average) · 5 Knee strike
(Disadvantage on mobility, speed −1; each turn Average Fortitude (Pain) or Stunned until reset;
Average reset) · 6 Severed toe (Bleeding (Major); injury: Amputation (toe); Average by a Surgeon)
· 7 Clean break (leg useless, Prone, Disadvantage on mobility, speed −1, Average Fortitude (Pain)
or Stunned a minute; injury: Minor Fracture (leg); Challenging treats shock) · 8 Deep cut (Bleeding
(Major), Disadvantage on tests with that leg; Challenging with tools) · 9 Mangled foot (Bleeding
(Major), Prone, speed −1; injury: Major Fracture (foot), lose 1d10−5 toes; Challenging by a
Surgeon) · 10 Shattered knee (useless, Prone, Disadvantage on mobility, speed −1, Challenging
Fortitude (Pain) or Stunned a minute; injury: Major Fracture (leg); Difficult treats shock) ·
11–12 Cleaved foot (Bleeding (Major), Prone, Challenging Fortitude (Pain) or Stunned a minute;
injury: lose a toe, one more per untreated minute, all → Amputation (foot); Difficult by a
Surgeon) · 13–14 Severed arteries (Prone, Bleeding (Major), Fatigued, speed −1, Disadvantage on
mobility; injury: Fatigued 1d10 days; Difficult with tools) · 15–16 Severed foot (Prone, Bleeding
(Major), Stunned an hour; injury: Amputation (foot); Very Hard by a Surgeon) · 17–19 Leg hanging by
a thread (useless, Prone, speed −1, Disadvantage on mobility, Stunned an hour, Bleeding (Major);
further damage → 20+; injury: Amputation (leg); Very Hard by a Surgeon to amputate) · 20+ Brutal
dismemberment — dead.

(Row-to-effect pairing reconstructed from the scrambled text layer; treatment column order is
reliable, injury placement mostly reliable. Cross-check with impmal-core's critical tables.)

### Conditions (Состояния) — p.356–357
First instance is Minor; gaining it again makes it Major, unless stated.
- **Ablaze (Горение):** Minor 1d5, Major 1d10 armour-ignoring damage at the start of your turn;
  auto-fail Stealth; remove by dropping Prone, an Action and Average (+0) Athletics.
- **Bleeding (Кровотечение):** Minor 1, Major 3 armour-ignoring damage at the end of your turn.
  If it takes your last wound you suffer a Critical Wound, bleeding damage stops, but wounds
  can't recover until the bleeding is stopped. Non-critical bleeding: Average Medicae or
  surgeon's tools.
- **Blinded (Слепота):** sight-based tests (Awareness (Sight), Ranged) succeed only on 01–05;
  Disadvantage on Melee and Reflexes (Dodge). Lasts 1d10 rounds unless stated.
- **Deafened (Глухота):** hearing tests only on 01–05. 1d10 rounds. (Augmetic senses can be
  rebooted with an Action.)
- **Fatigued (Усталость):** Minor — Disadvantage on all tests. Major — all tests become Very
  Hard (−30). Fatigued again while Major → act for Tgh-bonus minutes then Unconscious. Remove
  with six hours' rest unless stated.
- **Frightened (Страх):** Minor — Advantage on Awareness and Intuition, Disadvantage on tests
  to oppose the source. Major — flee the source by the fastest means. End of each round
  Average (+0) Discipline (Fear) to remove.
- **Helpless (Беспомощность):** can't move or act or defend; **melee attacks against you are
  automatic Critical Hits**.
- **Overburdened (Перегрузка):** Disadvantage on Agility tests, speed −1.
- **Poisoned (Отравление):** Minor — Disadvantage on Str and Tgh tests; **SL on any test
  capped at your Tgh bonus**. Major — Prone and Helpless. Lasts 1d5 hours unless stated.
  Usually Average Medicae with surgeon's tools; dangerous poisons Challenging, deadliest Very
  Hard (and often fatal when they run their course).
- **Prone (Сбит с ног):** crawl only unless you spend Move to stand; Disadvantage on Melee;
  attackers in Immediate range have Advantage, attackers further away Disadvantage.
- **Restrained (Обездвиживание):** Minor — no Move; Disadvantage on movement-related tests
  (Athletics, Dexterity, Melee, Reflexes, Ranged). Major — Helpless. Escape with an
  appropriate test.
- **Stunned (Оглушение):** Minor — Move or Action, not both. Major — also Disadvantage on all
  tests. 1d5 rounds unless stated; an ally spending an Action lets you try Average Fortitude
  (Pain) to shake it.
- **Unconscious (Без сознания):** drop everything, Prone and Helpless; anyone adjacent with a
  non-Useless weapon can kill you without a test.

### "I want to play…" — p.362
Archetype recipes (origin / faction / role), e.g. Sister of Silence novice (Shrine, Astra
Telepathica, Zealot), Administratum adept (Hive, Administratum, Savant), Aeronautica pilot
(Void, Fleet, Savant), commissar cadet (Schola, Militarum, Interlocutor), death cult assassin
(Feudal, Ministorum, Zealot), ganger (Hive, Infractionists, Penumbra), Guardsman (Feudal,
Militarum, Warrior), Inquisition acolyte (Schola, Inquisition, Penumbra), exorcist (Shrine,
Inquisition, Zealot), stormtrooper (Schola, Inquisition, Warrior), pariah (Hive, Inquisition,
Mystic — as printed), Guard medic (Feudal, Militarum, Savant), sniper (Schola, Militarum,
Penumbra), missionary (Shrine, Ministorum, Interlocutor), Assassinorum initiate (Schola,
Administratum, Penumbra), preacher (Shrine, Ministorum, Zealot), rejuvenat adept (Shrine,
Administratum, Savant), rogue trader mercenary (Feral, Dynasty, Warrior), seneschal (Void,
Dynasty, Interlocutor), sanctioned psyker (Void, Astra Telepathica, Mystic), Dialogus novice
(Schola, Ministorum, Savant), famulous (Schola, Ministorum, Interlocutor), Hospitaller novice
(Schola, Ministorum, Savant), Battle Sister novice (Schola, Ministorum, Warrior), tech-priest
(Forge, Mechanicus, Savant), Tempestus Scion cadet (Schola, Militarum, Warrior), armsman (Void,
Fleet, Warrior). (Column alignment reconstructed.)

## 20. Creating a Patron (Покровитель) — p.16–45

Built collaboratively before characters. Steps: 1 faction · 2 duty · 3 motivation · 4
demeanour · 5 players pick boons · 6 GM **secretly** picks liabilities · 7 background and
influence. Characters needn't share the patron's faction.

- **Influence:** patron starts at **+2 with its faction**, modified by duty, boons (*) and
  liabilities (*). PCs may use the patron's influence instead of their own. **Players know
  the positive values at the start; the GM keeps all later changes and all negative values
  secret.** Each point = +1 SL on social tests with that group; also works through named
  contacts inside factions, whose personal modifiers stack with faction influence.
- **Boons and liabilities:** each patron has **one duty boon** and **one liability** (GM,
  secret). Players may add **up to three extra boons**; the GM adds **one liability per
  extra boon**. Each boon/liability once unless stated.
- Faction (d100): 01–10 Administratum · 11–15 Astra Telepathica · 16–30 Mechanicus · 31–39
  Ministorum · 40–54 Astra Militarum · 55–64 Imperial Fleets · 65–74 Infractionists · 75–94
  Inquisition · 95–00 Rogue Trader Dynasty.

### Duties and their service boons — p.18–26
| Faction | Duty | Service boon |
| --- | --- | --- |
| Administratum | Departmento Munitorum ordinate | **Munitorum Depot:** HQ; Advantage on availability tests; free extra magazines |
| Administratum | Tithe Prefect | **Tithe Inspection:** once per mission a legal inspection of a place or people by adepts, wardens, vigilants; PCs may accompany |
| Astra Telepathica | Astropath | **Astropathic Link:** message through the warp (otherwise vox or couriers only); +1 Influence Telepathica |
| Astra Telepathica | Sister of Silence (Knight-Centura) | **Null Sanctum:** HQ with a warp-proof cell where no powers work |
| Mechanicus | Forge Master | **Manufactorum Overseer:** pick a gear type (flak, las, special ammo…); one Common/Uncommon item of it each mission start |
| Mechanicus | Magos Biologis | **Perfection Artisan:** no availability tests for augmetics and weapon upgrades; free augmetic surgery (and may require it) |
| Ministorum | Arch-confessor | **Ecclesiarchy Sanctuary:** HQ in a shrine; Lore (Theology) in its library 20 easier; each PC gets a holy symbol |
| Ministorum | Canoness | **Purification Rites:** mission start Advantage on the first Corruption resistance; mission end halve current Corruption |
| Astra Militarum | Lord Commissar | **Fearsome Reputation:** invoking the name → Difficult (−20) Discipline (Fear) or Frightened for those who know it |
| Astra Militarum | Senior Officer | **Attached Troops:** once per mission for a day, Guard soldiers equal to PC count (GM-run); +1 Influence Militarum |
| Imperial Fleets | Void Captain | **Voidship:** HQ aboard; Average+ lodging and food; free in-system and interstellar travel |
| Imperial Fleets | Port Master | **Voidport Master:** manifests and port logs, inspect ships and cargo, close the port, half-price transport; +1 Influence Fleets |
| Infractionists | Criminal Mastermind | **Expendables:** once per mission the patron's disposables commit a crime of your choice; +1 Influence Infractionists |
| Infractionists | Guildmaster | **Registered Trader:** trade papers, merchant passage, anything from chapter 5 at −10% per point of its highest Influence; +1 Influence Administratum, Fleets or Dynasties |
| Inquisition | Inquisitor, Ordo Hereticus / Ordo Xenos | **Absolute Authority:** when using patron influence, use its Inquisition value instead of the relevant faction's (may offend or not cow the target; heretics don't care) |
| Rogue Trader | Diplomat / Militant Trader | **Voidship** (as above) |

Each duty has a d10 boon table and a d10 liability table suggesting fits (see book).

### Motivation (d10 by faction) and demeanour — p.27–28
- **Motivations:** Conflict (violence, direct or by proxy) · Knowledge (gather and use
  information, archeotech) · Wealth (acquire and protect riches, relics, land) · Glory
  (fame, smear rivals) · Unity (make the Imperium's servants cooperate: diplomacy,
  keeping peace, foiling conspiracies). Rolled on a per-faction d10 table.
- **Demeanour (d10):** 1–2 Choleric (demands results, vengeful) · 3–4 Melancholic
  (deliberate, expects perfection) · 5–6 Phlegmatic (calm, sees other views, compromises) ·
  7–8 Sanguine (talkative, energetic, sometimes rash) · 9–10 Inscrutable.
- **Payment** per standard day, each agent: **Low 50 ₷ · Average 100 · Good 200 ·
  Excellent 600**. Start at Average (text garbled; almost certainly Average), paid between
  missions; living costs covered. Boons, liabilities and performance can move it.

### Boons (Возможности) — p.29–36 (* = changes influence)
- **Censorium:** HQ in a vast archive; information on nearly any place, organisation or
  family (histories may be revised).
- **Administratum Schola*** (+1 Administratum): −20 XP on Intuition (People), Linguistics
  (High Gothic), Logic (Evaluation, Investigation), Lore (Academics, Common), Medicae
  (Humans), Rapport (Inquiry).
- **Mechanicus Tutelage*** (+1 Mechanicus): −20 XP on all Logic, Lore, Tech specialisations.
- **Seminary*** (+1 Ministorum): −20 XP on Intuition (People), Linguistics (High Gothic),
  Lore (Theology), Presence (all), Rapport (Charm).
- **Secret Ally:** an NPC in another faction with Influence +3 there; asks favours back.
- **Blackmailer*** (+1 Infractionists): mission start, dirt on a person → +1 Superiority
  when dealing with them.
- **Cartographicae Contacts*** (+1 Fleets or Dynasties): void charts, cheap or free void
  travel.
- **Master of Ceremonies*** (+1 Ministorum): once per mission a procession or mandatory
  service.
- **Inquisitorial Training Camp*** (+1 Inquisition): −20 XP on Awareness (Sight, Hearing),
  Discipline (all), Intuition (all), Logic (Investigation), Navigation (Tracking), Presence
  (Interrogation), Rapport (Inquiry).
- **Air Support*** (+1 Fleets): Good-quality in-planet flights; once per mission an air
  strike = three frag or krak missile attacks at Ranged 60 (or GM variant, e.g. Vulture:
  two heavy bolter volleys and a lascannon shot at 60).
- **Perfection Artisan:** see duties.
- **Ancient Servants*** (+1 Mechanicus or Administratum): a mono-task servo-skull per PC.
- **Astropathic Link*** (+1 Telepathica).
- **Augmetic Workshop:** HQ; no availability tests for augmetics; free implant surgery;
  implants get one quality.
- **Spy Legend:** once per mission false identities: +1 Influence with one faction and
  matching uniform/disguise; maintain with Average Rapport (Deception).
- **Data-vault Access:** the faction's archives.
- **Zealots*** (+1 Ministorum): once per mission a day of zealots equal to PC count.
- **Purging Flame:** each mission start each PC may take a hand flamer, flamer, inferno
  magazine, three fire bombs or an exterminator.
- **Clerk Detail*** (+1 Administratum): once per mission two Administratum adepts for a day
  (won't risk life or break law).
- **Connoisseur:** Advantage on availability tests through the patron; can always get
  Masterwork or Fine gear.
- **Agent Network:** informants → Advantage on Rapport (Inquiry) in their areas.
- **Smuggler*** (+1 Infractionists): at mission start order any chapter-5 item regardless of
  availability at half price; delivered at mission end (may be stolen or trouble).
- **Transport Logistics*** (+1 Fleets): free Good transport, cargo manifests, crew lists.
- **Righteous Warmonger:** Advantage when rousing people to arms in the Emperor's and
  patron's name; Militarum/Fleet/Dynasty patrons +1 Ministorum, Ministorum patrons +1
  Militarum or Fleets.
- **Fleet Boarders*** (+1 Fleets): once per mission a day of armsmen equal to PC count.
- **Ecclesiarchy Sanctuary:** see duties.
- **Fearsome Reputation:** see duties.
- **Forbidden Archive:** Advantage on Lore (Forbidden).
- **Forged Documents:** any papers it can forge within a week; detection Very Hard (−30)
  Logic (Evaluation).
- **Gang*** (+1 Infractionists): once per mission a day of gangers equal to PC count
  (self-preserving).
- **Military Academy*** (Militarum): −20 XP on Athletics (all), Discipline (Fear), Fortitude
  (all), Medicae (Humans), Melee (One-Handed), Navigation (Surface), Ranged (all).
- **Hospital:** HQ in a medicae facility; medical archives; Good-quality medical care.
- **Munitorum Depot:** see duties.
- **Munitorum Wealth*** (+1 Militarum): each PC picks at start one of: laspistol, lasgun or
  long-las · three frag or three krak grenades · any flak piece · one of backpack,
  respirator, survival kit, chrono, climbing kit, entrenching tool, lamp, grapnel,
  las-cutter, magnoculars, vox-caster; extra items for an Endeavour.
- **Absolute Authority:** see duties.
- **Placate the Machine Spirits*** (+1 Mechanicus): once per mission declare a machine needs
  rites and send the PCs to perform them — access to restricted places.
- **Manufactorum Overseer:** see duties.
- **Expendables*** (+1 Infractionists): see duties.
- **Psychic Ward:** mission start Advantage on Discipline (Psychic) until you fail one;
  detectable with Difficult (−20) Awareness (Psyniscience).
- **Psyker Support*** (+1 Telepathica): once per mission a primaris psyker for a day (GM
  picks disciplines, avoids risk).
- **Purification Rites:** see duties.
- **Right of Conscription*** (+1 Militarum, Administratum or Fleets): once per mission a
  press-gang sweep that disrupts an area and gathers its workers.
- **Noble Blood:** once per adventure a letter of introduction to any noble on any world.
- **Null Sanctum:** see duties.
- **Luxury:** payment +1 step.
- **Oracle*** (+1 Telepathica): once per mission the patron casts any Divination power for you.
- **Planetary Governor:** on its world +1 Influence with every faction.
- **Servitor Clade*** (+1 Mechanicus): once per mission a day of one ordinary servitor per
  agent (gun or medicae servitors for powerful patrons).
- **Embedded Informants:** informants in every faction; know or point to who knows.
- **Strategos Extremis:** once per mission advice → +1 Superiority.
- **Preacher's Aid*** (+1 Ministorum): once per mission a Ministorum priest for a day.
- **Fine Armour:** Advantage on availability for armour through the patron; armour half
  price.
- **Registered Trader*** (+1 Administratum, Fleets or Dynasties): see duties.
- **Sacred Bolters:** each PC gets a bolt pistol or boltgun; ammo resupplied at mission end
  by performance; misuse angers the patron.
- **Sanctum Obscurus:** secret safehouse with chameleoline cloak, photo-visor, auspex,
  climbing kit, comm-leech, disguise kit, three magnoculars, pict-recorder, signal jammer,
  vox-caster.
- **Attached Troops*** (+1 Militarum): see duties.
- **Voidport Master*** (+1 Fleets): see duties.
- **Weapon Connoisseur:** always finds sellers of plasma, launcher and melta weapons, −10%.
- **Witch Hunt:** once per mission a mob hunt for suspected psykers (crowds, a zealot,
  vigilants); false accusations have severe consequences.
- **Xenotech Collector:** tolerates and rewards xenotech use and trophies (other authorities
  won't).
- **Temporary Alliances:** each mission start pick a faction: +1 Influence with it until
  mission end.
- **Tithe Inspection:** see duties.
- **Vigilant Patrol:** once per mission two Macharian vigilants for a day.
- **Voidship:** see duties.
- **Voidsman Training Base*** (+1 Fleets): −20 XP on Awareness (Sight), Discipline (Fear),
  Intuition (Surroundings), Navigation (all), Piloting (all), Ranged (Long Guns, Pistols),
  Reflexes (Balance, Dodge).

### Liabilities (Слабости) — p.37–41 (* = changes influence)
- **Braggart:** publicises your work — enemies hear and prepare.
- **Complicated Channels:** rotating ciphers garble messages.
- **Corrupted:** secretly serves something other than the Emperor.
- **Coward*** (−2 Militarum): once showed shameful cowardice, avoids danger.
- **Dangerous Debts*** (−2 with one faction until repaid): creditors demand favours.
- **Abrasive*** (−1 with any three factions).
- **Argumentative*** : each mission start −1 with a GM-chosen faction, restored by mission end.
- **Constant Vigilance!:** surprise drills, ambush tests.
- **Blackmailed*** (−2 with the blackmailer's faction): extra tasks, less money or gear, or
  orders to neutralise the leverage.
- **Draconian*** (−2 Infractionists): demands strict legality, reporting to local authorities;
  punishes with pay cuts or worse.
- **Enemy*** (−2 with the enemy's faction): a powerful rival interferes, sends agents, bribes.
- **Excommunicate*** (−3 with Telepathica, Mechanicus, Administratum, Militarum,
  Ministorum, Inquisition, Fleets): declared traitor; using the name is dangerous; clearing it
  could be a campaign.
- **Data-addict:** demands trivia; failing to feed it hurts pay and opinion.
- **Failed Deal*** (−2 with that faction, usually Administratum, Dynasties or Infractionists):
  may complicate acquiring gear.
- **I Don't Know You*** : name only in absolute need; breaking it → punishment or vanishing;
  investigators may dig.
- **Dogmatic:** punishes blasphemy (pay cuts, electro-whip).
- **Ends Justify the Means*** (−2 Administratum): happy for you to break rules for results.
- **Pedantic Archivist:** exhaustive mission reports or pay cuts.
- **Miser:** payment −1 step.
- **Missionary Mandate:** spread the faith wherever sent; judged each meeting.
- **Nemesis:** a heretic, daemon or xenos arch-enemy hunts the patron and its agents.
- **Ancient Observer:** a servo-skull or servitor recorder follows you, noisy and in the way.
- **One Foot in the Grave:** frail, dependent on rejuvenat treatments; sometimes unreachable.
- **Blissful Ignorance:** withholds "unimportant" details, blocks your digging.
- **Honour the Machine Spirits:** inspects your gear; pay cuts for neglect.
- **Impostor:** not who it claims; can't supply what it should, but its influence works… for
  now.
- **Endless Reports:** constant reporting eats time, may expose plans.
- **Known Schemer*** (−1 with two GM-chosen factions): whenever you use its influence, your
  next Fellowship test has Disadvantage.
- **Paranoid:** distrusts you, doubts reports, may send you on suicide missions.
- **Ostentatious Piety:** mandatory prayers and services eat time.
- **Price of Life:** every killing must be justified; pay cuts for needless deaths.
- **Psyker Killer*** (−2 Telepathica): wants unsanctioned psykers' heads, not capture.
- **Seeking Followers:** recruit new servants each mission or lose pay.
- **Revisionist:** falsifies records and expects you to live in its version.
- **Rumours of Death:** using its influence may need a Rapport (Charm) test to convince it's
  alive.
- **Sinned Against the Omnissiah*** (−2 Mechanicus): can't supply quality gear; Common items
  from elsewhere or Shoddy black-market substitutes.
- **Laws of the Omnissiah:** respect every machine spirit; harm to sacred tech → pay cuts.
- **Too Many Agents, Too Little Time:** rarely reachable; extra info, gear or money mid-mission
  nearly impossible.
- **Territorial Expansion:** seize land and found bases everywhere, eating time.
- **Collateral Accounting:** unjustified damage → pay cuts.
- **Unorthodox Beliefs*** (−2 Ministorum): odd rites take downtime.
- **Warp Visions:** tasks and clues make sense only in its visions.
- **Witch Hunter:** capture sanctioned-grade psykers for the Black Ships, heads of unsanctioned
  ones.
- **Saboteur*** (−1 with two GM-chosen factions): orders non-lethal sabotage against them
  whenever you deal with them.
- **Unstable Authority:** each use of its influence roll 1d10; on 0 its positive influence has
  no effect.
- **Shoddy Supplies:** all gear from the patron is Shoddy.
- **Outside Obligations:** you pay its debts on every world (bodyguard, courier…); neglect makes
  enemies.
- **Strange Tastes:** secretly procure its illicit fixations.
- **Under Suspicion*** (−2 with the suspicious faction, usually Inquisition): its agents shadow
  and interfere with you.

### What influence means per faction — p.42–44
Positive/negative flavour for each faction (e.g. Mechanicus + = gave lost knowledge, fought
beside skitarii; − = destroyed sacred tech, took forbidden knowledge. Inquisition − = suspected
heresy). Patron sheet fields: faction, duty, boons, liabilities, influence (scope: planet,
sector or Imperium by campaign scale), notes.

