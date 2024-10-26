// TODO: Show different head for the snake
// TODO: Validate map files
// TODO: Add fruits with more points that disappear after a while

import { defaultGameSettings } from "./defaultGameSettings.js";
import { map, loadMap, drawWalls, drawSnake, drawFood } from "./map.js";
import { updateSnakePosition, snake } from "./snake.js";
import { ctx, canvas, displayCountdown } from "./ui.js";

export const gameState = {
  isPaused: false,
  isGameOver: false,
  gameSpeed: defaultGameSettings.initialGameSpeed,
  score: defaultGameSettings.initialScore,
  scoreOnMap: defaultGameSettings.initialMapScore,
};
export let keyQueue = [];

// Save highscore to localStorage
export function saveHighscore(name, score) {
  let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  highscores.push({ name, score });

  // Sort the highscores by score, highest first, and keep only the top 5
  highscores.sort((a, b) => b.score - a.score);
  highscores = highscores.slice(0, 5); // Keep top 5 scores

  localStorage.setItem("highscores", JSON.stringify(highscores));
}

export function handleEnterKey(event) {
  if (event.key === "Enter") {
    document.removeEventListener("keydown", handleEnterKey); // Remove the event listener
    restartGame();
  }
}

document.addEventListener("keydown", (e) => {
  let newDirection;
  switch (e.key) {
    case "ArrowUp":
      newDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      newDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      newDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      newDirection = { x: 1, y: 0 };
      break;
    default:
      return; // Ignore other keys
  }

  // Add the new direction to the queue if it's not opposite to the current direction
  if (!isOppositeDirection(newDirection, snake.direction)) {
    keyQueue.push(newDirection);
  }
});

// Function to check if the new direction is not the opposite to the current direction
function isOppositeDirection(newDirection, currentDirection) {
  return (
    (newDirection.x === -currentDirection.x && newDirection.y === 0) ||
    (newDirection.y === -currentDirection.y && newDirection.x === 0)
  );
}

// Function to increase the game speed
export function increaseSpeed(points = 5) {
  if (gameState.gameSpeed > 50) {
    // Set a minimum speed limit
    gameState.gameSpeed -= points; // Decrease the interval by X ms
  }
}

export function resetGameSpeed() {
  gameState.gameSpeed = defaultGameSettings.initialGameSpeed;
}

export function restartGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Reset game state
  keyQueue = [];
  gameState.isGameOver = false;
  gameState.isPaused = false;

  map.currentMap = 1;
  map.tiles.length = 0;
  map.walls.length = 0;

  snake.snakeSegments = [...defaultGameSettings.initialSnakePosition];
  resetGameSpeed();
  gameState.score = defaultGameSettings.initialScore;
  snake.lives = defaultGameSettings.initialLives;
  snake.direction = { ...defaultGameSettings.initialDirection };
  map.food = { ...defaultGameSettings.initialFood };
  gameState.scoreOnMap = defaultGameSettings.initialMapScore;

  // Restart the game
  startGame();
}

// Game loop
function gameLoop() {
  if (gameState.isGameOver) return; // Check if the game is paused or over
  if (!gameState.isPaused) {
    // Process the key queue
    while (keyQueue.length > 0) {
      const newDirection = keyQueue.shift();
      if (!isOppositeDirection(newDirection, snake.direction)) {
        snake.direction = newDirection;
        break; // Process only the first valid direction
      }
    }
    updateSnakePosition();
    draw();
  }

  setTimeout(gameLoop, gameState.gameSpeed); // Control the snake speed (100ms per frame by default)
}

// Modify the game loop to draw walls
export function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWalls();
  drawSnake();
  drawFood();

  // Update score and lives
  document.getElementById("score").textContent = gameState.score;
  document.getElementById("lives").textContent = snake.lives;
}

// Start the game
async function startGame() {
  await loadMap();
  displayCountdown(1, "Start in", () => {
    gameLoop();
  });
}

startGame();
