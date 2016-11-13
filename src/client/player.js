class Player extends Circle {
    constructor({color = '#fff', name = 'Player', isLocal = true, id = '' } = {}) {
        super({x: 30, y: 30, size: 10});
        this.vel = new Vector(0, 0);
        this.maxSpeed = { x: 400, y: 400 };
        this.color = color;
        this.name = name;
        this.isLocal = isLocal;
        this.id = id;
        
        if (isLocal) {
            this.id = socket.id;
            log('from isLocal', this)
            socket.emit('message', {
                type: 'join',
                data: {
                    color: this.color,
                    id: this.id,
                }
            });
        }
    }

    applyFriction(friction) {
        this.vel.x *= friction;
        this.vel.y *= friction;
    }

    applyGravity(gravity) {
        this.vel.y += gravity;
    }

    move({ x = 0, y = 0 }) {
        this.vel.x += x;
        this.vel.y += y;
    }

    applyMovement(dt) {
        this.clampVelocity()

        if (this.vel.x != 0) {
            this.pos.x += this.vel.x * dt;
        } 

        if (this.vel.y != 0) {
            this.pos.y += this.vel.y * dt;
            //this.pos.y = Math.min(this.pos.y, canvas.height - this.size/2);
        }

    }

    jump (vel) {
        this.vel.y = vel;       
    }

    setPosition({ x, y }) {
        this.pos.x = x;
        this.pos.y = y;
    }

    clampVelocity() {
        const signX = Math.sign(this.vel.x);
        const signY = Math.sign(this.vel.y);

        const absX = Math.abs(this.vel.x);
        const absY = Math.abs(this.vel.y);

        this.vel.x = Math.min(absX, this.maxSpeed.x ) * signX;
        this.vel.y = Math.min(absY, this.maxSpeed.y ) * signY; 
    }
}