export type NumberOrPercentage = number | `${number}%`;

export interface LayoutOptions {
    x: NumberOrPercentage;
    y: NumberOrPercentage;
    w: NumberOrPercentage;
    h: NumberOrPercentage;

    invertXCoordinate?: boolean;
    invertYCoordinate?: boolean;

    alignFromCenterX?: boolean;
    alignFromCenterY?: boolean;
}

export default class Layout {
    private static parseSize(size: NumberOrPercentage, containerSize: number): number {
        if (typeof size === 'number') return size;
        return (parseFloat(size) / 100) * containerSize;
    }
    
    static calculatePosition(
        options: LayoutOptions, 
        containerWidth: number, 
        containerHeight: number,
        originX: number = 0,
        originY: number = 0 
    ) {
        const w = this.parseSize(options.w, containerWidth);
        const h = this.parseSize(options.h, containerHeight);

        let x = 0;
        let y = 0;

        if (typeof options.x === 'string' && options.x.endsWith('%')) {
            x = (parseFloat(options.x) / 100) * containerWidth;
        } else if (typeof options.x === 'number') {
            x = options.invertXCoordinate ? containerWidth - options.x : options.x;
            x = options.alignFromCenterX ? (containerWidth / 2) + x : x;
        }

        if (typeof options.y === 'string' && options.y.endsWith('%')) {
            y = (parseFloat(options.y) / 100) * containerHeight;
        } else if (typeof options.y === 'number') {
            y = options.invertYCoordinate ? containerHeight - options.y : options.y;
            y = options.alignFromCenterY ? (containerHeight / 2) + y : y;
        }

        return { 
            x: x + originX,
            y: y + originY,
            w, 
            h 
        };
    }
}