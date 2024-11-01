import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defaultGameSettings } from "./public/js/defaultGameSettings.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS (for cross-origin requests if needed)
app.use(express.static("public")); // Serve static files
app.use(express.json()); // Parse incoming JSON requests

// Ensure highscores.json exists
const highscoresFilePath = path.join(__dirname, "public", "highscores.json");
if (!fs.existsSync(highscoresFilePath)) {
  fs.writeFileSync(highscoresFilePath, JSON.stringify([]), "utf8");
}

// Get highscores
app.get("/highscores", (req, res) => {
  const filePath = highscoresFilePath;
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading highscores file");
    try {
      const highscores = JSON.parse(data);
      res.json(Array.isArray(highscores) ? highscores : []);
    } catch {
      res.json([]);
    }
  });
});

// Save highscores
app.post("/highscores", (req, res) => {
  const newHighscore = req.body;
  const filePath = highscoresFilePath;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading highscores file:", err);
      return res.status(500).send("Error reading highscores file");
    }

    let highscores;
    try {
      highscores = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing highscores file:", parseErr);
      highscores = [];
    }

    if (!Array.isArray(highscores)) {
      highscores = [];
    }
    highscores.push(newHighscore);

    highscores.sort((a, b) => b.score - a.score); // Sort descending
    const topHighscores = highscores.slice(0, defaultGameSettings.bestScoresToDisplay); // Display top 10

    fs.writeFile(filePath, JSON.stringify(topHighscores), "utf8", (err) => {
      if (err) {
        console.error("Error saving highscores:", err);
        return res.status(500).send("Error saving highscores");
      }
      res.status(200).send("Highscore saved");
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
