// ui.js
import { handleEnterKey } from "./main.js";
import { defaultGameSettings } from "./defaultGameSettings.js";
import { gameState, saveHighscore } from "./main.js";

export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
export const gridSize = defaultGameSettings.gridSize;

export function displayGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px 'RBCN'";
  ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 20);
  document.getElementById("final-score").textContent = gameState.score;

  setTimeout(() => {
    document.getElementById("game-over-screen").style.display = "flex";
    document.getElementById("player-name").focus(); // Focus on the player name input
  }, 1000);

  // Display player's ranking
  const playerRanking = calculatePlayerRanking(gameState.score);
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
    const playerName = document.getElementById("player-name").value;
    const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
    const nameExists = highscores.some(scoreEntry => scoreEntry.name === playerName);

    if (nameExists) {
      document.getElementById("error-message").textContent = "Player's name is taken. Choose a different one.";
    } else if (playerName) {
      saveHighscore(playerName, gameState.score);
      displayHighscoreBoard(); // Display highscores after saving
      document.getElementById("game-over-screen").style.display = "none";
    }
  });

// Calculate player's ranking based on score
function calculatePlayerRanking(score) {
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  highscores.push({ name: "currentPlayer", score: score }); // Temporarily add current player's score
  highscores.sort((a, b) => b.score - a.score); // Sort highscores in descending order

  const ranking = highscores.findIndex(scoreEntry => scoreEntry.score === score) + 1;
  return ranking;
}

// Display the highscore board
export function displayHighscoreBoard() {
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  const topScores = highscores.slice(0, defaultGameSettings.bestScoresToDisplay);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the game area

  ctx.fillStyle = "white";
  ctx.font = "32px 'RBCN'";
  ctx.textAlign = "center"; // Center align text
  ctx.fillText("Highscore Board:", canvas.width / 2, 100);

  ctx.font = "24px 'RBCN'";
  topScores.forEach((scoreEntry, index) => {
    ctx.textAlign = "left"; // Align text to the left for player names
    ctx.fillText(
      `${index + 1}. ${scoreEntry.name}`,
      canvas.width / 2 - 100,
      140 + index * 30
    );
    ctx.textAlign = "right"; // Align text to the right for scores
    ctx.fillText(
      `${scoreEntry.score}`,
      canvas.width / 2 + 100,
      140 + index * 30
    );
  });

  // Display "Press enter to start again" below the player scores
  ctx.textAlign = "center"; // Center align text
  ctx.font = "32px 'RBCN'";
  ctx.fillText(
    "Press enter to start again",
    canvas.width / 2,
    140 + highscores.length * 30 + 40
  );

  // Add event listener for Enter key to restart the game
  document.addEventListener("keydown", handleEnterKey);
}

// Function to display the countdown
export function displayCountdown(count, message, callback) {
  gameState.isPaused = true; // Pause the game loop
  let countdown = count;
  const interval = setInterval(() => {
    drawCountdown();
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      gameState.isPaused = false; // Resume the game loop
      callback();
    }
  }, 1000); // Update every second

  function drawCountdown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set the custom font
    ctx.font = "48px 'RBCN'";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message + " " + countdown, canvas.width / 2, canvas.height / 2);
  }
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
