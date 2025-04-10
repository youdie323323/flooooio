const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const TAU = Math.PI * 2;
const curves = new Array();

function createCurve(angle, direction, offset = 6) {
    direction *= -1;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const startX = cosAngle * 25;
    const startY = sinAngle * 25;

    curves.push({
        dir: direction,
        start: [startX, startY],
        curve: [
            startX + cosAngle * 23 + -sinAngle * direction * offset,
            startY + sinAngle * 23 + cosAngle * direction * offset,
            startX + cosAngle * 46,
            startY + sinAngle * 46,
        ],
    });
}

createCurve((Math.PI / 180) * 40, 1);
createCurve((Math.PI / 180) * 75, 1, 3);
createCurve((Math.PI / 180) * 105, -1, 3);
createCurve((Math.PI / 180) * 140, -1);

createCurve((-Math.PI / 180) * 40, -1);
createCurve((-Math.PI / 180) * 75, -1, 3);
createCurve((-Math.PI / 180) * 105, 1, 3);
createCurve((-Math.PI / 180) * 140, 1);

let moveCounter = 0;

(function loop() {
    moveCounter += 0.1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.scale(3, 3);
    ctx.translate(100, 100);

    ctx.lineCap = "round";

    { // Legs
        ctx.strokeStyle = "#323032";
        ctx.lineWidth = 10;

        for (let i = 0; i < curves.length; i++) {
            const curve = curves[i];

            ctx.save();

            ctx.rotate(curve.dir * Math.sin(moveCounter + i ** 2) * 0.2);
            ctx.beginPath();
            ctx.moveTo(...curve.start);
            ctx.quadraticCurveTo(...curve.curve);
            ctx.stroke();

            ctx.restore();
        }
    }

    { // Body
        ctx.fillStyle = "#4f412e";
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, TAU);
        ctx.fill();
        ctx.clip();
        ctx.stroke();
    }

    ctx.restore();

    requestAnimationFrame(loop);
})();