export type LayoutOptions = Readonly<{
    x?: number;
    y?: number;

    w: number;
    h: number;

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
    static layout(
        options: LayoutOptions,
        {
            containerWidth = 0,
            containerHeight = 0,
            originX = 0,
            originY = 0,
        }: LayoutContext,
    ): LayoutResult {
        const { w, h } = options;

        let x = options.x;

        x = options.invertXCoordinate ? containerWidth - x : x;
        x = options.alignFromCenterX ? (containerWidth / 2) + x : x;

        let y = options.y;

        y = options.invertYCoordinate ? containerHeight - y : y;
        y = options.alignFromCenterY ? (containerHeight / 2) + y : y;

        return {
            x: x + originX,
            y: y + originY,
            w,
            h,
        };
    }
}