const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let i = 0;

(function loop() {
    i++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.lineJoin = "round";
    ctx.lineWidth = 6;

    ctx.save();

    ctx.rotate(i * 0.02);

    ctx.rotate(Math.PI / 4);
    ctx.scale(-0.95, 0.95);

    ctx.strokeStyle = "#D5C7A6";
    ctx.fillStyle = "#D5C7A6";
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(14, 24.24871253967285);
    ctx.lineTo(-14, 24.24871063232422);
    ctx.lineTo(-28, 0);
    ctx.lineTo(-14, -24.24871253967285);
    ctx.lineTo(14, -24.24871253967285);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.save();

    ctx.rotate(i * -0.03);

    ctx.strokeStyle = "#BFB295";
    ctx.fillStyle = "#BFB295";
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(9, 15.588458061218262);
    ctx.lineTo(-9, 15.588457107543945);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-9, -15.588458061218262);
    ctx.lineTo(9, -15.588458061218262);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.save();

    ctx.rotate(i * 0.04);

    ctx.strokeStyle = "#A99E84";
    ctx.fillStyle = "#A99E84";
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(4, 6.928203582763672);
    ctx.lineTo(-4, 6.928203105926514);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-4, -6.928203582763672);
    ctx.lineTo(4, -6.928203582763672);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.restore();

    requestAnimationFrame(loop);
})();