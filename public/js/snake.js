// snake.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import {
  scoreToNextMap,
  map,
  drawFood,
  generateFood,
  spawnExtraFruit,
  removeExtraFruit,
  drawExtraFruit,
  extraFruit,
} from "./map.js";
import {
  gameState,
  draw,
  keyQueue,
} from "./main.js";
import {
  ctx,
  canvas,
  gridSize,
  displayGameOver,
  updateLivesDisplay,
} from "./ui.js";
import { updateTestResult, summarizeTestReport, testCases } from "./testReport.js";

export const snake = {
  snakeSegments: [...defaultGameSettings.initialSnakePosition],
  lives: defaultGameSettings.initialSnakeLives,
  direction: { ...defaultGameSettings.initialSnakeDirection },
  foodEaten: 0,
  speed: defaultGameSettings.initialSnakeSpeed,

  getHead() {
    return this.snakeSegments[0];
  },

  // Move the snake
  move() {
    const head = {
      x: this.getHead().x + this.direction.x * gridSize,
      y: this.getHead().y + this.direction.y * gridSize,
    };
    this.snakeSegments.unshift(head);

    // Remove the last segment unless the snake eats food
    if (head.x === map.food.x && head.y === map.food.y) {
      snake.eatFood();
    } else {
      this.snakeSegments.pop();
    }

    // Check for collisions
    checkCollisions(head);
  },

  eatFood() {
    gameState.score++; // Increment the score
    gameState.scoreOnMap++; // Increment the score for the current map
    if (gameState.score > gameState.hiScore) {
      gameState.hiScore = gameState.score; // Update the high score
    }
    snake.foodEaten++; // Increment the food eaten counter
    if (gameState.scoreOnMap >= scoreToNextMap) {
      map.finishMap(); // Load the next map if score reaches the limit per map
    } else {
      // Logic for spawning new food
      generateFood(canvas, gridSize);
      if (snake.foodEaten === defaultGameSettings.foodToExtraFruit) {
        spawnExtraFruit(canvas, gridSize);
      }
    }
    snake.increaseSpeed(); // Increase the game speed
  },

  eatExtraFruit() {
    gameState.score += defaultGameSettings.extraFruitScore; // Give 5 extra points
    if (gameState.score > gameState.hiScore) {
      gameState.hiScore = gameState.score; // Update the high score
    }
    gameState.extraFruitEaten = true; // Set the extra fruit eaten flag
    removeExtraFruit(); // Remove the extra fruit
  },

  loseLife() {
    snake.lives--;
    snake.foodEaten = 0; // Reset the food eaten counter
    updateLivesDisplay(snake.lives); // Update the lives display
    snake.speed = defaultGameSettings.initialSnakeSpeed; // Reset the snake speed
    if (extraFruit.position) {
      removeExtraFruit(); // Remove the extra fruit if it exists
    }
    if (snake.lives <= 0 || map.currentMap > map.numberOfMaps) {
      // Check if all maps are finished
      gameState.isGameOver = true;
      testCases.push({ name: `Test ${map.currentMap}`, status: "FAIL" }); // Mark current map as FAIL
      updateTestResult("FAIL"); // Update the test result
      // Mark remaining maps as SKIP
      for (let i = map.currentMap + 1; i <= map.numberOfMaps; i++) {
        testCases.push({ name: `Test ${i}`, status: "SKIP" });
      }
      summarizeTestReport("Snake"); // Summarize the test report
      displayGameOver();
    } else {
      gameState.isPaused = true;
      snake.blink(3, () => {
        snake.reset();
        if (gameState.extraFruitEaten) {
          gameState.extraFruitEaten = false; // Reset the extra fruit eaten flag
          gameState.score -= defaultGameSettings.extraFruitScore; // Deduct 5 points if the extra fruit was eaten
        }
        gameState.score -= gameState.scoreOnMap; // Reset the score for the current map
        gameState.scoreOnMap = 0; // Reset the score for the current map
        gameState.isPaused = false; // Resume the game loop
      });
    }
  },

  // Function to increase the game speed
  increaseSpeed(points = defaultGameSettings.snakeSpeedIncrement) {
    if (snake.speed > 50) {
      // Set a minimum speed limit
      snake.speed -= points; // Decrease the interval by X ms
    }
  },

  reset() {
    keyQueue.length = 0;
    snake.snakeSegments = [];
    for (let y = 0; y < map.tiles.length; y++) {
      for (let x = 0; x < map.tiles[y].length; x++) {
        if (map.tiles[y][x] === "S") {
          snake.snakeSegments.push({ x: x * gridSize, y: y * gridSize });
        }
      }
    }
    snake.snakeSegments.reverse(); // Reverse the snake array
    snake.direction = { ...defaultGameSettings.initialSnakeDirection };
  },

  draw() {
    // Make sure there are snake segments before drawing
    if (snake.snakeSegments.length === 0) return; // Check if the game is over

    // Draw snake with rounded edges but sharp corners
    ctx.lineJoin = "miter";
    ctx.lineCap = "round";
    ctx.strokeStyle = defaultGameSettings.cyanColor;
    ctx.lineWidth = gridSize * 0.8;
    ctx.beginPath();
    ctx.moveTo(
      snake.getHead().x + gridSize / 2,
      snake.getHead().y + gridSize / 2
    );
    for (let i = 1; i < snake.snakeSegments.length; i++) {
      ctx.lineTo(
        snake.snakeSegments[i].x + gridSize / 2,
        snake.snakeSegments[i].y + gridSize / 2
      );
    }
    ctx.stroke();
  },

  blink(times, callback) {
    let count = 0;
    const interval = setInterval(() => {
      if (count % 2 === 0) {
        // Hide the snake
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        map.drawBackground();
        map.drawWalls();
        drawFood();
        drawExtraFruit();
      } else {
        // Show the snake
        draw();
      }
      count++;
      if (count >= times * 2) {
        clearInterval(interval);
        callback();
      }
    }, 300); // Blink every 300ms
  },
};

// Update checkCollisions function
function checkCollisions(head) {
  // Wall collision
  if (checkWallCollision(head)) {
    snake.loseLife();
  }

  // Border collision
  if (checkBorderCollision(head)) {
    snake.loseLife();
  }

  // Self-collision
  for (let i = 1; i < snake.snakeSegments.length; i++) {
    if (
      snake.snakeSegments[i].x === head.x &&
      snake.snakeSegments[i].y === head.y
    ) {
      snake.loseLife();
    }
  }
  // Extra fruit collision
  if (checkExtraFruitCollision(head)) {
    snake.eatExtraFruit();
  }
}

// Check if the snake collides with a wall
function checkWallCollision(head) {
  return map.walls.some((wall) => wall.x === head.x && wall.y === head.y);
}

function checkBorderCollision(head) {
  return (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  );
}

function checkExtraFruitCollision(head) {
  return (
    extraFruit.position &&
    head.x === extraFruit.position.x &&
    head.y === extraFruit.position.y
  );
}
