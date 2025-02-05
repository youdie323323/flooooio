export interface Point {
    x: number;
    y: number;
}

export interface Circle {
    x: number;
    y: number;
    r: number;
}

export interface Ellipse {
    a: number;
    b: number;
    x: number;
    y: number;
    theta: number;
}

export interface Evolute extends Point {
    r: number;
}

export default class EllipseCollider2D {
    private static shiftAndRotate(disp: Point, angle: number, p0: Point): Point {
        // Shift a point p0, then rotate it
        // return the resulting point p1
        const x = p0.x + disp.x;
        const y = p0.y + disp.y;
        return {
            x: Math.cos(angle) * x - Math.sin(angle) * y,
            y: Math.sin(angle) * x + Math.cos(angle) * y
        };
    }

    private static rotateAndShift(disp: Point, angle: number, p0: Point): Point {
        // Rotate a point (x0, y0), then shift it
        // return the resulting point p1
        const x = p0.x;
        const y = p0.y;
        return {
            x: disp.x + Math.cos(angle) * x - Math.sin(angle) * y,
            y: disp.y + Math.sin(angle) * x + Math.cos(angle) * y
        };
    }

    private static computeEvolute(e: Ellipse, t: number): Evolute {
        // Compute center of evolute and radius of fitted circle
        const { a, b } = e;
        const x = a * (1 - Math.pow(b / a, 2)) * Math.pow(Math.cos(t), 3);
        const y = b * (1 - Math.pow(a / b, 2)) * Math.pow(Math.sin(t), 3);
        const num = Math.pow(Math.pow(a * Math.sin(t), 2) + Math.pow(b * Math.cos(t), 2), 1.5);
        const den = a * b;
        return {
            x,
            y,
            r: num / den
        };
    }

    private static findNormalT(e: Ellipse, p: Point): number {
        // Compute parameter t, with which a point (a*cos(t), b*sin(t)),
        // and the target point p gives a normal vector to the given ellipse
        let t = 0.25 * Math.PI;
    
        for (; ; ) {
            const xe = e.a * Math.cos(t);
            const ye = e.b * Math.sin(t);
            const evolute = EllipseCollider2D.computeEvolute(e, t);
            const dxe = xe - evolute.x;
            const dye = ye - evolute.y;
            const dxp = Math.abs(p.x) - evolute.x;
            const dyp = Math.abs(p.y) - evolute.y;
            const norme = Math.hypot(dxe, dye);
            const normp = Math.hypot(dxp, dyp);
            const dc = norme * Math.asin((dxe * dyp - dye * dxp) / (norme * normp));
            const dt = dc / Math.sqrt(e.a ** 2 + e.b ** 2 - xe ** 2 - ye ** 2);
            t += dt;
            // Limit in the first quadrant
            t = Math.min(t, 0.5 * Math.PI);
            t = Math.max(t, 0);
            if (Math.abs(dt) < 1e-8) {
                break;
            }
        }
    
        // Apply result to the other quadrants
        if (p.x < 0) {
            t = -t + Math.PI;
        }
        if (p.y < 0) {
            t = -t;
        }
    
        return t;
    }

    private static fitCircles(e0: Ellipse, e1: Ellipse): [Circle, Circle] {
        // Core function, fitting two circles
        let p0: Point = { x: e0.x, y: e0.y };
        let p1: Point = { x: e1.x, y: e1.y };
        let evolute0_: Evolute;
        let evolute1_: Evolute;
    
        for (let n = 0; n < 10; n++) {
            // Forward coordinate transform
            const disp0: Point = { x: -e0.x, y: -e0.y };
            const angle0 = -e0.theta;
            const p1_ = EllipseCollider2D.shiftAndRotate(disp0, angle0, p1);
    
            // Forward coordinate transform
            const disp1: Point = { x: -e1.x, y: -e1.y };
            const angle1 = -e1.theta;
            const p0_ = EllipseCollider2D.shiftAndRotate(disp1, angle1, p0);
    
            // Find optimum parameter t for each ellipse
            const e0_t = EllipseCollider2D.findNormalT(e0, p1_);
            const e1_t = EllipseCollider2D.findNormalT(e1, p0_);
    
            // Compute evolutes and their radii
            evolute0_ = EllipseCollider2D.computeEvolute(e0, e0_t);
            evolute1_ = EllipseCollider2D.computeEvolute(e1, e1_t);
    
            // Backward coordinate transform
            const disp0b: Point = { x: +e0.x, y: +e0.y };
            const angle0b = +e0.theta;
            p0 = EllipseCollider2D.rotateAndShift(disp0b, angle0b, evolute0_);
    
            // Backward coordinate transform
            const disp1b: Point = { x: +e1.x, y: +e1.y };
            const angle1b = +e1.theta;
            p1 = EllipseCollider2D.rotateAndShift(disp1b, angle1b, evolute1_);
        }
    
        const circle0: Circle = { x: p0.x, y: p0.y, r: evolute0_.r };
        const circle1: Circle = { x: p1.x, y: p1.y, r: evolute1_.r };
    
        return [circle0, circle1];
    }

    public static computeDelta(e0: Ellipse, e1: Ellipse): number {
        // Get the fitted circles for both ellipses
        const [circle0, circle1] = EllipseCollider2D.fitCircles(e0, e1);
    
        // Calculate distance between circle centers
        const dx = circle1.x - circle0.x;
        const dy = circle1.y - circle0.y;
        const distance = Math.hypot(dx, dy);
    
        // Calculate delta (overlap amount)
        // δ = r0 + r1 - d
        // Positive delta means collision/overlap
        // Negative delta means no collision/separation
        const delta = circle0.r + circle1.r - distance;
    
        return delta;
    }

    public static isColliding(delta: number): boolean {
        return delta > 0;
    }
}