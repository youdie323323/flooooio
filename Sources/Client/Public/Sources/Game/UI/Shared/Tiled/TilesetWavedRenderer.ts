import TilesetRenderer, { type RenderingConfig } from "./TilesetRenderer";

export default class TilesetWavedRenderer {
    // Dont use static to make all instance different step
    private readonly stepPerRender: number = Math.random() / 200;
    private tilesetRenderer: TilesetRenderer = new TilesetRenderer();

    private backgroundX: number = 0;
    private backgroundY: number = 0;
    private backgroundWaveStep: number = 0;

    public render(config: RenderingConfig) {
        this.backgroundX += 0.4;
        this.backgroundY += Math.sin(this.backgroundWaveStep) * 0.4;
        this.backgroundWaveStep += this.stepPerRender;

        this.tilesetRenderer.renderTitleTileset({
            ...config,
            translateX: this.backgroundX,
            translateY: this.backgroundY,
        });
    }
}