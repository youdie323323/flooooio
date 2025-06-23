"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Layout {
    static parseSize(size, containerSize) {
        if (typeof size === "number")
            return size;
        return (parseFloat(size) / 100) * containerSize;
    }
    static layout(options, { containerWidth = 0, containerHeight = 0, originX = 0, originY = 0, }) {
        const w = this.parseSize(options.w, containerWidth);
        const h = this.parseSize(options.h, containerHeight);
        let x = 0;
        let y = 0;
        // If neither, 0
        if (typeof options.x === "string" && options.x.endsWith("%")) {
            x = this.parseSize(options.x, containerWidth);
        }
        else if (typeof options.x === "number") {
            x = options.x;
            x = options.invertXCoordinate ? containerWidth - x : x;
            x = options.alignFromCenterX ? (containerWidth / 2) + x : x;
        }
        // If neither, 0
        if (typeof options.y === "string" && options.y.endsWith("%")) {
            y = this.parseSize(options.y, containerHeight);
        }
        else if (typeof options.y === "number") {
            y = options.y;
            y = options.invertYCoordinate ? containerHeight - y : y;
            y = options.alignFromCenterY ? (containerHeight / 2) + y : y;
        }
        return {
            x: x + originX,
            y: y + originY,
            w,
            h,
        };
    }
}
exports.default = Layout;
