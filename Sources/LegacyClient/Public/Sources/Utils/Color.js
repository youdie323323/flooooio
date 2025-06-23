"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightened = exports.darkened = exports.DARKENED_BASE = void 0;
const Memoize_1 = require("./Memoize");
// #00000030
exports.DARKENED_BASE = 0.1875;
/**
 * Darkens colour.
 *
 * @param color - Color code
 * @param strength - Strenth
 */
exports.darkened = (0, Memoize_1.memo)((color, strength) => {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = Math.floor(r * (1 - strength));
    g = Math.floor(g * (1 - strength));
    b = Math.floor(b * (1 - strength));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
});
/**
 * ligtens colour.
 *
 * @param color - Color code
 * @param strength - Strenth
 */
exports.lightened = (0, Memoize_1.memo)((color, strength) => {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    r = Math.min(255, Math.floor(r * (1 + strength)));
    g = Math.min(255, Math.floor(g * (1 + strength)));
    b = Math.min(255, Math.floor(b * (1 + strength)));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
});
