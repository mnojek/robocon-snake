import { canvas, ctx, gridSize } from "./ui.js";
import { snake } from "./snake.js";
import { map } from "./map.js"
import { food } from "./food.js";

export const extraFruit = {
  position: null,
  timer: null,
  blinkTimer: null,
  image: new Image(),
  blinking: false,
  visible: true,

  draw() {
    if (this.position) {
      const fruitSize = gridSize * 0.8;
      ctx.drawImage(
        this.image,
        this.position.x + (gridSize - fruitSize) / 2,
        this.position.y + (gridSize - fruitSize) / 2,
        fruitSize,
        fruitSize
      );
    }
  },

  spawn() {
    let validPosition = false;

    while (!validPosition) {
      this.position = {
        x: Math.floor((Math.random() * canvas.width) / gridSize) * gridSize,
        y: Math.floor((Math.random() * canvas.height) / gridSize) * gridSize,
      };

      const distanceFromSnakeHead = Math.sqrt(
        Math.pow(this.position.x - snake.getHead().x, 2) +
          Math.pow(this.position.y - snake.getHead().y, 2)
      );

      // Check if the generated position is not on a wall, on the snake, or too close to the snake's head
      validPosition =
        !map.walls.some(
          (wall) =>
            wall.x === this.position.x && wall.y === this.position.y
        ) &&
        !snake.snakeSegments.some(
          (segment) =>
            segment.x === this.position.x &&
            segment.y === this.position.y
        ) &&
        !(
          food.position.x === this.position.x &&
          food.position.y === this.position.y
        ) &&
        distanceFromSnakeHead >= 4 * gridSize; // Ensure the extra fruit is at least 4 squares away from the snake's head
    }
    // Set a timer to remove the extra fruit after a certain time
    this.timer = setTimeout(() => {
      this.position = null; // Remove extra fruit after the timer
      this.timer = null; // Clear the timer
    }, 10000); // 10 seconds

    this.blinkTimer = setTimeout(() => {
      this.blink(5, () => {
        // Do nothing after blinking
        this.blinking = false;
      });
    }, 7000);
  },

  blink(times, callback) {
    this.blinking = true;
    let count = 0;
    this.visible = true;
    const interval = setInterval(() => {
      this.visible = !this.visible; // Toggle visibility
      count++;
      if (count >= times * 2) {
        clearInterval(interval);
        this.blinking = false;
        this.visible = true; // Ensure it ends up visible
        callback();
      }
    }, 300); // Blink every 300ms
  },

  remove() {
    this.position = null;
    this.blinking = false;
    if (this.timer) {
      clearTimeout(this.timer); // Clear the timer if it's still running
      this.timer = null;
    }
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer); // Clear the blink timer if it's still running
      this.blinkTimer = null;
    }
  },
};

extraFruit.image.src = "images/rf.png"; // Path to your extra fruit image
