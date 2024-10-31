// map.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import { displayCountdown, displayGameOver } from "./ui.js";
import { canvas, ctx, gridSize } from "./ui.js";
import { snake, resetSnake } from "./snake.js";
import { gameState, resetSnakeSpeed } from "./main.js";

export const scoreToNextMap = defaultGameSettings.scoreToNextMap;
export const map = {
  currentMap: defaultGameSettings.initialMap,
  numberOfMaps: defaultGameSettings.numberOfMaps,
  tiles: [],
  walls: [], // Array to store wall coordinates
  food: { ...defaultGameSettings.initialFoodPosition },
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
const rfLogoImage = new Image();
rfLogoImage.src = "images/rf.png"; // Path to the RF logo image

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
    gameState.score += snake.lives * defaultGameSettings.extraScoreForRemainingLife; // Add 10 points for each remaining life
    displayGameOver();
  } else {
    displayCountdown(3, "Next map in", () => {
      map.currentMap++;
      snake.foodEaten = 0; // Reset the food eaten counter
      gameState.extraFruitEaten = false; // Reset the extra fruit eaten flag
      gameState.scoreOnMap = defaultGameSettings.initialMapScore; // Reset the score for the current map
      resetSnakeSpeed(); // Reset the game speed
      map.walls = []; // Reset walls array
      map.tiles = []; // Reset map array
      snake.snakeSegments = [...defaultGameSettings.initialSnakePosition]; // Reset snake position
      snake.direction = { ...defaultGameSettings.initialSnakeDirection }; // Reset snake direction
      loadMap();
    });
  }
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
}

export function drawFood() {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(map.food.x + gridSize / 2, map.food.y + gridSize / 2, gridSize / 2.5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawExtraFruit() {
  if (extraFruit.position) {
    const fruitSize = gridSize * 0.8;
    ctx.drawImage(
      extraFruit.image,
      extraFruit.position.x + (gridSize - fruitSize) / 2,
      extraFruit.position.y + (gridSize - fruitSize) / 2,
      fruitSize,
      fruitSize
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

    const distanceFromSnakeHead = Math.sqrt(
      Math.pow(map.food.x - snake.getHead().x, 2) +
        Math.pow(map.food.y - snake.getHead().y, 2)
    );

    // Check if the generated position is not on a wall or on the snake
    validPosition =
      !map.walls.some(
        (wall) => wall.x === map.food.x && wall.y === map.food.y
      ) &&
      !snake.snakeSegments.some(
        (segment) => segment.x === map.food.x && segment.y === map.food.y
      ) &&
      distanceFromSnakeHead >= 4 * gridSize; // Ensure the food is at least 4 squares away from the snake's head
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

    const distanceFromSnakeHead = Math.sqrt(
      Math.pow(extraFruit.position.x - snake.getHead().x, 2) +
      Math.pow(extraFruit.position.y - snake.getHead().y, 2)
    );

    // Check if the generated position is not on a wall, on the snake, or too close to the snake's head
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
      ) &&
      distanceFromSnakeHead >= 4 * gridSize; // Ensure the extra fruit is at least 4 squares away from the snake's head
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

// Function to draw the custom background with text and image
export function drawBackground() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a semi-transparent rectangle over the background to dim it
  ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Adjust the alpha value to control the dimming effect
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set the font size and style
  const fontSize = 150; // Adjust the font size as needed
  ctx.font = `${fontSize}px 'RBTFNT'`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const dimLevel = 0.5; // Dim level for the text and image

  // Calculate the position for the text and image
  const textX = canvas.width / 2;
  const textY = canvas.height / 2;
  const textWidth = ctx.measureText("RBCN25").width;
  const imageHeight = 100;
  const imageWidth = (rfLogoImage.width / rfLogoImage.height) * imageHeight;
  const imageX = textX + textWidth / 2 + imageWidth / 2 - 120; // Adjust the spacing as needed
  const imageY = textY - imageHeight / 2 - 8;

  // Draw the "RBCN" part of the text
  ctx.fillStyle = `rgba(255, 255, 255, ${dimLevel})`; // Dimmed white color
  drawTextWithLetterSpacing(ctx, "RBCN", textX - ctx.measureText("25").width / 2, textY, -10);

  // Draw the "25" part of the text
  ctx.fillStyle = `rgba(0, 255, 255, ${dimLevel})`; // Dimmed cyan color
  drawTextWithLetterSpacing(ctx, "25", textX + ctx.measureText("RBCN").width / 2 - 30, textY, -10);

  // Draw the image next to the text with dimming effect
  ctx.globalAlpha = dimLevel; // Set global alpha to dim the image
  if (rfLogoImage.complete) {
    ctx.drawImage(rfLogoImage, imageX, imageY, imageWidth, imageHeight);
  } else {
    rfLogoImage.onload = () => {
      ctx.drawImage(rfLogoImage, imageX, imageY, imageWidth, imageHeight);
    };
  }
  ctx.globalAlpha = 1.0; // Reset global alpha to default
}

// Helper function to draw text with letter spacing
function drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing) {
  const characters = text.split('');
  const totalWidth = ctx.measureText(text).width;
  const offsetX = x - totalWidth / 2;

  characters.forEach((char, index) => {
    const charWidth = ctx.measureText(char).width;
    ctx.fillText(char, offsetX + index * (charWidth + letterSpacing), y);
  });
}
