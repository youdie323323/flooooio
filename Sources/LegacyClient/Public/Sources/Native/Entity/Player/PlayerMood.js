"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeMood = decodeMood;
function decodeMood(flags) {
    return [
        // Is angry
        (flags & 0 /* MoodFlags.ANGRY */) !== 0,
        // Is sad
        (flags & 1 /* MoodFlags.SAD */) !== 0,
    ];
}
