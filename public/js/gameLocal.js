// TODO: Blink snake 3 times when dead
// TODO: Reset the points when lives are lost, but keep when the map changes
// TODO: Add a countdown before starting the game
// TODO: Show different head for the snake
// TODO: Validate map files
// TODO: Add fruits with more points that disappear after a while


import { defaultGameSettings as defaultGameSettings } from "./defaultGameSettings.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
let keyQueue = [];
const gridSize = defaultGameSettings.gridSize;
const scoreToNextMap = defaultGameSettings.scoreToNextMap;
let currentMap = defaultGameSettings.initialMap;
let map = [];
let walls = []; // Array to store wall coordinates

let snake = [...defaultGameSettings.initialSnakePosition];
let gameSpeed = defaultGameSettings.initialGameSpeed;
let direction = { ...defaultGameSettings.initialDirection };
let food = { ...defaultGameSettings.initialFood };
let score = defaultGameSettings.initialScore;
let scoreOnMap = defaultGameSettings.initialMapScore;
let lives = defaultGameSettings.initialLives;

let isGameOver = false;
let isPaused = false; // Add a flag to control the game loop


// Function to load the map from a text file
async function loadMap() {
  try {
    const response = await fetch(`maps/map-${currentMap}.txt`);
    const mapText = await response.text();
    const mapLines = mapText.split("\n");
    snake = []; // Clear the snake array
    walls = []; // Clear the walls array
    map = []; // Clear the map array

    for (let y = 0; y < mapLines.length; y++) {
      const row = [];
      for (let x = 0; x < mapLines[y].length; x++) {
        if (mapLines[y][x] === "#") {
          walls.push({ x: x * gridSize, y: y * gridSize });
          row.push("#");
        } else if (mapLines[y][x] === "S") {
          snake.push({ x: x * gridSize, y: y * gridSize });
          row.push("S");
        } else if (mapLines[y][x] === "F") {
          food = { x: x * gridSize, y: y * gridSize };
          row.push("F");
        } else {
          row.push(" ");
        }
      }
      map.push(row);
    }
    snake.reverse(); // Reverse the snake array
  } catch (error) {
    console.error("Error loading the map:", error);
  }
}

// Draw walls on the canvas
function drawWalls() {
  ctx.fillStyle = "grey";
  walls.forEach((wall) => {
    ctx.fillRect(wall.x, wall.y, gridSize, gridSize);
  });
}

// Check if the snake collides with a wall
function checkWallCollision(head) {
  return walls.some((wall) => wall.x === head.x && wall.y === head.y);
}

// Game loop
function gameLoop() {
  if (isGameOver) return; // Check if the game is paused or over
  if (!isPaused) {
    // Process the key queue
    while (keyQueue.length > 0) {
      const newDirection = keyQueue.shift();
      if (!isOppositeDirection(newDirection, direction)) {
        direction = newDirection;
        break; // Process only the first valid direction
      }
    }
    update();
    draw();
  }

  setTimeout(gameLoop, gameSpeed); // Control the snake speed (100ms per frame by default)
}

// Update game state
function update() {
  moveSnake();
  checkCollisions();
}

// Move the snake
function moveSnake() {
  const head = {
    x: snake[0].x + direction.x * gridSize,
    y: snake[0].y + direction.y * gridSize,
  };
  snake.unshift(head);

  // Remove the last segment unless the snake eats food
  if (head.x === food.x && head.y === food.y) {
    eatFood();
  } else {
    snake.pop();
  }
}

function eatFood() {
  score++; // Increment the score
  scoreOnMap++; // Increment the score for the current map
  if (scoreOnMap >= scoreToNextMap) {
    loadNextMap(); // Load the next map if score reaches the limit per map
  } else {
    // Logic for spawning new food
    generateFood();
  }
  increaseSpeed(); // Increase the game speed
}

// Function to increase the game speed
function increaseSpeed() {
  if (gameSpeed > 50) { // Set a minimum speed limit
    gameSpeed -= 5; // Decrease the interval by 5ms
  }
}

// Function to display the countdown
function displayCountdown(callback) {
  isPaused = true; // Pause the game loop
  let countdown = 3;
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(
      `Next map in ${countdown}...`,
      canvas.width / 2 - 80,
      canvas.height / 2 - 20
    );
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      isPaused = false; // Resume the game loop
      callback(); // Call the callback function to load the next map
    }
  }, 1000); // Update every second
}

