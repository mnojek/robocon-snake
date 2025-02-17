import { defaultGameSettings } from "./defaultGameSettings.js";
import { resetGame, startGame } from "./main.js";
import { showTitleScreen } from "./titleScreen.js";

export const highscoreBoard = {
  allowedKeys: ["Enter", "Q", "q"],
  boundHandleKeys: null, // Store the bound function reference

  // Save highscore to the server
  async saveHighscore(name, score, tests) {
    const newHighscore = { name, score, tests };

    return fetch("/highscores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newHighscore),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Failed to save highscore. Error:", error);
      });
  },

  async getHighscores() {
    return fetch("/highscores")
      .then((response) => response.json())
      .catch((error) => console.error("Error fetching highscores:", error));
  },

  display(serverHighscores) {
    const topScores = serverHighscores.slice(
      0,
      defaultGameSettings.bestScoresToDisplay
    );

    const highscoreList = document.getElementById("highscore-list");
    highscoreList.innerHTML =
      "<li><span class='player-name'>NAME</span><span class='player-score'>▼SCORE</span><span class='player-tests'>TESTS</span></li>";

    topScores.forEach((scoreEntry, index) => {
      const listItem = document.createElement("li");
      const nameSpan = document.createElement("span");
      const scoreSpan = document.createElement("span");
      const testsSpan = document.createElement("span");

      nameSpan.textContent = `${index + 1}. ${scoreEntry.name}`;
      scoreSpan.textContent = `${scoreEntry.score}`;
      testsSpan.textContent = `${scoreEntry.tests}`;

      nameSpan.classList.add("player-name");
      scoreSpan.classList.add("player-score");
      testsSpan.classList.add("player-tests");

      listItem.appendChild(nameSpan);
      listItem.appendChild(scoreSpan);
      listItem.appendChild(testsSpan);
      highscoreList.appendChild(listItem);
    });

    // Show the highscore board
    document.getElementById("highscore-board").style.display = "flex";
  },

  hide() {
    document.getElementById("highscore-board").style.display = "none";
    document.getElementById("highscore-help").style.display = "none";
  },

  displayHelp() {
    document.getElementById("highscore-help").style.display = "block";
  },

  hideHelp() {
    document.getElementById("highscore-help").style.display = "none";
  },

  bindKeys() {
    // Store the bound function reference
    this.boundHandleKeys = this.handleKeys.bind(this);

    // Add event listener for Enter key to restart the game
    document.addEventListener("keydown", this.boundHandleKeys);
  },

  handleKeys(event) {
    if (highscoreBoard.allowedKeys.includes(event.key)) {
      document.removeEventListener("keydown", highscoreBoard.boundHandleKeys); // Remove the event listener
      document.getElementById("highscore-board").style.display = "none"; // Hide the highscore board
      document.getElementById("score").textContent = 0; // Reset the score
      document.getElementById("lives").textContent = ""; // Reset the lives
      document.getElementById("highscore-help").style.display = "none";
    }
    if (event.key === "Enter") {
      resetGame();
      startGame();
    } else if (event.key == "Q" || event.key == "q") {
      resetGame();
      showTitleScreen();
    }
  },
};
