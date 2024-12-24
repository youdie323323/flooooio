interface PointLike {
    x: number;
    y: number;
}

/**
 * 2D spatial hashing implementation that provides a mechanism to quickly searching objects intersecting
 * a rectangle.
 * 
 * @remarks
 *
 * The spatial hash divides the world space into square cell. Each display-object added is
 * tracked by which cells they intersect with.
 */
export default class SpatialHash<Node extends PointLike & object> {
    private buckets: Map<number, Set<Node>>;

    /**
     * @param cellSize - the size of the 2D cells in the hash.
     */
    constructor(private readonly cellSize = 256) {
        this.buckets = new Map();
    }

    /**
     * Puts the display-object into the hash.
     */
    public put(object: Node): void {
        const hash = this.hashPoint(object.x, object.y);
        let bucket = this.buckets.get(hash);

        if (!bucket) {
            bucket = new Set();
            this.buckets.set(hash, bucket);
        }

        bucket.add(object);
    }

    /**
     * Removes the display-object from the hash.
     */
    public remove(object: Node): void {
        const hash = this.hashPoint(object.x, object.y);
        this.buckets.get(hash)?.delete(object);
    }

    /**
     * Updates this spatial hash to account for any changes in the display-object's bounds. This is equivalent
     * to removing & then adding the object again.
     */
    public update(object: Node): void {
        this.remove(object);
        this.put(object);
    }

    /**
     * Searches for all the display-objects that intersect with the given parameter NodeLike.
     */
    public search(x: number, y: number, radius: number): Set<Node> {
        const result = new Set<Node>();
        const radiusCells = Math.ceil(radius / this.cellSize);
        const radiusSquared = radius * radius;

        for (let dy = -radiusCells; dy <= radiusCells; dy++) {
            for (let dx = -radiusCells; dx <= radiusCells; dx++) {
                const bucket = this.buckets.get(
                    this.hashPoint(
                        x + (dx * this.cellSize),
                        y + (dy * this.cellSize)
                    )
                );

                if (bucket) {
                    bucket.forEach(obj => {
                        const dx = obj.x - x;
                        const dy = obj.y - y;
                        if ((dx * dx + dy * dy) <= radiusSquared) result.add(obj);
                    });
                }
            }
        }

        return result;
    }

    /**
     * Reset and clear the spatial hash.
     */
    public reset(): void {
        this.buckets.clear();
    }

    private hashPoint(x: number, y: number): number {
        // Szudzik's function for unique 2D to 1D mapping
        const xx = Math.floor(x / this.cellSize);
        const yy = Math.floor(y / this.cellSize);
        return xx >= yy ? (xx * xx + xx + yy) : (yy * yy + xx);
    }
}