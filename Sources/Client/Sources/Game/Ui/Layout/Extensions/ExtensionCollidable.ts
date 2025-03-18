import type { Components } from "../Components/Component";
import type { LayoutContext, LayoutResult } from "../Layout";
import type { ComponentExtensionTemplate, ExtensionConstructor } from "./Extension";

export default function Collidable<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        private static readonly COLLISION_SPEED: number = 0.4;
        private static readonly RETURN_SPEED: number = 0.2;
        private static readonly GAP: number = 4;
        private static readonly DEAD_ZONE: number = 6;

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

        // Override layout calculate to reset initial pos
        override layout(lc: LayoutContext): LayoutResult {
            // Moving collision always up direction
            const diffY = this.initialYPos - this.y;

            const layout = super.layout(lc);

            this.initialYPos = layout.y;

            layout.y -= diffY;

            return layout;
        }

        private resolveCollision(component: Components) {
            // Always up direction
            this.targetYPos = component.y - this.h - MixedBase.GAP;
            this.isReturning = false;
        }

        private isColliding(component: Components): boolean {
            const gap = MixedBase.GAP;

            return !(
                this.x + this.w + gap < component.x ||
                this.x > component.x + component.w + gap ||
                this.y + this.h + gap < component.y ||
                this.y > component.y + component.h + gap
            );
        }

        private filterCollidable(components: Array<Components>) {
            return components
                .filter(c => c.visible);
        }

        public addCollidableComponents(components: Array<Components>) {
            this.collidableComponents = this.collidableComponents.concat(
                components.filter(c => !this.collidableComponents.includes(c)),
            );
        }

        override get update(): ComponentExtensionTemplate["update"] {
            return (): void => {
                // Call parent extension update(), so its possible to nest the extension
                super.update?.();

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
            };
        }
    }

    return MixedBase;
}