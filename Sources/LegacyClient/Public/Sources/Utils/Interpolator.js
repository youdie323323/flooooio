"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolate = interpolate;
const Application_1 = require("../../../Application");
const EasingFunctions_1 = __importDefault(require("./EasingFunctions"));
function interpolate(start, end, duration) {
    return start + (end - start) * Math.min(1, Application_1.deltaTime / duration);
}
class Interpolator {
    get isInterpolating() {
        if (!this.interpolation.startTime)
            return false;
        const elapsedTime = Date.now() - this.interpolation.startTime;
        return elapsedTime <= this.options.duration;
    }
    constructor(options = {}) {
        this.oldValue = null;
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
            this.value = this.options.initValue;
        }
    }
    set value(newValue) {
        if (typeof this.oldValue === "number") {
            if (this.currentValue === newValue)
                return;
            this.oldValue = this.currentValue;
        }
        else {
            this.oldValue = newValue;
        }
        this.currentValue = newValue;
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
    handleRangeWrapping() {
        if (typeof this.options.range !== "number")
            return;
        const valueDifference = this.interpolation.endValue - this.interpolation.startValue;
        const halfRange = this.options.range / 2;
        if (Math.abs(valueDifference) >= halfRange) {
            if (this.interpolation.endValue <= halfRange) {
                if (this.interpolation.startValue >= 0) {
                    this.interpolation.endValue += this.options.range;
                }
            }
            else if (this.interpolation.startValue >= 0) {
                this.interpolation.startValue += this.options.range;
            }
        }
    }
    getValue() {
        return this.currentValue;
    }
    getOldValue() {
        return this.oldValue;
    }
    getInterpolatedValue() {
        return this.calculateInterpolatedValue();
    }
    calculateInterpolatedValue() {
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
        let interpolatedValue = EasingFunctions_1.default[this.options.easingType](deltaT, this.interpolation.startValue, valueChange, this.options.duration);
        if (typeof this.options.range === "number") {
            interpolatedValue %= this.options.range;
        }
        return interpolatedValue;
    }
}
exports.default = Interpolator;
