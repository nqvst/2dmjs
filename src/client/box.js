class Box extends Rect {
    constructor({ w = 100, h = 10, x = 0, y = 0, color = '#222'} = {}) {
        super({ x: w, y: h });
        this.color = color;
        this.pos = {x, y};
    }
}