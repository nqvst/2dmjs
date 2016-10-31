
const GRAVITY = 7;
const FRICTION = 0.9;
const WALK_SPEED = 10; 
const JUMP_VELOCITY = -600;

const randomColor = () => '#'+Math.floor(Math.random()*16777215).toString(16);

const log = (...args) => {
    console.log(...args)
}

class Vec {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set magnitude(value) {
        const f = value / this.magnitude;
        this.x *= f;
        this.y *= f;
    }
}

class Rect {
    constructor({ x = 0, y = 0 }) {
        this.pos = new Vec(0, 0);
        this.size = new Vec(x, y);
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
        return new Vec(this.right, this.bottom);
    }

    get bottomLeft() {
        return new Vec(this.left, this.bottom);
    }

    get topLeft() {
        return new Vec(this.left, this.top);
    }

    get topRight() {
        return new Vec(this.right, this.top);
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

    detectCollision(other) {
        const left = this.left < other.right && (this.top < other.bottom || this.bottom > other.top);
        const right = this.right > other.left && (this.top < other.bottom || this.bottom > other.top);
        const bottom = this.bottom > other.top && (this.left < other.right || this.right > other.left)
        const top = this.top < other.bottom && (this.left < other.right || this.right > other.left)
        
        const closeEnough = this.distance(other.pos) < (this.size.x + other.size.x) / 2


        // return  this.left < other.right && 
        //         this.right > other.left &&
        //         this.top < other.bottom && 
        //         this.bottom > other.top;
    }

    detectCollision(other) {
        // const left = this.left < other.right && (this.top < other.bottom || this.bottom > other.top);
        // const right = this.right > other.left && (this.top < other.bottom || this.bottom > other.top);
        // const bottom = this.bottom > other.top && (this.left < other.right || this.right > other.left)
        // const top = this.top < other.bottom && (this.left < other.right || this.right > other.left)
        
        // const closeEnough = this.distance(other.pos) < (this.size.x + other.size.x) / 2

        // return {
        //     collision: left || right || bottom || top, 
        //     left,
        //     right,
        //     bottom,
        //     top,
        // }

        return  this.left < other.right && 
                this.right > other.left &&
                this.top < other.bottom && 
                this.bottom > other.top;
    }

    detectCollisions(others) {
        let colissions = []
        others.forEach(other => {
            const coll = this.detectCollision(other);

            if(coll.collision) {
                colissions.push({
                    info: coll,
                    other,
                }); 
            }
        });
        // log(colissions);
        return colissions;
    }
}

class Box extends Rect {
    constructor({ w = 100, h = 10, x = 0, y = 0, color = '#222'} = {}) {
        super({ x: w, y: h });
        this.color = color;
        this.pos = {x, y};
    }
}

class Player extends Rect {
    constructor({color = '#fff', name = 'Player', isLocal = true, id = '' } = {}) {
        super({x: 30, y: 30});
        this.vel = new Vec;
        this.maxSpeed = { x: 400, y: 2000 };
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
            this.pos.y = Math.min(this.pos.y, canvas.height - this.size.y/2);
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

class Game {

    constructor(canvas) {
        
        this.players = [];
        this.remotes = {};
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
        this._context.font = '14px Monospace';
        this.player = new Player({color: randomColor()});

        this.players.push(this.player);
        this.reset();

    }

    addPlayer(data) {
        if (data.id != this.player.id) {
            console.log('adding player', data);
            data.isLocal = false;
            const newPlayer = new Player(data);
            this.remotes[data.id] = newPlayer;
            Object.assign(this.remotes, { [data.id]:  newPlayer });
            this.players.push(newPlayer);
        }
    }

    removePlayer(data) {
        console.info('removing player', data);
        this.players = this.players.filter(pl => pl.id !== data.id );
        delete this.remotes[data.id];
        console.info('remotes', this.remotes);

    }

    clear() {
        this._context.fillStyle = 'black';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    draw() {
        this.clear();

        this.players.forEach(p => {
            this.drawRect(p);
        });
        
        this.drawDebug();        
    }

    updatePosition({ id, position }) {
        console.log('updatePosition', id, position);
        if (this.player.id !== id) {
            const player = game.remotes[id];
            console.log(player);
            if(player) {
                player.setPosition(position);
            }
        }
    }

    drawDebug() {
        this._context.fillStyle = '#fff';
        this._context.fillText(`pos: x: ${this.player.pos.x | 0} y: ${this.player.pos.y | 0}`, 10, 10);
        this._context.fillText(`vel: x: ${this.player.vel.x | 0} y: ${this.player.vel.y | 0}`, 10, 30);
        this._context.fillText(`isGrounded: ${this.player.bottom >= this._canvas.height -0.1}`, 10, 50);
        this._context.fillText(`input: ${JSON.stringify(input.all)}`, 10, 70);
    }

    drawRect(rect) {
        this._context.fillStyle = rect.color || '#222';
        this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
    }
    
    reset() {
        this.player.setPosition({ x: Math.random() * canvas.width, y: this._canvas.height - 13 })
    }
    
    start() {
        this.timer = new Timer(dt => { this.update(dt); }, 1/120);
        this.netTimer = new Timer(dt => { this.networkUpdate(dt); }, 1/30);
        this.timer.start();
        this.netTimer.start()
    }

    networkUpdate(dt) {
        if (this.lastx !== this.player.pos.x || this.lasty !== this.player.pos.y) {
            socket.emit('message', {
                type: 'position',
                data: {
                    id: this.player.id,
                    position: this.player.pos,
                },
            });
        }

        this.lastx = this.player.pos.x;
        this.lasty = this.player.pos.y;
    }
    
    update(dt) {
        const isGrounded = this.player.bottom >= this._canvas.height -0.1;


        this.player.move({ x: input.horizontal * WALK_SPEED * (isGrounded ? 1 : 0.7) })
        
        if (this.player.vel.x !== 0 && input.horizontal === 0 && isGrounded) {
            this.player.applyFriction(FRICTION);
        }

        if (!isGrounded) {
            this.player.applyGravity(GRAVITY)
        } 
        
        if(input.jump && isGrounded) {
            this.player.jump(JUMP_VELOCITY);
        }

        this.player.applyMovement(dt);

        log('running');
          
        this.draw();
    }
}

class Input {
    constructor({ can, doc }) {
        
        this.jumpKeys = [32, 38, 87];
        this.leftKeys = [37, 65];
        this.rightKeys = [39, 68];
        this.inputs = {};
        this.mousePosition = { x: 0, y: 0 };

        document.addEventListener('keydown', event => {
            this.inputs[event.keyCode] = event.type == 'keydown';
        });

        document.addEventListener('keyup', event => {
            this.inputs[event.keyCode] = event.type == 'keydown';
        });

        canvas.addEventListener('mousemove', event => {
            const scale = event.offsetY / event.target.getBoundingClientRect().height;
            
            this.mousePosition = { 
                x: event.offsetX * scale, 
                y: event.offsetY * scale 
            };
            //log(this.mousePosition);
        });

        canvas.addEventListener('click', (event) => {
            //log('click', event)
        });
    }

    isPressed(keyList) {
        return !!keyList.filter((key) => !!this.inputs[key]).length;
    }

    get jump() {
        return this.isPressed(this.jumpKeys);
    }
    get left() {
        return this.isPressed(this.leftKeys);
    }

    get right() {
        return this.isPressed(this.rightKeys);
    }

    get all() {
        return {
            right: this.right,
            left: this.left,
            jump: this.jump,
        }
    }

    get horizontal() {
        let res = 0;
        if(this.right)
            res ++;
        if (this.left)
            res --;
        return res;
    }

}

const input = new Input({ can: canvas, doc: document });

