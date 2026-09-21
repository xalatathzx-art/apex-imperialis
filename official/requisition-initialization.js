Hooks.on("init", () => {
	game.impmal.config.factions["departmento-munitorum"] = "IMPMAL.FactionDepartmentoMunitorum"
	game.impmal.config.vehicleActions.crush.description = `<div class="journal-image float-right flip">
    <img height="350" src="modules/apex-imperialis/assets/impmal-requisition/assets/actors/wolfquad.webp">
</div>
<p><strong>Difficulty</strong>: Difficult (−10), opposed by the target’s <em>Piloting</em> or <em>Reflexes (Dodge)</em>.</p>
<p><strong>Restriction</strong>: Tracked vehicle or Walker</p>
<p>The Driver attempts to crush a target on the ground. The Driver must be able to enter the Zone their target is in and the vehicle must be of equal or larger Size to the target. Treat this Action as a melee attack, though characters on foot can only oppose it using their <em>Reflexes (Dodge)</em> Skill. If the vehicle is Size Large or greater, the attack benefits from the <em>Spread</em> Trait. If the target is a vehicle, each point of Damage above the vehicle’s Armour adds +2 to the roll on the Vehicle Critical Hit Table. If the target is on foot and they get hit, they suffer a Critical Wound instead of any other normal Damage they would take, rolling d10's only to decide on what Critical Wound and rolling to determine the Hit Locations as normal.</p>`;
	game.impmal.config.vehicleActions.emergencyLanding.description = `<p><strong>Difficulty</strong>: Challenging (+0)</p>
	<p><strong>Restriction</strong>: Flyer Vehicle</p>
	<p>The Pilot of a flying vehicle attempts to land quickly and dangerously. The Pilot of a flying vehicle makes a <strong>Piloting</strong> Test as a Reaction to the vehicle being hit. On a successful Test, the vehicle moves towards the ground at its full movement and makes a heavy landing, aiming to completely avoid any damage it would take from the impact. On a failed Test, the vehicle’s engine stalls out due to the amount of pressure being put on it, the vehicle moves one Zone towards the ground, and the Pilot rolls on the @UUID[.g3JsX7QntVJBm2vc]{Flyer Vehicle Critical Hit Table}. If the vehicle hits the ground through failing this Test, the vehicle suffers a Critical Hit and all Passengers take 1d5 Damage in addition to any other effect from the <strong>Critical Hit</strong> Table.</p>`;
	game.impmal.config.vehicleActions.evasiveManeuvers.description = `<p><strong>Difficulty</strong>: Varies</p>
	<p>The Driver takes evasive manoeuvres, dodging, weaving, and generally making the vehicle a more difficult target to hit. The driver makes a <strong>Piloting</strong> Test. On a successful Test, the SL achieved are subtracted from ranged attacks made against the vehicle until the Driver’s next turn. The Difficulty of this Test is based on the vehicle’s handling and how fast it is currently travelling, see the Table below.</p>
	<table class="impmal">
		<thead>
			<tr class="title">
				<td colspan="2">
					<p>Evasive Manoeuvres Difficulty Table</p>
				</td>
			</tr>
			<tr class="subheader" style="font-size:20px">
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
				<td>Slow</td>
				<td>Difficulty (-10)</td>
			</tr>
			<tr>
				<td>Normal</td>
				<td>Challenging (+0)</td>
			</tr>
			<tr>
				<td>Fast or Faster</td>
				<td>Routine (+20)</td>
			</tr>
		</tbody>
	</table>`;
	game.impmal.config.vehicleActions.getInClose.description = `<p><strong>Difficulty</strong>: Challenging (+0)</p>
	<p>This action is used for a vehicle to get close to another vehicle and keep pace with it to prepare for someone to <strong>Make the Jump</strong> or to allow someone to make a melee attack on someone in the target vehicle. The Driver of the vehicle makes a <strong>Piloting</strong> Test targeting a vehicle that is within the same Zone as the vehicle they are in. On a success, the vehicle is moved within Immediate Range of the target vehicle and stays next to that vehicle unless the target vehicle gets away in some way, typically by using <strong>Thread the Needle</strong>. Otherwise, on a failure, the vehicle does not close in on the target.</p>`;
	game.impmal.config.vehicleActions.makeTheJump.description = `<p><strong>Difficulty</strong>: Varies</p>
	<p>Someone on the vehicle attempts to jump onto a neighbouring vehicle. A character must first be in a vehicle that has performed and succeeded <strong>Get in Close</strong> before they can take this Action. The character performing this action must make an <strong>Athletics</strong> Test.</p>
	<p>If the character is a Passenger, this is a Difficult (−10) Test, however if this is done by the Driver of a vehicle, this is instead a Hard (−20) Test. When a driver attempts to make the jump, the vehicle begins to go <strong>Out of Control</strong> unless someone else <strong>Takes the Wheel</strong> before the former driver’s next turn. On a success, the character becomes a Passenger on the target vehicle, if there is no room for a Passenger on that vehicle, you can attempt to push one character inside the target vehicle out of the vehicle (making an <strong>Opposed</strong> Test, using your <em>Athletics</em> against the target’s <em>Reflexes</em>). If they push out the Driver, the character becomes the new Driver. If a character fails to push another character, they cling to the side of the vehicle and have one additional round to attempt to push the Driver out before they fall off the vehicle. On a failure to <strong>Make the Jump</strong>, the character performing the action misses the vehicle and hits the ground, taking Damage equal to the SL the character missed by to a random Hit Location.</p>`;
	game.impmal.config.vehicleActions.ram.description = `<p><strong>Difficulty</strong>: Challenging (+0), opposed by the target’s <em>Piloting</em> or <em>Reflexes (Dodge)</em>.</p>
	<p>The Driver attempts to ram an enemy. The Driver must be able to enter the Zone their target is in. Treat this as a melee attack, though characters on foot can only oppose it using their <em>Reflexes (Dodge)</em> Skill. If the vehicle is Size Large or greater, the attack benefits from the <em>Spread</em> Trait. If made against a vehicle, both the target and the ramming vehicle take Damage. Damage to the ramming vehicle is always resolved against its front Armour.</p>
	<table class="impmal">
		<colgroup>
			<col span="1" style="width:50%">
			<col span="1" style="width:50%">
		</colgroup>
		<thead>
			<tr class="title">
				<td colspan="2">
					<p>Vehicle Ram Damage Table</p>
				</td>
			</tr>
			<tr class="subheader" style="font-size:20px">
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
				<td>Small or below</td>
				<td>1</td>
			</tr>
			<tr>
				<td>Medium</td>
				<td>5 + SL</td>
			</tr>
			<tr>
				<td>Large</td>
				<td>10 + SL</td>
			</tr>
			<tr>
				<td>Enormous</td>
				<td>15 + SL</td>
			</tr>
			<tr>
				<td>Monstrous</td>
				<td>20 + SL</td>
			</tr>
		</tbody>
	</table>`;
	game.impmal.config.vehicleActions.takeTheWheel.description = `<p><strong>Difficulty</strong>: Challenging (+0)</p>
	<p>A Passenger on the vehicle can make a <strong>Challenging (+0) Piloting</strong> Test to take control of the vehicle in the event that the Driver is either incapacitated or no longer in the vehicle. On a success the Passenger becomes the new Driver, otherwise, the vehicle goes <strong>Out of Control</strong> within one round of the Driver being unable to act. This Action can also be taken against a Driver who is not incapacitated; in this case, an <strong>Opposed</strong> <strong>Piloting</strong> Test is made with the winner taking control of the vehicle.</p>`;
	game.impmal.config.vehicleActions.threadTheNeedle.description = `<p><strong>Difficulty</strong>: Difficult (−10)</p>
	<p>Making a getaway or closing the distance on a faraway vehicle, one must make a risky manoeuvre to dodge past any obstacles between whatever gets in the way of them and their destination.</p>
	<p>You can use this Action in a variety of ways to accentuate the speed of the vehicle, this could include:</p>
	<ul>
		<li>
			<p>To close the distance on another vehicle.</p>
		</li>
		<li>
			<p>To get away from a vehicle that has performed <strong>Get in Close</strong> on the Driver’s vehicle.</p>
		</li>
		<li>
			<p>To move through a precarious area that could result in a crash.</p>
		</li>
	</ul>
	<p>To perform the Action, the Driver must make a <strong>Difficult (−10) Piloting</strong> Test. On a successful Test, the Driver’s vehicle can move into the same Zone as a target vehicle or can move up to the vehicle’s Speed away from a vehicle that has performed <strong>Get in Close</strong>.</p>`;
})    