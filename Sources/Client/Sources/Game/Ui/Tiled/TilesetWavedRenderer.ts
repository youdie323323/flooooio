import TilesetRenderer, { type RenderConfig } from "./TilesetRenderer";

export default class TilesetWavedRenderer {
    // Dont use static to make all instance different step
    private readonly stepPerRender: number = Math.random() / 100;
    private tilesetRenderer: TilesetRenderer = new TilesetRenderer();

    private backgroundX: number = 0;
    private backgroundY: number = 0;
    private backgroundWaveStep: number = 0;

    public render(config: RenderConfig) {
        this.backgroundX += 0.4;
        this.backgroundY += Math.sin(this.backgroundWaveStep) * 0.4;
        this.backgroundWaveStep += this.stepPerRender;

        this.tilesetRenderer.renderMapMenu({
            ...config,
            translateX: this.backgroundX,
            translateY: this.backgroundY,
        });
    }
}