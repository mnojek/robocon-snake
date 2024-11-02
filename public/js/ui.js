// ui.js
import { defaultGameSettings } from "./defaultGameSettings.js";
import { gameState } from "./main.js";
import { highscoreBoard } from "./highscoreBoard.js";
import { testReport } from "./testReport.js";

export const canvas = document.getElementById("game-canvas");
export const ctx = canvas.getContext("2d");
export const gridSize = defaultGameSettings.gridSize;

export function displayGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px 'RBCN'";
  ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 20);
  document.getElementById("final-score").textContent = gameState.hiScore;
  // Calculate passed test cases and show in the "finished-maps" span
  const passedTests = testReport.testCases.filter(
    (t) => t.status === "PASS"
  ).length;
  const totalTests = testReport.testCases.length;
  document.getElementById("finished-maps").textContent = `${passedTests} / ${totalTests}`;

  setTimeout(() => {
    document.getElementById("game-over-screen").style.display = "flex";
    document.getElementById("current-player-name").value = ""; // Ensure the input is empty
    document.getElementById("current-player-name").focus(); // Focus on the player name input
  }, 1000);

  // Display player's ranking
  const playerRanking = calculatePlayerRanking(gameState.hiScore);
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  const playersCount = highscores.length;
  document.getElementById(
    "player-ranking"
  ).textContent = `${playerRanking} / ${playersCount + 1}`;
}

// Handle form submission
document
  .getElementById("highscore-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const playerName = document
      .getElementById("current-player-name")
      .value.toUpperCase(); // Capitalize player name
    const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
    const nameExists = highscores.some(scoreEntry => scoreEntry.name === playerName);

    if (nameExists) {
      document.getElementById("error-message").textContent = "Player's name is taken. Choose a different one.";
    } else if (playerName) {
      highscoreBoard.saveHighscore(playerName, gameState.hiScore);
      setTimeout(highscoreBoard.display(), 500); // Display highscores after saving with a slight delay
      document.getElementById("game-over-screen").style.display = "none";
    }
  });

// Calculate player's ranking based on score
function calculatePlayerRanking(score) {
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  highscores.push({ name: "currentPlayer", score: score }); // Temporarily add current player's score
  highscores.sort((a, b) => {
    if (b.score === a.score) {
      return a.name === "currentPlayer" ? 1 : -1; // Place current player last if scores are the same
    }
    return b.score - a.score; // Sort highscores in descending order
  });

  const ranking = highscores.findIndex(scoreEntry => scoreEntry.name === "currentPlayer") + 1;
  return ranking;
}

// Display the highscore board

// Function to display the countdown
export function displayCountdown(count, message, callback) {
  gameState.isPaused = true; // Pause the game loop
  let countdown = count;
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = defaultGameSettings.darkGreyColor; // Fill the canvas with grey color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCountdown();
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      gameState.isPaused = false; // Resume the game loop
      callback();
    }
  }, 1000); // Update every second

  function drawCountdown() {
    // Set the custom font for the countdown
    ctx.font = "72px 'RBCN'";
    ctx.fillStyle = defaultGameSettings.cyanColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2 - 40);

    // Set the custom font for the message
    ctx.font = "48px 'RBCN'";
    ctx.fillStyle = "white";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 40);
  }
}

export function updateLivesDisplay(lives) {
  const livesContainer = document.getElementById("lives");
  livesContainer.innerHTML = ""; // Clear any previous content

  for (let i = 0; i < lives; i++) {
    const lifeSpan = document.createElement("span");
    lifeSpan.textContent = "*"; // Use asterisk character instead of an image
    lifeSpan.style.fontSize = "30px"; // Set size of the asterisk (adjust as needed)
    lifeSpan.style.marginRight = "5px"; // Add some spacing between asterisks

    livesContainer.appendChild(lifeSpan);
  }
}
