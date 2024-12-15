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
 * The spatial hash divides the world space into square "cell" or "buckets". Each display-object added is
 * tracked by which cells they intersect with.
 */
export default class SpatialHash<Node extends PointLike & object> {
    cellSize: number;
    buckets: Map<string, Set<Node>>;

    /**
     * @param cellSize - the size of the 2D cells in the hash.
     */
    constructor(cellSize = 256) {
        this.cellSize = cellSize;
        this.buckets = new Map();
    }

    /**
     * Puts the display-object into the hash.
     *
     * @param bounds - the bounds of the object. This is automatically calculated using {@link getBounds}.
     */
    put(object: Node): this {
        const hash = this.hashPoint(object.x, object.y);
        let bucket = this.buckets.get(hash);

        if (!bucket) {
            bucket = new Set();
            this.buckets.set(hash, bucket);
        }

        bucket.add(object);
        return this;
    }

    /**
     * Removes the display-object from the hash.
     */
    remove(object: Node): void {
        const hash = this.hashPoint(object.x, object.y);
        const bucket = this.buckets.get(hash);
        if (bucket) {
            bucket.delete(object);
        }
    }

    /**
     * Updates this spatial hash to account for any changes in the display-object's bounds. This is equivalent
     * to removing & then adding the object again.
     */
    update(object: Node): void {
        this.remove(object);
        this.put(object);
    }

    /**
     * Searches for all the display-objects that intersect with the given rectangle bounds.
     */
    search(x: number, y: number, radius = this.cellSize): Set<Node> {
        const searchResult = new Set<Node>();
        const radiusCells = Math.ceil(radius / this.cellSize);

        for (let dy = -radiusCells; dy <= radiusCells; dy++) {
            for (let dx = -radiusCells; dx <= radiusCells; dx++) {
                const searchX = x + (dx * this.cellSize);
                const searchY = y + (dy * this.cellSize);
                const hash = this.hashPoint(searchX, searchY);
                const bucket = this.buckets.get(hash);

                if (bucket) {
                    bucket.forEach(obj => {
                        const distance = Math.sqrt(
                            Math.pow(obj.x - x, 2) + 
                            Math.pow(obj.y - y, 2)
                        );
                        if (distance <= radius) {
                            searchResult.add(obj);
                        }
                    });
                }
            }
        }

        return searchResult;
    }

    /**
     * Reset and clear the spatial hash.
     */
    reset(): void {
        this.buckets.clear();
    }

    private hashPoint(x: number, y: number): string {
        return `${Math.floor(x / this.cellSize)}|${Math.floor(y / this.cellSize)}`;
    }
}