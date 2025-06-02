const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;
const PI2 = Math.PI / 2;

ctx.translate(500, 500);
ctx.scale(15, 15);

ctx.lineCap = "round";

{ // Dev body
    ctx.beginPath();

    const START_X = 25;
    const START_Y = -0.5;

    ctx.moveTo(START_X, START_Y);

    ctx.quadraticCurveTo(19, 35, 4, 25.5);
    
    ctx.quadraticCurveTo(-20, 18, -22, 5);
    ctx.quadraticCurveTo(-25, -32, 0, -22);

    ctx.quadraticCurveTo(15, -24, START_X, START_Y);

    ctx.closePath();

    ctx.lineWidth = 3;
    ctx.fillStyle = "#ffe763";
    ctx.strokeStyle = "#cebb50";
    ctx.fill();
    ctx.stroke();
}