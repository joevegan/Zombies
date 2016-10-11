
var debug = false;
var clients = [];
// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var _d;
_d = [$(window).width(), $(window).height()];
this.canvas.width = _d[0];
this.canvas.height = _d[1];

/*
canvas.width = 800;
canvas.height = 640;
*/
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
    this.maxspeed = 256;
    this.radius = 300;
    this.x = x;
    this.y = y;
		this.reset = function() {
			this.x = canvas.height + (Math.random() * canvas.width);
			this.y = canvas.width + (Math.random() * canvas.height);
			this.speed < this.maxSpeed ? this.speed += 5 : this.maxSpeed;
		}
		this.ready = false;
		this.image = new Image();
		this.image.src = image;
}

function tree(x,y,image) {
  this.x = x;
  this.y = y;
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

function bullet(x,y,direction) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.speed = 500;
  this.ready = false;
  this.image = new Image();
  this.image.src = "images/bullet.png";
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
    this.bullets = [];
		this.shoot = function() {
      if (this.ammo > 0 && this.isShooting == false ) {
        var myBullet = new bullet(this.x,this.y, this.direction);
        this.ammo--;
        this.isShooting = true;
        this.bullets.push(myBullet);
      }
		}
		this.ready = false;
		this.image = new Image();
		this.image.src = "images/hero.png";
}

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
var trees = [];

var reset = function () {
  for (i=0; i < 500; i++){

    var myTree = new tree(Math.round(getRandomArbitrary(1,3333)),
                          Math.round(getRandomArbitrary(1,3333)),
                          "images/tree" + Math.round(getRandomArbitrary(1,6)) + ".png");
    trees.push(myTree);
  }

	for (i = 0; i < 10; i++) {
		var myEnemy = new enemy(10,
														32 + (Math.random() * (canvas.width - 64)),
														32 + (Math.random() * (canvas.height - 64)),
														"images/monster" + Math.round(getRandomArbitrary(1,4 )) + ".png");
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
    } else {
  		// player is dead
  		window.location.replace("/");
  	}

    // player and item
    if ( player.x <= (myItem.x + 32) && player.x <= (myItem.x + 32)  && player.y <= (myItem.y + 32) && player.y <= (myItem.y + 32) ) {
      player.ammo += 10;
      myItem.reset();
    }

    // moved bullets
    for (var i = 0, len = player.bullets.length; i < len; i++) {
        if (player.bullets[i].direction == 'right') {
          player.bullets[i].x += player.bullets[i].speed * modifier;
        } else if (player.bullets[i].direction == 'left') {
          player.bullets[i].x -= player.bullets[i].speed * modifier;
        } else if (player.bullets[i].direction == 'up') {
          player.bullets[i].y -= player.bullets[i].speed * modifier;
        } else if (player.bullets[i].direction == 'down') {
          player.bullets[i].y += player.bullets[i].speed * modifier;
        }
    }


    // enimies
		for (var i = 0, len = enimies.length; i < len; i++) {

      // for the bad guy getting killed with bullets
      /*
      for (var j = 0, len = player.bullets.length; j < len; j++) {
        if (player.bullets[j].x <= (enimies[i].x + 32)	&& enimies[i].x <= (player.bullets[j].x + 32) &&
            player.bullets[j].y <= (enimies[i].y + 32)	&& enimies[i].y <= (player.bullets[j].y + 32)) {
          ++monstersCaught;

          if (getRandomArbitrary(1,10) < 5 && myItem.available == true) {
            myItem.drop(enimies[i].x,enimies[i].y);
          }

          enimies[i].reset();
          var myEnemy = new enemy(100,
                                  32 + (Math.random() * (canvas.width - 64)),
                                  32 + (Math.random() * (canvas.height - 64)),
                                  "images/monster" + Math.round(getRandomArbitrary(1,4)) + ".png");
          myEnemy.reset();
          enimies.push(myEnemy);
          //player.resetBullet();

        }
      }
      */


			// for the bad guy getting to the player
			if (player.x <= (enimies[i].x + 32)	&& enimies[i].x <= (player.x + 32)
				&& player.y <= (enimies[i].y + 32) && enimies[i].y <= (player.y + 32)) {

				++monstersCaught;
				player.health -= 1;
				if (getRandomArbitrary(1,10) < 5 && myItem.available == true) {
					myItem.drop(enimies[i].x,enimies[i].y);
				}
				enimies[i].reset();
			} else if (Math.abs(enimies[i].x - player.x) < enimies[i].radius && Math.abs(enimies[i].y - player.y) < enimies[i].radius ) {
				  (enimies[i].x > player.x) ? enimies[i].x -= (enimies[i].speed) * modifier: enimies[i].x += enimies[i].speed * modifier;
				  (enimies[i].y > player.y) ? enimies[i].y -= (enimies[i].speed) * modifier: enimies[i].y += enimies[i].speed * modifier;

      } else {
          if (enimies[i].x > canvas.width) {enimies[i].x = canvas.width;}
          if (enimies[i].y > canvas.height) {enimies[i].y = canvas.height;}
          if (enimies[i].x < 0) {enimies[i].x = 0;}
          if (enimies[i].y < 0) {enimies[i].y = 0;}
          enimies[i].x += enimies[i].speed/2 * modifier * getRandomArbitrary(-10,10);
          enimies[i].y += enimies[i].speed/2 * modifier * getRandomArbitrary(-10,10);
      }
    }


  } // end loop through clients


};

// Draw everything
var render = function () {
	//ctx.drawImage(bgImage, 0, 0);
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fill();


  //draw things in the right order...
  var elements = [];
  elements.push.apply(elements,trees);
  elements.push.apply(elements,enimies);
  elements.push.apply(elements,clients);

  for (var i = 0, len = clients.length; i < len; i++) {
    elements.push.apply(elements,clients[i].bullets);
  }

  elements = elements.sort(function(a,b) {return (a.y + a.image.height/2 > b.y + b.image.height/2) ? 1 : ((b.y + b.image.height/2 > a.y + a.image.height/2 ) ? -1 : 0);} );
  for (var i = 0, len = elements.length; i < len; i++) {
    ctx.drawImage(elements[i].image, elements[i].x, elements[i].y);
  }

  for (var i = 0, len = clients.length; i < len; i++) {

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
      //console.log('bullet x,y: ' + player.bulletX  + ',' + player.bulletY);
    }

  }

  if (myItem.display) {
    ctx.drawImage(myItem.image, myItem.x, myItem.y);
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
