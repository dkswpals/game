const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player properties
const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 50,
  height: 20,
  color: 'white',
  speed: 5,
  teleportDistance: 100, // Distance to teleport
  lastKeyPress: null,
  lastKeyPressTime: 0,
  teleportCooldown: 300, // Time in ms to wait before next teleport
};

// Bullet properties
const bullets = [];
const bulletSpeed = 7;

// Enemy properties
const enemies = [];
const enemyWidth = 40;
const enemyHeight = 20;
const enemySpeed = 2;
const enemySpawnInterval = 2000; // milliseconds
let lastEnemySpawnTime = 0;

// Controls
let keys = {};

// Event listeners for controls
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  handleDoubleClick(e.code);
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function handleDoubleClick(keyCode) {
  const currentTime = Date.now();

  if (player.lastKeyPress === keyCode && currentTime - player.lastKeyPressTime < player.teleportCooldown) {
    teleportPlayer(keyCode);
  }

  player.lastKeyPress = keyCode;
  player.lastKeyPressTime = currentTime;
}

// Game loop
function gameLoop(timestamp) {
  update(timestamp);
  draw();
  requestAnimationFrame(gameLoop);
}

function update(timestamp) {
  // Player movement
  if (keys['ArrowLeft'] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }
  if (keys['Space']) {
    shoot();
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bulletSpeed;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemySpeed;
    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1); // Remove enemies that go off screen
    }
  }

  // Check for bullet-enemy collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (isCollision(bullets[i], enemies[j])) {
        bullets.splice(i, 1); // Remove bullet
        enemies.splice(j, 1); // Remove enemy
        break;
      }
    }
  }

  // Spawn new enemies
  if (timestamp - lastEnemySpawnTime > enemySpawnInterval) {
    spawnEnemy();
    lastEnemySpawnTime = timestamp;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw bullets
  ctx.fillStyle = 'red';
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, 5, 10);
  }

  // Draw enemies
  ctx.fillStyle = 'green';
  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemyWidth, enemyHeight);
  }
}

function shoot() {
  if (!keys['Space']) return;
  bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
}

function spawnEnemy() {
  const x = Math.random() * (canvas.width - enemyWidth);
  enemies.push({ x, y: -enemyHeight });
}

function isCollision(bullet, enemy) {
  return (
    bullet.x < enemy.x + enemyWidth &&
    bullet.x + 5 > enemy.x &&
    bullet.y < enemy.y + enemyHeight &&
    bullet.y + 10 > enemy.y
  );
}

function teleportPlayer(keyCode) {
  switch (keyCode) {
    case 'ArrowLeft':
      player.x = Math.max(0, player.x - player.teleportDistance);
      break;
    case 'ArrowRight':
      player.x = Math.min(canvas.width - player.width, player.x + player.teleportDistance);
      break;
    case 'ArrowUp':
      player.y = Math.max(0, player.y - player.teleportDistance);
      break;
    case 'ArrowDown':
      player.y = Math.min(canvas.height - player.height, player.y + player.teleportDistance);
      break;
  }
}

// Start the game loop
requestAnimationFrame(gameLoop);
