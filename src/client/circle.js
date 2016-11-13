class Circle {
    constructor({ x = 0, y = 0, size = 5 }) {
        console.log('Circle constructor', x, y);
        this.pos = new Vector(x, y);
        this.size = size;
    }
}