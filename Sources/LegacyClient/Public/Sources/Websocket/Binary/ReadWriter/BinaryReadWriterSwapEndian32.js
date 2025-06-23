"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = swapEndian32;
function swapEndian32(value) {
    return (value & 255) << 24 | 0 | (value & 65280) << 8 | value >> 8 & 65280 | value >> 24 & 255;
}
