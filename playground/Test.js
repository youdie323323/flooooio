const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

ctx.scale(5, 5);
ctx.translate(100, 100);

ctx.lineJoin = "round";

ctx.save();

ctx.lineCap = "round";
ctx.strokeStyle = "#292929";
ctx.lineWidth = 4;

ctx.save();

ctx.beginPath();

ctx.translate(-35, -32);
ctx.rotate(-1.6561946489531953);

ctx.moveTo(0, -7);
ctx.quadraticCurveTo(11, -10, 22, -5);
ctx.stroke();

ctx.beginPath();

ctx.moveTo(0, 7);
ctx.quadraticCurveTo(11, 10, 22, 5);

ctx.stroke();

ctx.restore();

ctx.save();

ctx.beginPath();

ctx.rotate(-2.356194599949769);

ctx.moveTo(50, 0);
ctx.quadraticCurveTo(0, -30, -50, 0);

ctx.lineWidth = 25;
ctx.strokeStyle = "#292929";
ctx.stroke();

ctx.lineWidth = 15;
ctx.strokeStyle = "#333333";
ctx.stroke();

ctx.restore();

ctx.restore();