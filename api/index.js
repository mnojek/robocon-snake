import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import supabase from "./supabaseClient.js";
import { defaultGameSettings } from "../public/js/defaultGameSettings.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors()); // Enable CORS (for cross-origin requests if needed)
app.use(express.static("public")); // Serve static files
app.use(express.json()); // Parse incoming JSON requests

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Fetch highscores
app.get("/highscores", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("highscores")
      .select("*")
      .order("score", { ascending: false }) // Sort by highest score
      .limit(defaultGameSettings.bestScoresToDisplay); // Limit to 10 highscores

    if (error) {
      console.error("Error fetching highscores:", error);
      return res.status(500).send("Error retrieving highscores");
    }

    res.json(data);
  } catch (error) {
    console.error("Unexpected error fetching highscores:", error);
    res.status(500).send("Error retrieving highscores");
  }
});

app.post("/highscores", async (req, res) => {
  try {
    const { name, score, tests } = req.body;

    if (!name || typeof score !== "number" || typeof tests !== "number") {
      return res.status(400).json({ error: "Invalid highscore data" });
    }

    const { error } = await supabase
      .from("highscores")
      .insert([{ name, score, tests }]);

    if (error) throw error;

    res.status(200).send("Highscore saved");
  } catch (err) {
    console.error("Error saving highscore:", err);
    res.status(500).send("Error saving highscore");
  }
});

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

export default app;
