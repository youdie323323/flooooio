import { deltaTime } from "../../../../Main";
import EASING_FUNCTIONS from "./EasingFunctions";

interface InterpolationState {
    startTime: number | null;
    startValue: number;
    endValue: number;
}

interface InterpolatorOptions {
    easingType: keyof typeof EASING_FUNCTIONS;
    duration: number;
    initValue: number | null;
    range: number | null;
}

export function interpolate(start: number, end: number, duration: number): number {
    return start + (end - start) * Math.min(1, deltaTime / duration);
}

export default class Interpolator {
    private interpolation: InterpolationState;
    private options: InterpolatorOptions;
    private oldValue: number | null;
    private lastUpdatedAt: number | null;
    private currentValue: number;

    public get isInterpolating(): boolean {
        if (!this.interpolation.startTime) return false;
        const elapsedTime = Date.now() - this.interpolation.startTime;

        return elapsedTime <= this.options.duration;
    }

    constructor(options: Partial<InterpolatorOptions> = {}) {
        this.oldValue = null;
        this.lastUpdatedAt = null;
        this.currentValue = 0;

        this.interpolation = {
            startTime: null,
            startValue: NaN,
            endValue: NaN,
        };

        this.options = {
            easingType: "easeLinear",
            duration: 1000,
            initValue: null,
            range: null,
            ...options,
        };

        if (typeof this.options.initValue === "number") {
            this.setValue(this.options.initValue);
        }
    }

    public setValue(newValue: number): void {
        if (typeof this.oldValue === "number") {
            if (this.currentValue === newValue) return;
            this.oldValue = this.currentValue;
        } else {
            this.oldValue = newValue;
        }

        this.currentValue = newValue;
        this.lastUpdatedAt = Date.now();

        const interpolatedValue = this.getInterpolatedValue();
        this.interpolation.startValue = this.oldValue;

        if (this.interpolation.startTime) {
            const elapsedTime = Date.now() - this.interpolation.startTime;
            if (elapsedTime < this.options.duration) {
                this.interpolation.startValue = interpolatedValue;
            }
        }

        this.interpolation.endValue = this.currentValue;
        this.interpolation.startTime = Date.now();

        this.handleRangeWrapping();
    }

    private handleRangeWrapping(): void {
        if (typeof this.options.range !== "number") return;

        const valueDifference = this.interpolation.endValue - this.interpolation.startValue;
        const halfRange = this.options.range / 2;

        if (Math.abs(valueDifference) >= halfRange) {
            if (this.interpolation.endValue <= halfRange) {
                if (this.interpolation.startValue >= 0) {
                    this.interpolation.endValue += this.options.range;
                }
            } else if (this.interpolation.startValue >= 0) {
                this.interpolation.startValue += this.options.range;
            }
        }
    }

    public getValue(): number {
        return this.currentValue;
    }

    public getOldValue(): number | null {
        return this.oldValue;
    }

    public getInterpolatedValue(): number {
        return this.calculateInterpolatedValue();
    }

    private calculateInterpolatedValue(): number {
        if (typeof this.oldValue !== "number") {
            throw new TypeError("Cannot calculate interpolated value: Old value is not set");
        }

        if (this.options.duration === 0) {
            return this.currentValue;
        }

        if (!this.interpolation.startTime) {
            return this.currentValue;
        }

        let deltaT = Date.now() - this.interpolation.startTime;
        deltaT = Math.max(0, Math.min(deltaT, this.options.duration));

        const valueChange = this.interpolation.endValue - this.interpolation.startValue;
        let interpolatedValue = EASING_FUNCTIONS[this.options.easingType](
            deltaT,
            this.interpolation.startValue,
            valueChange,
            this.options.duration,
        );

        if (typeof this.options.range === "number") {
            interpolatedValue %= this.options.range;
        }

        return interpolatedValue;
    }
}