const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

function drawShape(radius, angle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);

    ctx.lineCap = ctx.lineJoin = "round";
    
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    for (let i = 0; i < Math.PI * 2; i += Math.PI * 2 / 15) {
        ctx.quadraticCurveTo(
            Math.cos(i) * radius * 1.2, Math.sin(i) * radius * 1.2,
            Math.cos(i + Math.PI * 1 / 15) * radius * 0.9, Math.sin(i + Math.PI * 1 / 15) * radius * 0.9,
        );
    }
    ctx.fillStyle = "#efc99b";
    ctx.fill();
    ctx.strokeStyle = "#c1a37d";
    ctx.lineWidth = radius / 6;
    ctx.stroke();
    ctx.closePath();
    
    ctx.restore();
}

drawShape(100, Math.PI / 6);
