// ==========================================
// NAVEGACIÓN ENTRE PÁGINAS
// ==========================================
function showGame(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // Detener juegos al cambiar de página
    if (pageId === 'home') {
        stopCarGame();
        stopSnakeGame();
    }
}

// ==========================================
// JUEGO 1: CARRITO Y OBSTÁCULOS
// ==========================================
let carCanvas, carCtx;
let carGame = {
    car: { x: 175, y: 420, width: 50, height: 70 },
    obstacles: [],
    score: 0,
    highscore: 0,
    speed: 3,
    isRunning: false,
    animationId: null
};

function initCarGame() {
    carCanvas = document.getElementById('carCanvas');
    carCtx = carCanvas.getContext('2d');
    carGame.highscore = localStorage.getItem('carHighscore') || 0;
    document.getElementById('car-highscore').textContent = carGame.highscore;
}

function startCarGame() {
    carGame.car.x = 175;
    carGame.obstacles = [];
    carGame.score = 0;
    carGame.speed = 3;
    carGame.isRunning = true;
    document.getElementById('car-score').textContent = '0';
    document.getElementById('car-result').textContent = '';
    document.getElementById('car-result').className = 'result-message';
    document.getElementById('carStartBtn').disabled = true;
    gameLoopCar();
}

function stopCarGame() {
    carGame.isRunning = false;
    if (carGame.animationId) {
        cancelAnimationFrame(carGame.animationId);
    }
    document.getElementById('carStartBtn').disabled = false;
}

function gameLoopCar() {
    if (!carGame.isRunning) return;
    
    updateCar();
    drawCar();
    carGame.animationId = requestAnimationFrame(gameLoopCar);
}

function updateCar() {
    // Generar obstáculos
    if (Math.random() < 0.02) {
        carGame.obstacles.push({
            x: Math.random() * (carCanvas.width - 40),
            y: -50,
            width: 40,
            height: 40
        });
    }
    
    // Mover obstáculos
    carGame.obstacles.forEach(obs => {
        obs.y += carGame.speed;
    });
    
    // Eliminar obstáculos fuera de pantalla y sumar puntos
    carGame.obstacles = carGame.obstacles.filter(obs => {
        if (obs.y > carCanvas.height) {
            carGame.score += 10;
            document.getElementById('car-score').textContent = carGame.score;
            // Aumentar velocidad gradualmente
            if (carGame.score % 50 === 0) {
                carGame.speed += 0.5;
            }
            return false;
        }
        return true;
    });
    
    // Detectar colisiones
    carGame.obstacles.forEach(obs => {
        if (checkCollision(carGame.car, obs)) {
            endCarGame();
        }
    });
}

function drawCar() {
    // Limpiar canvas
    carCtx.fillStyle = '#1a1a2e';
    carCtx.fillRect(0, 0, carCanvas.width, carCanvas.height);
    
    // Dibujar líneas de carretera
    carCtx.strokeStyle = '#333';
    carCtx.setLineDash([20, 15]);
    carCtx.lineWidth = 3;
    for (let i = 1; i < 4; i++) {
        carCtx.beginPath();
        carCtx.moveTo(i * 100, 0);
        carCtx.lineTo(i * 100, carCanvas.height);
        carCtx.stroke();
    }
    carCtx.setLineDash([]);
    
    // Dibujar carrito (representación simple)
    carCtx.fillStyle = '#4a9eff';
    carCtx.fillRect(carGame.car.x, carGame.car.y, carGame.car.width, carGame.car.height);
    // Ventanas del carro
    carCtx.fillStyle = '#87ceeb';
    carCtx.fillRect(carGame.car.x + 5, carGame.car.y + 10, 40, 20);
    // Ruedas
    carCtx.fillStyle = '#333';
    carCtx.fillRect(carGame.car.x - 5, carGame.car.y + 5, 8, 15);
    carCtx.fillRect(carGame.car.x + 47, carGame.car.y + 5, 8, 15);
    carCtx.fillRect(carGame.car.x - 5, carGame.car.y + 50, 8, 15);
    carCtx.fillRect(carGame.car.x + 47, carGame.car.y + 50, 8, 15);
    
    // Dibujar obstáculos
    carGame.obstacles.forEach(obs => {
        carCtx.fillStyle = '#ff5252';
        carCtx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Detalle del obstáculo
        carCtx.fillStyle = '#ff8a80';
        carCtx.fillRect(obs.x + 5, obs.y + 5, 30, 10);
    });
}

