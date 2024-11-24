import { scaleFactor } from "../../main";
import { LayoutOptions } from "../layout/Layout";
import { Component, Interactive } from "./Component";

export class ComponentDynamicText extends Component {
    private static readonly INTERPOLATION_SPEED: number = 0.2;
    private text: string;
    private fontSize: number;
    private collisionComponents: Component[] = [];
    private targetPosition: { x: number | null; y: number | null } = { x: null, y: null };

    constructor(
        layout: LayoutOptions,
        text: string,
        fontSize: number = 16,
    ) {
        super(layout);

        this.text = text;
        this.fontSize = fontSize;
    }

    public setCollisionComponents(components: Component[]) {
        this.collisionComponents = components.filter(c => c !== this);
    }

    private checkCollision(component: Component): boolean {
        return !(
            this.x + this.w < component.x ||
            this.x > component.x + component.w ||
            this.y + this.h < component.y ||
            this.y > component.y + component.h
        );
    }

    private resolveCollision(component: Component) {
        const overlapX = Math.min(
            Math.abs((this.x + this.w) - component.x),
            Math.abs(this.x - (component.x + component.w))
        );
        const overlapY = Math.min(
            Math.abs((this.y + this.h) - component.y),
            Math.abs(this.y - (component.y + component.h))
        );

        if (overlapX < overlapY) {
            if (this.x < component.x) {
                this.targetPosition.x = component.x - this.w;
            } else {
                this.targetPosition.x = component.x + component.w;
            }
            this.targetPosition.y = null;
        } else {
            if (this.y < component.y) {
                this.targetPosition.y = component.y - this.h;
            } else {
                this.targetPosition.y = component.y + component.h;
            }
            this.targetPosition.x = null;
        }
    }

    private interpolatePosition() {
        if (this.targetPosition.x !== null) {
            this.x += (this.targetPosition.x - this.x) * ComponentDynamicText.INTERPOLATION_SPEED;
            if (Math.abs(this.targetPosition.x - this.x) < 0.1) {
                this.x = this.targetPosition.x;
                this.targetPosition.x = null;
            }
        }

        if (this.targetPosition.y !== null) {
            this.y += (this.targetPosition.y - this.y) * ComponentDynamicText.INTERPOLATION_SPEED;
            if (Math.abs(this.targetPosition.y - this.y) < 0.1) {
                this.y = this.targetPosition.y;
                this.targetPosition.y = null;
            }
        }
    }

    public update() {
        for (const component of this.collisionComponents) {
            if (this.checkCollision(component)) {
                this.resolveCollision(component);
            }
        }

        this.interpolatePosition();
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.fillStyle = "white";
        ctx.strokeStyle = '#000000';
        ctx.font = `${this.fontSize}px Ubuntu`;
        ctx.lineWidth = this.fontSize / 20;

        const x = this.x + (this.w - ctx.measureText(this.text).width) / 2;
        const y = this.y + (this.h + this.fontSize) / 2;

        ctx.fillText(
            this.text,
            x,
            y
        );
        ctx.strokeText(
            this.text,
            x,
            y
        );
    }
}