import { defaultGameSettings } from "./defaultGameSettings.js";
import { restartGame } from "./main.js";

export const highscoreBoard = {
  // Save highscore to the server
  saveHighscore(name, score) {
    const newHighscore = { name, score };

    fetch("/highscores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newHighscore),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.text();
      })
      .then((message) => {
        console.log("Server message:", message);
        localStorage.setItem("highscores", JSON.stringify([{ name, score }])); // Update local storage
      })
      .catch((error) => console.error("Error:", error));
  },

  // Save highscore to localStorage
  saveHighscoreToLocalStorage(name, score) {
    let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
    highscores.push({ name, score });

    // Sort the highscores by score, highest first
    highscores.sort((a, b) => b.score - a.score);

    localStorage.setItem("highscores", JSON.stringify(highscores));
  },

  display() {
    // Get highscores from local storage
    // const highscores = JSON.parse(localStorage.getItem("highscores")) || [];

    fetch("/highscores")
      .then((response) => response.json())
      .then((highscores) => {
        const topScores = highscores.slice(
          0,
          defaultGameSettings.bestScoresToDisplay
        );

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
        document.addEventListener("keydown", this.handleEnterKey);
      })
      .catch((error) => console.error("Error fetching highscores:", error));
  },

  handleEnterKey(event) {
    if (event.key === "Enter") {
      document.removeEventListener("keydown", this.handleEnterKey); // Remove the event listener
      document.getElementById("highscore-board").style.display = "none"; // Hide the highscore board
      document.getElementById("score").textContent = 0; // Reset the score
      document.getElementById("lives").textContent = ""; // Reset the lives
      restartGame();
    }
  },
};
