const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const path2d_0 = (function () {
    const path = new Path2D();

    path.moveTo(11, 0);

    path.lineTo(-11, -6);
    path.lineTo(-11, 6);
    path.lineTo(11, 0);

    path.closePath();

    return path;
})();

const path2d_1 = (function () {
    const path = new Path2D();

    path.moveTo(10.342206954956055, 2.411909580230713);

    path.lineTo(-11.657793045043945, -3.588090419769287);
    path.lineTo(-11, -6);
    path.lineTo(-8.5, -6);
    path.lineTo(-8.5, 6);
    path.lineTo(-11, 6);
    path.lineTo(-11.657793045043945, 3.588090419769287);
    path.lineTo(10.342206954956055, -2.411909580230713);
    path.lineTo(11, 0);
    path.lineTo(10.342206954956055, 2.411909580230713);

    path.closePath();

    path.moveTo(11.657793045043945, -2.411909580230713);

    path.quadraticCurveTo(12.298311233520508, -2.237222671508789, 12.767766952514648, -1.7677668333053589);
    path.quadraticCurveTo(13.237222671508789, -1.2983107566833496, 13.411909103393555, -0.6577935218811035);
    path.quadraticCurveTo(13.684375762939453, 0.34125208854675293, 13.17060661315918, 1.2403472661972046);
    path.quadraticCurveTo(12.656837463378906, 2.1394424438476562, 11.657793045043945, 2.411909580230713);
    path.lineTo(-10.342206954956055, 8.411909103393555);
    path.quadraticCurveTo(-10.502988815307617, 8.455759048461914, -10.668167114257812, 8.477879524230957);
    path.quadraticCurveTo(-10.833346366882324, 8.5, -11, 8.5);
    path.quadraticCurveTo(-12.03553295135498, 8.5, -12.767765045166016, 7.767766952514648);
    path.quadraticCurveTo(-13.499999046325684, 7.035533905029297, -13.5, 6);
    path.lineTo(-13.5, -6);
    path.quadraticCurveTo(-13.5, -6.166653633117676, -13.477879524230957, -6.3318328857421875);
    path.quadraticCurveTo(-13.455759048461914, -6.497012138366699, -13.411909103393555, -6.6577935218811035);
    path.quadraticCurveTo(-13.13944149017334, -7.656838417053223, -12.240346908569336, -8.17060661315918);
    path.quadraticCurveTo(-11.341251373291016, -8.684375762939453, -10.342206954956055, -8.411909103393555);
    path.lineTo(11.657793045043945, -2.411909580230713);

    path.closePath();

    return path;
})();

const path2d_2 = (function () {
    const path = new Path2D();

    path.moveTo(30, 0);
    
    path.quadraticCurveTo(29.999996185302734, 8.284271240234375, 21.21320152282715, 14.142135620117188);
    path.quadraticCurveTo(12.426405906677246, 20, 0, 20);
    path.quadraticCurveTo(-12.426405906677246, 20, -21.21320152282715, 14.142135620117188);
    path.quadraticCurveTo(-29.999996185302734, 8.284271240234375, -30, 0);
    path.quadraticCurveTo(-29.999996185302734, -8.284271240234375, -21.21320152282715, -14.142135620117188);
    path.quadraticCurveTo(-12.426405906677246, -20, 0, -20);
    path.quadraticCurveTo(12.426405906677246, -20, 21.21320152282715, -14.142135620117188);
    path.quadraticCurveTo(29.999996185302734, -8.284271240234375, 30, 0);

    return path;
})();

const path2d_3 = (function () {
    const path = new Path2D();

    path.moveTo(20, -14.907119750976562);

    path.lineTo(20, 14.907119750976562);
    path.quadraticCurveTo(17.813514709472656, 16.210886001586914, 15.289612770080566, 17.207592010498047);
    path.quadraticCurveTo(12.765708923339844, 18.204296112060547, 10, 18.85618019104004);
    path.lineTo(10, -18.85618019104004);
    path.quadraticCurveTo(12.765708923339844, -18.204296112060547, 15.28961181640625, -17.207592010498047);
    path.quadraticCurveTo(17.813514709472656, -16.210886001586914, 20, -14.907119750976562);

    path.closePath();

    return path;
})();

