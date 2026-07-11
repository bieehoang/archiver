import { normalizeUrl } from "./ultils.js";

export class Queue {

    constructor() {

        this.pending = [];
        this.visited = new Set();
        this.inQueue = new Set();

    }

    /**
     * Thêm URL vào queue nếu chưa từng thấy. Trả về false nếu bị trùng.
     */
    add(url) {

        const norm = normalizeUrl(url);

        if (this.visited.has(norm) || this.inQueue.has(norm))
            return false;

        this.inQueue.add(norm);
        this.pending.push(norm);

        return true;

    }

    next() {

        const url = this.pending.shift();

        if (url) {
            this.inQueue.delete(url);
            this.visited.add(url);
        }

        return url;

    }

    isEmpty() {

        return this.pending.length === 0;

    }

    get size() {

        return this.pending.length;

    }

    get visitedCount() {

        return this.visited.size;

    }

    has(url) {

        return this.visited.has(normalizeUrl(url));

    }

}