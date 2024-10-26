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
  displayCountdown(1, "Next map in", () => {
    map.currentMap++;
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

  // Draw the head in a different color
  const head = snake.getHead();
  ctx.fillStyle = "#66ff66"; // Set the color for the snake's head
  ctx.fillRect(head.x, head.y, gridSize, gridSize);

  // Draw the rest of the snake segments in green
  ctx.fillStyle = "green"; // Set the color for the body
  snake.snakeSegments.slice(1).forEach((segment) => {
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });
}

export function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(map.food.x, map.food.y, gridSize, gridSize);
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
