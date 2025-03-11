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
    private buckets: Map<
        number,
        Set<Node>
    >;

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
        const pair = this.pairPoint(
            Math.floor(object.x / this.cellSize),
            Math.floor(object.y / this.cellSize),
        );

        let bucket = this.buckets.get(pair);
        if (!bucket) {
            bucket = new Set();
            this.buckets.set(pair, bucket);
        }

        bucket.add(object);
    }

    /**
     * Removes the display-object from the hash.
     */
    public remove(object: Node): void {
        const pair = this.pairPoint(
            Math.floor(object.x / this.cellSize),
            Math.floor(object.y / this.cellSize),
        );

        this.buckets.get(pair)?.delete(object);
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
     * Searches for all the display-objects that intersect.
     */
    public search({ x, y }: Node, radius: number): Set<Node> {
        const result = new Set<Node>();

        const minX = Math.floor((x - radius) / this.cellSize);
        const maxX = Math.floor((x + radius) / this.cellSize);
        const minY = Math.floor((y - radius) / this.cellSize);
        const maxY = Math.floor((y + radius) / this.cellSize);

        const radiusSquared = radius * radius;

        for (let yy = minY; yy <= maxY; yy++) {
            for (let xx = minX; xx <= maxX; xx++) {
                const bucket = this.buckets.get(this.pairPoint(xx, yy));
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
        this.buckets.forEach(o => o.clear());
        this.buckets.clear();
    }

    /**
     * Pair point into one number.
     */
    private pairPoint(x: number, y: number): number {
        return x >= y ? (x * x + x + y) : (y * y + x);
    }
}