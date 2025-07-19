const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;
const PI2 = Math.PI / 2;
const PI10 = Math.PI / 10;

ctx.translate(500, 500);
ctx.scale(7, 7);

ctx.lineJoin = "round";

ctx.translate(128 - 111.54286193847656, 0);

ctx.lineWidth = 5;
ctx.fillStyle = "#333333";
ctx.strokeStyle = "#333333";

ctx.beginPath();

ctx.moveTo(11, 0);
ctx.lineTo(-11, -6);
ctx.lineTo(-11, 6);

ctx.closePath();

ctx.fill();
ctx.stroke();

ctx.lineWidth = 2;

ctx.beginPath();

ctx.arc(0, 0, 10, 0, TAU);

ctx.stroke();