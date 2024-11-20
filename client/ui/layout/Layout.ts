export type Anchor = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type Size = number | 'auto' | `${number}%`;

export interface LayoutOptions {
    x?: number | `${number}%`;
    y?: number | `${number}%`;
    width?: Size;
    height?: Size;
    margin?: number;
    horizontalAlign?: Anchor;
    verticalAlign?: Anchor;
}

export default class Layout {
    private static readonly SCALING_WIDTH = 1300;
    private static readonly SCALING_HEIGHT = 650;

    private static getScale(containerWidth: number, containerHeight: number): number {
        return Math.max(
            containerWidth / this.SCALING_WIDTH,
            containerHeight / this.SCALING_HEIGHT
        );
    }

    private static parseSize(size: Size | undefined, containerSize: number, scale: number): number {
        if (size === undefined || size === 'auto') return containerSize * 0.1 * scale;
        if (typeof size === 'number') return size * scale;
        return (parseFloat(size) / 100) * containerSize;
    }
    
    static calculatePosition(options: LayoutOptions, containerWidth: number, containerHeight: number) {
        const scale = this.getScale(containerWidth, containerHeight);
        
        const width = this.parseSize(options.width, containerWidth, scale);
        const height = this.parseSize(options.height, containerHeight, scale);
        const margin = (options.margin || 0) * scale;

        let x = 0;
        let y = 0;

        if (typeof options.x === 'string' && options.x.endsWith('%')) {
            x = (parseFloat(options.x) / 100) * containerWidth;
        } else if (typeof options.x === 'number') {
            x = options.x * scale;
        } else {
            switch (options.horizontalAlign) {
                case 'left':
                    x = margin;
                    break;
                case 'right':
                    x = containerWidth - width - margin;
                    break;
                case 'center':
                default:
                    x = (containerWidth - width) / 2;
                    break;
            }
        }

        if (typeof options.y === 'string' && options.y.endsWith('%')) {
            y = (parseFloat(options.y) / 100) * containerHeight;
        } else if (typeof options.y === 'number') {
            y = options.y * scale;
        } else {
            switch (options.verticalAlign) {
                case 'top':
                    y = margin;
                    break;
                case 'bottom':
                    y = containerHeight - height - margin;
                    break;
                case 'center':
                default:
                    y = (containerHeight - height) / 2;
                    break;
            }
        }

        return { x, y, width, height, scale };
    }
}