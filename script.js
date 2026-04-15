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
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},{"x":50,"y":330,"width":30,"height":30,"type":"SPAWN"},{"x":700,"y":300,"width":50,"height":80,"type":"GOAL"},{"x":391.5,"y":254.1875,"width":51,"height":131,"type":"PLATFORM"},{"x":271.5,"y":313.1875,"width":60,"height":25,"type":"PLATFORM"}
    ],
    // Level 2
    [
       {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
       {"x":2.5,"y":347.1875,"width":805,"height":59,"type":"SPIKE"},
        {"x":0.5,"y":351.1875,"width":9,"height":43,"type":"SPIKE"},
        {"x":-1.5,"y":347.1875,"width":28,"height":56,"type":"SPIKE"},
        {"x":38.5,"y":148.1875,"width":34,"height":27,"type":"SPAWN"},
        {"x":7.5,"y":181.1875,"width":106,"height":57,"type":"PLATFORM"},
        {"x":183.5,"y":189.1875,"width":42,"height":22,"type":"PLATFORM"},
        {"x":318.5,"y":253.1875,"width":42,"height":32,"type":"PLATFORM"},
        {"x":426.5,"y":318.1875,"width":70,"height":16,"type":"PLATFORM"},
        {"x":587.5,"y":253.1875,"width":55,"height":29,"type":"PLATFORM"},
        {"x":663.5,"y":22.1875,"width":19,"height":152,"type":"PLATFORM"},
        {"x":670.5,"y":173.1875,"width":127,"height":18,"type":"PLATFORM"},
        {"x":770.5,"y":142.1875,"width":30,"height":33,"type":"GOAL"}
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
