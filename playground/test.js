const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

// #00000030
const DARKEND_BASE = 0.1875;
/**
 * Darkens colour.
 * @param color - Color code.
 * @param strength - Strenth.
 */
const darkend = (color, strength) => {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = Math.floor(r * (1 - strength));
    g = Math.floor(g * (1 - strength));
    b = Math.floor(b * (1 - strength));
    const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return result;
};

ctx.scale(5, 5);

ctx.translate(50, 50);

[-10, -12, 5, -12, 15, 0];
[5, 12, -10, 12, -15, 0];
[-10, -12, 5, -12, 15, 0];
[5, 12, -10, 12, -15, 0];
[-10, -12, 5, -12, 15, 0];
[5, 12, -10, 12, -15, 0];
[-10, -12, 5, -12, 15, 0];
[5, 12, -10, 12, -15, 0];

{
    ctx.lineCap = ctx.lineJoin = "round";

    ctx.beginPath();

    ctx.fillStyle = "#ffe763";

    ctx.bezierCurveTo(5, 12, -10, 12, -15, 0);
    ctx.bezierCurveTo(-10, -12, 5, -12, 15, 0);

    ctx.lineWidth = 3;
    ctx.stroke();
}