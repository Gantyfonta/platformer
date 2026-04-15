const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// --- SPEEDRUN TIMER VARIABLES ---
let startTime = 0;
let elapsedTime = 0;
let timerRunning = false;
let timerFinished = false;

function formatTime(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = Math.floor((ms % 60000) / 1000);
    let centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

// --- 1. SETTINGS (Time-Based) ---
const gravity = 1500;    
const friction = 0.001;  
const jumpForce = -700;  
const moveSpeed = 400;   
const acceleration = 2000; 

let lastTime = 0; // Required for Delta Time calculation
let gameTime = 0; // Required for moving platforms

// 2. PLAYER DEFINITION
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    speed: 5, // Max speed
    velX: 0,
    velY: 0,
    jumping: false,
    color: '#ff4757'
};

// 3. THE LEVEL DATABASE
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
    ], 

[{"x":5.5,"y":45.1875,"width":84,"height":17,"type":"PLATFORM"},{"x":129.5,"y":0.1875,"width":20,"height":59,"type":"PLATFORM"},{"x":22.5,"y":6.1875,"width":19,"height":22,"type":"SPAWN"},{"x":-0.5,"y":148.1875,"width":147,"height":25,"type":"SPIKE"},{"x":144.5,"y":149.1875,"width":74,"height":29,"type":"SPIKE"},{"x":-0.5,"y":162.1875,"width":238,"height":62,"type":"PLATFORM"},{"x":184.5,"y":94.1875,"width":180,"height":131,"type":"PLATFORM"},{"x":409.5,"y":-0.8125,"width":15,"height":228,"type":"PLATFORM"},{"x":302.5,"y":319.1875,"width":125,"height":28,"type":"SPIKE"},{"x":117.5,"y":326.1875,"width":191,"height":21,"type":"PLATFORM"},{"x":6.5,"y":393.1875,"width":794,"height":14,"type":"PLATFORM"},{"x":-0.5,"y":217.1875,"width":35,"height":190,"type":"PLATFORM"},{"x":417.5,"y":219.1875,"width":7,"height":107,"type":"SPIKE"},{"x":416.5,"y":218.1875,"width":265,"height":8,"type":"PLATFORM"},{"x":484.5,"y":350.1875,"width":30,"height":12,"type":"PLATFORM"},{"x":582.5,"y":305.1875,"width":50,"height":47,"type":"PLATFORM"},{"x":709.5,"y":288.1875,"width":79,"height":11,"type":"PLATFORM"},{"x":593.5,"y":4.1875,"width":9,"height":82,"type":"PLATFORM"},{"x":590.5,"y":-0.8125,"width":211,"height":9,"type":"PLATFORM"},{"x":599.5,"y":78.1875,"width":142,"height":8,"type":"PLATFORM"},{"x":743.5,"y":80.1875,"width":58,"height":7,"type":"PLATFORM","tx":683.5,"ty":79.1875,"isMoving":true},{"x":613.5,"y":24.1875,"width":31,"height":26,"type":"GOAL"},{"x":618.5,"y":62.1875,"width":39,"height":15,"type":"PORTAL_SHRINK"},{"x":654.5,"y":134.1875,"width":100,"height":20,"type":"PLATFORM"}]

    
];

let currentLevelIndex = 0;
let worldObjects = [];
let spawnPoint = { x: 50, y: 300 };

// --- PORTAL LOGIC ---
function setPlayerSize(newSize) {
    if (player.width === newSize) return; // Do nothing if we are already this size

    // Calculate how much taller/shorter we are getting
    let heightDiff = newSize - player.height;
    
    player.width = newSize;
    player.height = newSize;
    
    // Shift the player's Y position so they don't clip into the ground
    player.y -= heightDiff; 
}

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
    player.width = 30;  // <-- Add this
    player.height = 30; // <-- Add this
    player.velX = 0;
    player.velY = 0;
    player.jumping = false;
}

function nextLevel() {
    currentLevelIndex++;
    
    if (currentLevelIndex < LEVEL_DATABASE.length) {
        initLevel();
    } else {
        timerRunning = false;
        timerFinished = true;
        alert(`🎉 YOU WIN!\nFinal Time: ${formatTime(elapsedTime)}`);
    }
}

// 5. INPUT LISTENERS
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// --- UPDATED SETTINGS FOR DELTA TIME ---
const gravity = 1500;    // Pixels per second squared
const friction = 0.001;  // Exponential decay factor
const jumpForce = -700;  // Upward velocity
const moveSpeed = 400;   // Max horizontal pixels per second
const acceleration = 2000; 

