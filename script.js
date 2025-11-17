const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");

const joystickOuter = document.getElementById("joystickOuter");
const joystickInner = document.getElementById("joystickInner");
const boostBtn = document.getElementById("boostBtn");

const scoreBox = document.getElementById("scoreBox");
const scoreSpan = document.getElementById("score");
const highScoreSpan = document.getElementById("highScore");

let highScore = localStorage.getItem("snakeHS") || 0;
highScoreSpan.textContent = highScore;

const size = 30;
let snake = [];
let direction = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let length = 3;

let speed = 150;
let lastMove = 0;
let score = 0;
let boosted = false;

const headImg = new Image();
const bodyImg = new Image();
const foodImg = new Image();

headImg.src = "head.png";
bodyImg.src = "body.png";
foodImg.src = "food.png";

const eatSound = new Audio("eat.mp3");
const outSound = new Audio("out.mp3");

startBtn.onclick = () => {
    menu.style.display = "none";
    canvas.style.display = "block";
    joystickOuter.style.display = "block";
    boostBtn.style.display = "flex";

    startGame();
};

function startGame() {
    snake = [{ x: 300, y: 300 }];
    direction = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    length = 3;
    score = 0;
    speed = 150;

    scoreSpan.textContent = 0;
    placeFood();

    requestAnimationFrame(gameLoop);
}

function placeFood() {
    food.x = Math.floor(Math.random() * 20) * size;
    food.y = Math.floor(Math.random() * 20) * size;
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") nextDir = { x: 0, y: -1 };
    if (e.key === "ArrowDown") nextDir = { x: 0, y: 1 };
    if (e.key === "ArrowLeft") nextDir = { x: -1, y: 0 };
    if (e.key === "ArrowRight") nextDir = { x: 1, y: 0 };
});

boostBtn.onmousedown = () => boosted = true;
boostBtn.onmouseup = () => boosted = false;

// JOYSTICK TOUCH
joystickOuter.addEventListener("touchmove", (e) => {
    let touch = e.touches[0];
    let rect = joystickOuter.getBoundingClientRect();

    let x = touch.clientX - rect.left - 60;
    let y = touch.clientY - rect.top - 60;

    joystickInner.style.left = (60 + x / 2) + "px";
    joystickInner.style.top = (60 + y / 2) + "px";

    if (Math.abs(x) > Math.abs(y)) {
        nextDir = { x: x > 0 ? 1 : -1, y: 0 };
    } else {
        nextDir = { x: 0, y: y > 0 ? 1 : -1 };
    }
});
joystickOuter.addEventListener("touchend", () => {
    joystickInner.style.left = "35px";
    joystickInner.style.top = "35px";
});

function rotate(img, x, y, angle) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(img, -15, -15, size, size);
    ctx.restore();
}

function gameOver() {
    outSound.play();
    alert("GAME OVER!");

    if (score > highScore) {
        localStorage.setItem("snakeHS", score);
    }
    location.reload();
}

function gameLoop(time) {
    if (time - lastMove < speed - (boosted ? 90 : 0)) {
        return requestAnimationFrame(gameLoop);
    }
    lastMove = time;

    direction = nextDir;

    let head = {
        x: snake[snake.length - 1].x + direction.x * size,
        y: snake[snake.length - 1].y + direction.y * size
    };

    if (head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) {
        return gameOver();
    }

    snake.push(head);
    if (snake.length > length) snake.shift();

    if (head.x === food.x && head.y === food.y) {
        eatSound.play();
        length++;
        score++;
        scoreSpan.textContent = score;

        if (speed > 60) speed -= 5; // auto level up

        placeFood();
    }

    ctx.clearRect(0, 0, 600, 600);

    ctx.drawImage(foodImg, food.x, food.y, size, size);

    for (let i = 0; i < snake.length - 1; i++) {
        let s = snake[i];
        let n = snake[i + 1];

        let angle = 0;
        if (n.x > s.x) angle = 270;
        if (n.x < s.x) angle = 90;
        if (n.y > s.y) angle = 180;
        if (n.y < s.y) angle = 0;

        rotate(bodyImg, s.x, s.y, angle);
    }

    let last = snake[snake.length - 1];
    let angle = 0;

    if (direction.x === 1) angle = 270;
    if (direction.x === -1) angle = 90;
    if (direction.y === 1) angle = 180;
    if (direction.y === -1) angle = 0;

    rotate(headImg, last.x, last.y, angle);

    requestAnimationFrame(gameLoop);
}
