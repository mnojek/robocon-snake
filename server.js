import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS (for cross-origin requests if needed)
app.use(express.static("public")); // Serve static files
app.use(express.json()); // Parse incoming JSON requests

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
