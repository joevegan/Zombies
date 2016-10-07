
var socket = io(); // socket for multiplayer!
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

function enemy(speed, x, y, image) {
    this.speed = speed;
    this.x = x;
    this.y = y;
		this.reset = function() {
			this.x = canvas.height + (Math.random() * canvas.width);
			this.y = canvas.width + (Math.random() * canvas.height);
			this.speed += 5;
		}
		this.ready = false;
		this.image = new Image();
		this.image.src = image;
}

function item(x,y,type,image) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.image = new Image();
	this.image.src = image;
	this.available = true;
	this.display = true;
	this.reset = function() {
		this.x = -100;
		this.y = -100;
		this.available = true;
	}
	this.drop = function(x,y) {
		this.x = x;
		this.y = y;
		this.available = false;
		this.display = true;
	}

}

function hero() {
		this.speed = 256; // movement in pixels per second
		this.health = 100;
	  this.bag = [];
		this.ammo = 20;
		this.isShooting = false;
		this.direction = 'left';
		this.bulletSpeed = 100;
		this.bulletX = canvas.width;
		this.bulletY = canvas.height;
		this.shoot = function() {
			if (this.ammo > 0 && this.isShooting == false) {
				this.ammo--;
				this.isShooting = true;
				this.bulletX = this.x;
				this.bulletY = this.y
			}
		}
		this.resetBullet = function() {
			this.isShooting = false;
			this.bulletX = canvas.width;
			this.bulletY = canvas.height;
		}
		this.ready = false;
		this.image = new Image();
		this.image.src = "images/hero.png";
}

var myHero = new hero();
var myItem = new item(-100,-100,"ammo","images/bug.png")

/* load images... */
// Background image
var bgImage = new Image();
bgImage.src = "images/background.png";

// Bullet image
var bulletImage = new Image();
bulletImage.src = "images/bullet.png";

// Bullet image
var ammoImage = new Image();
ammoImage.src = "images/bug.png";

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

// Hero
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var enimies = [];

var reset = function () {
	for (i = 0; i < 10; i++) {
		var myEnemy = new enemy(10,
														32 + (Math.random() * (canvas.width - 64)),
														32 + (Math.random() * (canvas.height - 64)),
														"images/monster.png");
		enimies.push(myEnemy);
	}
};


// Update game objects
var update = function (modifier) {

	if ( myHero.health > 0 ) {
		// player movement
		if (38 in keysDown && (myHero.y > 32 )) { // Player holding up
			myHero.y -= myHero.speed * modifier;
			myHero.direction = 'up';
		}
		if (40 in keysDown && myHero.y < (canvas.height - 64)) { // Player holding down
			myHero.y += myHero.speed * modifier;
			myHero.direction = 'down';
		}
		if (37 in keysDown && (myHero.x > 32) ) { // Player holding left
			myHero.x -= myHero.speed * modifier;
			myHero.direction = 'left';
		}
		if (39 in keysDown && myHero.x < (canvas.width - 64)) { // Player holding right
			myHero.x += myHero.speed * modifier;
			myHero.direction = 'right';
		}
		if (90 in keysDown) { // shoot
			myHero.shoot();
		}
		// reset the bullet
		if (myHero.bulletX > canvas.width || myHero.bulletX < -canvas.width) {
			myHero.resetBullet();
		}
		if (myHero.bulletY > canvas.height || myHero.bulletY < -canvas.height) {
			myHero.resetBullet();
		}

		/* collisions */

		// player and item
		if (
			myHero.x <= (myItem.x + 32)
			&& myItem.x <= (myHero.x + 32)
			&& myHero.y <= (myItem.y + 32)
			&& myItem.y <= (myHero.y + 32)
		) {
			myHero.ammo += 10;
			myItem.reset();
		}

		for (var i = 0, len = enimies.length; i < len; i++) {

			// player shoots
			if (myHero.isShooting == true) {
				if (myHero.direction =='right') {
					myHero.bulletX += myHero.bulletSpeed * modifier;
				} else if (myHero.direction == 'left') {
					myHero.bulletX -= myHero.bulletSpeed * modifier;
				} else if (myHero.direction == 'up') {
					myHero.bulletY -= myHero.bulletSpeed * modifier;
				} else if (myHero.direction == 'down') {
					myHero.bulletY += myHero.bulletSpeed * modifier;
				}

			}
			// bullet and enemy
			if (myHero.bulletX <= (enimies[i].x + 32)	&& enimies[i].x <= (myHero.bulletX + 32) &&
					myHero.bulletY <= (enimies[i].y + 32)	&& enimies[i].y <= (myHero.bulletY + 32)) {
				++monstersCaught;

				if (getRandomArbitrary(1,10) < 5 && myItem.available == true) {
					myItem.drop(enimies[i].x,enimies[i].y);
				}

				enimies[i].reset();
				var myEnemy = new enemy(20,
																32 + (Math.random() * (canvas.width - 64)),
																32 + (Math.random() * (canvas.height - 64)),
																"images/monster2.png");
				myEnemy.reset();
				enimies.push(myEnemy);
				myHero.resetBullet();

			}


			// player and enemy
			if (myHero.x <= (enimies[i].x + 32)
				&& enimies[i].x <= (myHero.x + 32)
				&& myHero.y <= (enimies[i].y + 32)
				&& enimies[i].y <= (myHero.y + 32)) {
				++monstersCaught;
				myHero.health -= 1;
				if (getRandomArbitrary(1,10) < 5 && myItem.available == true) {
					myItem.drop(enimies[i].x,enimies[i].y);
				}
				enimies[i].reset();

			} else {
				(enimies[i].x > myHero.x) ? enimies[i].x -= enimies[i].speed * modifier: enimies[i].x += enimies[i].speed * modifier;
				(enimies[i].y > myHero.y) ? enimies[i].y -= enimies[i].speed * modifier: enimies[i].y += enimies[i].speed * modifier;
			}
		}
	} else {
		// player is dead
		window.location.replace("index.html");

	}

};

// Draw everything
var render = function () {
	ctx.drawImage(bgImage, 0, 0);
	ctx.drawImage(myHero.image, myHero.x, myHero.y);
	ctx.drawImage(bulletImage, myHero.bulletX, myHero.bulletY);

	if (myItem.display) {
		ctx.drawImage(myItem.image, myItem.x, myItem.y);
	}

	for (var i = 0, len = enimies.length; i < len; i++) {
	  ctx.drawImage(enimies[i].image, enimies[i].x, enimies[i].y);
	}

	/* HUD */
	// Score
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "16px proxima-nova, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Zombies Killed: " + monstersCaught, 32, 32);

	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "16px proxima-nova, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Ammo: " + myHero.ammo, 32, 48);

	// health
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "16px proxima-nova, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Health: " + myHero.health, 512, 32);
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
	console.log('hero x,y: ' + myHero.x  + ',' + myHero.y);
	console.log('bullet x,y: ' + myHero.bulletX  + ',' + myHero.bulletY);

 };

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
myHero.x = canvas.width / 2;
myHero.y = canvas.height / 2;
main();
