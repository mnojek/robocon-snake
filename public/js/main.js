// main.js
// TODO: Validate map files
// TODO: Add game pausing feature

import { defaultGameSettings } from "./defaultGameSettings.js";
import { map } from "./map.js";
import { food } from "./food.js";
import { extraFruit } from "./extraFruit.js";
import { snake } from "./snake.js";
import { ctx, canvas, displayCountdown, updateLivesDisplay } from "./ui.js";
import { testReport } from "./testReport.js";

export const gameState = {
  isPaused: false,
  isGameOver: false,
  score: defaultGameSettings.initialScore,
  hiScore: defaultGameSettings.initialScore,
  scoreOnMap: defaultGameSettings.initialMapScore,
  extraFruitEaten: false,
};
export let keyQueue = [];

// Save highscore to the server
export function saveHighscore(name, score) {
  const newHighscore = { name, score };

  fetch("/highscores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newHighscore)
  })
  .then(response => {
    console.log("Response status:", response.status);
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text); });
    }
    return response.text();
  })
  .then(message => {
    console.log("Server message:", message);
    localStorage.setItem("highscores", JSON.stringify([{ name, score }])); // Update local storage
  })
  .catch(error => console.error("Error:", error));
}

// Save highscore to localStorage
export function saveHighscoreToLocalStorage(name, score) {
  let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  highscores.push({ name, score });

  // Sort the highscores by score, highest first
  highscores.sort((a, b) => b.score - a.score);

  localStorage.setItem("highscores", JSON.stringify(highscores));
}

export function handleEnterKey(event) {
  if (event.key === "Enter") {
    document.removeEventListener("keydown", handleEnterKey); // Remove the event listener
    document.getElementById("highscore-board").style.display = "none"; // Hide the highscore board
    document.getElementById("score").textContent = 0; // Reset the score
    document.getElementById("lives").textContent = ""; // Reset the lives
    restartGame();
  }
}

document.addEventListener("keydown", (e) => {
  let newDirection;
  switch (e.key) {
    case "ArrowUp":
    case "W":
    case "w":
      newDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
    case "S":
    case "s":
      newDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
    case "A":
    case "a":
      newDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
    case "D":
    case "d":
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

export function restartGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Reset game state
  keyQueue = [];
  gameState.isGameOver = false;
  gameState.isPaused = false;

  gameState.hiScore = defaultGameSettings.initialScore;
  gameState.score = defaultGameSettings.initialScore;
  gameState.scoreOnMap = defaultGameSettings.initialMapScore;

  map.currentMap = defaultGameSettings.initialMap;
  map.tiles.length = 0;
  map.walls.length = 0;
  food.position = { ...defaultGameSettings.initialFoodPosition };

  snake.speed = defaultGameSettings.initialSnakeSpeed;
  snake.snakeSegments = [...defaultGameSettings.initialSnakePosition];
  snake.lives = defaultGameSettings.initialSnakeLives;
  snake.direction = { ...defaultGameSettings.initialSnakeDirection };

  testReport.testCases.length = 0; // Reset testCases

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
    snake.move();
    draw();
  }

  setTimeout(gameLoop, snake.speed); // Control the snake speed (100ms per frame by default)
}

// Modify the game loop to draw walls
export function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  map.drawBackground(); // Draw the background
  food.draw();
  if (extraFruit.position && extraFruit.visible) {
    extraFruit.draw();
  }
  map.drawWalls();
  snake.draw();
  testReport.draw();

  // Update score and lives
  if (gameState.hiScore !== gameState.score) {
    document.getElementById("score").textContent = `${gameState.score} (Hi: ${gameState.hiScore})`;
  } else {
    document.getElementById("score").textContent = gameState.score;
  }
  updateLivesDisplay(snake.lives);
}

// Start the game
async function startGame() {
  testReport.initiate();
  testReport.draw();
  testReport.addTestSuiteTitle("Snake");
  await map.loadMap();
  displayCountdown(3, `Test case ${map.currentMap}`, () => {
    document.getElementById("game-info").style.display = "flex";
    gameLoop();
  });
}

startGame();
