const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

(async function () {
    const size = 1024;

    const offscreenCanvas = new OffscreenCanvas(size, size);
    const offscreenCtx = offscreenCanvas.getContext("2d");

    offscreenCtx.direction = "ltr";
    offscreenCtx.globalAlpha = 1;
    offscreenCtx.lineWidth = 1;
    offscreenCtx.miterLimit = 10;
    offscreenCtx.font = "700 10px Game, Microsoft YaHei, sans-serif";
    offscreenCtx.imageSmoothingEnabled = true;
    offscreenCtx.clearRect(0, 0, size, size);
    offscreenCtx.globalCompositeOperation = "source-over";
    offscreenCtx.lineJoin = "round";

    // new PetalRendererId1().render(offscreenCtx);

    ctx.drawImage(
        offscreenCanvas,
        20, 20,
        size, size,
    );
})();