const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;
const PI2 = Math.PI / 2;
const PI10 = Math.PI / 10;

ctx.translate(500, 500);
ctx.scale(7, 7);

ctx.lineJoin = "round";

ctx.beginPath();

ctx.moveTo(15, 0);

ctx.quadraticCurveTo(1.963525414466858, 1.4265848398208618, 9.270508766174316 / 2, 28.531696319580078 / 2);

ctx.quadraticCurveTo(-0.7500001192092896, 2.308262586593628, -24.270511627197266 / 2, 17.633556365966797 / 2);

ctx.quadraticCurveTo(-2.427051067352295, -1.9073486612342094e-7, -24.2705078125 / 2, -17.633560180664062 / 2);

ctx.quadraticCurveTo(-0.7499997019767761, -2.308262586593628, 9.270513534545898 / 2, -28.531694412231445 / 2);

ctx.quadraticCurveTo(1.9635257720947266, -1.4265844821929932, 30 / 2, 0.000005245366537565133 / 2);

ctx.closePath();

ctx.lineCap = "round";

ctx.lineWidth = 10;
ctx.fillStyle = "#A9403E";
ctx.strokeStyle = "#A9403E";
ctx.fill();
ctx.stroke();

ctx.lineWidth = 5;
ctx.fillStyle = "#D14F4D";
ctx.strokeStyle = "#D14F4D";
ctx.fill();
ctx.stroke();

ctx.fillStyle = "#D4766C";

ctx.beginPath();
ctx.arc(25, 0, 2, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(18, 0, 3, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(9, 0, 4, 0, TAU, false);
ctx.fill();

ctx.beginPath();
ctx.arc(7.7254243195056915, 23.77641350030899, 2, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(5.562305510044098, 17.119017720222473, 3, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(2.781152755022049, 8.559508860111237, 4, 0, TAU, false);
ctx.fill();

ctx.beginPath();
ctx.arc(-20.22542655467987, 14.694629609584808, 2, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(-14.562307119369507, 10.580133318901062, 3, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(-7.281153559684753, 5.290066659450531, 4, 0, TAU, false);
ctx.fill();

ctx.beginPath();
ctx.arc(-20.225423574447632, -14.694634079933167, 2, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(-14.562304973602295, -10.58013653755188, 3, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(-7.2811524868011475, -5.29006826877594, 4, 0, TAU, false);
ctx.fill();

ctx.beginPath();
ctx.arc(7.72542804479599, -23.77641201019287, 2, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(5.562308192253113, -17.119016647338867, 3, 0, TAU, false);
ctx.fill();
ctx.beginPath();
ctx.arc(2.7811540961265564, -8.559508323669434, 4, 0, TAU, false);
ctx.fill();
