export type NumberOrPercentage = number | `${number}%`;

export type LayoutOptions = Readonly<{
    /**
     * @defaultValue 0
     */
    x?: NumberOrPercentage;
    /**
     * @defaultValue 0
     */
    y?: NumberOrPercentage;

    w: NumberOrPercentage;
    h: NumberOrPercentage;

    invertXCoordinate?: boolean;
    invertYCoordinate?: boolean;

    alignFromCenterX?: boolean;
    alignFromCenterY?: boolean;
}>;

export type LayoutContext = Readonly<{
    ctx: CanvasRenderingContext2D;

    containerWidth: number;
    containerHeight: number;

    originX: number;
    originY: number;
}>;

export interface LayoutResult {
    x: number;
    y: number;

    w: number;
    h: number;
}

export default class Layout {
    private static parseSize(size: NumberOrPercentage, containerSize: number): number {
        if (typeof size === 'number') return size;

        return (parseFloat(size) / 100) * containerSize;
    }

    static layout(
        options: LayoutOptions,
        {
            containerWidth = 0,
            containerHeight = 0,

            originX = 0,
            originY = 0,
        }: LayoutContext,
    ): LayoutResult {
        const w = this.parseSize(options.w, containerWidth);
        const h = this.parseSize(options.h, containerHeight);

        let x = 0;
        let y = 0;

        // If neither, 0
        if (typeof options.x === 'string' && options.x.endsWith('%')) {
            x = this.parseSize(options.x, containerWidth);
        } else if (typeof options.x === 'number') {
            x = options.x;
            x = options.invertXCoordinate ? containerWidth - x : x;
            x = options.alignFromCenterX ? (containerWidth / 2) + x : x;
        }
    
        // If neither, 0
        if (typeof options.y === 'string' && options.y.endsWith('%')) {
            y = this.parseSize(options.y, containerHeight);
        } else if (typeof options.y === 'number') {
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