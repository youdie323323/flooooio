import UIMobIcon from "./UIMobIcon";

export default class UIDraggableMobIcon extends UIMobIcon {
    private isDragging: boolean = false;

    constructor(...args: ConstructorParameters<typeof UIMobIcon>) {
        super(...args);

        this.on("onDown", () => {
            this.isDragging = true;
        });

        this.on("onUp", () => {
            this.isDragging = false;
        });

        this.on("onMouseMove", () => {
            if (!this.isDragging) return;
        });
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (this.isDragging) {
            ctx.scale(1.3, 1.3);
            
            console.log(this.x, this.y);
        }

        super.render(ctx);
    }
}