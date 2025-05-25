const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const points = [
    { x: 50, y: 50 },
    { x: 180, y: 100 },
    { x: 75, y: 120 },
    { x: 40, y: 40 },
];

// move to the first point
ctx.moveTo(points[0].x, points[0].y);

for (var i = 1; i < points.length - 2; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;

    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
}

console.log(points, points.length - 2, i);

// curve through the last two points
ctx.quadraticCurveTo(
    points[i].x,
    points[i].y,
    points[i + 1].x,
    points[i + 1].y,
);
ctx.stroke();