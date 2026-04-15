const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// 1. GAME SETTINGS
const gravity = 0.8;
const friction = 0.9;
const keys = {};

// 2. PLAYER DEFINITION (Must be before initLevel)
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

// 3. THE LEVEL DATABASE
const LEVEL_DATABASE = [
    // Level 1
    [
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
        {"x":50,"y":330,"width":30,"height":30,"type":"SPAWN"},
        {"x":700,"y":300,"width":50,"height":80,"type":"GOAL"}
    ],
    // Level 2
    [
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
        {"x":40,"y":320,"width":30,"height":30,"type":"SPAWN"},
        {"x":200,"y":300,"width":100,"height":20,"type":"PLATFORM"},
        {"x":350,"y":220,"width":20,"height":160,"type":"SPIKE"},
        {"x":700,"y":180,"width":50,"height":50,"type":"GOAL"}
    ]
];

let currentLevelIndex = 0;
let worldObjects = [];
let spawnPoint = { x: 50, y: 300 };

// 4. LEVEL LOGIC
function initLevel() {
    worldObjects = LEVEL_DATABASE[currentLevelIndex];
    const spawn = worldObjects.find(o => o.type === 'SPAWN');
    if (spawn) {
        spawnPoint = { x: spawn.x, y: spawn.y };
    }
    respawn();
}

function respawn() {
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;
    player.velX = 0;
    player.velY = 0;
}

function nextLevel() {
    currentLevelIndex++;
    if (currentLevelIndex < LEVEL_DATABASE.length) {
        initLevel();
    } else {
        alert("🎉 YOU WIN!");
        currentLevelIndex = 0;
        initLevel();
    }
}

// 5. INPUT LISTENERS
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// 6. GAME ENGINE
function update() {
    // Jump
    if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && !player.jumping) {
        player.velY = -player.speed * 2.5;
        player.jumping = true;
    }
    // Left/Right
    if (keys['ArrowLeft'] || keys['KeyA']) {
        if (player.velX > -player.speed) player.velX--;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        if (player.velX < player.speed) player.velX++;
    }

    player.velX *= friction;
    player.velY += gravity;

    player.y += player.velY;
    player.x += player.velX;

    // Collision Logic
    worldObjects.forEach(obj => {
        if (player.x < obj.x + obj.width &&
            player.x + player.width > obj.x &&
            player.y < obj.y + obj.height &&
            player.y + player.height > obj.y) {
            
            if (obj.type === 'PLATFORM') {
                if (player.velY > 0 && player.y + player.height - player.velY <= obj.y) {
                    player.jumping = false;
                    player.velY = 0;
                    player.y = obj.y - player.height;
                }
            } else if (obj.type === 'SPIKE') {
                respawn();
            } else if (obj.type === 'GOAL') {
                nextLevel();
            }
        }
    });

    // Screen Bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // UI
    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Level: ${currentLevelIndex + 1}`, 20, 30);

    // Objects
    worldObjects.forEach(obj => {
        if (obj.type === 'PLATFORM') ctx.fillStyle = '#2f3542';
        else if (obj.type === 'SPIKE') ctx.fillStyle = '#ff4757';
        else if (obj.type === 'GOAL') ctx.fillStyle = '#ffa502';
        else if (obj.type === 'SPAWN') ctx.fillStyle = '#2ed573';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    });

    // Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// 7. START
initLevel();
update();
