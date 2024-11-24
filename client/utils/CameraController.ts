import Interpolator from "./Interpolator";
export default class CameraController {
    _zoom: Interpolator;

    constructor(public canvas: HTMLCanvasElement) {
        this._zoom = new Interpolator({
            easingType: "easeOutExpo",
            duration: 500,
            initValue: 1,
        });
    }

    set zoom(o) {
        this._zoom.setValue(o);
    }

    get zoom() {
        return this._zoom.getInterpolatedValue();
    }
}