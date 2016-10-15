var Game;
var Universe;
var clients = [];


/*
 code from lazeroids... work this in for the multiplaer
*/
var __bind = function(func, context) {
  return function(){ return func.apply(context, arguments); };
}, __slice = Array.prototype.slice, __extends = function(child, parent) {
  var ctor = function(){};
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.prototype.constructor = child;
  if (typeof parent.extended === "function") parent.extended(child);
  child.__superClass__ = parent.prototype;
}, __hasProp = Object.prototype.hasOwnProperty;
if (typeof process !== "undefined" && process !== null) {
  Game = exports;
} else {
  Game = (window.Game = {});
  window.console = window.console || {};
  _b = ['log', 'dir', 'error', 'warn'];
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    (function() {
      var fn = _b[_a];
      return window.console[fn] = window.console[fn] || (function() {});
    })();
  }
}

Controller = function(canvas) {
  this.canvas = canvas;
  this.setupCanvas();
  //this.start();
  return this;
};
Controller.prototype.setupCanvas = function() {
  var _d;
  _d = [$(window).width(), $(window).height()];
  this.canvas.width = _d[0];
  this.canvas.height = _d[1];
  return [this.canvas.width, this.canvas.height];
};
Controller.prototype.setupInput = function() {
  this.setupKeys();
  return this.setupTouch();
};
Controller.prototype.setupKeys = function() {
  $(window).keydown(__bind(function(e) {
    var _d, ship;
    ship = this.universe.ship;
    if ((_d = e.which) === 32) {
      return ship.shoot();
    } else if (_d === 37) {
      return ship.rotate(-1);
    } else if (_d === 39) {
      return ship.rotate(+1);
    } else if (_d === 38) {
      return ship.thrust();
    } else if (_d === 40) {
      return ship.brake();
    } else if (_d === 87) {
      return ship.warp();
    } else if (_d === 72 || _d === 191) {
      return $('#help').animate({
        opacity: 'toggle'
      });
    } else if (_d === 78) {
      return (this.universe.renderNames = !this.universe.renderNames);
    } else if (_d === 90) {
      if (this.universe.zoom === 1) {
        this.universe.zoom = 0.4;
        return play('zoom_out');
      } else {
        this.universe.zoom = 1;
        return play('zoom_in');
      }
    }
  }, this));
  return $(window).keyup(__bind(function(e) {
    var _d;
    if ((_d = e.which) === 37 || _d === 39) {
      return this.universe.ship.rotate(0);
    }
  }, this));
};
Controller.prototype.setupTouch = function() {
  var x0, x1, y0, y1;
  x0 = (y0 = (x1 = (y1 = null)));
  $(document.body).bind('touchstart', function(e) {
    var _d, _e;
    _d = e.originalEvent.targetTouches[0];
    x0 = _d.screenX;
    y0 = _d.screenY;
    _e = [x0, y0];
    x1 = _e[0];
    y1 = _e[1];
    return [x1, y1];
  });
  $(document.body).bind('touchmove', function(e) {
    var _d;
    _d = e.originalEvent.targetTouches[0];
    x1 = _d.screenX;
    y1 = _d.screenY;
    return {
      screenX: x1,
      screenY: y1
    };
  });
  return $(document.body).bind('touchend', __bind(function(e) {
    var _d, _e, absX, absY, dx, dy, ship;
    _d = [x1 - x0, y1 - y0];
    dx = _d[0];
    dy = _d[1];
    _e = [Math.abs(dx), Math.abs(dy)];
    absX = _e[0];
    absY = _e[1];
    x0 = (y0 = (x1 = (y1 = null)));
    ship = this.universe.ship;
    if (absX < 20 && absY < 20) {
      return ship.shoot();
    } else if (absX > 20 && absX > absY) {
      return ship.rotate(dx);
    } else if (absY > 20 && absY > absX) {
      return dy > 0 ? ship.brake() : ship.thrust();
    }
  }, this));
};
Controller.prototype.setName = function(name) {
  return this.universe.startShip(name);
};
Controller.prototype.start = function() {
  this.universe = new Universe({
    canvas: this.canvas
  });
  return this.universe.start();
};
Game.Controller = Controller;

