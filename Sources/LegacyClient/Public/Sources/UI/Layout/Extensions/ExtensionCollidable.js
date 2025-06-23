"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Collidable;
function Collidable(Base, direction = "up") {
    class MixedBase extends Base {
        static { this.COLLISION_SPEED = 0.3; }
        static { this.RETURN_SPEED = 0.3; }
        static { this.GAP = 4; }
        static { this.DEAD_ZONE = 5; }
        constructor(...args) {
            super(...args);
            this.collidableComponents = [];
            this.targetYPos = null;
            this.initialYPos = this.y;
            this.isReturning = false;
        }
        layout(lc) {
            const diffY = this.initialYPos - this.y;
            const layout = super.layout(lc);
            this.initialYPos = layout.y;
            layout.y -= diffY;
            return layout;
        }
        resolveCollision(component) {
            if (direction === "up") {
                this.targetYPos = component.y - this.h - MixedBase.GAP;
            }
            else {
                this.targetYPos = component.y + component.h + MixedBase.GAP;
            }
            this.isReturning = false;
        }
        isColliding(component) {
            const { GAP } = MixedBase;
            return !(this.x + this.w + GAP < component.x ||
                this.x > component.x + component.w + GAP ||
                this.y + this.h + GAP < component.y ||
                this.y > component.y + component.h + GAP);
        }
        filterCollidable(components) {
            return components
                .filter(c => c.visible);
        }
        addCollidableComponents(...components) {
            this.collidableComponents = this.collidableComponents.concat(components.filter(c => !this.collidableComponents.includes(c)));
        }
        render(ctx) {
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
