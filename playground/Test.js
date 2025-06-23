const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;
const PI2 = Math.PI / 2;
const PI10 = Math.PI / 10;

ctx.translate(500, 500);
ctx.scale(2, 2);

ctx.lineJoin = ctx.lineCap = "round";

{
    ctx.setTransform(-1.357645034790039, -1.35764479637146, 1.35764479637146, -1.357645034790039, 128, 128);

    ctx.lineWidth = 7;

    ctx.beginPath();

    ctx.arc(-8, 0, 13.5, 0, TAU);

    ctx.fillStyle = "#454545";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(-8, 0, 6.5, 0, TAU);

    ctx.fillStyle = "#555555";
    ctx.fill();

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#EEEEEE";

    ctx.beginPath();

    ctx.ellipse(-7, -8, 15, 7, PI10, 0, TAU);

    ctx.fill();

    ctx.beginPath();

    ctx.ellipse(-7, 8, 15, 7, -PI10, 0, TAU);

    ctx.fill();
}

{
    ctx.setTransform(-1.357645034790039, -1.35764479637146, 1.35764479637146, -1.357645034790039, 117.13883972167969, 117.13883972167969);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#292929";

    ctx.beginPath();

    ctx.moveTo(0, -7);
    ctx.quadraticCurveTo(11, -10, 22, -5);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(0, 7);
    ctx.quadraticCurveTo(11, 10, 22, 5);

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(0, 0, 17.5, 0, TAU, false);

    ctx.fillStyle = "#454545";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(0, 0, 10.5, 0, TAU, false);

    ctx.fillStyle = "#555555";
    ctx.fill();
}