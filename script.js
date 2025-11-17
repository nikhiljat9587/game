const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let size = 30;

// Auto-fit canvas for all phones
function resize() {
    let s = Math.min(window.innerWidth, window.innerHeight) - 20;
    canvas.width = s;
    canvas.height = s;
}
resize();
window.onresize = resize;

let speed = 120;
let lastMoveTime = 0;

let snake = [];
let direction = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let length = 3;

// Images
const headImg = new Image();
const bodyImg = new Image();
const foodImg = new Image();

// Sounds
const eatSound = new Audio("eat.mp3");
const outSound = new Audio("out.mp3");

// Load images
headImg.src = "head.png";
bodyImg.src = "body.png";
foodImg.src = "food.png";

headImg.onload = () => startGame();

function startGame() {
    snake = [{ x: 5 * size, y: 5 * size }];
    direction = { x: 1, y: 0 };
    length = 3;
    placeFood();
    requestAnimationFrame(gameLoop);
}

function placeFood() {
    let cols = Math.floor(canvas.width / size);
    let rows = Math.floor(canvas.height / size);

    food.x = Math.floor(Math.random() * cols) * size;
    food.y = Math.floor(Math.random() * rows) * size;
}

function drawRotated(img, x, y, angle) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
}

function gameOver() {
    outSound.play();
    if (navigator.vibrate) navigator.vibrate(200);
    setTimeout(startGame, 500);
}

function gameLoop(t) {
    if (t - lastMoveTime < speed) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastMoveTime = t;

    let head = {
        x: snake[snake.length - 1].x + direction.x * size,
        y: snake[snake.length - 1].y + direction.y * size
    };

    // OUT LOGIC
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }

    snake.push(head);
    if (snake.length > length) snake.shift();

    // EAT FOOD
    if (head.x === food.x && head.y === food.y) {
        length++;
        eatSound.play();
        placeFood();
    }

    // DRAW
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // FOOD
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
    let h = snake[snake.length - 1];
    let angle = 0;

    if (direction.x === 1) angle = 270;
    if (direction.x === -1) angle = 90;
    if (direction.y === 1) angle = 180;
    if (direction.y === -1) angle = 0;

    drawRotated(headImg, h.x, h.y, angle);

    requestAnimationFrame(gameLoop);
}

/* ---- DESKTOP CONTROLS ---- */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction.y !== 1) direction = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && direction.y !== -1) direction = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && direction.x !== 1) direction = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && direction.x !== -1) direction = { x: 1, y: 0 };
});

/* ---- MOBILE SWIPE CONTROL ---- */
let sx = 0, sy = 0;

canvas.addEventListener("touchstart", e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
    let dx = e.changedTouches[0].clientX - sx;
    let dy = e.changedTouches[0].clientY - sy;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction.x !== -1) direction = { x: 1, y: 0 };
        else if (dx < 0 && direction.x !== 1) direction = { x: -1, y: 0 };
    } else {
        if (dy > 0 && direction.y !== -1) direction = { x: 0, y: 1 };
        else if (dy < 0 && direction.y !== 1) direction = { x: 0, y: -1 };
    }
});
