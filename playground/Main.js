const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function createBeetleBodyPath() {
    const path = new Path2D();

    path.moveTo(0, -30);
    path.quadraticCurveTo(40, -30, 40, 0);
    path.quadraticCurveTo(40, 30, 0, 30);
    path.quadraticCurveTo(-40, 30, -40, 0);
    path.quadraticCurveTo(-40, -30, 0, -30);
    path.closePath();

    return path;
}

const beetleBodyPath = createBeetleBodyPath();

let moveCounter = 0;

(function loop() {
    moveCounter += 0.1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.scale(5, 5);
    ctx.translate(100, 100);

    ctx.lineJoin = ctx.lineCap = "round";

    {
        ctx.lineWidth = 7;

        const skinColor = "#8f5db0";

        ctx.fillStyle = skinColor;
        ctx.fill(beetleBodyPath);

        // Arc points are same color with this
        ctx.fillStyle = ctx.strokeStyle = skinColor;
        ctx.stroke(beetleBodyPath);
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    requestAnimationFrame(loop);
})();