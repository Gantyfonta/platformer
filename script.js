const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = 800;
canvas.height = 400;

// Game Constants
const gravity = 0.8;
const friction = 0.9;

const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
    color: '#ff4757'
};

const platforms = [
    { x: 0, y: 380, width: 800, height: 20 }, // Floor
    { x: 200, y: 280, width: 150, height: 20 },
    { x: 450, y: 200, width: 150, height: 20 },
    { x: 100, y: 150, width: 100, height: 20 }
];

const keys = {};

// Input listeners
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

function update() {
    // Movement logic
    if (keys['ArrowUp'] || keys['Space'] || keys['KeyW']) {
        if (!player.jumping) {
            player.velY = -player.speed * 3;
            player.jumping = true;
        }
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        if (player.velX > -player.speed) player.velX--;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        if (player.velX < player.speed) player.velX++;
    }

    player.velX *= friction;
    player.velY += gravity;

    player.x += player.velX;
    player.y += player.velY;

    // Platform Collision
    player.jumping = true;
    for (let plat of platforms) {
        if (player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y < plat.y + plat.height &&
            player.y + player.height > plat.y) {
            
            // Basic floor collision logic
            if (player.velY > 0) {
                player.jumping = false;
                player.velY = 0;
                player.y = plat.y - player.height;
            }
        }
    }

    // Screen Bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    ctx.fillStyle = '#2f3542';
    platforms.forEach(plat => {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

update();
