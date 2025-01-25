const gameBoard = document.getElementById("game-board");
const player = document.getElementById("player");
const gameMaster = document.getElementById("game-master");
const timerElement = document.getElementById("timer");
const finishLine = document.getElementById("finish-line");

let playerPosition = { top: 90, left: 10 };
let isGreenLight = true;
let timeLeft = 60;
let lightInterval;
let timer;
let shootingInterval;
let keyPressed = {};

const obstacleCount = 5;
const obstacleElements = [];

function initializePlayerPosition() {
  playerPosition = { top: 90, left: 10 };
  updatePlayerPosition();
}

function moveObstacles() {
  obstacleElements.forEach((obstacle) => {
    let direction = 1;
    const speed = 0.5;

    function animate() {
      const currentLeft = parseFloat(obstacle.style.left);
      const newLeft = currentLeft + direction * speed;
      if (newLeft <= 0 || newLeft >= 90) {
        direction *= -1;
      }
      obstacle.style.left = `${newLeft}%`;

      requestAnimationFrame(animate);
    }

    animate();
  });
}

function generateObstacles() {
  obstacleElements.forEach((obstacle) => obstacle.remove());
  obstacleElements.length = 0;
  const controlsHeight = 60;
  const gameMasterHeight = 50;
  const gameMasterWidth = 50;
  const bufferDistance = 30;

  for (let i = 0; i < obstacleCount; i++) {
    let obstacle;
    let isOverlap;

    do {
      isOverlap = false;
      obstacle = document.createElement("div");
      obstacle.classList.add("obstacle");

      const randomTop = Math.random() * 90;
      const randomLeft = Math.random() * 90;

      obstacle.style.top = `${randomTop}%`;
      obstacle.style.left = `${randomLeft}%`;

      gameBoard.appendChild(obstacle);

      const obstacleRect = obstacle.getBoundingClientRect();

      const controlsZone = {
        top: gameBoard.offsetHeight - controlsHeight,
        bottom: gameBoard.offsetHeight,
        left: 0,
        right: gameBoard.offsetWidth,
      };

      const shooterZone = {
        top: gameMaster.offsetTop - bufferDistance,
        bottom: gameMaster.offsetTop + gameMasterHeight + bufferDistance,
        left: gameMaster.offsetLeft - bufferDistance,
        right: gameMaster.offsetLeft + gameMasterWidth + bufferDistance,
      };

      isOverlap =
        isRectOverlap(obstacleRect, controlsZone) ||
        isRectOverlap(obstacleRect, shooterZone);

      if (isOverlap) {
        gameBoard.removeChild(obstacle);
      }
    } while (isOverlap);

    obstacleElements.push(obstacle);
  }

  moveObstacles();
}
function isRectOverlap(rect1, rect2) {
  return !(
    rect1.bottom <= rect2.top ||
    rect1.top >= rect2.bottom ||
    rect1.right <= rect2.left ||
    rect1.left >= rect2.right
  );
}

document.addEventListener("keydown", (e) => {
  if (keyPressed[e.key] || !player) return;
  keyPressed[e.key] = true;

  if (isGreenLight || Math.random() < 0.2) {
    switch (e.key) {
      case "ArrowUp":
        if (playerPosition.top > 0) playerPosition.top -= 1;
        break;
      case "ArrowDown":
        if (playerPosition.top < 100) playerPosition.top += 1;
        break;
      case "ArrowLeft":
        if (playerPosition.left > 0) playerPosition.left -= 1;
        break;
      case "ArrowRight":
        if (playerPosition.left < 100) playerPosition.left += 1;
        break;
    }
    updatePlayerPosition();
  }
});

document.addEventListener("keyup", (e) => {
  keyPressed[e.key] = false;
});

function updatePlayerPosition() {
  player.style.top = `${playerPosition.top}%`;
  player.style.left = `${playerPosition.left}%`;
  checkIfCaught();
  checkIfFinished();
}

function checkIfCaught() {
  if (!isGreenLight) {
    if (!shootingInterval) {
      shootingInterval = setInterval(shootAtPlayer, 500);
    }
  } else {
    clearInterval(shootingInterval);
    shootingInterval = null;
  }
}

