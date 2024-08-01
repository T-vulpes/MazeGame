const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const messageDiv = document.createElement('div');
document.body.appendChild(messageDiv);

let cellSize = 40;
let cols = Math.floor(canvas.width / cellSize);
let rows = Math.floor(canvas.height / cellSize);
let grid = [];
let stack = [];
let current;
let level = 1;
const maxLevel = 3;

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = [true, true, true, true]; 
        this.visited = false;
    }

    show() {
        const x = this.x * cellSize;
        const y = this.y * cellSize;
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.walls[0]) ctx.moveTo(x, y), ctx.lineTo(x + cellSize, y);
        if (this.walls[1]) ctx.moveTo(x + cellSize, y), ctx.lineTo(x + cellSize, y + cellSize);
        if (this.walls[2]) ctx.moveTo(x + cellSize, y + cellSize), ctx.lineTo(x, y + cellSize);
        if (this.walls[3]) ctx.moveTo(x, y + cellSize), ctx.lineTo(x, y);
        ctx.stroke();
    }

    checkNeighbors() {
        const neighbors = [];

        const top = grid[index(this.x, this.y - 1)];
        const right = grid[index(this.x + 1, this.y)];
        const bottom = grid[index(this.x, this.y + 1)];
        const left = grid[index(this.x - 1, this.y)];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
            const r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        }
        return undefined;
    }
}

function index(x, y) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return x + y * cols;
}

function setup() {
    grid = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }
    current = grid[0];
    stack = [];
    generateMaze();
}

function generateMaze() {
    while (true) {
        current.visited = true;
        const next = current.checkNeighbors();
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }
    drawMaze();
    drawPlayer();
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < grid.length; i++) {
        grid[i].show();
    }
}

function removeWalls(a, b) {
    const x = a.x - b.x;
    if (x === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (x === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
    }

    const y = a.y - b.y;
    if (y === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (y === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

const playerColors = ['red', 'blue', 'green'];
let player = { x: 0, y: 0, color: playerColors[level - 1] };
let exit = { x: cols - 1, y: rows - 1 };

function drawPlayer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'red';
    ctx.fillRect(exit.x * cellSize + 2, exit.y * cellSize + 2, cellSize - 4, cellSize - 4);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(exit.x * cellSize + cellSize / 2, exit.y * cellSize + cellSize / 4);
    ctx.lineTo(exit.x * cellSize + cellSize / 2, exit.y * cellSize + cellSize - cellSize / 4);
    ctx.lineTo(exit.x * cellSize + cellSize / 4, exit.y * cellSize + cellSize - cellSize / 2);
    ctx.moveTo(exit.x * cellSize + cellSize / 2, exit.y * cellSize + cellSize - cellSize / 4);
    ctx.lineTo(exit.x * cellSize + cellSize - cellSize / 4, exit.y * cellSize + cellSize - cellSize / 2);
    ctx.stroke();
}

function movePlayer(event) {
    const key = event.key;
    const cell = grid[index(player.x, player.y)];
    if (key === 'ArrowUp' && !cell.walls[0] && player.y > 0) player.y -= 1;
    if (key === 'ArrowRight' && !cell.walls[1] && player.x < cols - 1) player.x += 1;
    if (key === 'ArrowDown' && !cell.walls[2] && player.y < rows - 1) player.y += 1;
    if (key === 'ArrowLeft' && !cell.walls[3] && player.x > 0) player.x -= 1;
    checkWin();
    drawPlayer();
}

function checkWin() {
    if (player.x === exit.x && player.y === exit.y) {
        messageDiv.textContent = `Congratulations, you completed level ${level}!`;
        level++;
        if (level <= maxLevel) {
            setupNextLevel();
        } else {
            messageDiv.textContent = 'Congratulations! You have completed all levels!';
            nextLevelBtn.disabled = true; 
        }
    }
}

function setupNextLevel() {
    if (level > maxLevel) {
        return; 
    }
    cellSize -= 10;
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
    player = { x: 0, y: 0, color: playerColors[(level - 1) % playerColors.length] };
    exit = { x: cols - 1, y: rows - 1 };
    setup();
}

nextLevelBtn.addEventListener('click', setupNextLevel);
document.addEventListener('keydown', movePlayer);
setup();
