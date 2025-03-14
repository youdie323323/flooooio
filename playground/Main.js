const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

function fitTextToWidth(text, maxWidth, fontSize = 40, fontFamily = "Arial") {
    ctx.font = `${fontSize}px ${fontFamily}`;

    const textWidth = ctx.measureText(text).width;

    const scaleRatio = maxWidth / textWidth;

    if (scaleRatio < 1) {
        ctx.scale(scaleRatio, 1);
    }

    return { scaledText: text, scaleRatio };
}

const text = "これはとても長いテキストです";
const maxWidth = 200;

const { scaledText, scaleRatio } = fitTextToWidth(text, maxWidth);

console.log(`調整後のテキスト: ${scaledText}, 縮小率: ${scaleRatio}`);