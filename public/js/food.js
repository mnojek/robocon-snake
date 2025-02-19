import { defaultGameSettings } from "./defaultGameSettings.js";
import { ctx, gridSize } from "./ui.js";
import { snake } from "./snake.js";
import { map } from "./map.js";
import { extraFruit } from "./extraFruit.js";

export const food = {
  position: { ...defaultGameSettings.initialFoodPosition },

  draw() {
    ctx.fillStyle = defaultGameSettings.offWhiteColor;
    const radius = gridSize / 5;
    const x = food.position.x + radius;
    const y = food.position.y + radius;
    const width = gridSize - 2 * radius;
    const height = gridSize - 2 * radius;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  },

  spawn(canvas, gridSize) {
    let validPosition = false;

    while (!validPosition) {
      food.position.x =
        Math.floor((Math.random() * canvas.width) / gridSize) * gridSize;
      food.position.y =
        Math.floor((Math.random() * canvas.height) / gridSize) * gridSize;

      const distanceFromSnakeHead = Math.sqrt(
        Math.pow(food.position.x - snake.getHead().x, 2) +
          Math.pow(food.position.y - snake.getHead().y, 2),
      );

      // Check if the generated position is not on a wall, on the snake, or on a no food spot
      validPosition =
        !map.walls.some(
          (wall) => wall.x === food.position.x && wall.y === food.position.y,
        ) &&
        !snake.snakeSegments.some(
          (segment) =>
            segment.x === food.position.x && segment.y === food.position.y,
        ) &&
        !map.noFoodSpots.some(
          (spot) => spot.x === food.position.x && spot.y === food.position.y,
        ) &&
        distanceFromSnakeHead >= 4 * gridSize && // Ensure the food is at least 4 squares away from snake's head
        !(
          extraFruit.position &&
          extraFruit.position.x === food.position.x &&
          extraFruit.position.y === food.position.y
        );
    }
  },
};