let lastTime = 0;

// 6. UPDATED GAME ENGINE
function update(timestamp) {
    // A. Calculate Delta Time (seconds passed since last frame)
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000; 
    lastTime = timestamp;

    // Prevent massive jumps if the user switches tabs (limit dt to 0.1s)
    if (dt > 0.1) dt = 0.1;

    // Increment game time for moving platforms
    gameTime += dt * 2; // Adjusted multiplier to keep platform speed similar

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

    // --- 2. TIMER ---
    if (!timerRunning && !timerFinished) {
        if (keys['ArrowUp'] || keys['Space'] || keys['KeyW'] || 
            keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD']) {
            startTime = Date.now();
            timerRunning = true;
        }
    }
    if (timerRunning) elapsedTime = Date.now() - startTime;

    // --- 3. INPUTS & PHYSICS (Time-Based) ---
    if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && !player.jumping) {
        player.velY = jumpForce;
        player.jumping = true;
    }
    
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.velX -= acceleration * dt;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.velX += acceleration * dt;
    } else {
        // Apply friction only when not pressing keys
        player.velX *= Math.pow(friction, dt);
    }

    // Apply Gravity
    player.velY += gravity * dt;

    // Hard Speed Limits
    if (player.velX > moveSpeed) player.velX = moveSpeed;
    if (player.velX < -moveSpeed) player.velX = -moveSpeed;

    // --- 4. Y-AXIS MOVE & COLLISION ---
    player.y += player.velY * dt; // Velocity * Time = Distance
    
    worldObjects.forEach(obj => {
        if (player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y < obj.currentY + obj.height && player.y + player.height > obj.currentY) {
            
            if (obj.type === 'PLATFORM') {
                // Landing on Top
                if (player.velY >= 0 && (player.y + player.height) - (player.velY * dt) <= obj.currentY + 10) { 
                    player.jumping = false;
                    player.velY = 0;
                    player.y = obj.currentY - player.height;
                    if (obj.isMoving) player.y += (obj.currentY - obj.oldY);
                } 
                // Head Bonk (The fix we added earlier)
                else if (player.velY < 0 && player.y - (player.velY * dt) >= obj.currentY + obj.height - 10) {
                    player.velY = 0;
                    player.y = obj.currentY + obj.height;
                }
            } 
            else if (obj.type === 'SPIKE') respawn();
            else if (obj.type === 'GOAL') nextLevel();
            else if (obj.type === 'PORTAL_SHRINK') setPlayerSize(15);
            else if (obj.type === 'PORTAL_NORMAL') setPlayerSize(30);
            else if (obj.type === 'PORTAL_GROW') setPlayerSize(45);
        }
    });

    // --- 5. X-AXIS MOVE & COLLISION ---
    player.x += player.velX * dt;
    
    worldObjects.forEach(obj => {
        // Parent to moving platform
        if (obj.isMoving && !player.jumping && 
            player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y + player.height >= obj.currentY - 5 && player.y + player.height <= obj.currentY + 10) {
            player.x += (obj.currentX - obj.oldX);
        }

        if (player.x < obj.currentX + obj.width && player.x + player.width > obj.currentX &&
            player.y < obj.currentY + obj.height && player.y + player.height > obj.currentY) {
            
            if (obj.type === 'PLATFORM') {
                if (player.y + player.height > obj.currentY + 5) {
                    if (player.velX > 0) { player.x = obj.currentX - player.width; player.velX = 0; }
                    else if (player.velX < 0) { player.x = obj.currentX + obj.width; player.velX = 0; }
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

// BOOT UP
initLevel();
requestAnimationFrame(update); // Start the loop with the timestamp
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

        else if (obj.type === 'PORTAL_SHRINK') ctx.fillStyle = '#9c88ff'; // Purple
        else if (obj.type === 'PORTAL_GROW') ctx.fillStyle = '#e1b12c';   // Gold
        else if (obj.type === 'PORTAL_NORMAL') ctx.fillStyle = '#00a8ff'; // Blue
        
        ctx.fillRect(obj.currentX, obj.currentY, obj.width, obj.height);
    });

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // --- DRAW TIMER ---
    ctx.fillStyle = "white";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "right";
    ctx.fillText(formatTime(elapsedTime), canvas.width - 20, 30);
    ctx.textAlign = "left"; 
}

// BOOT UP
initLevel();
update();
