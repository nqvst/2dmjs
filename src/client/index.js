let game;

socket.on('connect', () => {
    const canvas = document.getElementById('canvas');
    game = new Game(canvas);
    game.start()
});

socket.on('message', msg => {
    const { type, data } = msg;
    console.info(type, data);

    switch (type) {
        case 'position':
            game.updatePosition(data);
            break;
        case 'join':
            game.addPlayer(data);
            break;
        case 'disconnect':
            game.removePlayer(data);
            break;
        default:
            console.warn('unhandled message:', msg);
    }
});

let isPaused = false;

function togglePause() {
    isPaused = ! isPaused;
    log('paused: ', isPaused);
    if(isPaused) {   
        game.timer.stop();
    } else {
        game.timer.start();
    }
}

function pause() {
    log('pause');
    isPaused = true;
    game.timer.stop();
}


function play() {
    log('play');
    isPaused = false;
    game.timer.start();
}

let i = 0;
let timeout = null;

document.addEventListener('keypress', function(e) {
    if(isPaused) {
        play();
    }

    if(timeout)
        clearTimeout(timeout)
    if(!isPaused)
        timeout = setTimeout(() => {
            pause();
        }, 5000);
});

document.addEventListener('keyup', function(e) {
    if(e.keyCode === 27) {
        togglePause();
    }
});

