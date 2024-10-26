// ui.js
import { handleEnterKey } from "./main.js";
import { defaultGameSettings } from "./defaultGameSettings.js";
import { gameState, saveHighscore } from "./main.js";

export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
export const gridSize = defaultGameSettings.gridSize;

export function displayGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 20);
  document.getElementById("final-score").textContent = gameState.score;

  setTimeout(() => {
    document.getElementById("game-over-screen").style.display = "flex";
  }, 1000);
}

// Handle form submission
document
  .getElementById("highscore-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const playerName = document.getElementById("player-name").value;
    if (playerName) {
      saveHighscore(playerName, gameState.score);
      displayHighscoreBoard(); // Display highscores after saving
      document.getElementById("game-over-screen").style.display = "none";
      // Focus on the player name input
      const playerNameInput = document.getElementById("player-name");
      // FIXME: This doesn't work
      playerNameInput.focus();
    }
  });

// Display the highscore board
export function displayHighscoreBoard() {
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the game area

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Highscore Board:", canvas.width / 2 - 80, 100);

  highscores.forEach((scoreEntry, index) => {
    ctx.fillText(
      `${index + 1}. ${scoreEntry.name}: ${scoreEntry.score}`,
      canvas.width / 2 - 80,
      140 + index * 30
    );
  });

  // Display "Press enter to start again" below the player scores
  ctx.fillText(
    "Press enter to start again",
    canvas.width / 2 - 80,
    140 + highscores.length * 30 + 40
  );

  // Add event listener for Enter key to restart the game
  document.addEventListener("keydown", handleEnterKey);
}

// Function to display the countdown
export function displayCountdown(seconds, text, callback) {
  gameState.isPaused = true; // Pause the game loop
  let countdown = seconds;
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(
      `${text} ${countdown}...`,
      canvas.width / 2 - 80,
      canvas.height / 2 - 20
    );
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      gameState.isPaused = false; // Resume the game loop
      callback();
    }
  }, 1000); // Update every second
}

export function updateLivesDisplay(lives) {
  const livesContainer = document.getElementById("lives");
  livesContainer.innerHTML = ""; // Clear any previous content

  for (let i = 0; i < lives; i++) {
    const heartImg = document.createElement("img");
    heartImg.src = "images/heart.png"; // Path to the heart image
    heartImg.alt = "Life"; // Alt text for accessibility
    heartImg.style.width = "16px"; // Set size of the heart image (adjust as needed)
    heartImg.style.height = "16px";
    heartImg.style.marginRight = "5px"; // Add some spacing between hearts

    livesContainer.appendChild(heartImg);
  }
}
