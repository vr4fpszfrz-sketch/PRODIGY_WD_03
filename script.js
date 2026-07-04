const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const vsPlayerBtn = document.getElementById('vsPlayerBtn');
const vsAiBtn = document.getElementById('vsAiBtn');

const WIN_PATTERNS = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

let gameState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let vsAI = false;

function setMode(ai) {
  vsAI = ai;
  vsAiBtn.classList.toggle('active', ai);
  vsPlayerBtn.classList.toggle('active', !ai);
  restart();
}

vsPlayerBtn.addEventListener('click', () => setMode(false));
vsAiBtn.addEventListener('click', () => setMode(true));

function checkWinner() {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      return { winner: gameState[a], pattern };
    }
  }
  if (!gameState.includes('')) {
    return { winner: 'draw' };
  }
  return null;
}

function handleCellClick(e) {
  const index = Number(e.target.dataset.index);
  if (gameState[index] !== '' || !gameActive) return;
  if (vsAI && currentPlayer === 'O') return; // block manual O clicks in AI mode

  makeMove(index, currentPlayer);

  const result = checkWinner();
  if (result) {
    endGame(result);
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  status.textContent = `Player ${currentPlayer}'s turn`;

  if (vsAI && currentPlayer === 'O' && gameActive) {
    status.textContent = "AI is thinking...";
    setTimeout(aiMove, 400);
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
}

function aiMove() {
  if (!gameActive) return;
  const bestMove = getBestMove();
  makeMove(bestMove, 'O');

  const result = checkWinner();
  if (result) {
    endGame(result);
    return;
  }

  currentPlayer = 'X';
  status.textContent = "Player X's turn";
}

// Simple AI: win if possible, block if needed, else pick center/corner/random
function getBestMove() {
  const empty = gameState.map((v, i) => v === '' ? i : null).filter(v => v !== null);

  // Try to win
  for (const i of empty) {
    gameState[i] = 'O';
    if (checkWinner()?.winner === 'O') { gameState[i] = ''; return i; }
    gameState[i] = '';
  }

  // Block player
  for (const i of empty) {
    gameState[i] = 'X';
    if (checkWinner()?.winner === 'X') { gameState[i] = ''; return i; }
    gameState[i] = '';
  }

  // Take center
  if (gameState[4] === '') return 4;

  // Take a corner
  const corners = [0, 2, 6, 8].filter(i => gameState[i] === '');
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // Random remaining
  return empty[Math.floor(Math.random() * empty.length)];
}

function endGame(result) {
  gameActive = false;
  if (result.winner === 'draw') {
    status.textContent = "It's a draw!";
  } else {
    status.textContent = `Player ${result.winner} wins!`;
    result.pattern.forEach(i => cells[i].classList.add('win'));
  }
}

function restart() {
  gameState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  status.textContent = "Player X's turn";
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'win');
  });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restart);
