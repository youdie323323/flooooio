import { Component } from "../Component";
import { ComponentExtensionTemplate, ExtensionConstructor, Updatable, UpdateFunction } from "./Extension";

type NullableAll<T extends readonly any[]> = {
    [K in keyof T]: T[K] | null;
};

export default function ExtensionCollidable<T extends ExtensionConstructor>(Base: T) {
    return class CollidablePrivateAccess extends Base implements ComponentExtensionTemplate {
        private static readonly SPEED: number = 0.4;
        private collidableComponents: Component[];
        private targetPosition: NullableAll<[number, number]>;
        private initialPosition: [number, number];

        constructor(...args: any[]) {
            super(...args);

            this.collidableComponents = [];
            this.targetPosition = [null, null];
            this.initialPosition = [this.x, this.y];
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
                    this.targetPosition[0] = component.x - this.w;
                } else {
                    this.targetPosition[0] = component.x + component.w;
                }
                this.targetPosition[1] = null;
            } else {
                if (this.y < component.y) {
                    this.targetPosition[1] = component.y - this.h;
                } else {
                    this.targetPosition[1] = component.y + component.h;
                }
                this.targetPosition[0] = null;
            }
        }

        private shouldReturn(): boolean {
            return this.filterCollidable(this.collidableComponents).every(component => {
                const futureX = this.initialPosition[0];
                const futureY = this.initialPosition[1];
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
                this.targetPosition[0] = this.initialPosition[0];
                this.targetPosition[1] = this.initialPosition[1];
            }

            if (this.targetPosition[0] !== null) {
                this.x += (this.targetPosition[0] - this.x) * CollidablePrivateAccess.SPEED;
                if (Math.abs(this.targetPosition[0] - this.x) < 0.1) {
                    this.setX(this.targetPosition[0]);
                    this.targetPosition[0] = null;
                }
            }

            if (this.targetPosition[1] !== null) {
                this.y += (this.targetPosition[1] - this.y) * CollidablePrivateAccess.SPEED;
                if (Math.abs(this.targetPosition[1] - this.y) < 0.1) {
                    this.setY(this.targetPosition[1]);
                    this.targetPosition[1] = null;
                }
            }
        }
    };
}