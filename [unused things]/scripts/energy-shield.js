const shieldCoolRate = 0.5;

var shieldEnergy; //Undefined initially, look below for variable definitions
var shieldCooldownTimer;
var shieldRegenDelay;

print("[AeMin] Energy Shield script ready.");
// At the moment, there are no means to add new local variables to Content types via scripting.
// However, we can still use what is already there in clever ways to achieve what we want. This is where LiquidModules come in.
// LiquidModules are able to keep track of multiple liquids at once, making them a great, albeit slightly confusing choice for local variables.
// Until we can add local variables when extending content, liquidModules work well for that purpose.

// The Liquid bar on the in-game UI can also be used to determine a secondary characteristic of the block.
// The script uses the bar to display the health of the block's energy shield, as well as a cooldown timer for when the shield is down.

const energyShield = extendContent(LiquidBlock, "energy-shield-block", {
	
	update(tile) {
		var liquidModule = tile.entity.liquids; //Defining the liquidModule variable isn't essential for the function of the script, but it does make the code look a little cleaner.
		
		if (shieldEnergy == undefined) { //For some reason, defining modded content up at the top causes NullPointerExceptions, so it'll be done down here instead.
			shieldEnergy = Vars.content.getByName(ContentType.liquid, "aeromindustry-shield");
			shieldCooldownTimer = Vars.content.getByName(ContentType.liquid, "aeromindustry-shield-cooldown");
			shieldRegenDelay = Vars.content.getByName(ContentType.liquid, "slag");
		}
		
		if (liquidModule.current() === shieldEnergy) {
			// Handle shield regeneration
			if (liquidModule.get(shieldEnergy) > 0 && liquidModule.get(shieldEnergy) < 200) {
				if (liquidModule.get(shieldRegenDelay) < 300) { //Increment shieldRegenDelay if it is not maxed. If it is, add 2 to the shield.
					liquidModule.add(shieldRegenDelay, 1);
				} else {
					liquidModule.add(shieldEnergy, 2);
				}
			} else if (liquidModule.get(shieldRegenDelay) == 0) { // The script should only be here if the block has just been placed.
				liquidModule.add(shieldRegenDelay, 300);
				liquidModule.add(shieldEnergy, 2);
			}
		} else if (liquidModule.get(shieldCooldownTimer) > 0) {			// If the cooldown timer is active, decrement it by shieldCoolRate. 
			liquidModule.remove(shieldCooldownTimer, shieldCoolRate);
		} else if (liquidModule.get(shieldCooldownTimer) <= 0) { // If the cooldown timer hits zero, max out shieldRegenDelay and add a bit of shielding. 
			liquidModule.add(shieldRegenDelay, 300);
			liquidModule.add(shieldEnergy, 2);
		} 
		
		//If the energy shield is over max, have it bleed back down to max. Could turn this into a proper Overshield mechanic later.
		if (liquidModule.get(shieldEnergy) > 200) {
			liquidModule.remove(shieldEnergy, 1);
		}
		
		//If shieldEnergy is above 0 (not in cooldown state) then set current to shieldEnergy
		if (liquidModule.get(shieldEnergy) > 0)
			liquidModule.add(shieldEnergy, 0);
		
		//print(Vars.content.getByName(ContentType.liquid, "aeromindustry-shield"));
		//print(liquidModule.current());
		//print(liquidModule.get(shieldRegenDelay));
		//print(liquidModule.get(shieldCooldownTimer));
		//print(liquidModule.get(shieldEnergy));
	},

	handleBulletHit(entity, bullet) {
		var liquidModule = entity.liquids;
		if (liquidModule.get(shieldEnergy) > 0) {
			//print("Timekeeper was at " + liquidModule.get(shieldRegenDelay));
			liquidModule.remove(shieldEnergy, bullet.damage());
			if (liquidModule.get(shieldEnergy) <= 0) { // If the shield runs out, begin cooldown and make sure shield is set to zero.
				liquidModule.add(shieldEnergy, -liquidModule.get(shieldEnergy));
				liquidModule.add(shieldCooldownTimer, 300);
			}
		} else if (liquidModule.current() === shieldCooldownTimer){ // If the shield is already down, the block itself takes damage and cooldown resets.
			entity.damage(bullet.damage());
			liquidModule.add(shieldCooldownTimer, 300 - liquidModule.get(shieldCooldownTimer));
		}
		
		//Reset shieldRegenDelay
		liquidModule.remove(shieldRegenDelay, liquidModule.get(shieldRegenDelay));
		//Set 'current' back to either Shield or Cooldown.
		if (liquidModule.current() === shieldRegenDelay) {
			if (liquidModule.get(shieldCooldownTimer) > 0)
				liquidModule.add(shieldCooldownTimer, 0);
			else
				liquidModule.add(shieldEnergy, 0);
		}
	}
});