const path2d_4 = (function () {
    const path = new Path2D();

    path.moveTo(-10, -18.85618019104004);

    path.quadraticCurveTo(-7.591191291809082, -19.42394256591797, -5.07305908203125, -19.711971282958984);
    path.quadraticCurveTo(-2.554927110671997, -20, 0, -20);
    path.lineTo(0, 20);
    path.quadraticCurveTo(-2.554927110671997, 20, -5.07305908203125, 19.711971282958984);
    path.quadraticCurveTo(-7.591191291809082, 19.42394256591797, -10, 18.85618019104004);
    path.lineTo(-10, -18.85618019104004);

    path.closePath();

    return path;
})();

const path2d_5 = (function () {
    const path = new Path2D();

    path.moveTo(-20, 14.907119750976562);

    path.quadraticCurveTo(-24.77225685119629, 12.06149673461914, -27.386127471923828, 8.164966583251953);
    path.quadraticCurveTo(-30, 4.268435478210449, -30, 0);
    path.quadraticCurveTo(-30, -4.268435478210449, -27.38612937927246, -8.164966583251953);
    path.quadraticCurveTo(-24.77225685119629, -12.06149673461914, -20, -14.907119750976562);
    path.lineTo(-20, 14.907119750976562);

    path.closePath();

    return path;
})();

const path2d_6 = (function () {
    const path = new Path2D();

    path.moveTo(32.5, 0);

    path.quadraticCurveTo(32.5, 9.62222671508789, 22.59995460510254, 16.222261428833008);
    path.quadraticCurveTo(13.183349609375, 22.500003814697266, 0, 22.5);
    path.quadraticCurveTo(-13.183344841003418, 22.5, -22.59995460510254, 16.222261428833008);
    path.quadraticCurveTo(-32.5, 9.622234344482422, -32.5, 0);
    path.quadraticCurveTo(-32.5, -9.62222671508789, -22.59995460510254, -16.222261428833008);
    path.quadraticCurveTo(-13.183349609375, -22.500003814697266, 0, -22.5);
    path.quadraticCurveTo(13.183344841003418, -22.5, 22.59995460510254, -16.222261428833008);
    path.quadraticCurveTo(32.5, -9.622234344482422, 32.5, 0);
    path.quadraticCurveTo(32.499996185302734, 1.0355339050292969, 31.767765045166016, 1.7677669525146484);
    path.quadraticCurveTo(31.03553009033203, 2.5, 30, 2.5);
    path.quadraticCurveTo(28.964462280273438, 2.5, 28.23223114013672, 1.7677669525146484);
    path.quadraticCurveTo(27.499996185302734, 1.0355339050292969, 27.5, 0);
    path.quadraticCurveTo(27.500003814697266, -6.946311950683594, 19.826452255249023, -12.062009811401367);
    path.quadraticCurveTo(11.669464111328125, -17.5, 0, -17.5);
    path.quadraticCurveTo(-11.66946029663086, -17.5, -19.826452255249023, -12.062009811401367);
    path.quadraticCurveTo(-27.499996185302734, -6.946311950683594, -27.5, 0);
    path.quadraticCurveTo(-27.500003814697266, 6.946311950683594, -19.826452255249023, 12.062009811401367);
    path.quadraticCurveTo(-11.669464111328125, 17.5, 0, 17.5);
    path.quadraticCurveTo(11.66946029663086, 17.5, 19.826452255249023, 12.062009811401367);
    path.quadraticCurveTo(27.499996185302734, 6.946311950683594, 27.5, 0);
    path.quadraticCurveTo(27.499996185302734, -1.0355339050292969, 28.23223114013672, -1.7677669525146484);
    path.quadraticCurveTo(28.964462280273438, -2.5, 30, -2.5);
    path.quadraticCurveTo(31.03553009033203, -2.5, 31.767765045166016, -1.7677669525146484);
    path.quadraticCurveTo(32.499996185302734, -1.0355339050292969, 32.5, 0);

    path.closePath();

    return path;
})();

