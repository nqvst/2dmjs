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
            this.drawCircle(p);
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
        this._context.fillStyle = rect.color || '#fff';
        this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
    }

    drawCircle(circle) {
        this._context.fillStyle = '#888'; //circle.color || '#fff';
        this._context.strokeStyle = circle.color || '#fff';
        this._context.beginPath();
        this._context.arc(circle.pos.x, circle.pos.y, circle.size, 0, circle.size * Math.PI, false); 
        this._context.lineWidth = 5;
        this._context.closePath();
        this._context.stroke();
        this._context.fill();
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
        
        
        this.player.move({ x: input.horizontal * WALK_SPEED, y: input.vertical * WALK_SPEED });

        if ((input.vertical === 0 && input.horizontal === 0) && (this.player.vel.x !== 0 || this.player.vel.y !== 0)) {
            this.player.applyFriction(FRICTION);
        }
        this.player.applyMovement(dt);
        this.draw();
    }

    updateGravity(dt) {
        const isGrounded = this.player.pos.y + (this.player.size * 2) >= this._canvas.height -0.1;

        this.player.move({ x: input.horizontal * WALK_SPEED * (isGrounded ? 1 : 0.7) })
        
        if (this.player.vel.x !== 0 && input.horizontal === 0 && isGrounded) {
            this.player.applyFriction(FRICTION);
        }


        if (!isGrounded) {
            this.player.applyGravity(GRAVITY);
        } else {
            this.player.vel.y = 0;
        }
        
        if(input.jump && isGrounded) {
            this.player.jump(JUMP_VELOCITY);
        }

        this.player.applyMovement(dt);

        log('running');
          
        this.draw();
    }
}

const input = new Input({ can: canvas, doc: document });

