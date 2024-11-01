// ui.js
import { handleEnterKey } from "./main.js";
import { defaultGameSettings } from "./defaultGameSettings.js";
import { gameState, saveHighscore, testCases } from "./main.js";

export const canvas = document.getElementById("game-canvas");
export const ctx = canvas.getContext("2d");
export const gridSize = defaultGameSettings.gridSize;
export let testReport = "";

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
    const playerName = document.getElementById("player-name").value.toUpperCase(); // Capitalize player name
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
export function displayHighscoreBoard() {
  const highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  const topScores = highscores.slice(0, defaultGameSettings.bestScoresToDisplay);

  const highscoreList = document.getElementById("highscore-list");
  highscoreList.innerHTML = ""; // Clear previous content

  topScores.forEach((scoreEntry, index) => {
    const listItem = document.createElement("li");
    const nameSpan = document.createElement("span");
    const scoreSpan = document.createElement("span");

    nameSpan.textContent = `${index + 1}. ${scoreEntry.name}`;
    scoreSpan.textContent = `${scoreEntry.score}`;

    nameSpan.classList.add("player-name");
    scoreSpan.classList.add("player-score");

    listItem.appendChild(nameSpan);
    listItem.appendChild(scoreSpan);
    highscoreList.appendChild(listItem);
  });

  // Hide the game over screen
  document.getElementById("game-over-screen").style.display = "none";
  // Show the highscore board
  document.getElementById("highscore-board").style.display = "flex";

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
    const lifeSpan = document.createElement("span");
    lifeSpan.textContent = "*"; // Use asterisk character instead of an image
    lifeSpan.style.fontSize = "30px"; // Set size of the asterisk (adjust as needed)
    lifeSpan.style.marginRight = "5px"; // Add some spacing between asterisks

    livesContainer.appendChild(lifeSpan);
  }
}

export function initiateTestReport() {
  testReport = "> robot tests/snake.robot\n"; // Add Robot Framework command
}

export function addTestSuiteTitle(title) {
  const consoleWidth = 60;
  const doubleLine = "=".repeat(consoleWidth);

  testReport += `${doubleLine}\n${title}\n${doubleLine}\n`;
}

export function addTestResult(testName, testStatus) {
  testReport += `${testName.padEnd(52, " ")}| ${testStatus} |\n`;
}

export function addCurrentTest(testName) {
  testReport += `${testName.padEnd(52, " ")}| `;
}

export function updateTestResult(testStatus) {
  testReport += `${testStatus} |\n`;
}

export function addSingleLineToTestReport() {
  const consoleWidth = 60;
  const singleLine = "-".repeat(consoleWidth);
  testReport += `${singleLine}\n`;
}

export function summarizeTestReport(suiteName) {
  const consoleWidth = 60;
  const singleLine = "-".repeat(consoleWidth);
  const doubleLine = "=".repeat(consoleWidth);

  let totalTests = testCases.length;
  let passedTests = testCases.filter((t) => t.status === "PASS").length;
  let failedTests = testCases.filter((t) => t.status === "FAIL").length;
  let skippedTests = testCases.filter((t) => t.status === "SKIP").length;
  let suiteStatus = failedTests > 0 ? "FAIL" : "PASS";

  // Display all SKIP tests before the summary
  testCases
    .filter((t) => t.status === "SKIP")
    .forEach((t) => {
      testReport += `${singleLine}\n${t.name.padEnd(52, " ")}| ${t.status} |\n`;
    });

  // Set suite status based on failed tests
  testReport += doubleLine + "\n";
  testReport += `${suiteName.padEnd(52, " ")}| ${suiteStatus} |\n`;
  testReport += `${totalTests} tests, ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped\n`;
  testReport += doubleLine + "\n";
  testReport += "Output:  /Users/robocon2025/game/output.xml\n";
  testReport += "Log:     /Users/robocon2025/game/log.html\n";
  testReport += "Report:  /Users/robocon2025/game/report.html\n";
  testReport += "\n>";
}

// Add this function to display the test execution simulation
export function drawTestReport() {
  const testReportContainer = document.getElementById("test-report");
  testReportContainer.innerHTML = ""; // Clear previous content

  // Create a preformatted text element to display the lines
  const pre = document.createElement("pre");
  pre.innerHTML = testReport
    .replace(/PASS/g, '<span style="color: green;">PASS</span>')
    .replace(/FAIL/g, '<span style="color: red;">FAIL</span>')
    .replace(/SKIP/g, '<span style="color: yellow;">SKIP</span>');
    testReportContainer.appendChild(pre);
}
