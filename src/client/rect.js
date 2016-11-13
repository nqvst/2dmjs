class Rect {
    constructor({ x = 0, y = 0 }) {
        this.pos = new Vector(0, 0);
        this.size = new Vector(x, y);
    }

    // sides
    get left() {
        return this.pos.x - this.size.x / 2;
    }

    get right() {
        return this.pos.x + this.size.x / 2;
    }

    get top() {
        return this.pos.y - this.size.y / 2;
    }

    get bottom() {
        return this.pos.y + this.size.y / 2;
    }

    // corners
    get bottomRight() {
        return new Vector(this.right, this.bottom);
    }

    get bottomLeft() {
        return new Vector(this.left, this.bottom);
    }

    get topLeft() {
        return new Vector(this.left, this.top);
    }

    get topRight() {
        return new Vector(this.right, this.top);
    }

    get corners() {
        return {
            topRight: this.topRight,
            topLeft: this.topLeft,
            bottomRight: this.bottomRight,
            bottomLeft: this.bottomLeft,
        }
    }

    distance(vec) {
        const dx = this.pos.x - vec.x;
        const dy = this.pos.y - vec.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}