import { Entity } from "../Entity";

interface Rectangle {
    // Center
    x: number;
    y: number;
    // Size
    w: number;
    h: number;
}

interface Point {
    x: number;
    y: number;
    unit: Entity;
}

export default class QuadTree {
    private boundary: Rectangle;
    private capacity: number;
    private points: Point[] = [];
    private divided: boolean = false;

    private northWest!: QuadTree;
    private northEast!: QuadTree;
    private southWest!: QuadTree;
    private southEast!: QuadTree;

    private depth: number;

    private static readonly MAX_DEPTH = 10;
    private static readonly MIN_SIZE = 1;

    constructor(boundary: Rectangle, capacity: number = 4, depth: number = 0) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.depth = depth;
    }

    public insert(point: Point): boolean {
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

    public query(range: Rectangle): Point[] {
        const found: Point[] = [];

        if (this.overlapsAABB(range, this.boundary)) {
            return found;
        }

        for (const p of this.points) {
            if (this.containsPoint(p.x, p.y, range)) {
                found.push(p);
            }
        }

        if (this.divided) {
            found.push(...this.northWest.query(range));
            found.push(...this.northEast.query(range));
            found.push(...this.southWest.query(range));
            found.push(...this.southEast.query(range));
        }

        return found;
    }

    private divide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        this.northWest = new QuadTree(
            { x: x - w / 2, y: y - h / 2, w: w, h: h },
            this.capacity,
            this.depth + 1
        );
        this.northEast = new QuadTree(
            { x: x + w / 2, y: y - h / 2, w: w, h: h },
            this.capacity,
            this.depth + 1
        );
        this.southWest = new QuadTree(
            { x: x - w / 2, y: y + h / 2, w: w, h: h },
            this.capacity,
            this.depth + 1
        );
        this.southEast = new QuadTree(
            { x: x + w / 2, y: y + h / 2, w: w, h: h },
            this.capacity,
            this.depth + 1
        );

        this.divided = true;

        for (const p of this.points) {
            this.insert(p);
        }
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

    clear() {
        this.points = [];
        this.divided = false;
        this.northWest = this.northEast = this.southWest = this.southEast = undefined;
    }
}