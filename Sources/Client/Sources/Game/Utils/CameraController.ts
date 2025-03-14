import Interpolator from "./Interpolator";

export default class CameraController {
    private _zoom: Interpolator;

    constructor(public canvas: HTMLCanvasElement) {
        this._zoom = new Interpolator({
            easingType: "easeOutExpo",
            duration: 500,
            initValue: 1,
        });
    }

    public set zoom(o) {
        this._zoom.setValue(o);
    }

    public get zoom() {
        return this._zoom.getInterpolatedValue();
    }
}