// ... (Your canvas, ctx, player, and gravity variables stay here) ...

// ==========================================
// 1. THE LEVEL DATABASE
// ==========================================
// To add a new level:
// 1. Design it in the editor and click "Export Code".
// 2. Copy the [ { ... }, { ... } ] part.
// 3. Add a comma after the previous level and paste your code inside the brackets below.

const LEVEL_DATABASE = [
    // --- LEVEL 1 (Index 0) ---
    [
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
        {"x":50,"y":330,"width":30,"height":30,"type":"SPAWN"},
        {"x":700,"y":300,"width":50,"height":80,"type":"GOAL"}
    ],
    // --- LEVEL 2 (Index 1) ---
    [
        {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
        {"x":40,"y":320,"width":30,"height":30,"type":"SPAWN"},
        {"x":200,"y":300,"width":100,"height":20,"type":"PLATFORM"},
        {"x":350,"y":220,"width":20,"height":160,"type":"SPIKE"},
        {"x":500,"y":250,"width":100,"height":20,"type":"PLATFORM"},
        {"x":700,"y":180,"width":50,"height":50,"type":"GOAL"}
    ],
    // ADD NEW LEVELS HERE (Don't forget the comma above!)
];

// ==========================================
// 2. LEVEL STATE MANAGEMENT
// ==========================================
let currentLevelIndex = 0;
let worldObjects = LEVEL_DATABASE[currentLevelIndex];
let spawnPoint = { x: 50, y: 300 };

function initLevel() {
    // Load objects from the database based on current level
    worldObjects = LEVEL_DATABASE[currentLevelIndex];
    
    // Find the spawn point
    const spawn = worldObjects.find(o => o.type === 'SPAWN');
    if (spawn) {
        spawnPoint = { x: spawn.x, y: spawn.y };
    }
    
    respawn();
}

function nextLevel() {
    currentLevelIndex++;
    
    // Check if there are more levels
    if (currentLevelIndex < LEVEL_DATABASE.length) {
        initLevel();
    } else {
        alert("🎉 CONGRATULATIONS! You beat every level!");
        currentLevelIndex = 0; // Restart from Level 1
        initLevel();
    }
}

function respawn() {
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;
    player.velX = 0;
    player.velY = 0;
}

// ==========================================
// 3. GAME ENGINE
// ==========================================

function update() {
    // ... (Your existing movement logic: gravity, keys, friction) ...

    player.y += player.velY;
    player.x += player.velX;

    // OBJECT COLLISION LOOP
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
            } 
            else if (obj.type === 'SPIKE') {
                respawn(); 
            } 
            else if (obj.type === 'GOAL') {
                // We use a small timeout so the player sees they touched it
                setTimeout(() => {
                    nextLevel();
                }, 10);
            }
        }
    });

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Current Level Number
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Level: ${currentLevelIndex + 1}`, 20, 30);

    worldObjects.forEach(obj => {
        if (obj.type === 'PLATFORM') ctx.fillStyle = '#2f3542';
        else if (obj.type === 'SPIKE') ctx.fillStyle = '#ff4757';
        else if (obj.type === 'GOAL') ctx.fillStyle = '#ffa502';
        else if (obj.type === 'SPAWN') ctx.fillStyle = '#2ed573';
        
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    });

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Kick off the game
initLevel();
update();
