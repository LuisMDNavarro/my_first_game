// Variables
const game = document.getElementById('game')
const player = document.getElementById('player')
const overlay = document.getElementById('overlay')
const restartBtn = document.getElementById('restartBtn')
const scoreSpan = document.getElementById('score')
const finalScore = document.getElementById('finalScore')
const gameMessage = document.getElementById("gameMessage")

let playing = false
let jumping = false
let obstacles = []
let speed = 4 // px per frame multiplier
let spawnTimer = 0
let score = 0
let frame = 0
let loopId = null

function changeCharacter(character) {
    player.classList.forEach(cls => {
        if (cls.startsWith("type")) player.classList.remove(cls);
    });

    switch (true) {
        case character == "type1":
            player.classList.add('type1');
            break;

        case character == "type2":
            player.classList.add('type2');
            break;

        case character == "type3":
            player.classList.add('type3');
            break;

        case character == "type4":
            player.classList.add('type4');
            break;

        default:
            player.classList.add('type1');
            break;
    }
}

// Controls
function startGame() {
    reset()
    playing = true
    overlay.classList.remove('show')
    player.classList.add('running')
    loop()
}

function reset() {
    // clear obstacles
    obstacles.forEach(o => o.el.remove())
    obstacles = []
    speed = 4
    spawnTimer = 0
    score = 0
    frame = 0
    scoreSpan.textContent = '0'
}

function gameOver() {
    playing = false
    overlay.classList.add('show')
    finalScore.textContent = 'Puntuación: ' + score
    restartBtn.textContent = 'Reiniciar'
    gameMessage.textContent = '¡Game Over!'
    cancelAnimationFrame(loopId)
    player.classList.remove('running')
}

function spawnObstacle() {
    const el = document.createElement('div')
    el.className = 'obstacle animated';
    randomObstacle = Math.random();
    switch (true) {
        case randomObstacle < 0.10:
            el.classList.add('big');
            el.classList.remove('animated');
            el.classList.add('bigAnimated');
            break;

        case randomObstacle < 0.20:
            el.classList.add('fly1');
            el.classList.remove('animated');
            el.classList.add('animatedFly');
            break;

        case randomObstacle < 0.30:
            el.classList.add('fly2');
            el.classList.remove('animated');
            el.classList.add('animatedFly');
            break;

        case randomObstacle < 0.65:
            el.classList.add('type1');
            break;

        default:
            el.classList.add('type2');
            break;
    }
    game.appendChild(el)
    const obj = { el, x: game.clientWidth, w: el.offsetWidth, h: el.offsetHeight }
    obstacles.push(obj)
}

// Input handlers
function jump() {
    if (!playing) startGame()
    if (jumping) return
    jumping = true
    const currentCharacter = [...player.classList].find(c => c.startsWith("type"));
    player.classList.add('jumping')
    if (currentCharacter) {
        player.classList.add(currentCharacter)
    }
    player.classList.remove('running')
    setTimeout(() => {
        player.classList.remove('jumping')
        player.classList.add('running')
        jumping = false
    }, 700)
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
    }
    if (e.key === 'r' || e.key === 'R') {
        if (!playing) startGame()
    }
})

document.addEventListener('click', () => jump())
restartBtn.addEventListener('click', () => startGame())

// Main loop
function loop() {
    frame++
    loopId = requestAnimationFrame(loop)

    // Spawn obstacles over time
    spawnTimer++
    const spawnInterval = Math.max(90 - Math.floor(score / 100), 50)
    if (spawnTimer > spawnInterval) {
        spawnTimer = 0
        spawnObstacle()
    }

    // Increase difficulty gradually
    if (frame % 240 === 0) speed += 0.4

    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i]
        o.x -= speed * (1 + score / 500)
        o.el.style.transform = `translateX(${o.x}px)`

        // Off screen -> remove
        if (o.x + o.w < -40) {
            o.el.remove()
            obstacles.splice(i, 1)
            score += 10
            scoreSpan.textContent = score
        }
    }

    // Collision detection
    const dRect = player.getBoundingClientRect();
    for (const o of obstacles) {
        const oRect = o.el.getBoundingClientRect();

        const sideTrim = 0.20;
        const trimLeft = oRect.width * sideTrim;
        const trimRight = oRect.width * sideTrim;

        const hitbox = {
            left: oRect.left + trimLeft,
            right: oRect.right - trimRight,
            top: oRect.top,
            bottom: oRect.bottom
        };

        const overlap = !(dRect.right < hitbox.left ||
            dRect.left > hitbox.right ||
            dRect.bottom < hitbox.top ||
            dRect.top > hitbox.bottom);

        if (overlap) {
            gameOver();
            break;
        }
    }
}

function rectOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
}

// Start paused with message
overlay.classList.add('show')

// Expose small helper for dev console
window.__miniPlayer = { startGame, gameOver, jump }
