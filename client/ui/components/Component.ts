// Base interface for all GUI components
export interface Component {
    visible: boolean;
    updateAbsolutePosition(viewportWidth: number, viewportHeight: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}

// Interface for interactive components
export interface Interactive extends Component {
    enabled: boolean;
    isPointInside(x: number, y: number): boolean;
    onMouseEnter?(): void;
    onMouseLeave?(): void;
    onMouseMove?(x: number, y: number): void;
}

// Interface for clickable components
export interface Clickable extends Interactive {
    onClick?(): void;
    onMouseDown?(): void;
    onMouseUp?(): void;
}

// Interface for components that can hold a value
export interface ValueHolder<T> extends Component {
    value: T;
    onChange?(value: T): void;
}

// Interface for components that can be focused
export interface Focusable extends Interactive {
    focused: boolean;
    onFocus?(): void;
    onBlur?(): void;
}

// Interface for components that can contain other components
export interface Container extends Component {
    children: Component[];
    addChild(component: Component): void;
    removeChild(component: Component): void;
}