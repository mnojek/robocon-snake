export const defaultGameSettings = {
  // Map defaults
  gridSize: 40, // Size of each square on the grid
  scoreToNextMap: 2, // Score required to move to the next map
  initialMap: 1, // Start with the first map
  numberOfMaps: 3, // Number of maps available
  initialFoodPosition: {}, // Initial food position
  foodToExtraFruit: 5, // Number of food items to eat before extra fruit appears
  extraFruitScore: 5, // Score for eating extra fruit

  // Snake defaults
  initialSnakeSpeed: 150, // Initial snake speed
  snakeSpeedIncrement: 5, // Speed increment per food item eaten
  initialSnakeDirection: { x: 1, y: 0 }, // Snake starts moving right
  initialSnakeLives: 3, // Initial number of snake lives
  initialSnakePosition: [], // Initial snake position

  // Score defaults
  initialScore: 0, // Initial score
  initialMapScore: 0, // Score for the current map
  bestScoresToDisplay: 5, // Number of best scores to display
  extraScoreForRemainingLife: 10, // Extra score for each remaining life
};