Observable = function() {};
Observable.prototype.observe = function(name, fn) {
  return this.observers(name).push(fn);
};
Observable.prototype.trigger = function(name) {
  var _d, _e, _f, _g, args, callback;
  args = __slice.call(arguments, 1);
  _d = []; _f = this.observers(name);
  for (_e = 0, _g = _f.length; _e < _g; _e++) {
    callback = _f[_e];
    _d.push(callback.apply(this, args));
  }
  return _d;
};
Observable.prototype.observers = function(name) {
  return (this._observers = this._observers || {})[name] = (this._observers = this._observers || {})[name] || [];
};
Game.Observable = Observable;

Serializer = function(klass, name, options) {
  var _d, _e, _f, _g, i;
  _d = [klass, name];
  this.klass = _d[0];
  this.name = _d[1];
  this.allowNesting = typeof options === "undefined" || options == undefined ? undefined : options.allowNesting;
  this.allowed = {};
  _f = _.compact(_.flatten([typeof options === "undefined" || options == undefined ? undefined : options.exclude]));
  for (_e = 0, _g = _f.length; _e < _g; _e++) {
    i = _f[_e];
    this.allowed[i] = false;
  }
  this.copy = (function() {});
  this.copy.prototype = this.klass.prototype;
  return this;
};
Serializer.prototype.shouldSerialize = function(name, value) {
  var _d;
  if (!(typeof value !== "undefined" && value !== null)) {
    return false;
  }
  return this.allowed[name] = (typeof (_d = this.allowed[name]) !== "undefined" && _d !== null) ? this.allowed[name] : _.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isArray(value) || (value.serializer == undefined ? undefined : value.serializer.allowNesting);
};
Serializer.prototype.pack = function(instance) {
  var _d, k, packed, v;
  packed = {
    serializer: this.name
  };
  _d = instance;
  for (k in _d) {
    if (!__hasProp.call(_d, k)) continue;
    v = _d[k];
    this.shouldSerialize(k, v) ? (packed[k] = Serializer.pack(v)) : null;
  }
  return packed;
};
Serializer.prototype.unpack = function(data) {
  var _d, k, unpacked, v;
  unpacked = new this.copy();
  _d = data;
  for (k in _d) {
    if (!__hasProp.call(_d, k)) continue;
    v = _d[k];
    k !== 'serializer' ? (unpacked[k] = Serializer.unpack(v)) : null;
  }
  return unpacked;
};
_.extend(Serializer, {
  instances: {},
  pack: function(data) {
    var _d, _e, _f, _g, i, s;
    if (s = typeof data === "undefined" || data == undefined ? undefined : data.serializer) {
      return s.pack(data);
    } else if (_.isArray(data)) {
      _d = []; _f = data;
      for (_e = 0, _g = _f.length; _e < _g; _e++) {
        i = _f[_e];
        _d.push(Serializer.pack(i));
      }
      return _d;
    } else {
      return data;
    }
  },
  unpack: function(data) {
    var _d, _e, _f, _g, i, s;
    if (s = Serializer.instances[data == undefined ? undefined : data.serializer]) {
      return s.unpack(data);
    } else if (_.isArray(data)) {
      _d = []; _f = data;
      for (_e = 0, _g = _f.length; _e < _g; _e++) {
        i = _f[_e];
        _d.push(Serializer.unpack(i));
      }
      return _d;
    } else {
      return data;
    }
  },
  bless: function(klass) {
    var _d, name, options;
    _d = _.flatten([klass.prototype.serialize]);
    name = _d[0];
    options = _d[1];
    klass.prototype.serializer = new Serializer(klass, name, options);
    return (Serializer.instances[name] = klass.prototype.serializer);
  },
  blessAll: function(namespace) {
    var _d, _e, _f, k, v;
    _d = []; _e = namespace;
    for (k in _e) {
      if (!__hasProp.call(_e, k)) continue;
      v = _e[k];
      (typeof (_f = v.prototype.serialize) !== "undefined" && _f !== null) ? _d.push(Serializer.bless(v)) : null;
    }
    return _d;
  }
});
Game.Serializer = Serializer;
Serializer.blessAll(Game);


