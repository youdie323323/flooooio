import type { LayoutResult } from "./Layout";

export default class LayoutCache {
    private cache: Map<string, LayoutResult> = new Map();
    private isDirty: Map<string, boolean> = new Map();

    constructor() {
        this.clear();
    }

    public clear() {
        this.cache.clear();
        this.isDirty.clear();
    }

    public get(key: string): LayoutResult {
        return this.cache.get(key);
    }

    public set(key: string, value: LayoutResult) {
        this.cache.set(key, value);
        this.isDirty.set(key, false);
    }

    public invalidate() {
        this.isDirty.clear();
    }

    public isDirtyCache(key: string): boolean {
        if (!this.isDirty.has(key)) {
            this.isDirty.set(key, true);

            return true;
        }

        return this.isDirty.get(key) || false;
    }
}