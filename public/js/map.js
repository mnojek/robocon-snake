// map.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import { displayCountdown, displayGameOver } from "./ui.js";
import { canvas, ctx, gridSize } from "./ui.js";
import { snake, resetSnake } from "./snake.js";
import { gameState, resetGameSpeed } from "./main.js";

export const scoreToNextMap = defaultGameSettings.scoreToNextMap;
export const map = {
  currentMap: defaultGameSettings.initialMap,
  numberOfMaps: defaultGameSettings.numberOfMaps,
  tiles: [],
  walls: [], // Array to store wall coordinates
  food: { ...defaultGameSettings.initialFood },
};
export const extraFruit = {
  position: null,
  timer: null,
  blinkTimer: null,
  image: new Image(),
  blinking: false,
  visible: true,
};
extraFruit.image.src = "images/rf.png"; // Path to your extra fruit image

// Function to load the map from a text file
export async function loadMap() {
  try {
    const response = await fetch(`maps/map-${map.currentMap}.txt`);
    if (!response.ok) {
      console.warn(`Map file maps/map-${map.currentMap}.txt not found.`);
      return;
    }
    const mapText = await response.text();
    let mapLines = mapText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    snake.snakeSegments.length = 0; // Clear the snake array
    map.walls = []; // Clear the walls array
    map.tiles = []; // Clear the map array

    const mapHeight = mapLines.length;
    const mapWidth = mapLines[0].length;

    // Set the canvas size based on the map dimensions
    canvas.width = mapWidth * gridSize;
    canvas.height = mapHeight * gridSize;

    for (let y = 0; y < mapLines.length; y++) {
      const row = [];
      for (let x = 0; x < mapLines[y].length; x++) {
        if (mapLines[y][x] === "#") {
          map.walls.push({ x: x * gridSize, y: y * gridSize });
          row.push("#");
        } else if (mapLines[y][x] === "S") {
          row.push("S");
        } else if (mapLines[y][x] === "F") {
          map.food = { x: x * gridSize, y: y * gridSize };
          row.push("F");
        } else {
          row.push(" ");
        }
      }
      map.tiles.push(row);
    }
    resetSnake(); // Reset the snake position
  } catch (error) {
    console.error("Error loading the map:", error);
  }
}

export function loadNextMap() {
  if (map.currentMap >= map.numberOfMaps) {
    console.log("Game over");
    displayGameOver();
  }
  displayCountdown(3, "Next map in", () => {
    map.currentMap++;
    snake.foodEaten = 0; // Reset the food eaten counter
    gameState.extraFruitEaten = false; // Reset the extra fruit eaten flag
    gameState.scoreOnMap = defaultGameSettings.initialMapScore; // Reset the score for the current map
    resetGameSpeed(); // Reset the game speed
    map.walls = []; // Reset walls array
    map.tiles = []; // Reset map array
    snake.snakeSegments = [...defaultGameSettings.initialSnakePosition]; // Reset snake position
    snake.direction = { ...defaultGameSettings.initialDirection }; // Reset snake direction
    loadMap();
  });
}

// Draw walls on the canvas
export function drawWalls() {
  ctx.fillStyle = "grey";
  map.walls.forEach((wall) => {
    ctx.fillRect(wall.x, wall.y, gridSize, gridSize);
  });
}

export function drawSnake() {
  // Make sure there are snake segments before drawing
  if (snake.snakeSegments.length === 0) return;

  // Draw snake with smooth, rounded edges
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "green";
  ctx.lineWidth = gridSize;
  ctx.beginPath();
  ctx.moveTo(
    snake.snakeSegments[0].x + gridSize / 2,
    snake.snakeSegments[0].y + gridSize / 2
  );
  for (let i = 1; i < snake.snakeSegments.length; i++) {
    ctx.lineTo(
      snake.snakeSegments[i].x + gridSize / 2,
      snake.snakeSegments[i].y + gridSize / 2
    );
  }
  ctx.stroke();
}

export function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(map.food.x, map.food.y, gridSize, gridSize);
}

export function drawExtraFruit() {
  if (extraFruit.position) {
    ctx.drawImage(
      extraFruit.image,
      extraFruit.position.x,
      extraFruit.position.y,
      gridSize,
      gridSize
    );
  }
}

export function generateFood(canvas, gridSize) {
  let validPosition = false;

  while (!validPosition) {
    map.food.x =
      Math.floor((Math.random() * canvas.width) / gridSize) * gridSize;
    map.food.y =
      Math.floor((Math.random() * canvas.height) / gridSize) * gridSize;

    // Check if the generated position is not on a wall or on the snake
    validPosition =
      !map.walls.some(
        (wall) => wall.x === map.food.x && wall.y === map.food.y
      ) &&
      !snake.snakeSegments.some(
        (segment) => segment.x === map.food.x && segment.y === map.food.y
      );
  }
}

// Function to spawn extra fruit at a random position
export function spawnExtraFruit() {
  let validPosition = false;

  while (!validPosition) {
    extraFruit.position = {
      x: Math.floor((Math.random() * canvas.width) / gridSize) * gridSize,
      y: Math.floor((Math.random() * canvas.height) / gridSize) * gridSize,
    };

    // Check if the generated position is not on a wall or on the snake
    validPosition =
      !map.walls.some(
        (wall) =>
          wall.x === extraFruit.position.x && wall.y === extraFruit.position.y
      ) &&
      !snake.snakeSegments.some(
        (segment) =>
          segment.x === extraFruit.position.x &&
          segment.y === extraFruit.position.y
      ) &&
      !(
        map.food.x === extraFruit.position.x &&
        map.food.y === extraFruit.position.y
      );
  }
  // Set a timer to remove the extra fruit after a certain time
  extraFruit.timer = setTimeout(() => {
    extraFruit.position = null; // Remove extra fruit after the timer
    extraFruit.timer = null; // Clear the timer
  }, 10000); // 10 seconds

  extraFruit.blinkTimer = setTimeout(() => {
    blinkExtraFruit(5, () => {
      // Do nothing after blinking
      extraFruit.blinking = false;
    });
  }, 7000);
}

export function blinkExtraFruit(times, callback) {
  extraFruit.blinking = true;
  let count = 0;
  extraFruit.visible = true;
  const interval = setInterval(() => {
    extraFruit.visible = !extraFruit.visible; // Toggle visibility
    count++;
    if (count >= times * 2) {
      clearInterval(interval);
      extraFruit.blinking = false;
      extraFruit.visible = true; // Ensure it ends up visible
      callback();
    }
  }, 300); // Blink every 300ms
}

// Function to remove the extra fruit
export function removeExtraFruit() {
  extraFruit.position = null;
  extraFruit.blinking = false;
  if (extraFruit.timer) {
    clearTimeout(extraFruit.timer); // Clear the timer if it's still running
    extraFruit.timer = null;
  }
  if (extraFruit.blinkTimer) {
    clearTimeout(extraFruit.blinkTimer); // Clear the blink timer if it's still running
    extraFruit.blinkTimer = null;
  }
}
