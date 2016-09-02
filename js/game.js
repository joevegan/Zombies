// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 640;
/* Set canvas dynamically, not sure if thats a good idea
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
*/
document.body.appendChild(canvas);


// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/bug.png";

// Game objects
var hero = {
	speed: 256, // movement in pixels per second
	health:100,
        bag:[],
	ammo:20
};
var monster= {
	speed:10
};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {
	//hero.x = canvas.width / 2;
	//hero.y = canvas.height / 2;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown && (hero.y > 32 )) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown && hero.y < (canvas.height - 64)) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown && (hero.x > 32) ) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown && hero.x < (canvas.width - 64)) { // Player holding right
		hero.x += hero.speed * modifier;
	}

	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		hero.health -= 10;
   		monster.speed += 1;
		reset();
	} else {
		(monster.x > hero.x) ? monster.x -= monster.speed * modifier: monster.x += monster.speed * modifier;
		(monster.y > hero.y) ? monster.y -= monster.speed * modifier: monster.y += monster.speed * modifier;
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(0, 102, 255)";
	ctx.font = "16px proxima-nova, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Bugs Found: " + monstersCaught, 32, 32);
 	
	// health	
	ctx.fillStyle = "rgb(0, 102, 255)";
	ctx.font = "16px proxima-nova, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Health: " + hero.health, 512, 32);	
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);

	// log for debugs
	// console.log('hero.x: ' + hero.x);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
hero.x = canvas.width / 2;
hero.y = canvas.height / 2;
main();
