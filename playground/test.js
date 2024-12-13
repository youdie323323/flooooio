const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

ctx.scale(5, 5);

{
    ctx.save();

    ctx.lineCap = "round";

    ctx.fillStyle = '#ffe763';
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = '#cebb50';

    ctx.beginPath();
    ctx.moveTo(28, -0.5);
    
    ctx.quadraticCurveTo(20, 35, 5, 25.5);
    ctx.quadraticCurveTo(-20, 18, -22, 5);
    ctx.quadraticCurveTo(-26, -32, 0, -23);
    ctx.quadraticCurveTo(19, -24, 28, -0.5);
    
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}

{
    let drawEyeOutline = function (flag = 0) {
        ctx.beginPath();
        ctx.ellipse(13, 8, 2.5 + flag, 6 + flag, -0.15, 0, Math.PI * 2);
        ctx.moveTo(-7, -5);
        ctx.ellipse(-9, -8, 2.5 + flag, 6 + flag, -0.15, 0, Math.PI * 2);
        ctx.strokeStyle = ctx.fillStyle = "#111111";
        ctx.fill();
    };
    
    ctx.save();

    ctx.beginPath();
    drawEyeOutline(0.7);
    drawEyeOutline(0);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(13 + 1 * 2, 8 + 1 * 3.5, 3.1, 0, Math.PI * 2);
    ctx.moveTo(-7, -5);
    ctx.arc(-9 + 1 * 2, -8 + 1 * 3.5, 3.1, 0, Math.PI * 2);
    ctx.fillStyle = "#eee";
    ctx.fill();

    ctx.restore();
}

{
    const verticRise = 0 * -10.5 + 0 * -9;

    ctx.beginPath();
    ctx.translate(-6, 8);
    ctx.rotate(0.5)
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(0, 5.5 + verticRise, 3, 0);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
}