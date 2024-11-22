export type NumberOrPercentage = number | `${number}%`;

export interface LayoutOptions {
    x?: NumberOrPercentage;
    y?: NumberOrPercentage;
    width?: NumberOrPercentage;
    height?: NumberOrPercentage;
}

export default class Layout {
    private static parseSize(size: NumberOrPercentage | undefined, containerSize: number): number {
        if (typeof size === 'number') return size;
        return (parseFloat(size) / 100) * containerSize;
    }
    
    static calculatePosition(options: LayoutOptions, containerWidth: number, containerHeight: number) {
        const width = this.parseSize(options.width, containerWidth);
        const height = this.parseSize(options.height, containerHeight);

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

        return { x, y, width, height };
    }
}