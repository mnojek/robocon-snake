const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const gridSize = 20; // Size of each square on the grid
const scoreToNextMap = 10;
let isPaused = false; // Add a flag to control the game loop
let map = [];
let currentMap = 1; // Start with the first map
let snake = []; // Snake starts with one segment
let gameSpeed = 100; // Initial snake speed
let direction = { x: 1, y: 0 }; // Snake starts moving right
let food = {}; // Starting food position
let score = 0;
let scoreOnMap = 0;
let lives = 3;
let isGameOver = false;

let walls = []; // Array to store wall coordinates

// Function to load the map from a text file
async function loadMap() {
  try {
    const response = await fetch(`maps/map-${currentMap}.txt`);
    const mapText = await response.text();
    const mapLines = mapText.split("\n");

    for (let y = 0; y < mapLines.length; y++) {
      const row = [];
      for (let x = 0; x < mapLines[y].length; x++) {
        if (mapLines[y][x] === "#") {
          walls.push({ x: x * gridSize, y: y * gridSize });
          row.push("#");
        } else if (mapLines[y][x] === "S") {
          snake[0] = { x: x * gridSize, y: y * gridSize };
          row.push(" ");
        } else if (mapLines[y][x] === "F") {
          food = { x: x * gridSize, y: y * gridSize };
          row.push(" ");
        } else {
          row.push(" ");
        }
      }
      map.push(row);
    }
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
    update();
    draw();
  }

  setTimeout(gameLoop, gameSpeed); // Control the snake speed (100ms per frame)
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
    loadNextMap(); // Load the next map if score reaches 20
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
  scoreOnMap = 0;
  gameSpeed = 100; // Reset the game speed
  walls = []; // Reset walls array
  map = []; // Reset map array
  snake = [{ x: 40, y: 40 }]; // Reset snake position
  direction = { x: 1, y: 0 };
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
  if (lives <= 0) {
    isGameOver = true;
    displayGameOver();
  } else {
    resetSnake();
  }
}

// Reset snake position after losing life
function resetSnake() {
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

    // Check if the generated position is not on a wall
    validPosition = !walls.some(wall => wall.x === food.x && wall.y === food.y);
  }
}

function displayGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 20);

  setTimeout(() => {
    promptForHighscore();
  }, 1000);
}

// Prompt for player name (simplified)
function promptForHighscore() {
  let playerName = prompt("Enter your name for the highscore:");
  if (playerName) {
    saveHighscore(playerName, score);
    displayHighscoreBoard(); // Display highscores after saving
  }
}

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
}

// Start the game
async function startGame() {
  await loadMap();
  gameLoop();
}

startGame();

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});