function endCarGame() {
    carGame.isRunning = false;
    cancelAnimationFrame(carGame.animationId);
    
    if (carGame.score > carGame.highscore) {
        carGame.highscore = carGame.score;
        localStorage.setItem('carHighscore', carGame.highscore);
        document.getElementById('car-highscore').textContent = carGame.highscore;
    }
    
    document.getElementById('car-result').textContent = `¡Game Over! Puntuación: ${carGame.score}`;
    document.getElementById('car-result').className = 'result-message lose';
    document.getElementById('carStartBtn').disabled = false;
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ==========================================
// JUEGO 2: SNAKE
// ==========================================
let snakeCanvas, snakeCtx;
let snakeGame = {
    snake: [],
    food: { x: 0, y: 0 },
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    highscore: 0,
    gridSize: 20,
    isRunning: false,
    intervalId: null
};

function initSnakeGame() {
    snakeCanvas = document.getElementById('snakeCanvas');
    snakeCtx = snakeCanvas.getContext('2d');
    snakeGame.highscore = localStorage.getItem('snakeHighscore') || 0;
    document.getElementById('snake-highscore').textContent = snakeGame.highscore;
}

function startSnakeGame() {
    // Inicializar serpiente
    snakeGame.snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    snakeGame.direction = 'RIGHT';
    snakeGame.nextDirection = 'RIGHT';
    snakeGame.score = 0;
    snakeGame.isRunning = true;
    
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-result').textContent = '';
    document.getElementById('snake-result').className = 'result-message';
    document.getElementById('snakeStartBtn').disabled = true;
    
    generateFood();
    
    if (snakeGame.intervalId) clearInterval(snakeGame.intervalId);
    snakeGame.intervalId = setInterval(gameLoopSnake, 100);
}

function stopSnakeGame() {
    snakeGame.isRunning = false;
    if (snakeGame.intervalId) {
        clearInterval(snakeGame.intervalId);
    }
    document.getElementById('snakeStartBtn').disabled = false;
}

function gameLoopSnake() {
    if (!snakeGame.isRunning) return;
    
    updateSnake();
    drawSnake();
}

function updateSnake() {
    snakeGame.direction = snakeGame.nextDirection;
    
    // Calcular nueva cabeza
    let head = { ...snakeGame.snake[0] };
    
    switch (snakeGame.direction) {
        case 'UP': head.y -= snakeGame.gridSize; break;
        case 'DOWN': head.y += snakeGame.gridSize; break;
        case 'LEFT': head.x -= snakeGame.gridSize; break;
        case 'RIGHT': head.x += snakeGame.gridSize; break;
    }
    
    // Verificar colisión con paredes
    if (head.x < 0 || head.x >= snakeCanvas.width ||
        head.y < 0 || head.y >= snakeCanvas.height) {
        endSnakeGame();
        return;
    }
    
    // Verificar colisión consigo misma
    for (let segment of snakeGame.snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endSnakeGame();
            return;
        }
    }
    
    // Agregar nueva cabeza
    snakeGame.snake.unshift(head);
    
    // Verificar si comió comida
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        document.getElementById('snake-score').textContent = snakeGame.score;
        generateFood();
    } else {
        snakeGame.snake.pop();
    }
}

