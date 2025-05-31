const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;
const PI2 = Math.PI / 2;

ctx.translate(300, 300);
ctx.scale(5, 5);

ctx.lineJoin = "round";
ctx.lineCap = "round";

ctx.beginPath();
ctx.lineWidth = 2;
ctx.arc(0, 0, 40, 0, TAU);
ctx.stroke();

ctx.translate(-23, 0);

ctx.beginPath();

ctx.moveTo(39.5, 18);
ctx.quadraticCurveTo(0, 30, 0, 0);

ctx.lineWidth = 28;
ctx.strokeStyle = "#363685";
ctx.stroke();

ctx.beginPath();

ctx.moveTo(40, 18);
ctx.quadraticCurveTo(0, 30, 0, 0);

ctx.lineWidth = 16.799999237060547;
ctx.strokeStyle = "#4343A4";
ctx.stroke();

ctx.beginPath();

ctx.moveTo(39.5, -18);
ctx.quadraticCurveTo(0, -30, 0, 0);

ctx.lineWidth = 28;
ctx.strokeStyle = "#853636";
ctx.stroke();

ctx.beginPath();

ctx.moveTo(40, -18);
ctx.quadraticCurveTo(0, -30, 0, 0);

ctx.lineWidth = 16.799999237060547;
ctx.strokeStyle = "#A44343";
ctx.stroke();

ctx.lineCap = "butt";

ctx.beginPath();

ctx.moveTo(39.5, 18);
ctx.quadraticCurveTo(0, 30, 0, 0);

ctx.lineWidth = 28;
ctx.strokeStyle = "#363685";
ctx.stroke();


ctx.beginPath();

ctx.moveTo(40, 18);
ctx.quadraticCurveTo(0, 30, 0, 0);

ctx.lineWidth = 16.799999237060547;
ctx.strokeStyle = "#4343A4";
ctx.stroke();

ctx.beginPath();

ctx.moveTo(39.5, -18);
ctx.quadraticCurveTo(0, -30, 0, 0);

ctx.lineWidth = 28;
ctx.strokeStyle = "#853636";
ctx.stroke();

ctx.beginPath();

ctx.moveTo(40, -18);
ctx.quadraticCurveTo(0, -30, 0, 0);

ctx.lineWidth = 16.799999237060547;
ctx.strokeStyle = "#A44343";
ctx.stroke();