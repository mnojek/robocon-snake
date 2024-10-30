# RoboCon 2025 Snake Game

This is a classic Snake game with additional features, developed for RoboCon 2025. Navigate the snake to eat food, avoid obstacles, and achieve the highest score!

## Requirements

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server to run the game locally through [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## How to Run the Game

1. **Clone the Repository**

   ```
   git clone https://github.com/mnojek/robocon-snake.git
   ```

2. **Install the Game**

    Navigate to the root directory:
    ```
    cd robocon-snake
    ```

    Install all dependencies:
    ```
    npm install
    ```

3. **Running with a Local Web Server**

    Run the local server:

    ```
    npm start
    ```

    Now, open your browser and go to `http://localhost:3000`.

## Game Controls

- **Arrow Keys**: Control the snake's movement.

## Game Rules

- **Objective**: Eat food to increase your score.
- **Movement**: Use the arrow keys to change the snake's direction.
- **Walls and Borders**: Avoid colliding with walls and the edges of the map.
- **Self-Collision**: Don't run into your own snake body.
- **Extra Fruit**:
  - After eating 5 food items, an extra fruit appears.
  - Extra fruit gives bonus points but disappears after a short time.
- **Lives**:
  - You start with 3 lives.
  - You lose a life when you collide with walls, borders, or yourself.
- **Maps**:
  - The game features multiple maps.
  - Advance to the next map by reaching the required score.
- **Game Over**: The game ends when you lose all your lives.

## High Scores

- After the game ends, submit your name to save your score.
- High scores are stored locally in your browser's `localStorage`.
- View the high score board after submitting your score.

## Credits

Developed for RoboCon 2025 with :heart: by [mnojek](https://github.com/mnojek)
