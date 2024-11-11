import { deltaTime } from "../main";
import EASING_FUNCTIONS from "./easingFunctions";

export function interpolate(start: number, end: number, duration: number): number {
    return start + (end - start) * Math.min(1, deltaTime / duration);
}

const defaultOption = {
    easingType: "easeLinear",
    duration: 1000,
    initValue: null,
    range: null
};
const _defaultOption = defaultOption;
export default class Interpolator {
    interpolation: any;
    options: any;
    oldValue: null;
    lastUpdatedAt: number | null;
    value: any;
    get isInterpolating() {
        const l = new Date().getTime() - this.interpolation.startTime;
        return l <= this.options.duration;
    }
    constructor(defaultOptionOverride = {}) {
        this.oldValue = null;
        this.lastUpdatedAt = null;
        const interpolation = {
            startTime: null,
            startValue: NaN,
            endValue: NaN
        };
        this.interpolation = interpolation;
        const options = {
            ..._defaultOption,
            ...defaultOptionOverride
        };
        this.options = options;
        if (typeof this.options.initValue === "number") {
            this.setValue(this.options.initValue);
        }
    }
    setValue(o: any) {
        if (typeof this.oldValue === "number") {
            if (this.value === o) {
                return;
            }
            this.oldValue = this.value;
        } else {
            this.oldValue = o;
        }
        this.value = o;
        this.lastUpdatedAt = new Date().getTime();
        const G = this.getInterpolatedValue();
        this.interpolation.startValue = this.oldValue;
        if (typeof this.interpolation.startTime === "number") {
            const W = new Date().getTime() - this.interpolation.startTime;
            if (W < this.options.duration) {
                this.interpolation.startValue = G;
            }
        }
        this.interpolation.endValue = this.value;
        this.interpolation.startTime = new Date().getTime();
        if (typeof this.options.range === "number") {
            const L = this.interpolation.endValue - this.interpolation.startValue;
            if (Math.abs(L) >= this.options.range / 2) {
                if (this.interpolation.endValue <= this.options.range / 2) {
                    if (this.interpolation.startValue >= 0) {
                        this.interpolation.endValue += this.options.range;
                    }
                } else if (this.interpolation.startValue >= 0) {
                    this.interpolation.startValue += this.options.range;
                }
            }
        }
    }
    getValue() {
        return this.value;
    }
    getOldValue() {
        return this.oldValue;
    }
    getInterpolatedValue() {
        return this.calcInterpolatedValue();
    }
    calcInterpolatedValue() {
        if (typeof this.oldValue !== "number") {
            throw new TypeError("Cannot calculate interpolated value");
        }
        if (this.options.duration === 0) {
            return this.value;
        }
        let o = new Date().getTime() - this.interpolation.startTime;
        o = Math.max(o, 0);
        o = Math.min(o, this.options.duration);
        const l = this.interpolation.endValue - this.interpolation.startValue;
        const easingFunction = EASING_FUNCTIONS[this.options.easingType];
        let c = easingFunction(o, this.interpolation.startValue, l, this.options.duration);
        if (typeof this.options.range === "number") {
            c %= this.options.range;
        }
        return c;
    }
}