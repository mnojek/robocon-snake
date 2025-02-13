import { ctx, canvas, gridSize } from "./ui.js";
import { startGame, isOppositeDirection, keyQueue, resetGame, gameLoopTimeoutId } from "./main.js";
import { snake } from "./snake.js";
import { defaultGameSettings } from "./defaultGameSettings.js";
import { testReport } from "./testReport.js";
import { highscoreBoard } from "./highscoreBoard.js";

export let titleScreenActive = true;
let titleScreenTimeoutId;
let titleScreenAnimationFrameId;
let highscoreBoardActive = false;

function drawTitleScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw title text
  ctx.font = "72px 'RBCN'";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ROBOCON SNAKE", canvas.width / 2, canvas.height / 2 - 40);

  // Draw instruction text
  ctx.font = "36px 'RBCN'";
  const instructionText = "Press Enter to start";
  const enterText = "Enter";
  const enterIndex = instructionText.indexOf(enterText);

  // Draw the part before "Enter"
  ctx.fillText(
    instructionText.substring(0, enterIndex),
    canvas.width / 2 - ctx.measureText(instructionText).width / 2 + 60,
    canvas.height / 2 + 40
  );

  // Change color to cyan and draw "Enter"
  ctx.fillStyle = "#00c0b5";
  ctx.fillText(
    enterText,
    canvas.width / 2 - ctx.measureText(instructionText).width / 2 + ctx.measureText(instructionText.substring(0, enterIndex)).width + 60,
    canvas.height / 2 + 40
  );

  // Change color back to white and draw the part after "Enter"
  ctx.fillStyle = "white";
  ctx.fillText(
    instructionText.substring(enterIndex + enterText.length),
    canvas.width / 2 - ctx.measureText(instructionText).width / 2 + ctx.measureText(instructionText.substring(0, enterIndex + enterText.length + 2)).width + 60,
    canvas.height / 2 + 40
  );

  // Display text "Press H for help"
  ctx.font = "24px 'RBCN'";
  ctx.fillStyle = "white";
  ctx.fillText("Press H for help", canvas.width / 2, canvas.height / 2 + 80);

  // Display text "Press B for highscores"
  ctx.font = "24px 'RBCN'";
  ctx.fillStyle = "white";
  ctx.fillText("Press B for highscores", canvas.width / 2, canvas.height / 2 + 120);

  // Draw snake
  snake.draw();
}

// Move snake in rectangular shape
function moveTitleSnake() {
  let newDirection;
  if (
    snake.getHead().x < 0 + (5 * gridSize) &&
    snake.direction.x != 0 && snake.direction.y != -1
  ) {
    newDirection = { x: 0, y: -1 };
  } else if (
    snake.getHead().x > canvas.width - (6 * gridSize) &&
    snake.direction.x != 0 && snake.direction.y != 1
  ) {
    newDirection = { x: 0, y: 1 };
  } else if (
    snake.getHead().y < 0 + (8 * gridSize) &&
    snake.direction.x != 1 && snake.direction.y != 0
  ) {
    newDirection = { x: 1, y: 0 };
  } else if (
    snake.getHead().y > canvas.height - (8 * gridSize) &&
    snake.direction.x != -1 && snake.direction.y != 0
  ) {
    newDirection = { x: -1, y: 0 };
  }
  if (newDirection && newDirection != snake.direction) {
    if (!isOppositeDirection(newDirection, snake.direction)) {
      keyQueue.push(newDirection);
    }
  }

  while (keyQueue.length > 0) {
    const newDirection = keyQueue.shift();
    if (!isOppositeDirection(newDirection, snake.direction)) {
      snake.direction = newDirection;
      break; // Process only the first valid direction
    }
  }
  snake.move();
  snake.draw();
}

function titleScreenLoop() {
  if (titleScreenActive) {
    moveTitleSnake();
    drawTitleScreen();
    titleScreenTimeoutId = setTimeout(titleScreenLoop, 100);
  }
}

function handleKeys(event) {
  if (event.key === "Enter" && !highscoreBoardActive) {
    if (highscoreBoardActive) {
      highscoreBoardActive = false;
      highscoreBoard.hide();
    }
    titleScreenActive = false;
    cancelAnimationFrame(titleScreenAnimationFrameId); // Stop the title screen animation frame
    clearTimeout(titleScreenTimeoutId); // Stop the title screen loop
    document.removeEventListener("keydown", handleKeys); // Remove the event listener
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    resetGame();
    startGame();
  } else if ((event.key === "H" || event.key === "h") && !highscoreBoardActive) {
    testReport.displayHelp();
  } else if (event.key === "B" || event.key === "b") {
    if (highscoreBoardActive) {
      highscoreBoardActive = false;
      highscoreBoard.hide();
      document.getElementById("highscore-back").style.display = "none";
    } else {
      highscoreBoardActive = true;
      highscoreBoard.display();
      highscoreBoard.hideHelp();
      document.getElementById("highscore-back").style.display = "block";
    }
  }
}

export function showTitleScreen() {
  clearTimeout(gameLoopTimeoutId); // Stop the game loop;
  // Initialize the snake for the title screen
  snake.snakeSegments = [
    { x: canvas.width / 2 - 200, y: canvas.height / 2 - 180 },
    { x: canvas.width / 2 - 240, y: canvas.height / 2 - 180 },
    { x: canvas.width / 2 - 280, y: canvas.height / 2 - 180 },
    { x: canvas.width / 2 - 320, y: canvas.height / 2 - 180 },
    { x: canvas.width / 2 - 360, y: canvas.height / 2 - 180 },
  ];
  snake.direction = defaultGameSettings.initialSnakeDirection;
  document.addEventListener("keydown", handleKeys);
  titleScreenActive = true;
  titleScreenLoop();
}
