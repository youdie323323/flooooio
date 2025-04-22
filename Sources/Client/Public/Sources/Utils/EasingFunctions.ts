interface EasingFunction {
    (elapsed: number, start: number, change: number, duration: number, overshoot?: number): number;
}

interface EasingFunctions {
    [key: string]: EasingFunction;
}

const TAU = Math.PI * 2;
const OVERSHOOT = 3 / 40 * (3 + Math.cbrt(1187 - Math.sqrt(110) * 80) + Math.cbrt(1187 + Math.sqrt(110) * 80));

class Easing {
    private static bounceOut(t: number, b: number, c: number, d: number): number {
        const ratio = t / d;
        
        if (ratio < 1 / 2.75) {
            return c * (7.5625 * ratio * ratio) + b;
        }

        if (ratio < 2 / 2.75) {
            const adjusted = ratio - 1.5 / 2.75;

            return c * (7.5625 * adjusted * adjusted + 0.75) + b;
        }

        if (ratio < 2.5 / 2.75) {
            const adjusted = ratio - 2.25 / 2.75;

            return c * (7.5625 * adjusted * adjusted + 0.9375) + b;
        }

        const adjusted = ratio - 2.625 / 2.75;

        return c * (7.5625 * adjusted * adjusted + 0.984375) + b;
    }

    private static elastic(elapsed: number, start: number, change: number, duration: number, amplitude: number, period: number): number {
        if (elapsed === 0) return start;
        if ((elapsed /= duration) === 1) return start + change;

        period = period || duration * 0.3;
        let s = period / TAU * Math.asin(change / amplitude);

        if (amplitude < Math.abs(change)) {
            amplitude = change;
            s = period / 4;
        }

        return amplitude * Math.pow(2, -10 * elapsed) *
            Math.sin((elapsed * duration - s) * TAU / period) + change + start;
    }

    public static readonly functions: EasingFunctions = {
        linear: (t, b, c, d) => c * (t / d) + b,

        // Quadratic
        easeInQuad: (t, b, c, d) => c * (t /= d) * t + b,
        easeOutQuad: (t, b, c, d) => -c * (t /= d) * (t - 2) + b,
        easeInOutQuad: (t, b, c, d) => {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;

            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },

        // Cubic
        easeInCubic: (t, b, c, d) => c * (t /= d) * t * t + b,
        easeOutCubic: (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b,
        easeInOutCubic: (t, b, c, d) => {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;

            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },

        // Quartic
        easeInQuart: (t, b, c, d) => c * (t /= d) * t * t * t + b,
        easeOutQuart: (t, b, c, d) => -c * ((t = t / d - 1) * t * t * t - 1) + b,
        easeInOutQuart: (t, b, c, d) => {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;

            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },

        // Quintic
        easeInQuint: (t, b, c, d) => c * (t /= d) * t * t * t * t + b,
        easeOutQuint: (t, b, c, d) => c * ((t = t / d - 1) * t * t * t * t + 1) + b,
        easeInOutQuint: (t, b, c, d) => {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;

            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },

        // Sinusoidal
        easeInSine: (t, b, c, d) => -c * Math.cos(t / d * (Math.PI / 2)) + c + b,
        easeOutSine: (t, b, c, d) => c * Math.sin(t / d * (Math.PI / 2)) + b,
        easeInOutSine: (t, b, c, d) => -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b,

        // Exponential
        easeInExpo: (t, b, c, d) => t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b,
        easeOutExpo: (t, b, c, d) => t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b,
        easeInOutExpo: (t, b, c, d) => {
            if (t === 0) return b;
            if (t === d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;

            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },

        // Circular
        easeInCirc: (t, b, c, d) => -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b,
        easeOutCirc: (t, b, c, d) => c * Math.sqrt(1 - (t = t / d - 1) * t) + b,
        easeInOutCirc: (t, b, c, d) => {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;

            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },

        // Back
        easeInBack: (t, b, c, d, s = OVERSHOOT) => c * (t /= d) * t * ((s + 1) * t - s) + b,
        easeOutBack: (t, b, c, d, s = OVERSHOOT) => c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b,
        easeInOutBack: (t, b, c, d, s = OVERSHOOT) => {
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;

            return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },

        // Bounce
        easeInBounce: (t, b, c, d) => c - Easing.bounceOut(d - t, 0, c, d) + b,
        easeOutBounce: Easing.bounceOut,
        easeInOutBounce: (t, b, c, d) => {
            if (t < d / 2) return Easing.functions.easeInBounce(t * 2, 0, c, d) * 0.5 + b;

            return Easing.functions.easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        },

        // Elastic
        easeOutElastic: (t, b, c, d) => Easing.elastic(t, b, c, d, c, d * 0.3),
        easeInElastic: (t, b, c, d) => {
            return -(c * Math.pow(2, 10 * (t / d - 1)) * Math.sin((t * d - 0.3) * TAU / (d * 0.3)));
        },
        easeInOutElastic: (t, b, c, d) => {
            if (t < d / 2) {
                return Easing.functions.easeInElastic(t * 2, b, c / 2, d);
            }

            return Easing.functions.easeOutElastic(t * 2 - d, b + c / 2, c / 2, d);
        },
    } as const satisfies EasingFunctions;
}

export default Easing.functions;