import { LayoutResult } from "../../layout/Layout";
import { Component } from "../Component";
import { ComponentExtensionTemplate, ExtensionConstructor, Updatable, UpdateFunction } from "./Extension";

type NullableAll<T extends readonly any[]> = {
    [K in keyof T]: T[K] | null;
};

export default function ExtensionCollidable<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        private static readonly SPEED: number = 0.3;
        private static readonly GAP: number = 4;

        private collidableComponents: Component[];
        private targetPos: NullableAll<[number, number]>;
        private initialPos: [number, number];

        constructor(...args: any[]) {
            super(...args);

            this.collidableComponents = [];
            this.targetPos = [null, null];
            this.initialPos = [this.x, this.y];
        }

        // Override layout calculate to reset initial pos
        public override calculateLayout(
            width: number,
            height: number,
            originX: number,
            originY: number
        ): LayoutResult {
            const layout = super.calculateLayout(width, height, originX, originY);

            this.initialPos = [layout.x, layout.y];

            // Maybe need to set layout to previous layout x,y position because looks ugly on resize

            return layout;
        }

        private resolveCollision(component: Component) {
            const gap = MixedBase.GAP;
        
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
                    this.targetPos[0] = component.x - this.w - gap;
                } else {
                    this.targetPos[0] = component.x + component.w + gap;
                }
                this.targetPos[1] = null;
            } else {
                this.targetPos[1] = component.y - this.h - gap;
                this.targetPos[0] = null;
            }
        }

        private isColliding(component: Component): boolean {
            const gap = MixedBase.GAP;
            return !(
                this.x + this.w + gap < component.x ||
                this.x > component.x + component.w + gap ||
                this.y + this.h + gap < component.y ||
                this.y > component.y + component.h + gap
            );
        }

        private filterCollidable(components: Component[]) {
            return components
                .filter(c => c.visible);
        }

        public addCollidableComponents(components: Component[]) {
            this.collidableComponents = this.collidableComponents.concat(
                components.filter(c => !this.collidableComponents.includes(c))
            );
        }

        public update: UpdateFunction = () => {
            if (typeof super.update === 'function') {
                super.update();
            }

            let hasCollision = false;

            this.filterCollidable(this.collidableComponents).forEach(component => {
                if (this.isColliding(component)) {
                    this.resolveCollision(component);
                    hasCollision = true;
                }
            });

            if (!hasCollision) {
                this.targetPos[0] = this.initialPos[0];
                this.targetPos[1] = this.initialPos[1];
            }

            const DEAD_ZONE = 10;

            if (this.targetPos[0] !== null) {
                this.x += (this.targetPos[0] - this.x) * MixedBase.SPEED;
                if (Math.abs(this.targetPos[0] - this.x) < DEAD_ZONE) {
                    this.setX(this.targetPos[0]);
                    this.targetPos[0] = null;
                }
            }

            if (this.targetPos[1] !== null) {
                this.y += (this.targetPos[1] - this.y) * MixedBase.SPEED;
                if (Math.abs(this.targetPos[1] - this.y) < DEAD_ZONE) {
                    this.setY(this.targetPos[1]);
                    this.targetPos[1] = null;
                }
            }
        }
    }

    return MixedBase;
}