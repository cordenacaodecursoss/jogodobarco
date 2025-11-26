const SIZE = 10;

// Frota completa (você pode refinar depois para posicionar por navio)
const SHIPS = [
  { name: "Porta-aviões", size: 5 },
  { name: "Encouraçado", size: 4 },
  { name: "Cruzador", size: 3 },
  { name: "Submarino", size: 3 },
  { name: "Destróier", size: 2 }
];

let myBoard = [];
let enemyBoard = [];
let gameStarted = false;
let myTurn = false;

const btnStart = document.getElementById("btnStart");
const btnReady = document.getElementById("btnReady");
const menuDiv = document.getElementById("menu");
const gameDiv = document.getElementById("game");
const myBoardDiv = document.getElementById("myBoard");
const enemyBoardDiv = document.getElementById("enemyBoard");
const infoP = document.getElementById("info");
const turnInfo = document.getElementById("turnInfo");
const explosionContainer = document.getElementById("explosion-container");

// util
function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < SIZE; r++) {
    const row = [];
    for (let c = 0; c < SIZE; c++) {
      row.push({ hasShip: false, hit: false });
    }
    board.push(row);
  }
  return board;
}

function renderBoard(container, board, isMyBoard) {
  container.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (isMyBoard && board[r][c].hasShip) {
        cell.classList.add("ship");
      }

      if (isMyBoard) {
        cell.addEventListener("click", () => {
          if (gameStarted) return;
          board[r][c].hasShip = !board[r][c].hasShip;
          renderBoard(container, board, true);
        });
      } else {
        cell.addEventListener("click", () => {
          if (!myTurn || gameStarted === false) return;
          playerFire(r, c, cell);
        });
      }

      container.appendChild(cell);
    }
  }
}

// posiciona navios do CPU (forma simples, aleatória, respeitando SHIPS)
function placeCpuShips(board) {
  SHIPS.forEach(ship => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * SIZE);
      const col = Math.floor(Math.random() * SIZE);
      const cells = [];

      if (horizontal) {
        if (col + ship.size > SIZE) continue;
        for (let c = col; c < col + ship.size; c++) {
          cells.push({ r: row, c });
        }
      } else {
        if (row + ship.size > SIZE) continue;
        for (let r = row; r < row + ship.size; r++) {
          cells.push({ r, c: col });
        }
      }

      if (cells.some(cell => board[cell.r][cell.c].hasShip)) {
        continue;
      }

      cells.forEach(cell => {
        board[cell.r][cell.c].hasShip = true;
      });
      placed = true;
    }
  });
}

// explosão
function showExplosionAtElement(elem) {
  const rect = elem.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 10; i++) {
    const p = document.createElement("div");
    p.classList.add("explosion-particle");
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 30;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--dy", dy + "px");
    p.style.left = cx + "px";
    p.style.top = cy + "px";
    explosionContainer.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

// lógica de tiro do jogador
function playerFire(r, c, cellElem) {
  const cell = enemyBoard[r][c];
  if (cell.hit) return;
  cell.hit = true;

  if (cell.hasShip) {
    cellElem.classList.add("hit");
    cellElem.textContent = "X";
    showExplosionAtElement(cellElem);
  } else {
    cellElem.classList.add("miss");
    cellElem.textContent = "•";
  }

  if (checkWin(enemyBoard)) {
    turnInfo.textContent = "Você venceu!";
    myTurn = false;
    return;
  }

  myTurn = false;
  turnInfo.textContent = "Vez do inimigo...";
  setTimeout(cpuTurn, 700);
}

// turno do CPU (bem simples, aleatório)
function cpuTurn() {
  let r, c, cell;
  do {
    r = Math.floor(Math.random() * SIZE);
    c = Math.floor(Math.random() * SIZE);
    cell = myBoard[r][c];
  } while (cell.hit);

  cell.hit = true;
  const index = r * SIZE + c;
  const cellElem = myBoardDiv.children[index];

  if (cell.hasShip) {
    cellElem.classList.add("hit");
    cellElem.textContent = "X";
    showExplosionAtElement(cellElem);
  } else {
    cellElem.classList.add("miss");
    cellElem.textContent = "•";
  }

  if (checkWin(myBoard)) {
    turnInfo.textContent = "Você perdeu!";
    myTurn = false;
    return;
  }

  myTurn = true;
  turnInfo.textContent = "Sua vez de atirar!";
}

function checkWin(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].hasShip && !board[r][c].hit) return false;
    }
  }
  return true;
}

// fluxo
btnStart.addEventListener("click", () => {
  menuDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");
  infoP.textContent = "";

  myBoard = createEmptyBoard();
  enemyBoard = createEmptyBoard();

  renderBoard(myBoardDiv, myBoard, true);
  renderBoard(enemyBoardDiv, enemyBoard, false);

  turnInfo.textContent = "Clique nas células do seu tabuleiro para posicionar navios.";
});

btnReady.addEventListener("click", () => {
  // aqui você pode validar se a quantidade de células com navio bate com a soma de SHIPS
  placeCpuShips(enemyBoard);
  renderBoard(enemyBoardDiv, enemyBoard, false);
  gameStarted = true;
  myTurn = true;
  turnInfo.textContent = "Jogo iniciado! Atire no tabuleiro inimigo.";
});
