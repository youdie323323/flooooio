import { Component } from "../Component";
import { ComponentExtensionTemplate, ExtensionConstructor, Updatable, UpdateFunction } from "./Extension";

type NullableAll<T extends readonly any[]> = {
    [K in keyof T]: T[K] | null;
};

export default function ExtensionCollidable<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        private static readonly SPEED: number = 0.4;
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
            viewportWidth: number,
            viewportHeight: number,
            originX: number = 0,
            originY: number = 0
        ): void {
            super.calculateLayout(viewportWidth, viewportHeight, originX, originY);
            this.initialPos = [this.x, this.y];
        }

        private isColliding(component: Component): boolean {
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
                    this.targetPos[0] = component.x - this.w;
                } else {
                    this.targetPos[0] = component.x + component.w;
                }
                this.targetPos[1] = null;
            } else {
                if (this.y < component.y) {
                    this.targetPos[1] = component.y - this.h;
                } else {
                    this.targetPos[1] = component.y + component.h;
                }
                this.targetPos[0] = null;
            }
        }

        private shouldReturn(): boolean {
            return this.filterCollidable(this.collidableComponents).every(component => {
                const futureX = this.initialPos[0];
                const futureY = this.initialPos[1];
                return !(
                    futureX + this.w < component.x ||
                    futureX > component.x + component.w ||
                    futureY + this.h < component.y ||
                    futureY > component.y + component.h
                );
            });
        }

        private filterCollidable(components: Component[]) {
            return components.filter(c => c.visible);
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

            if (!hasCollision && this.shouldReturn()) {
                this.targetPos[0] = this.initialPos[0];
                this.targetPos[1] = this.initialPos[1];
            }

            if (this.targetPos[0] !== null) {
                this.x += (this.targetPos[0] - this.x) * MixedBase.SPEED;
                if (Math.abs(this.targetPos[0] - this.x) < 0.1) {
                    this.setX(this.targetPos[0]);
                    this.targetPos[0] = null;
                }
            }

            if (this.targetPos[1] !== null) {
                this.y += (this.targetPos[1] - this.y) * MixedBase.SPEED;
                if (Math.abs(this.targetPos[1] - this.y) < 0.1) {
                    this.setY(this.targetPos[1]);
                    this.targetPos[1] = null;
                }
            }
        }
    }

    return MixedBase;
}