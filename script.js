// ... (Keep the previous setup variables like canvas, ctx, player) ...

// Use the code you export from the editor here!
let worldObjects = [
    {"x":0,"y":380,"width":800,"height":20,"type":"PLATFORM"},
    {"x":50,"y":330,"width":30,"height":30,"type":"SPAWN"}, // Default spawn
    {"x":700,"y":300,"width":50,"height":80,"type":"GOAL"}
];

let spawnPoint = { x: 50, y: 300 };

function initLevel() {
    // Find the spawn point in the level data
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

function update() {
    // ... (Keep movement logic from previous code) ...

    player.y += player.velY;
    player.x += player.velX;

    // OBJECT COLLISION LOOP
    worldObjects.forEach(obj => {
        if (player.x < obj.x + obj.width &&
            player.x + player.width > obj.x &&
            player.y < obj.y + obj.height &&
            player.y + player.height > obj.y) {
            
            if (obj.type === 'PLATFORM') {
                // Land on platform
                if (player.velY > 0 && player.y + player.height - player.velY <= obj.y) {
                    player.jumping = false;
                    player.velY = 0;
                    player.y = obj.y - player.height;
                }
            } else if (obj.type === 'SPIKE') {
                respawn(); // Ouch!
            } else if (obj.type === 'GOAL') {
                alert("Level Complete!");
                // You could trigger nextLevel() here
                respawn(); 
            }
        }
    });

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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

initLevel();
update();