function checkIfFinished() {
  const playerRect = player.getBoundingClientRect();
  const finishLineRect = finishLine.getBoundingClientRect();

  if (
    playerRect.top < finishLineRect.bottom &&
    playerRect.bottom > finishLineRect.top &&
    playerRect.left < finishLineRect.right &&
    playerRect.right > finishLineRect.left
  ) {
    alert("You win! Great job!");
    resetGame();
  }
}

function shootAtPlayer() {
  const volleyCount = 2;

  for (let i = 0; i < volleyCount; i++) {
    setTimeout(() => createBullet(), i * 100);
  }
}

function createBullet() {
  const bullet = document.createElement("div");
  bullet.className = "bullet";

  const gameMasterRect = gameMaster.getBoundingClientRect();
  const gameBoardRect = gameBoard.getBoundingClientRect();
  bullet.style.left = `${
    gameMasterRect.left + gameMasterRect.width / 2 - gameBoardRect.left - 5
  }px`;
  bullet.style.top = `${
    gameMasterRect.top + gameMasterRect.height / 2 - gameBoardRect.top - 5
  }px`;

  gameBoard.appendChild(bullet);
  moveBullet(bullet);
}

function moveBullet(bullet) {
  const bulletRect = bullet.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  const dx =
    playerRect.left +
    playerRect.width / 2 -
    (bulletRect.left + bulletRect.width / 2);
  const dy =
    playerRect.top +
    playerRect.height / 2 -
    (bulletRect.top + bulletRect.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);

  const speed = 5;

  const velocityX = (dx / distance) * speed;
  const velocityY = (dy / distance) * speed;

  function animateBullet() {
    bullet.style.left = `${bullet.offsetLeft + velocityX}px`;
    bullet.style.top = `${bullet.offsetTop + velocityY}px`;

    if (
      bullet.offsetLeft < 0 ||
      bullet.offsetTop < 0 ||
      bullet.offsetLeft > gameBoard.clientWidth ||
      bullet.offsetTop > gameBoard.clientHeight
    ) {
      bullet.remove();
    } else if (isBulletCollision(bullet, player)) {
      alert("You were hit! Game Over.");
      resetGame();
    } else {
      requestAnimationFrame(animateBullet);
    }
  }

  requestAnimationFrame(animateBullet);
}

function isBulletCollision(bullet, target) {
  const bulletRect = bullet.getBoundingClientRect();

  if (target) {
    const targetRect = target.getBoundingClientRect();
    if (isRectOverlap(bulletRect, targetRect)) {
      return true;
    }
  }

  for (let obstacle of obstacleElements) {
    const obstacleRect = obstacle.getBoundingClientRect();
    if (isRectOverlap(bulletRect, obstacleRect)) {
      bullet.remove();
      return false;
    }
  }

  return false;
}

const controls = {
  up: () => (playerPosition.top > 0 ? (playerPosition.top -= 1) : null),
  down: () => (playerPosition.top < 100 ? (playerPosition.top += 1) : null),
  left: () => (playerPosition.left > 0 ? (playerPosition.left -= 1) : null),
  right: () => (playerPosition.left < 100 ? (playerPosition.left += 1) : null),
};

document.getElementById("controls").addEventListener("click", (e) => {
  if (e.target.classList.contains("control-btn")) {
    controls[e.target.id]();
    updatePlayerPosition();
  }
});

function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timerElement.innerText = `Time: ${timeLeft}`;
    } else {
      clearInterval(timer);
      alert("Time's up! You lost.");
      resetGame();
    }
  }, 1000);
}

function toggleLight() {
  isGreenLight = !isGreenLight;
  gameBoard.style.backgroundColor = isGreenLight ? "lightgreen" : "lightcoral";
}

function startGame() {
  initializePlayerPosition();
  generateObstacles();
  toggleLight();

  startTimer();

  lightInterval = setInterval(() => {
    toggleLight();
  }, 5000);
}

function resetGame() {
  clearInterval(lightInterval);
  clearInterval(timer);
  clearInterval(shootingInterval);
  timeLeft = 60;
  isGreenLight = true;
  shootingInterval = null;

  const bullets = document.querySelectorAll(".bullet");
  bullets.forEach((bullet) => bullet.remove());

  startGame();
}

startGame();
