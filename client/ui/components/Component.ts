export interface Component {
    updateAbsolutePosition(viewportWidth: number, viewportHeight: number): void;

    isPointInside(x: number, y: number): boolean;
    
    setPressed(pressed: boolean): void;
    setHovered(hovered: boolean): void;

    executeCallback(): void;
    render(ctx: CanvasRenderingContext2D): void;
}