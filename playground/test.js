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

const curves = []

function createCurve(angle, direction, offset = 8) {
  direction *= -1
  const cosAngle = Math.cos(angle)
  const sinAngle = Math.sin(angle)
  const startX = cosAngle * 40
  const startY = sinAngle * 40

  curves.push({
    dir: direction,
    start: [startX, startY],
    curve: [
      startX + cosAngle * 23 + -sinAngle * direction * offset,
      startY + sinAngle * 23 + cosAngle * direction * offset,
      startX + cosAngle * 46,
      startY + sinAngle * 46
    ],
    side: Math.sign(angle)
  })
}

createCurve((Math.PI / 180) * 40, 1)
createCurve((Math.PI / 180) * 70, 1, 6)
createCurve((Math.PI / 180) * 100, -1, 6)
createCurve((Math.PI / 180) * 130, -1)
createCurve((-Math.PI / 180) * 40, -1)
createCurve((-Math.PI / 180) * 70, -1, 6)
createCurve((-Math.PI / 180) * 100, 1, 6)
createCurve((-Math.PI / 180) * 130, 1)

ctx.scale(5, 5);

ctx.translate(100, 100);

for (let i = 0; i < curves.length; i++) {
    const curve = curves[i];
    ctx.save();
    ctx.rotate(curve.dir * 1.5);
    ctx.beginPath();
    ctx.moveTo(...curve.start);
    ctx.quadraticCurveTo(...curve.curve);
    ctx.strokeStyle = "#323032";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
}