const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;
const PI2 = Math.PI / 2;

ctx.translate(500, 500);
ctx.scale(2, 2);

ctx.lineJoin = ctx.lineCap = "round";

ctx.lineWidth = 7;

{
    ctx.save();

    ctx.translate(-8, 0);

    ctx.beginPath();

    ctx.arc(-8, 0, 13.5, 0, TAU);

    ctx.fillStyle = "#454545";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(-8, 0, 6.5, 0, TAU);

    ctx.fillStyle = "#555555";
    ctx.fill();

    ctx.restore();
}

{
    ctx.save();

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

    ctx.arc(0, 0, 17.5, 0, TAU);

    ctx.fillStyle = "#454545";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(0, 0, 10.5, 0, TAU);

    ctx.fillStyle = "#555555";
    ctx.fill();

    ctx.restore();
}

ctx.translate(200, 200);

ctx.lineJoin = ctx.lineCap = "round";

ctx.lineWidth = 7;

{
    ctx.save();

    ctx.translate(10.861160278320312, 10.861160278320312);
    ctx.rotate(-2.356194577998286);
    ctx.scale(1.919999852501179, 1.919999852501179);

    ctx.beginPath();

    ctx.arc(-8, 0, 13.5, 0, TAU);

    ctx.fillStyle = "#454545";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(-8, 0, 6.5, 0, TAU);

    ctx.fillStyle = "#555555";
    ctx.fill();

    ctx.restore();
}

{
    ctx.save();

    ctx.rotate(-2.356194577998286);
    ctx.scale(1.919999852501179, 1.919999852501179);

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

    ctx.arc(0, 0, 17.5, 0, 2 * Math.PI);

    ctx.fillStyle = "#454545";
    ctx.fill();

    ctx.beginPath();

    ctx.arc(0, 0, 10.5, 0, 2 * Math.PI);

    ctx.fillStyle = "#555555";
    ctx.fill();

    ctx.restore();
}