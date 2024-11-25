interface Rectangle {
    // Center
    x: number;
    y: number;
    // Size
    w: number;
    h: number;
}

interface Point<T> {
    x: number;
    y: number;
    unit: T;
}

export default class QuadTree<T> {
    private static readonly MAX_DEPTH = 10;
    private static readonly MIN_SIZE = 1;

    public boundary: Rectangle;
    private capacity: number;
    private points: Point<T>[] = [];
    private divided: boolean = false;

    private northWest: QuadTree<T> | null = null;
    private northEast: QuadTree<T> | null = null;
    private southWest: QuadTree<T> | null = null;
    private southEast: QuadTree<T> | null = null;

    private depth: number;

    constructor(boundary: Rectangle, capacity: number = 4, depth: number = 0) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.depth = depth;
    }

    public insert(point: Point<T>): boolean {
        if (!this.containsPoint(point.x, point.y)) {
            return false;
        }

        if (this.points.length < this.capacity && !this.divided) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            if (this.depth >= QuadTree.MAX_DEPTH || this.boundary.w <= QuadTree.MIN_SIZE || this.boundary.h <= QuadTree.MIN_SIZE) {
                return false;
            }

            this.divide();
        }

        return (
            this.northWest.insert(point) ||
            this.northEast.insert(point) ||
            this.southWest.insert(point) ||
            this.southEast.insert(point)
        );
    }

    public query(range: Rectangle): Point<T>[] {
        let found: Point<T>[] = [];

        if (this.overlapsAABB(range, this.boundary)) {
            return found;
        }

        this.points.forEach(p => {
            if (this.containsPoint(p.x, p.y, range)) {
                found.push(p);
            }
        });

        if (this.divided) {
            found = found.concat(
                this.northWest.query(range),
                this.northEast.query(range),
                this.southWest.query(range),
                this.southEast.query(range),
            );
        }

        return found;
    }

    private divide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        this.northWest = new QuadTree(
            { x: x - w / 2, y: y - h / 2, w, h },
            this.capacity,
            this.depth + 1
        );
        this.northEast = new QuadTree(
            { x: x + w / 2, y: y - h / 2, w, h },
            this.capacity,
            this.depth + 1
        );
        this.southWest = new QuadTree(
            { x: x - w / 2, y: y + h / 2, w, h },
            this.capacity,
            this.depth + 1
        );
        this.southEast = new QuadTree(
            { x: x + w / 2, y: y + h / 2, w, h },
            this.capacity,
            this.depth + 1
        );

        this.divided = true;

        this.points.forEach(p => this.insert(p));
        this.points = [];
    }

    private containsPoint(x: number, y: number, range: Rectangle = this.boundary): boolean {
        const w = range.w / 2;
        const h = range.h / 2;
        return (
            x >= range.x - w &&
            x <= range.x + w &&
            y >= range.y - h &&
            y <= range.y + h
        );
    }

    private overlapsAABB(rangeA: Rectangle, rangeB: Rectangle): boolean {
        const wA = rangeA.w / 2;
        const hA = rangeA.h / 2;
        const wB = rangeB.w / 2;
        const hB = rangeB.h / 2;
        return (
            rangeA.x - wA > rangeB.x + wB ||
            rangeA.x + wA < rangeB.x - wB ||
            rangeA.y - hA > rangeB.y + hB ||
            rangeA.y + hA < rangeB.y - hB
        );
    }

    public clear() {
        this.points = [];
        this.divided = false;
        this.northWest = this.northEast = this.southWest = this.southEast = null;
    }
}