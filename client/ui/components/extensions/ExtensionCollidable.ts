import { LayoutResult } from "../../layout/Layout";
import { AllComponents, Component } from "../Component";
import { ComponentExtensionTemplate, ExtensionConstructor, Updatable, UpdateFunction } from "./Extension";

export default function ExtensionCollidable<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        private static readonly SPEED: number = 0.4;
        private static readonly GAP: number = 4;
        private static readonly DEAD_ZONE: number = 10;

        private collidableComponents: Component[];
        private targetYPos: number | null;
        private initialYPos: number;

        constructor(...args: any[]) {
            super(...args);

            this.collidableComponents = [];
            this.targetYPos = null;
            this.initialYPos = this.y;
        }

        // Override layout calculate to reset initial pos
        public override calculateLayout(
            width: number,
            height: number,
            originX: number,
            originY: number
        ): LayoutResult {
            // Moving collision always up direction
            const  diffY = this.initialYPos - this.y;

            const layout = super.calculateLayout(width, height, originX, originY);

            this.initialYPos = layout.y;

            layout.y -= diffY;

            return layout;
        }

        private resolveCollision(component: Component) {
            // Always up direction
            this.targetYPos = component.y - this.h - MixedBase.GAP;
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

            if (!hasCollision) this.targetYPos = this.initialYPos;

            if (this.targetYPos !== null) {
                this.y += (this.targetYPos - this.y) * MixedBase.SPEED;
                if (Math.abs(this.targetYPos - this.y) < MixedBase.DEAD_ZONE) {
                    this.setY(this.targetYPos);
                    this.targetYPos = null;
                }
            }
        }
    }

    return MixedBase;
}