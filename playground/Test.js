const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;
const PI2 = Math.PI / 2;

ctx.translate(300, 300);
ctx.scale(5, 5);

ctx.fillStyle = "#403525";
ctx.beginPath();
ctx.arc(0, 0, 35, 0, 6.283185307179586, false);
ctx.fill();
ctx.fillStyle = "#4F412E";
ctx.beginPath();
ctx.arc(0, 0, 25, 0, 6.283185307179586, false);
ctx.fill();