// tic-tac-toe.js
// Full Tic Tac Toe logic with prompts, scoreboard and UI updates.

(() => {
  // DOM references
  const cells = Array.from(document.querySelectorAll('[data-cell-index]'));
  const boardEl = document.getElementById('board');
  const turnIndicator = document.getElementById('turnIndicator');
  const gameMessage = document.getElementById('gameMessage');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const newGameBtn = document.getElementById('newGameBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resetScoreBtn = document.getElementById('resetScoreBtn');

  const resultModal = document.getElementById('resultModal');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const modalNewGame = document.getElementById('modalNewGame');
  const modalClose = document.getElementById('modalClose');

  // Game state
  let boardState = Array(9).fill(null); // null | 'X' | 'O'
  let currentPlayer = 'X';
  let isGameActive = true;
  let scores = { X: 0, O: 0 };

  // Winning combos
  const WIN_COMBOS = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diagonals
  ];

  // ------- Initialization -------
  function init() {
    renderBoard();
    attachListeners();
    updateTurnIndicator();
    updateScoreboard();
    setMessage(`Ready — ${currentPlayer} starts.`);
  }

  // ------- UI helpers -------
  function renderBoard() {
    cells.forEach((cell, idx) => {
      cell.innerHTML = boardState[idx] ? `<span>${boardState[idx]}</span>` : '';
      cell.classList.remove('bg-green-500', 'bg-blue-600', 'ring-4', 'ring-yellow-300');
      // reset hover background
      cell.classList.remove('bg-gray-600');
      // set base color (two-tone)
      cell.classList.remove('bg-gray-700', 'bg-gray-800');
      // alternate shading for nicer look
      cell.classList.add(idx % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800');
    });
  }

  function updateTurnIndicator() {
    turnIndicator.textContent = currentPlayer;
    if (currentPlayer === 'X') {
      turnIndicator.classList.remove('bg-yellow-600');
      turnIndicator.classList.add('bg-gray-800');
    } else {
      turnIndicator.classList.remove('bg-gray-800');
      turnIndicator.classList.add('bg-yellow-600');
    }
  }

  function setMessage(msg) {
    gameMessage.textContent = msg;
  }

  function updateScoreboard() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
  }

  // ------- Game logic -------
  function handleCellClick(e) {
    const idx = Number(e.currentTarget.getAttribute('data-cell-index'));
    if (!isGameActive) return;
    if (boardState[idx]) {
      // already filled
      return;
    }
    makeMove(idx, currentPlayer);
  }

  function makeMove(index, player) {
    boardState[index] = player;
    renderBoard();

    const winInfo = checkWin(boardState, player);
    if (winInfo.isWin) {
      isGameActive = false;
      // highlight winning cells
      winInfo.line.forEach(i => {
        const el = document.querySelector(`[data-cell-index="${i}"]`);
        if (el) el.classList.add('bg-green-500', 'ring-4', 'ring-yellow-300');
      });
      scores[player] += 1;
      updateScoreboard();
      showResult(`${player} Wins!`, `🎉 ${player} wins the round.`);
      return;
    }

    if (isDraw(boardState)) {
      isGameActive = false;
      showResult('Draw', '🤝 The game is a draw.');
      return;
    }

    // toggle player
    currentPlayer = (player === 'X') ? 'O' : 'X';
    updateTurnIndicator();
    setMessage(`It's ${currentPlayer}'s turn`);
  }

  function checkWin(board, player) {
    for (const combo of WIN_COMBOS) {
      const [a,b,c] = combo;
      if (board[a] === player && board[b] === player && board[c] === player) {
        return { isWin: true, line: combo };
      }
    }
    return { isWin: false, line: [] };
  }

  function isDraw(board) {
    return board.every(cell => cell !== null);
  }

  // ------- Controls -------
  function clearBoard() {
    boardState = Array(9).fill(null);
    isGameActive = true;
    renderBoard();
    setMessage(`Board cleared — ${currentPlayer} to play.`);
  }

  function newGame() {
    boardState = Array(9).fill(null);
    isGameActive = true;
    currentPlayer = 'X';
    updateTurnIndicator();
    renderBoard();
    setMessage(`New game — ${currentPlayer} starts.`);
  }

  function resetScores() {
    scores = { X: 0, O: 0 };
    updateScoreboard();
    setMessage('Scores reset. ' + `${currentPlayer} to play.`);
  }

  // ------- Modal / result -------
  function showResult(title, message) {
    resultTitle.textContent = title;
    resultText.textContent = message;
    resultModal.classList.remove('hidden');
    resultModal.classList.add('flex');
    setMessage(message);
  }

  function closeModal() {
    resultModal.classList.add('hidden');
    resultModal.classList.remove('flex');
  }

  // ------- Events -------
  function attachListeners() {
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
      // hover effect for available cells
      cell.addEventListener('mouseenter', () => {
        const idx = Number(cell.getAttribute('data-cell-index'));
        if (isGameActive && !boardState[idx]) {
          cell.classList.add('bg-gray-600');
        }
      });
      cell.addEventListener('mouseleave', () => cell.classList.remove('bg-gray-600'));
    });

    newGameBtn.addEventListener('click', () => {
      newGame();
      closeModal();
    });

    clearBtn.addEventListener('click', () => {
      clearBoard();
      closeModal();
    });

    resetScoreBtn.addEventListener('click', () => {
      if (confirm('Reset scores to zero?')) {
        resetScores();
      }
    });

    modalNewGame.addEventListener('click', () => {
      newGame();
      closeModal();
    });

    modalClose.addEventListener('click', closeModal);

    // keyboard shortcut: R -> new game, C -> clear, S -> reset scores
    window.addEventListener('keydown', (ev) => {
      const key = ev.key.toLowerCase();
      if (key === 'r') { newGame(); closeModal(); }
      if (key === 'c') { clearBoard(); closeModal(); }
      if (key === 's') {
        if (confirm('Reset scores to zero?')) resetScores();
      }
    });
  }

  // init on load
  init();
})();
