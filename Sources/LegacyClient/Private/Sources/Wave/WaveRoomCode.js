"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomWaveRoomCode = generateRandomWaveRoomCode;
exports.isWaveRoomCode = isWaveRoomCode;
function generateRandomServerIdentifier() {
    return [...Array(3)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
}
function generateRandomMeaninglessIdentifier() {
    return [...Array(6)]
        .map(() => String.fromCharCode(97 + Math.floor(26 * Math.random())))
        .join("");
}
function generateRandomWaveRoomCode() {
    const serverPart = generateRandomServerIdentifier();
    const meaninglessPart = generateRandomMeaninglessIdentifier();
    return `${serverPart}-${meaninglessPart}`;
}
function isWaveRoomCode(maybeCode) {
    if (maybeCode.length !== 10)
        return false;
    if (maybeCode[3] !== "-")
        return false;
    const [prefix, suffix] = maybeCode.split("-");
    // Check if prefix is valid hex (3 characters)
    if (prefix.length !== 3 || !/^[0-9a-f]{3}$/.test(prefix))
        return false;
    // Check if suffix is valid lowercase letters (6 characters)
    if (suffix.length !== 6 || !/^[a-z]{6}$/.test(suffix))
        return false;
    return true;
}