const path2d_7 = (function () {
    const path = new Path2D();

    path.moveTo(-0.47434163093566895, 1.4230250120162964);

    path.quadraticCurveTo(-0.9337265491485596, 1.2698967456817627, -1.2168631553649902, 0.8770654201507568);
    path.quadraticCurveTo(-1.5, 0.4842342138290405, -1.5, 0);
    path.quadraticCurveTo(-1.5, -0.6213203072547913, -1.0606601238250732, -1.0606601238250732);
    path.quadraticCurveTo(-0.6213203072547913, -1.5, 0, -1.5);
    path.quadraticCurveTo(15.621322631835938, -1.5, 26.060659408569336, 8.939339637756348);
    path.quadraticCurveTo(26.403064727783203, 9.281744956970215, 26.48063087463379, 9.759726524353027);
    path.quadraticCurveTo(26.558197021484375, 10.23770809173584, 26.34164047241211, 10.670820236206055);
    path.quadraticCurveTo(26.06377601623535, 11.226545333862305, 25.47433853149414, 11.423023223876953);
    path.quadraticCurveTo(24.884902954101562, 11.619503021240234, 24.329179763793945, 11.34164047241211);
    path.quadraticCurveTo(14.424531936645508, 6.389315605163574, -0.47434163093566895, 1.4230250120162964);

    path.closePath();

    return path;
})();

{
    ctx.direction = "ltr";
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.miterLimit = 10;
    ctx.font = "700 10px Game, Microsoft YaHei, sans-serif";
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, 128, 128);

    ctx.globalCompositeOperation = "source-over";

    ctx.save();

    ctx.lineJoin = "round";

    ctx.save();

    ctx.beginPath();
    ctx.setTransform(1.9199999570846558, 0, 0, 1.9199999570846558, 6.400000095367432, 6.400000095367432);
    ctx.moveTo(5, 2.5);
    ctx.lineTo(55, 2.5);
    ctx.quadraticCurveTo(57.5, 2.5, 57.5, 5);
    ctx.lineTo(57.5, 55);
    ctx.quadraticCurveTo(57.5, 57.5, 55, 57.5);
    ctx.lineTo(5, 57.5);
    ctx.quadraticCurveTo(2.5, 57.5, 2.5, 55);
    ctx.lineTo(2.5, 5);
    ctx.quadraticCurveTo(2.5, 2.5, 5, 2.5);
    ctx.closePath();
    ctx.clip();
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.fillStyle = "#333333";
    ctx.setTransform(0.8824692368507385, 0.8824690580368042, -0.8824690580368042, 0.8824692368507385, 102.55711364746094, 102.55711364746094);
    ctx.fill(path2d_0, "nonzero");
    ctx.fill(path2d_1, "nonzero");
    ctx.fillStyle = "#FFD363";
    ctx.setTransform(-0.8824692368507385, -0.8824690580368042, 0.8824690580368042, -0.8824692368507385, 70.78822326660156, 70.78822326660156);
    ctx.fill(path2d_2, "nonzero");
    ctx.fillStyle = "#333333";
    ctx.fill(path2d_3, "evenodd");
    ctx.fill(path2d_4, "evenodd");
    ctx.fill(path2d_5, "evenodd");
    ctx.fillStyle = "#D3AD46";
    ctx.fill(path2d_6, "nonzero");
    ctx.fillStyle = "#333333";
    ctx.setTransform(-0.8824692368507385, -0.8824690580368042, -0.8824690580368042, 0.8824692368507385, 44.31414794921875, 53.13884353637695);
    ctx.fill(path2d_7, "evenodd");
    ctx.setTransform(-0.8824692368507385, -0.8824690580368042, 0.8824690580368042, -0.8824692368507385, 53.13883972167969, 44.314151763916016);
    ctx.fill(path2d_7, "evenodd");
    
    ctx.restore();

    ctx.restore();
}