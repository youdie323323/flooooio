export type NumberOrPercentage = number | `${number}%`;

export interface LayoutOptions {
    x: NumberOrPercentage;
    y: NumberOrPercentage;
    w: NumberOrPercentage;
    h: NumberOrPercentage;
}

export default class Layout {
    private static parseSize(size: NumberOrPercentage, containerSize: number): number {
        if (typeof size === 'number') return size;
        return (parseFloat(size) / 100) * containerSize;
    }
    
    static calculatePosition(options: LayoutOptions, containerWidth: number, containerHeight: number) {
        const w = this.parseSize(options.w, containerWidth);
        const h = this.parseSize(options.h, containerHeight);

        let x = 0;
        let y = 0;

        if (typeof options.x === 'string' && options.x.endsWith('%')) {
            x = (parseFloat(options.x) / 100) * containerWidth;
        } else if (typeof options.x === 'number') {
            x = options.x;
        }

        if (typeof options.y === 'string' && options.y.endsWith('%')) {
            y = (parseFloat(options.y) / 100) * containerHeight;
        } else if (typeof options.y === 'number') {
            y = options.y;
        }

        return { x, y, w, h };
    }
}