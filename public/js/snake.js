// snake.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import {
  scoreToNextMap,
  map,
  loadNextMap,
  drawWalls,
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
  resetGameSpeed,
  increaseSpeed,
} from "./main.js";
import {
  ctx,
  canvas,
  gridSize,
  displayGameOver,
  updateLivesDisplay,
} from "./ui.js";

export const snake = {
  snakeSegments: [...defaultGameSettings.initialSnakePosition],
  lives: defaultGameSettings.initialLives,
  direction: { ...defaultGameSettings.initialDirection },
  foodEaten: 0,

  getHead() {
    return this.snakeSegments[0];
  },

  // Move the snake
  move() {
    const head = {
      x: this.snakeSegments[0].x + this.direction.x * gridSize,
      y: this.snakeSegments[0].y + this.direction.y * gridSize,
    };
    this.snakeSegments.unshift(head);

    // Remove the last segment unless the snake eats food
    if (head.x === map.food.x && head.y === map.food.y) {
      eatFood();
    } else {
      this.snakeSegments.pop();
    }
  },
};

// Update game state
export function updateSnakePosition() {
  snake.move();
  checkCollisions();
}

// Update checkCollisions function
export function checkCollisions() {
  const head = snake.getHead();

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
  for (let i = 1; i < snake.snakeSegments.length; i++) {
    if (
      snake.snakeSegments[i].x === head.x &&
      snake.snakeSegments[i].y === head.y
    ) {
      loseLife();
    }
  }
  // Extra fruit collision
  if (
    extraFruit.position &&
    head.x === extraFruit.position.x &&
    head.y === extraFruit.position.y
  ) {
    gameState.score += 5; // Give 5 extra points
    gameState.extraFruitEaten = true; // Set the extra fruit eaten flag
    removeExtraFruit(); // Remove the extra fruit
  }
}

export function eatFood() {
  gameState.score++; // Increment the score
  gameState.scoreOnMap++; // Increment the score for the current map
  snake.foodEaten++; // Increment the food eaten counter
  if (gameState.scoreOnMap >= scoreToNextMap) {
    loadNextMap(); // Load the next map if score reaches the limit per map
  } else {
    // Logic for spawning new food
    generateFood(canvas, gridSize);
    if (snake.foodEaten === 1) {
      spawnExtraFruit(canvas, gridSize);
    }
  }
  increaseSpeed(); // Increase the game speed
}

/**
 * Blinks the dead snake on the canvas a specified number of times.
 *
 * @param {number} times - The number of times to blink the snake.
 * @param {Function} callback - The function to call after blinking is complete.
 */
export function blinkSnake(times, callback) {
  let count = 0;
  const interval = setInterval(() => {
    if (count % 2 === 0) {
      // Hide the snake
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWalls();
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
}

// Check if the snake collides with a wall
export function checkWallCollision(head) {
  return map.walls.some((wall) => wall.x === head.x && wall.y === head.y);
}

// Handle losing life
export function loseLife() {
  snake.lives--;
  snake.foodEaten = 0; // Reset the food eaten counter
  updateLivesDisplay(snake.lives); // Update the lives display
  resetGameSpeed(); // Reset the game speed
  if (extraFruit.position) {
    removeExtraFruit(); // Remove the extra fruit if it exists
  }
  if (snake.lives <= 0) {
    gameState.isGameOver = true;
    snake.snakeSegments = []; // Clear the snake
    displayGameOver();
  } else {
    gameState.isPaused = true;
    blinkSnake(3, () => {
      resetSnake();
      if (gameState.extraFruitEaten) {
        gameState.extraFruitEaten = false; // Reset the extra fruit eaten flag
        gameState.score -= 5; // Deduct 5 points if the extra fruit was eaten
      }
      gameState.score -= gameState.scoreOnMap; // Reset the score for the current map
      gameState.scoreOnMap = 0; // Reset the score for the current map
      gameState.isPaused = false; // Resume the game loop
    });
  }
}

// Reset snake position after losing life
export function resetSnake() {
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
  snake.direction = { ...defaultGameSettings.initialDirection };
}