function loadNextMap() {
  displayCountdown(() => {
    currentMap++;
    scoreOnMap = defaultGameSettings.initialMapScore; // Reset the score for the current map
    gameSpeed = defaultGameSettings.initialGameSpeed; // Reset the game speed
    walls = []; // Reset walls array
    map = []; // Reset map array
    snake = [...defaultGameSettings.initialSnakePosition]; // Reset snake position
    direction = { ...defaultGameSettings.initialDirection }; // Reset snake direction
    loadMap();
  });
}

// Update checkCollisions function
function checkCollisions() {
  const head = snake[0];

  // Wall collision
  if (checkWallCollision(head)) {
    loseLife();
  }

  // Border collision
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  ) {
    loseLife();
  }

  // Self-collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      loseLife();
    }
  }
}

// Handle losing life
function loseLife() {
  lives--;
  gameSpeed = defaultGameSettings.initialGameSpeed; // Reset the game speed
  if (lives <= 0) {
    isGameOver = true;
    snake = []; // Clear the snake
    displayGameOver();
  } else {
    resetSnake();
    score -= scoreOnMap; // Reset the score for the current map
    scoreOnMap = 0; // Reset the score for the current map
  }
}

// Reset snake position after losing life
function resetSnake() {
  keyQueue = [];
  snake = [{ x: 40, y: 40 }];
  direction = { x: 1, y: 0 };
}

// Modify the game loop to draw walls
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw walls
  drawWalls();

  // Draw snake
  ctx.fillStyle = "green";
  snake.forEach((segment) => {
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);

  // Update score and lives
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
}

// Generate new food position
function generateFood() {
  let validPosition = false;

  while (!validPosition) {
    food.x = Math.floor((Math.random() * canvas.width) / gridSize) * gridSize;
    food.y = Math.floor((Math.random() * canvas.height) / gridSize) * gridSize;

    // Check if the generated position is not on a wall or on the snake
    validPosition = !walls.some(wall => wall.x === food.x && wall.y === food.y) &&
                    !snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
}

function displayGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 20);
  document.getElementById("final-score").textContent = score;

  setTimeout(() => {
    document.getElementById("game-over-screen").style.display = "flex";
  }, 1000);
}

// Handle form submission
document.getElementById("highscore-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const playerName = document.getElementById("player-name").value;
  if (playerName) {
    saveHighscore(playerName, score);
    displayHighscoreBoard(); // Display highscores after saving
    document.getElementById("game-over-screen").style.display = "none";
  }
});

// Save highscore to localStorage
function saveHighscore(name, score) {
  let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  highscores.push({ name, score });

  // Sort the highscores by score, highest first, and keep only the top 5
  highscores.sort((a, b) => b.score - a.score);
  highscores = highscores.slice(0, 5); // Keep top 5 scores

  localStorage.setItem("highscores", JSON.stringify(highscores));
}


// Display the highscore board
function displayHighscoreBoard() {
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the game area

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Highscore Board:", canvas.width / 2 - 80, 100);

  highscores.forEach((scoreEntry, index) => {
    ctx.fillText(
      `${index + 1}. ${scoreEntry.name}: ${scoreEntry.score}`,
      canvas.width / 2 - 80,
      140 + index * 30
    );
  });

  // Display "Press enter to start again" below the player scores
  ctx.fillText(
    "Press enter to start again",
    canvas.width / 2 - 80,
    140 + highscores.length * 30 + 40
  );

  // Add event listener for Enter key to restart the game
  document.addEventListener("keydown", handleEnterKey);
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    document.removeEventListener("keydown", handleEnterKey); // Remove the event listener
    restartGame();
  }
}

function restartGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Reset game state
  keyQueue = [];
  isGameOver = false;
  isPaused = false;

  currentMap = 1;
  map = [];
  walls = [];

  snake = [...defaultGameSettings.initialSnakePosition];
  gameSpeed = defaultGameSettings.initialGameSpeed;
  score = defaultGameSettings.initialScore;
  lives = defaultGameSettings.initialLives;
  direction = { ...defaultGameSettings.initialDirection };
  food = { ...defaultGameSettings.initialFood };
  scoreOnMap = defaultGameSettings.initialMapScore;

  // Restart the game
  startGame();
}

// Start the game
async function startGame() {
  await loadMap();
  gameLoop();
}

startGame();

function isOppositeDirection(newDirection, currentDirection) {
  return (
    (newDirection.x === -currentDirection.x && newDirection.y === 0) ||
    (newDirection.y === -currentDirection.y && newDirection.x === 0)
  );
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
  if (!isOppositeDirection(newDirection, direction)) {
    keyQueue.push(newDirection);
  }
});
