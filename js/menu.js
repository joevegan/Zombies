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
bgImage.src = "images/menu.png";
