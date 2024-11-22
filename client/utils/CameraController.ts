import Interpolator from "./Interpolator";
export default class CameraController {
    _zoom: Interpolator;
    canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement) {
        this._zoom = new Interpolator({
            easingType: "easeOutExpo",
            duration: 500,
            initValue: 0.6
        });
        this.canvas = canvas;
    }

    set zoom(o) {
        this._zoom.setValue(o);
    }

    get zoom() {
        return this._zoom.getInterpolatedValue();
    }
}