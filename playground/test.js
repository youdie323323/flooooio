const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function createBeetleBodyPath() {
    const p2 = new Path2D();
    p2.moveTo(-40, 0);
    p2.bezierCurveTo(-50, -50, 50, -50, 40, 0);
    p2.bezierCurveTo(50, 50, -50, 50, -40, 0);
    p2.closePath();
    return p2;
}

const beetleBodyPath = createBeetleBodyPath();

const DARKEND_BASE = 0.1875;

const darkendCache = new Map();

function darkend(color, strength) {
    const cacheKey = `${color}${strength}`;

    if (darkendCache.has(cacheKey)) {
        return darkendCache.get(cacheKey);
    }

    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.floor(r * (1 - strength));
    g = Math.floor(g * (1 - strength));
    b = Math.floor(b * (1 - strength));

    const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    darkendCache.set(cacheKey, result);

    return result;
}

ctx.translate(500, 500);

ctx.scale(5, 5)

ctx.beginPath();
for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.scale(1, i * 2 - 1);
    ctx.translate(0, -3);
    ctx.arc(0, 36, 18, 0, Math.PI * 2);
    ctx.restore();
}
ctx.lineWidth = 7;
ctx.lineJoin = ctx.lineCap = "round";
ctx.strokeStyle = ctx.fillStyle = "#333333";
ctx.fill();

let bodyColor = ["#8ac255", "#709e45"];

ctx.beginPath();
ctx.arc(0, 0, 40, 0, Math.PI * 2);
ctx.fillStyle = bodyColor[0];
ctx.fill();
ctx.lineWidth = 7;
ctx.strokeStyle = bodyColor[1];
ctx.stroke();