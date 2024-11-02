// map.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import { displayCountdown, displayGameOver } from "./ui.js";
import { canvas, ctx, gridSize } from "./ui.js";
import { snake } from "./snake.js";
import { gameState } from "./main.js"; // Import isGameOver function
import { testCases, updateTestResult, addCurrentTest, addSingleLineToTestReport, summarizeTestReport } from "./testReport.js";

export const scoreToNextMap = defaultGameSettings.scoreToNextMap;
export const map = {
  currentMap: defaultGameSettings.initialMap,
  numberOfMaps: defaultGameSettings.numberOfMaps,
  tiles: [],
  walls: [], // Array to store wall coordinates

  finishMap() {
    testCases.push({ name: `Test ${map.currentMap}`, status: "PASS" }); // Mark current map as PASS
    updateTestResult("PASS"); // Update the test result
    if (map.currentMap >= map.numberOfMaps) {
      console.log("Game over");
      gameState.hiScore +=
        snake.lives * defaultGameSettings.extraScoreForRemainingLife; // Add 10 points for each remaining life
      summarizeTestReport("Snake"); // Summarize the test report
      displayGameOver();
      gameState.isGameOver = true; // Stop the snake
    } else {
      addSingleLineToTestReport(); // Add a single line to the test report
      map.currentMap++;
      displayCountdown(3, `Test case ${map.currentMap}`, () => {
        snake.foodEaten = 0; // Reset the food eaten counter
        gameState.extraFruitEaten = false; // Reset the extra fruit eaten flag
        gameState.scoreOnMap = defaultGameSettings.initialMapScore; // Reset the score for the current map
        map.walls = []; // Reset walls array
        map.tiles = []; // Reset map array
        snake.snakeSegments = [...defaultGameSettings.initialSnakePosition]; // Reset snake position
        snake.direction = { ...defaultGameSettings.initialSnakeDirection }; // Reset snake direction
        snake.speed = defaultGameSettings.initialSnakeSpeed; // Reset snake speed
        map.loadMap();
      });
    }
  },

  async loadMap() {
    try {
      const response = await fetch(`maps/map-${map.currentMap}.txt`);
      if (!response.ok) {
        console.warn(`Map file maps/map-${map.currentMap}.txt not found.`);
        return;
      }
      addCurrentTest(`Test ${map.currentMap}`); // Add the current map to the test report
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
            food.position = { x: x * gridSize, y: y * gridSize };
            row.push("F");
          } else {
            row.push(" ");
          }
        }
        map.tiles.push(row);
      }
      snake.reset(); // Reset the snake position
    } catch (error) {
      console.error("Error loading the map:", error);
    }
  },

  drawWalls() {
    ctx.fillStyle = "grey";
    map.walls.forEach((wall) => {
      ctx.fillRect(wall.x, wall.y, gridSize, gridSize);
    });
  },

  drawBackground() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a semi-transparent rectangle over the background to dim it
    ctx.fillStyle = defaultGameSettings.darkGreyColor; // Adjust the alpha value to control the dimming effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set the font size and style
    const fontSize = 150; // Adjust the font size as needed
    ctx.font = `${fontSize}px 'RBTFNT'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const dimLevel = 0.2; // Dim level for the text and image

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
    drawTextWithLetterSpacing(
      ctx,
      "RBCN",
      textX - ctx.measureText("25").width / 2,
      textY,
      -10
    );

    // Draw the "25" part of the text
    ctx.fillStyle = `rgba(0, 255, 255, ${dimLevel})`; // Dimmed cyan color
    drawTextWithLetterSpacing(
      ctx,
      "25",
      textX + ctx.measureText("RBCN").width / 2 - 30,
      textY,
      -10
    );

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
  },
};

export const food = {
  position: { ...defaultGameSettings.initialFoodPosition },

  draw() {
    ctx.fillStyle = defaultGameSettings.offWhiteColor;
    const radius = gridSize / 5;
    const x = food.position.x + radius;
    const y = food.position.y + radius;
    const width = gridSize - 2 * radius;
    const height = gridSize - 2 * radius;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  },

  spawn(canvas, gridSize) {
    let validPosition = false;

    while (!validPosition) {
      food.position.x =
        Math.floor((Math.random() * canvas.width) / gridSize) * gridSize;
      food.position.y =
        Math.floor((Math.random() * canvas.height) / gridSize) * gridSize;

      const distanceFromSnakeHead = Math.sqrt(
        Math.pow(food.position.x - snake.getHead().x, 2) +
          Math.pow(food.position.y - snake.getHead().y, 2)
      );

      // Check if the generated position is not on a wall or on the snake
      validPosition =
        !map.walls.some(
          (wall) => wall.x === food.position.x && wall.y === food.position.y
        ) &&
        !snake.snakeSegments.some(
          (segment) =>
            segment.x === food.position.x && segment.y === food.position.y
        ) &&
        distanceFromSnakeHead >= 4 * gridSize; // Ensure the food is at least 4 squares away from the snake's head
    }
  },
};

const rfLogoImage = new Image();
rfLogoImage.src = "images/rf.png"; // Path to the RF logo image

// Function to load the map from a text file

// Draw walls on the canvas

// Function to spawn extra fruit at a random position

// Function to remove the extra fruit

// Function to draw the custom background with text and image

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
