
var debug = false;
var clients = [];
// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 640;

document.body.appendChild(canvas);


// get guid
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

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

function hero(name) {
		this.speed = 256; // movement in pixels per second
		this.health = 100;
    this.name = name;
    this.id = guid();
    this.socket = io(); // socket for multiplayer
	  this.bag = [];
		this.ammo = 20;
		this.isShooting = false;
    this.x = 100;
    this.y = 100;
    this.bulletDirection = '';
		this.direction = 'left';
		this.bulletSpeed = 500;
		this.bulletX = canvas.width;
		this.bulletY = canvas.height;
		this.shoot = function() {
			if (this.ammo > 0 && this.isShooting == false) {
				this.ammo--;
				this.isShooting = true;
        this.bulletDirection = this.direction;
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

/*
var myHero = new hero('justin');
socket.emit('join', myHero.name + ' has joined');
clients.push(myHero);
*/


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
  // loop through the all the cleints
  for (var i = 0, len = clients.length; i < len; i++) {

    // for your player
    if (localStorage.getItem('id') == clients[i].id && clients[i].health > 0  ) {
      player = clients[i];
      // player movement
      if (38 in keysDown && (player.y > 32 )) { // Player holding up
        player.y -= player.speed * modifier;
        player.direction = 'up';
      }
      if (40 in keysDown && player.y < (canvas.height - 64)) { // Player holding down
        player.y += player.speed * modifier;
        player.direction = 'down';
      }
      if (37 in keysDown && (player.x > 32) ) { // Player holding left
        player.x -= player.speed * modifier;
        player.direction = 'left';
      }
      if (39 in keysDown && player.x < (canvas.width - 64)) { // Player holding right
        player.x += player.speed * modifier;
        player.direction = 'right';
      }
      if (90 in keysDown) { // shoot
        player.shoot();
      }
      // reset the bullet
      if (player.bulletX > canvas.width || player.bulletX < -canvas.width) {
        player.resetBullet();
      }
      if (player.bulletY > canvas.height || player.bulletY < -canvas.height) {
        player.resetBullet();
      }

      // player and item
      if (
        player.x <= (myItem.x + 32)
        && player.x <= (myItem.x + 32)
        && player.y <= (myItem.y + 32)
        && player.y <= (myItem.y + 32)
      ) {
        player.ammo += 10;
        myItem.reset();
      }

      // player shoots
      if (player.isShooting == true) {
        if (player.bulletDirection == 'right') {
          player.bulletX += player.bulletSpeed * modifier;
        } else if (player.bulletDirection == 'left') {
          player.bulletX -= player.bulletSpeed * modifier;
        } else if (player.bulletDirection == 'up') {
          player.bulletY -= player.bulletSpeed * modifier;
        } else if (player.bulletDirection == 'down') {
          player.bulletY += player.bulletSpeed * modifier;
        }

      }
      /* collisions */
  		for (var i = 0, len = enimies.length; i < len; i++) {

  			// bullet and enemy
  			if (player.bulletX <= (enimies[i].x + 32)	&& enimies[i].x <= (player.bulletX + 32) &&
  					player.bulletY <= (enimies[i].y + 32)	&& enimies[i].y <= (player.bulletY + 32)) {
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
  				player.resetBullet();

  			}

  			// player and enemy
  			if (player.x <= (enimies[i].x + 32)
  				&& enimies[i].x <= (player.x + 32)
  				&& player.y <= (enimies[i].y + 32)
  				&& enimies[i].y <= (player.y + 32)) {
  				++monstersCaught;
  				player.health -= 1;
  				if (getRandomArbitrary(1,10) < 5 && myItem.available == true) {
  					myItem.drop(enimies[i].x,enimies[i].y);
  				}
  				enimies[i].reset();

  			} else {
  				(enimies[i].x > player.x) ? enimies[i].x -= enimies[i].speed * modifier: enimies[i].x += enimies[i].speed * modifier;
  				(enimies[i].y > player.y) ? enimies[i].y -= enimies[i].speed * modifier: enimies[i].y += enimies[i].speed * modifier;
  			}
  		}
  	} else {
  		// player is dead
  		window.location.replace("index.html");

  	}
  } // end loop through clients


};

// Draw everything
var render = function () {
	ctx.drawImage(bgImage, 0, 0);

  for (var i = 0, len = clients.length; i < len; i++) {
    player = clients[i];
    ctx.drawImage(player.image, player.x, player.y);
    ctx.drawImage(bulletImage, player.bulletX, player.bulletY);

    /* HUD */
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "16px proxima-nova, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Zombies Killed: " + monstersCaught, 32, 32);

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "16px proxima-nova, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Ammo: " + player.ammo, 32, 48);

    // health
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "16px proxima-nova, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Health: " + player.health, 512, 32);

    // log for debugs
    if (debug) {
      console.log('hero x,y: ' + player.x  + ',' + player.y);
      console.log('bullet x,y: ' + player.bulletX  + ',' + player.bulletY);
    }
  }

	if (myItem.display) {
		ctx.drawImage(myItem.image, myItem.x, myItem.y);
	}

	for (var i = 0, len = enimies.length; i < len; i++) {
	  ctx.drawImage(enimies[i].image, enimies[i].x, enimies[i].y);
	}

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

 };

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
