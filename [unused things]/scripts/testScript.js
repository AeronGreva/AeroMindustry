//Someone already made a working mending block...
var timeTest = Time.millis();
const scriptTest = extendContent(Block, "script-test", {
	update(tile) {
		var deltaTime = Time.timeSinceMillis(timeTest);
		print(timeTest);
		print(deltaTime);
		print(deltaTime % 1000);
		print(tile.entity.health());
		print(tile.entity.maxHealth());
		if ((tile.entity.health() < tile.entity.maxHealth()) && (deltaTime % 1000 < 16)) {
			tile.entity.health++;
		}
	}
});	