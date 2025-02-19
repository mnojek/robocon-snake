// map.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import { displayCountdown, displayGameOver } from "./ui.js";
import { canvas, ctx, gridSize } from "./ui.js";
import { snake } from "./snake.js";
import { food } from "./food.js";
import { gameLoopTimeoutId, gameState } from "./main.js";
import { testReport } from "./testReport.js";

export const map = {
  currentMap: defaultGameSettings.initialMap,
  numberOfMaps: defaultGameSettings.numberOfMaps,
  scoreToNextMap: defaultGameSettings.scoreToNextMap,
  tiles: [],
  walls: [], // Array to store wall coordinates
  noFoodSpots: [], // Array to store coordinates where food can't be spawned

  finishMap() {
    gameState.isLoading = true; // Set loading map state
    clearTimeout(gameLoopTimeoutId);
    testReport.testCases.push({
      name: `Test ${this.currentMap}`,
      status: "PASS",
    }); // Mark current map as PASS
    testReport.updateTestResult("PASS"); // Update the test result
    gameState.extraFruitEaten = false; // Reset the extra fruit eaten flag
    if (this.currentMap >= this.numberOfMaps) {
      console.info("Game over");
      gameState.hiScore +=
        snake.lives * defaultGameSettings.extraScoreForRemainingLife; // Add 10 points for each remaining life
      testReport.summarizeTestReport("Snake"); // Summarize the test report
      displayGameOver();
      gameState.isGameOver = true; // Stop the snake
    } else {
      testReport.addSingleLineToTestReport(); // Add a single line to the test report
      this.currentMap++;
      displayCountdown(3, `Test case ${this.currentMap}`, () => {
        gameState.scoreOnMap = defaultGameSettings.initialMapScore; // Reset the score for the current map
        this.walls = []; // Reset walls array
        this.tiles = []; // Reset map array
        this.noFoodSpots = []; // Reset no food spots array
        snake.foodEaten = 0; // Reset the food eaten counter
        snake.snakeSegments = [...defaultGameSettings.initialSnakePosition]; // Reset snake position
        snake.direction = { ...defaultGameSettings.initialSnakeDirection }; // Reset snake direction
        snake.speed = defaultGameSettings.initialSnakeSpeed; // Reset snake speed
        this.loadMap().then(() => {
          gameState.isLoading = false; // Reset loading map state
        });
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
      const mapText = await response.text();
      if (!this.validateMap(mapText)) {
        console.warn(
          `Invalid map: maps/map-${this.currentMap}.txt. Loading next map.`,
        );
        this.currentMap++;
        await this.loadMap();
        return;
      }
      testReport.addCurrentTest(`Test ${this.currentMap}`); // Add the current map to the test report
      let mapLines = mapText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      snake.snakeSegments.length = 0; // Clear the snake array
      this.walls = []; // Clear the walls array
      this.tiles = []; // Clear the map array
      this.noFoodSpots = []; // Clear the no food spots array

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
          } else if (mapLines[y][x] === "x") {
            this.noFoodSpots.push({ x: x * gridSize, y: y * gridSize });
            row.push("x");
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

  // Function to validate map before loading
  validateMap(mapText) {
    const lines = mapText.trim().split("\n");
    const mapHeight = lines.length;
    const mapWidth = lines[0].length;

    // Check if the map has a valid size
    if (mapHeight < 10 || mapWidth < 10) {
      console.error(
        "Invalid map: Map size is too small. Minimum size is 10x10.",
      );
      return false;
    }

    let foodCount = 0;

    // Check if the map has a valid format
    for (let y = 0; y < mapHeight; y++) {
      if (lines[y].length !== mapWidth) {
        console.error("Invalid map: Map is not rectangular.");
        return false;
      }
      if (lines[y][0] !== "#" || lines[y][mapWidth - 1] !== "#") {
        console.error(
          "Invalid map: Walls must be at the left and right edges of the map.",
        );
        return false;
      }
      for (let x = 0; x < mapWidth; x++) {
        const char = lines[y][x];
        if (
          char !== " " &&
          char !== "#" &&
          char !== "S" &&
          char !== "F" &&
          char !== "x"
        ) {
          console.error(`Invalid map: Invalid character in map: ${char}`);
          return false;
        }
        if (char === "F") {
          foodCount++;
        }
        if (lines[0][x] !== "#" || lines[mapHeight - 1][x] !== "#") {
          console.error(
            "Invalid map: Walls must be at the top and bottom edges of the map.",
          );
          return false;
        }
      }
      // Check if snake is at least 3 segments long
      if (lines[y].includes("S") && lines[y].split("S").length - 1 < 3) {
        console.error("Invalid map: Snake is too short.");
        return false;
      }
    }

    // Check if there is exactly one food item
    if (foodCount !== 1) {
      console.error(
        `Invalid map: Invalid number of food items: ${foodCount}. There must be exactly one "F" on the map.`,
      );
      return false;
    }

    return true;
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
      -10,
    );

    // Draw the "25" part of the text
    ctx.fillStyle = `rgba(0, 255, 255, ${dimLevel})`; // Dimmed cyan color
    drawTextWithLetterSpacing(
      ctx,
      "25",
      textX + ctx.measureText("RBCN").width / 2 - 30,
      textY,
      -10,
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

  // Screen shake effect function
  shakeScreen() {
    const originalStyle = canvas.style.transform;
    let count = 0;
    const shakeInterval = setInterval(() => {
      canvas.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
      count++;
      if (count >= 10) {
        clearInterval(shakeInterval);
        canvas.style.transform = originalStyle;
      }
    }, 50);
  },
};

const rfLogoImage = new Image();
rfLogoImage.src = "images/rf.png"; // Path to the RF logo image

// Helper function to draw text with letter spacing
function drawTextWithLetterSpacing(ctx, text, x, y, letterSpacing) {
  const characters = text.split("");
  const totalWidth = ctx.measureText(text).width;
  const offsetX = x - totalWidth / 2;

  characters.forEach((char, index) => {
    const charWidth = ctx.measureText(char).width;
    ctx.fillText(char, offsetX + index * (charWidth + letterSpacing), y);
  });
}
