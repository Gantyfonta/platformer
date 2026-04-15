const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- SPEEDRUN TIMER VARIABLES ---
let startTime = 0;
let elapsedTime = 0;
let timerRunning = false;
let timerFinished = false;

// Helper function to turn milliseconds into a pretty string (00:00.00)
function formatTime(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = Math.floor((ms % 60000) / 1000);
    let centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

canvas.width = 800;
canvas.height = 400;

// 1. GAME SETTINGS
const gravity = 0.8;
const friction = 0.9;
const keys = {};
let gameTime = 0; // New: Drives the movement of platforms

// 2. PLAYER DEFINITION
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
// Paste your exported code from the editor here!
const LEVEL_DATABASE = [
    [
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},{"x":50,"y":330,"width":30,"height":30,"type":"SPAWN"},{"x":700,"y":300,"width":50,"height":80,"type":"GOAL"},{"x":391.5,"y":254.1875,"width":51,"height":131,"type":"PLATFORM"},{"x":271.5,"y":313.1875,"width":60,"height":25,"type":"PLATFORM"}
    ],
     [
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
        {"x":2.5,"y":347.1875,"width":805,"height":59,"type":"SPIKE"},
        {"x":38.5,"y":148.1875,"width":34,"height":27,"type":"SPAWN"},
        {"x":7.5,"y":181.1875,"width":106,"height":57,"type":"PLATFORM"},
        {"x":183.5,"y":189.1875,"width":42,"height":22,"type":"PLATFORM"},
        {"x":318.5,"y":253.1875,"width":42,"height":32,"type":"PLATFORM"},
        {"x":426.5,"y":318.1875,"width":70,"height":16,"type":"PLATFORM"},
        {"x":587.5,"y":253.1875,"width":55,"height":29,"type":"PLATFORM"},
       {"x":670.5,"y":173.1875,"width":127,"height":18,"type":"PLATFORM"},
        {"x":770.5,"y":142.1875,"width":30,"height":33,"type":"GOAL"}
    ],
    
    [
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
        {"x":173.5,"y":107.1875,"width":483,"height":23,"type":"SPIKE","tx":172.5,"ty":356.1875,"isMoving":true},
        {"x":743.5,"y":309.1875,"width":58,"height":68,"type":"GOAL"},
        {"x":5.5,"y":350.1875,"width":41,"height":22,"type":"SPAWN"}
    ],
    
    [
        {"x":33.5,"y":311.1875,"width":83,"height":38,"type":"PLATFORM"},
     {"x":203.5,"y":328.1875,"width":53,"height":27,"type":"PLATFORM","tx":202.5,"ty":182.1875,"isMoving":true},
        {"x":321.5,"y":181.1875,"width":74,"height":31,"type":"PLATFORM","tx":319.5,"ty":325.1875,"isMoving":true},
        {"x":471.5,"y":342.1875,"width":47,"height":22,"type":"PLATFORM","tx":470.5,"ty":179.1875,"isMoving":true},
        {"x":639.5,"y":330.1875,"width":73,"height":37,"type":"PLATFORM","tx":637.5,"ty":95.1875,"isMoving":true},
        {"x":648.5,"y":22.1875,"width":69,"height":59,"type":"GOAL"},
        {"x":40.5,"y":278.1875,"width":39,"height":33,"type":"SPAWN"},
        {"x":5.5,"y":395.1875,"width":800,"height":12,"type":"SPIKE"}
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
    player.jumping = false;
}

function nextLevel() {
    currentLevelIndex++;
    
    if (currentLevelIndex < LEVEL_DATABASE.length) {
        initLevel();
    } else {
        // --- STOP THE TIMER HERE ---
        timerRunning = false;
        timerFinished = true;
        
        alert(`🎉 YOU WIN!\nFinal Time: ${formatTime(elapsedTime)}`);
        
        // Optional: Reset for a new run
        // currentLevelIndex = 0;
        // timerFinished = false;
        // elapsedTime = 0;
        // initLevel();
    }
}

// 5. INPUT LISTENERS
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// 6. GAME ENGINE
function update() {
    // Increment game time
    gameTime += 0.02;

    // --- 1. UPDATE PLATFORM POSITIONS ---
    worldObjects.forEach(obj => {
        if (obj.isMoving) {
            obj.oldX = obj.currentX || obj.x;
            obj.oldY = obj.currentY || obj.y;

            let progress = (Math.sin(gameTime) + 1) / 2;
            obj.currentX = obj.x + (obj.tx - obj.x) * progress;
            obj.currentY = obj.y + (obj.ty - obj.y) * progress;
        } else {
            obj.currentX = obj.x;
            obj.currentY = obj.y;
        }
    });

    // --- 2. TIMER & INPUTS ---
    if (!timerRunning && !timerFinished) {
        if (keys['ArrowUp'] || keys['Space'] || keys['KeyW'] || 
            keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD']) {
            startTime = Date.now();
            timerRunning = true;
        }
    }
    if (timerRunning) elapsedTime = Date.now() - startTime;

    if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && !player.jumping) {
        player.velY = -player.speed * 2.5;
        player.jumping = true;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        if (player.velX > -player.speed) player.velX--;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        if (player.velX < player.speed) player.velX++;
    }

    player.velX *= friction;
    player.velY += gravity;

    // --- 3. Y-AXIS MOVE & COLLISION ---
    player.y += player.velY;
    worldObjects.forEach(obj => {
        if (player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y < obj.currentY + obj.height && player.y + player.height > obj.currentY) {
            
            if (obj.type === 'PLATFORM') {
                // If falling or moving down onto the platform
                if (player.velY >= 0 && player.y + player.height - player.velY <= obj.currentY + 10) { 
                    player.jumping = false;
                    player.velY = 0;
                    player.y = obj.currentY - player.height;

                    // Stick to platform vertically
                    if (obj.isMoving) {
                        player.y += (obj.currentY - obj.oldY);
                    }
                }
            } else if (obj.type === 'SPIKE') respawn();
            else if (obj.type === 'GOAL') nextLevel();
        }
    });

    // --- 4. X-AXIS MOVE & COLLISION ---
    player.x += player.velX;
    worldObjects.forEach(obj => {
        // Parent the player to moving platform (Horizontal move)
        if (obj.isMoving && !player.jumping && 
            player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y + player.height >= obj.currentY - 5 && player.y + player.height <= obj.currentY + 10) {
            player.x += (obj.currentX - obj.oldX);
        }

        if (player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y < obj.currentY + obj.height && player.y + player.height > obj.currentY) {
            
            if (obj.type === 'PLATFORM') {
                // BUG FIX: Only trigger side-collision if we aren't "on top" of the platform
                // We check if the player's feet are significantly lower than the platform's top
                if (player.y + player.height > obj.currentY + 5) {
                    if (player.velX > 0) { 
                        player.x = obj.currentX - player.width;
                        player.velX = 0;
                    } else if (player.velX < 0) {
                        player.x = obj.currentX + obj.width;
                        player.velX = 0;
                    }
                }
            } else if (obj.type === 'SPIKE') respawn();
            else if (obj.type === 'GOAL') nextLevel();
        }
    });

    // Screen Bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    draw();
    requestAnimationFrame(update);
}
    // --- B. INPUTS ---
    if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && !player.jumping) {
        player.velY = -player.speed * 2.5;
        player.jumping = true;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        if (player.velX > -player.speed) player.velX--;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        if (player.velX < player.speed) player.velX++;
    }

    player.velX *= friction;
    player.velY += gravity;

    // --- C. Y-AXIS MOVE & COLLISION ---
    player.y += player.velY;
    worldObjects.forEach(obj => {
        if (player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y < obj.currentY + obj.height && player.y + player.height > obj.currentY) {
            
            if (obj.type === 'PLATFORM') {
                if (player.velY > 0 && player.y + player.height - player.velY <= obj.currentY + 5) { 
                    player.jumping = false;
                    player.velY = 0;
                    player.y = obj.currentY - player.height;

                    // Parent the player to the moving platform (Vertical push)
                    if (obj.isMoving) {
                        player.y += (obj.currentY - obj.oldY);
                    }
                }
            } else if (obj.type === 'SPIKE') respawn();
            else if (obj.type === 'GOAL') nextLevel();
        }
    });

    // --- D. X-AXIS MOVE & COLLISION ---
    player.x += player.velX;
    worldObjects.forEach(obj => {
        // Parent the player to moving platform (Horizontal push)
        // We check if player is standing on the platform first
        if (obj.isMoving && !player.jumping && 
            player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            Math.abs((player.y + player.height) - obj.currentY) < 2) {
            player.x += (obj.currentX - obj.oldX);
        }

        if (player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y < obj.currentY + obj.height && player.y + player.height > obj.currentY) {
            
            if (obj.type === 'PLATFORM') {
                if (player.velX > 0) { 
                    player.x = obj.currentX - player.width;
                    player.velX = 0;
                } else if (player.velX < 0) {
                    player.x = obj.currentX + obj.width;
                    player.velX = 0;
                }
            } else if (obj.type === 'SPIKE') respawn();
            else if (obj.type === 'GOAL') nextLevel();
        }
    });

    // Screen Bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    draw();
    requestAnimationFrame(update);

// 7. DRAWING FUNCTION
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Level: ${currentLevelIndex + 1}`, 20, 30);

    worldObjects.forEach(obj => {
        if (obj.type === 'PLATFORM') ctx.fillStyle = '#2f3542';
        else if (obj.type === 'SPIKE') ctx.fillStyle = '#ff4757';
        else if (obj.type === 'GOAL') ctx.fillStyle = '#ffa502';
        else if (obj.type === 'SPAWN') ctx.fillStyle = '#2ed573';
        
        // Use the animated currentX/Y for drawing
        ctx.fillRect(obj.currentX, obj.currentY, obj.width, obj.height);
    });

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // --- DRAW TIMER ---
    ctx.fillStyle = "white";
    ctx.font = "bold 20px monospace";
    // Place it in the top right corner
    ctx.textAlign = "right";
    ctx.fillText(formatTime(elapsedTime), canvas.width - 20, 30);
    ctx.textAlign = "left"; // Reset alignment for other text
}

initLevel();
update();
