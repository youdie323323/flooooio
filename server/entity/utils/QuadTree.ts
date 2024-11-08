import { Entity } from "../Entity";

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Point {
    x: number;
    y: number;
    entity: Entity;
}

export default class QuadTree {
    private boundary: Rectangle;
    private capacity: number;
    private points: Point[] = [];
    private divided: boolean = false;
    private northwest?: QuadTree;
    private northeast?: QuadTree;
    private southwest?: QuadTree;
    private southeast?: QuadTree;
    private depth: number;

    private static readonly MAX_DEPTH = 10;
    private static readonly MIN_SIZE = 1;

    constructor(boundary: Rectangle, capacity: number = 4, depth: number = 0) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.depth = depth;
    }

    insert(point: Point): boolean {
        if (!this.containsPoint(point.x, point.y)) {
            return false;
        }

        if (this.points.length < this.capacity && !this.divided) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            if (this.depth >= QuadTree.MAX_DEPTH || this.boundary.width <= QuadTree.MIN_SIZE || this.boundary.height <= QuadTree.MIN_SIZE) {
                return false;
            }
            this.subDivide();
        }

        return (
            this.northwest.insert(point) ||
            this.northeast.insert(point) ||
            this.southwest.insert(point) ||
            this.southeast.insert(point)
        );
    }

    query(range: Rectangle): Point[] {
        const found: Point[] = [];

        if (!this.intersects(range, this.boundary)) {
            return found;
        }

        for (const p of this.points) {
            if (this.containsPoint(p.x, p.y, range)) {
                found.push(p);
            }
        }

        if (this.divided) {
            found.push(...this.northwest.query(range));
            found.push(...this.northeast.query(range));
            found.push(...this.southwest.query(range));
            found.push(...this.southeast.query(range));
        }

        return found;
    }

    private subDivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.width / 2;
        const h = this.boundary.height / 2;

        this.northwest = new QuadTree(
            { x: x - w / 2, y: y - h / 2, width: w, height: h },
            this.capacity,
            this.depth + 1
        );
        this.northeast = new QuadTree(
            { x: x + w / 2, y: y - h / 2, width: w, height: h },
            this.capacity,
            this.depth + 1
        );
        this.southwest = new QuadTree(
            { x: x - w / 2, y: y + h / 2, width: w, height: h },
            this.capacity,
            this.depth + 1
        );
        this.southeast = new QuadTree(
            { x: x + w / 2, y: y + h / 2, width: w, height: h },
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
        const w = range.width / 2;
        const h = range.height / 2;
        return (
            x >= range.x - w &&
            x <= range.x + w &&
            y >= range.y - h &&
            y <= range.y + h
        );
    }

    private intersects(rangeA: Rectangle, rangeB: Rectangle): boolean {
        const wA = rangeA.width / 2;
        const hA = rangeA.height / 2;
        const wB = rangeB.width / 2;
        const hB = rangeB.height / 2;
        return !(
            rangeA.x - wA > rangeB.x + wB ||
            rangeA.x + wA < rangeB.x - wB ||
            rangeA.y - hA > rangeB.y + hB ||
            rangeA.y + hA < rangeB.y - hB
        );
    }

    clear() {
        this.points = [];
        this.divided = false;
        this.northwest = undefined;
        this.northeast = undefined;
        this.southwest = undefined;
        this.southeast = undefined;
    }
}