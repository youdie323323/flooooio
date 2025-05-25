import type { Components } from "../Components/Component";
import type { LayoutContext, LayoutResult } from "../Layout";
import type { ExtensionConstructor } from "./Extension";

export type CollisionDirection = "up" | "down";

export default function Collidable<T extends ExtensionConstructor>(Base: T, direction: CollisionDirection = "up") {
    abstract class MixedBase extends Base {
        private static readonly COLLISION_SPEED: number = 0.3;
        private static readonly RETURN_SPEED: number = 0.3;
        private static readonly GAP: number = 4;
        private static readonly DEAD_ZONE: number = 5;

        private collidableComponents: Array<Components>;
        private targetYPos: number | null;
        private initialYPos: number;
        private isReturning: boolean;

        constructor(...args: ReadonlyArray<any>) {
            super(...args);

            this.collidableComponents = [];
            this.targetYPos = null;
            this.initialYPos = this.y;
            this.isReturning = false;
        }

        override layout(lc: LayoutContext): LayoutResult {
            const diffY = this.initialYPos - this.y;

            const layout = super.layout(lc);

            this.initialYPos = layout.y;

            layout.y -= diffY;

            return layout;
        }

        private resolveCollision(component: Components) {
            if (direction === "up") {
                this.targetYPos = component.y - this.h - MixedBase.GAP;
            } else {
                this.targetYPos = component.y + component.h + MixedBase.GAP;
            }

            this.isReturning = false;
        }

        private isColliding(component: Components): boolean {
            const { GAP } = MixedBase;

            return !(
                this.x + this.w + GAP < component.x ||
                this.x > component.x + component.w + GAP ||
                this.y + this.h + GAP < component.y ||
                this.y > component.y + component.h + GAP
            );
        }

        private filterCollidable(components: Array<Components>) {
            return components
                .filter(c => c.visible);
        }

        public addCollidableComponents(...components: Array<Components>) {
            this.collidableComponents = this.collidableComponents.concat(
                components.filter(c => !this.collidableComponents.includes(c)),
            );
        }

        override render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);

            let hasCollision = false;

            this.filterCollidable(this.collidableComponents).forEach(component => {
                if (this.isColliding(component)) {
                    this.resolveCollision(component);
                    hasCollision = true;
                }
            });

            if (!hasCollision) {
                this.targetYPos = this.initialYPos;
                this.isReturning = true;
            }

            if (this.targetYPos !== null) {
                const speed = this.isReturning
                    ? MixedBase.RETURN_SPEED
                    : MixedBase.COLLISION_SPEED;
                const deltaY = this.targetYPos - this.y;

                this.y += deltaY * speed;

                if (Math.abs(deltaY) < MixedBase.DEAD_ZONE) {
                    this.setY(this.targetYPos);
                    this.targetYPos = null;
                }
            }
        }
    }

    return MixedBase;
}