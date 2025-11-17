const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const size = 30;

// ===== SPEED =====
let speed = 120;
let lastMoveTime = 0;

let snake = [];
let direction = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let length = 3;
let gameRunning = false;

// IMAGES
const headImg = new Image();
const bodyImg = new Image();
const foodImg = new Image();

// SOUNDS
const eatSound = new Audio("eat.mp3");
const outSound = new Audio("out.mp3");

let imagesLoaded = 0;

function checkLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 3) startGame();
}

headImg.onload = checkLoaded;
bodyImg.onload = checkLoaded;
foodImg.onload = checkLoaded;

headImg.src = "head.png";
bodyImg.src = "body.png";
foodImg.src = "food.png";

// MOBILE TOUCH BUTTON FUNCTION
function dir(x, y) {
    if (x !== -direction.x || y !== -direction.y) {
        direction = { x, y };
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && direction.y !== 1) direction = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && direction.y !== -1) direction = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && direction.x !== 1) direction = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && direction.x !== -1) direction = { x: 1, y: 0 };
});

// SPEED CONTROL (+ / -)
document.addEventListener("keydown", (e) => {
    if (e.key === "+") speed = Math.max(20, speed - 10);
    if (e.key === "-") speed += 10;
});

function startGame() {
    snake = [{ x: 300, y: 300 }];
    direction = { x: 1, y: 0 };
    length = 3;
    placeFood();
    if (!gameRunning) requestAnimationFrame(gameLoop);
}

function placeFood() {
    food.x = Math.floor(Math.random() * 20) * size;
    food.y = Math.floor(Math.random() * 20) * size;
}

function drawRotated(img, x, y, angle) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
}

function gameOver() {
    outSound.play();           // death sound
    if (navigator.vibrate) {   // mobile vibration
        navigator.vibrate(300);
    }

    alert("GAME OVER!");
    startGame();
}

function gameLoop(timestamp) {
    gameRunning = true;

    if (timestamp - lastMoveTime < speed) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastMoveTime = timestamp;

    // NEW HEAD
    let head = {
        x: snake[snake.length - 1].x + direction.x * size,
        y: snake[snake.length - 1].y + direction.y * size,
    };

    // ===== BORDER OUT (GAME OVER) =====
    if (head.x < 0 || head.x > 570 || head.y < 0 || head.y > 570) {
        gameOver();
        return;
    }

    snake.push(head);
    if (snake.length > length) snake.shift();

    // ===== FOOD =====
    if (head.x === food.x && head.y === food.y) {
        length++;
        eatSound.play();
        placeFood();
    }

    // DRAW
    ctx.clearRect(0, 0, 600, 600);

    ctx.drawImage(foodImg, food.x, food.y, size, size);

    // BODY
    for (let i = 0; i < snake.length - 1; i++) {
        let s = snake[i];
        let n = snake[i + 1];

        let angle = 0;
        if (n.x > s.x) angle = 270;
        if (n.x < s.x) angle = 90;
        if (n.y > s.y) angle = 180;
        if (n.y < s.y) angle = 0;

        drawRotated(bodyImg, s.x, s.y, angle);
    }

    // HEAD
    let last = snake[snake.length - 1];
    let angle = 0;

    if (direction.x === 1) angle = 270;
    if (direction.x === -1) angle = 90;
    if (direction.y === 1) angle = 180;
    if (direction.y === -1) angle = 0;

    drawRotated(headImg, last.x, last.y, angle);

    requestAnimationFrame(gameLoop);
}
