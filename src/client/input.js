class Input {
    constructor({ can, doc }) {
        
        this.jumpKeys = [32];
        this.upKeys = [38, 87];
        this.downKeys = [40, 83];
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

        // canvas.addEventListener('mousemove', event => {
        //     const scale = event.offsetY / event.target.getBoundingClientRect().height;
        //    
        //     this.mousePosition = { 
        //         x: event.offsetX * scale, 
        //         y: event.offsetY * scale 
        //     };
        //     //log(this.mousePosition);
        // });
        //
        // canvas.addEventListener('click', (event) => {
        //     //log('click', event)
        // });
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

    get up() {
        return this.isPressed(this.upKeys);
    }

    get down() {
        return this.isPressed(this.downKeys);
    }

    get all() {
        return {
            up: this.up,
            down: this.down,
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
    
    get vertical() {
        let res = 0;
        if(this.down)
            res ++;
        if (this.up)
            res --;
        return res;
    }

}
