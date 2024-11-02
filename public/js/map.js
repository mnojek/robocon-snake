// map.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import { displayCountdown, displayGameOver } from "./ui.js";
import { canvas, ctx, gridSize } from "./ui.js";
import { snake } from "./snake.js";
import { food } from "./food.js";
import { gameState } from "./main.js"; // Import isGameOver function
import { testCases, updateTestResult, addCurrentTest, addSingleLineToTestReport, summarizeTestReport } from "./testReport.js";

export const map = {
  currentMap: defaultGameSettings.initialMap,
  numberOfMaps: defaultGameSettings.numberOfMaps,
  scoreToNextMap: defaultGameSettings.scoreToNextMap,
  tiles: [],
  walls: [], // Array to store wall coordinates

  finishMap() {
    testCases.push({ name: `Test ${this.currentMap}`, status: "PASS" }); // Mark current map as PASS
    updateTestResult("PASS"); // Update the test result
    if (this.currentMap >= this.numberOfMaps) {
      console.log("Game over");
      gameState.hiScore +=
        snake.lives * defaultGameSettings.extraScoreForRemainingLife; // Add 10 points for each remaining life
      summarizeTestReport("Snake"); // Summarize the test report
      displayGameOver();
      gameState.isGameOver = true; // Stop the snake
    } else {
      addSingleLineToTestReport(); // Add a single line to the test report
      this.currentMap++;
      displayCountdown(3, `Test case ${this.currentMap}`, () => {
        snake.foodEaten = 0; // Reset the food eaten counter
        gameState.extraFruitEaten = false; // Reset the extra fruit eaten flag
        gameState.scoreOnMap = defaultGameSettings.initialMapScore; // Reset the score for the current map
        this.walls = []; // Reset walls array
        this.tiles = []; // Reset map array
        snake.snakeSegments = [...defaultGameSettings.initialSnakePosition]; // Reset snake position
        snake.direction = { ...defaultGameSettings.initialSnakeDirection }; // Reset snake direction
        snake.speed = defaultGameSettings.initialSnakeSpeed; // Reset snake speed
        this.loadMap();
      });
    }
  },

  async loadMap() {
    try {
      const response = await fetch(`maps/map-${this.currentMap}.txt`);
      if (!response.ok) {
        console.warn(`Map file maps/map-${this.currentMap}.txt not found.`);
        return;
      }
      addCurrentTest(`Test ${this.currentMap}`); // Add the current map to the test report
      const mapText = await response.text();
      let mapLines = mapText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      snake.snakeSegments.length = 0; // Clear the snake array
      this.walls = []; // Clear the walls array
      this.tiles = []; // Clear the map array

      const mapHeight = mapLines.length;
      const mapWidth = mapLines[0].length;

      // Set the canvas size based on the map dimensions
      canvas.width = mapWidth * gridSize;
      canvas.height = mapHeight * gridSize;

      for (let y = 0; y < mapLines.length; y++) {
        const row = [];
        for (let x = 0; x < mapLines[y].length; x++) {
          if (mapLines[y][x] === "#") {
            this.walls.push({ x: x * gridSize, y: y * gridSize });
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
        this.tiles.push(row);
      }
      snake.reset(); // Reset the snake position
    } catch (error) {
      console.error("Error loading the map:", error);
    }
  },

  drawWalls() {
    ctx.fillStyle = "grey";
    this.walls.forEach((wall) => {
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
