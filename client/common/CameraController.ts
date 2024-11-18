import Interpolator from "./Interpolator";
export default class CameraController extends EventTarget {
    _zoom: Interpolator;
    canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement) {
        super();
        this._zoom = new Interpolator({
            easingType: "easeOutExpo",
            duration: 500,
            initValue: 1
        });
        this.canvas = canvas;
        this.handleZoom();
    }

    handleZoom() {
        function limitZoom(zoom: number) {
            if (zoom < 0.0125) {
                zoom = 0.0125;
            }
            if (zoom > 1) {
                zoom = 1;
            }
            return zoom;
        }
        
        {
            this.canvas.addEventListener("wheel", e => {
                const N = e.deltaY * -0.0005 * (this.zoom * 4);
                const E = this.zoom + N;
                this.zoom = limitZoom(E);
            });
        }
    }

    set zoom(o) {
        this._zoom.setValue(o);
    }

    get zoom() {
        return this._zoom.getInterpolatedValue();
    }

    resetCamera() {
        this.zoom = 0.0125;
    }
}