Connection = function() {
  this.socket = io.connect();
  this.setupObservers();
  return this;
};
__extends(Connection, Observable);
Connection.prototype.send = function(obj) {
  var data;
  data = Serializer.pack(obj);
  return this.socket.send(JSON.stringify(data));
};
Connection.prototype.observe = function(msg, fn) {
  Connection.__superClass__.observe.call(this, msg, fn);
  return this.observeSocket(msg);
};
Connection.prototype.connect = function() {
  //return this.socket.connect();
};
Connection.prototype.setupObservers = function() {
  this.observingSocket = {};
  return this.observe("connect", __bind(function() {
    return (this.id = this.socket.socket.sessionid);
  }, this));
};
Connection.prototype.observeSocket = function(eventName) {
  if (this.observingSocket[eventName]) {
    return null;
  }
  this.observingSocket[eventName] = true;
  return this.socket.on(eventName, __bind(function(json) {
    var data;
    if (json && json !== 'booted') {
      data = JSON.parse(json);
    }
    return this.trigger(eventName, Serializer.unpack(data));
  }, this));
};
Game.Connection = Connection;

IOQueue = function() {
  this.outbox = [];
  this.inbox = [];
  this.connection = new Connection();
  return this;
};
IOQueue.prototype.send = function() {
  var args;
  args = __slice.call(arguments, 0);
  return this.outbox.push(args);
};
IOQueue.prototype.flush = function() {
  var _d;
  if (!(this.outbox.length && (typeof (_d = this.connection.id) !== "undefined" && _d !== null))) {
    return null;
  }
  this.connection.send(this.outbox);
  return (this.outbox = []);
};
IOQueue.prototype.read = function() {
  var ret;
  ret = this.inbox;
  this.inbox = [];
  return ret;
};
IOQueue.prototype.connect = function() {
  this.connection.observe('message', __bind(function(data) {
    return (this.inbox = this.inbox.concat(data));
  }, this));
  return this.connection.connect();
};


var debug = false;
// Create the canvas
/*
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var _d;
_d = [$(window).width(), $(window).height()];
this.canvas.width = _d[0];
this.canvas.height = _d[1];
document.body.appendChild(canvas);
*/


Universe = function(options) {
this.canvas = typeof options === "undefined" || options == undefined ? undefined : options.canvas;
this.tick = 0;
this.zoom = 1;
this.io = new IOQueue();
this.hero = new hero("Server");
this.clients = [];
this.clients.push(this.hero);
return this;
};
Game.Universe = Universe;

// Create the canvas
var canvas = $('canvas').get(0);
var ctx = canvas.getContext("2d");
var _d;
_d = [$(window).width(), $(window).height()];
this.canvas.width = _d[0];
this.canvas.height = _d[1];
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
  this.reset = function() {
    this.image.style.visibility = 'hidden';
  }
}

function hero(name) {
		this.speed = 256; // movement in pixels per second
		this.health = 100;
    this.name = name;
    this.id = guid();
    this.socket = io.connect(); // socket for multiplayer
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
		var myEnemy = new enemy(getRandomArbitrary(10,20),
														32 + (Math.random() * (canvas.width - 64)),
														32 + (Math.random() * (canvas.height - 64)),
														"images/monster" + Math.round(getRandomArbitrary(1,4 )) + ".png");
		enimies.push(myEnemy);
	}
};


// Update game objects
var update = function (modifier) {
  console.log('clients: ' + clients.length + ' zombies:' + enimies.length);
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

    // player bullets
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

        if (player.bullets[i].x > canvas.width ||
            player.bullets[i].x < 0 ||
            player.bullets[i].y > canvas.height  ||
            player.bullets[i].y < 0) {
            //player.bullets[i].reset();
            player.bullets.splice(i,1);

        }

    }



    // enimies
		for (var i = 0, len = enimies.length; i < len; i++) {

      // for the bad guy getting killed with bullets

      /*
      // this is broken? idk why looping through the bullets breaks the eniemes
        for (var b = 0, len = player.bullets.length; b < len; b++) {
          console.log('len ' + len);
          console.log('bullet:' + i + 'x: ' + player.bullets[i].x);

          if (player.bullets[b].x <= (enimies[i].x + 32)	&& enimies[i].x <= (player.bullets[b].x + 32) &&
              player.bullets[b].y <= (enimies[i].y + 32)	&& enimies[i].y <= (player.bullets[b].y + 32)) {

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
            player.bullets.splice(b,1);

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
          enimies[i].x += 1 * modifier * getRandomArbitrary(-10,10);
          enimies[i].y += 1 * modifier * getRandomArbitrary(-10,10);
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
