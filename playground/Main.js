const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

(function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.lineJoin = "round";

    ctx.save();

    ctx.translate(300, 300);
    ctx.scale(5, 5);

    ctx.save();

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.fillStyle = "#CCB36D";
    ctx.strokeStyle = "#CCB36D";

    ctx.beginPath();
    ctx.moveTo(-20, -15);
    ctx.quadraticCurveTo(-15, 0, -20, 15);
    ctx.lineTo(0, 3);
    ctx.lineTo(0, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FCDD86";

    ctx.beginPath();
    ctx.arc(0, 0, 30, -1.2566370964050293, 1.2566370964050293, false);
    ctx.quadraticCurveTo(0, 20, -15, 8);
    ctx.quadraticCurveTo(-20, 0, -15, -8);
    ctx.quadraticCurveTo(0, -20, 9.270508766174316, -28.531696319580078);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(12, 15);
    ctx.quadraticCurveTo(0, 8, -8, 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(17.399999618530273, 6);
    ctx.quadraticCurveTo(0, 3.200000047683716, -6.199999809265137, 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(17.399999618530273, -6);
    ctx.quadraticCurveTo(0, -3.200000047683716, -6.199999809265137, -2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(12, -15);
    ctx.quadraticCurveTo(0, -8, -8, -5);
    ctx.stroke();

    ctx.restore();

    ctx.restore();

    ctx.restore();

    requestAnimationFrame(loop);
})();