function drawSnake() {
    // Limpiar canvas
    snakeCtx.fillStyle = '#0a0a15';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Dibujar cuadrícula sutil
    snakeCtx.strokeStyle = '#1a1a2e';
    for (let i = 0; i < snakeCanvas.width; i += snakeGame.gridSize) {
        snakeCtx.beginPath();
        snakeCtx.moveTo(i, 0);
        snakeCtx.lineTo(i, snakeCanvas.height);
        snakeCtx.stroke();
        snakeCtx.beginPath();
        snakeCtx.moveTo(0, i);
        snakeCtx.lineTo(snakeCanvas.width, i);
        snakeCtx.stroke();
    }
    
    // Dibujar serpiente
    snakeGame.snake.forEach((segment, index) => {
        if (index === 0) {
            // Cabeza
            snakeCtx.fillStyle = '#00c853';
        } else {
            // Cuerpo con gradiente
            snakeCtx.fillStyle = `rgb(0, ${180 - index * 3}, ${80 - index})`;
        }
        snakeCtx.fillRect(segment.x + 1, segment.y + 1, 
                          snakeGame.gridSize - 2, snakeGame.gridSize - 2);
    });
    
    // Dibujar ojos de la serpiente
    snakeCtx.fillStyle = '#fff';
    let headX = snakeGame.snake[0].x;
    let headY = snakeGame.snake[0].y;
    snakeCtx.fillRect(headX + 4, headY + 4, 4, 4);
    snakeCtx.fillRect(headX + 12, headY + 4, 4, 4);
    
    // Dibujar comida (manzana)
    snakeCtx.fillStyle = '#ff5252';
    snakeCtx.beginPath();
    snakeCtx.arc(snakeGame.food.x + 10, snakeGame.food.y + 12, 8, 0, Math.PI * 2);
    snakeCtx.fill();
    // Tallo de la manzana
    snakeCtx.fillStyle = '#8b4513';
    snakeCtx.fillRect(snakeGame.food.x + 8, snakeGame.food.y + 2, 4, 6);
}

function generateFood() {
    let valid = false;
    while (!valid) {
        snakeGame.food.x = Math.floor(Math.random() * (snakeCanvas.width / snakeGame.gridSize)) * snakeGame.gridSize;
        snakeGame.food.y = Math.floor(Math.random() * (snakeCanvas.height / snakeGame.gridSize)) * snakeGame.gridSize;
        
        // Verificar que no esté sobre la serpiente
        valid = !snakeGame.snake.some(seg => 
            seg.x === snakeGame.food.x && seg.y === snakeGame.food.y
        );
    }
}

function endSnakeGame() {
    snakeGame.isRunning = false;
    clearInterval(snakeGame.intervalId);
    
    if (snakeGame.score > snakeGame.highscore) {
        snakeGame.highscore = snakeGame.score;
        localStorage.setItem('snakeHighscore', snakeGame.highscore);
        document.getElementById('snake-highscore').textContent = snakeGame.highscore;
    }
    
    document.getElementById('snake-result').textContent = `¡Game Over! Puntuación: ${snakeGame.score}`;
    document.getElementById('snake-result').className = 'result-message lose';
    document.getElementById('snakeStartBtn').disabled = false;
}

// ==========================================
// CONTROLES DEL TECLADO
// ==========================================
document.addEventListener('keydown', function(e) {
    // Controles del carrito
    if (carGame.isRunning) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            carGame.car.x = Math.max(0, carGame.car.x - 20);
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            carGame.car.x = Math.min(carCanvas.width - carGame.car.width, carGame.car.x + 20);
        }
    }
    
    // Controles de la serpiente
    if (snakeGame.isRunning) {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                if (snakeGame.direction !== 'DOWN') snakeGame.nextDirection = 'UP';
                break;
            case 'ArrowDown': case 's': case 'S':
                if (snakeGame.direction !== 'UP') snakeGame.nextDirection = 'DOWN';
                break;
            case 'ArrowLeft': case 'a': case 'A':
                if (snakeGame.direction !== 'RIGHT') snakeGame.nextDirection = 'LEFT';
                break;
            case 'ArrowRight': case 'd': case 'D':
                if (snakeGame.direction !== 'LEFT') snakeGame.nextDirection = 'RIGHT';
                break;
        }
    }
});

// ==========================================
// INICIALIZACIÓN
// ==========================================
window.onload = function() {
    initCarGame();
    initSnakeGame();
};