// Memory Match Pro — script.js

// DOM refs
const board = document.getElementById("gameBoard");
const movesCounter = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");
const difficultySelect = document.getElementById("difficulty");

const winModal = document.getElementById("winModal");
const finalTime = document.getElementById("finalTime");
const finalMoves = document.getElementById("finalMoves");
const playAgainBtn = document.getElementById("playAgainBtn");

const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

// emoji pool (must have >= 18 unique for 6x6)
const emojis = ["🍎","🍌","🍇","🍉","🍒","🍋","🥝","🍍","🥥","🍑","🍓","🍆","🌽","🥕","🥦","🍄","🥨","🍪","🍩","🍧"];

// game state
let cards = [];
let flippedCards = [];
let matched = [];
let moves = 0;
let timer = 0;
let timerInterval = null;

// confetti state
let confettiParticles = [];
let confettiAnimation = null;

// shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// set grid layout based on difficulty -> returns totalCards
function setGrid() {
  const difficulty = difficultySelect.value;
  let cols, rows;
  if (difficulty === "easy") { cols = 4; rows = 4; }       // 16
  else if (difficulty === "medium") { cols = 5; rows = 4; } // 20 (4 x 5)
  else { cols = 6; rows = 6; }                             // 36

  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  return cols * rows;
}

// generate cards and attach to DOM
function generateCards() {
  const totalCards = setGrid();

  // safety: totalCards must be even and <= 40 (we have 20 emoji pairs safely)
  if (totalCards % 2 !== 0) {
    console.error("Total cards must be even — check difficulty logic.");
    return;
  }
  const neededPairs = totalCards / 2;
  if (neededPairs > emojis.length) {
    console.error("Not enough emoji choices for this difficulty.");
    return;
  }

  const selected = emojis.slice(0, neededPairs);
  cards = shuffle([...selected, ...selected]);

  board.innerHTML = "";
  cards.forEach((emoji, idx) => {
    const card = document.createElement("div");
    card.className = "card bg-white/20 rounded-xl";
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
      </div>
    `;
    card.dataset.emoji = emoji;
    // click handler
    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });
}

// flip card logic
function flipCard(card) {
  // guard: can't flip 2 cards while waiting, and can't flip already matched or already flipped
  if (card.classList.contains("matched")) return;
  if (flippedCards.some(fc => fc.card === card)) return;
  if (flippedCards.length === 2) return;

  card.classList.add("flipped");
  flippedCards.push({ card, emoji: card.dataset.emoji });

  if (flippedCards.length === 2) {
    moves++;
    movesCounter.textContent = moves;

    const [first, second] = flippedCards;
    if (first.emoji === second.emoji) {
      // match!
      first.card.classList.add("matched");
      second.card.classList.add("matched");
      matched.push(first, second);
      flippedCards = [];

      // win condition
      if (matched.length === cards.length) {
        clearInterval(timerInterval);
        setTimeout(showWinModal, 700);
      }
    } else {
      // not match — flip back after short delay
      setTimeout(() => {
        first.card.classList.remove("flipped");
        second.card.classList.remove("flipped");
        flippedCards = [];
      }, 900);
    }
  }
}

// start / restart game
function startGame() {
  // reset
  clearInterval(timerInterval);
  timer = 0;
  moves = 0;
  flippedCards = [];
  matched = [];
  movesCounter.textContent = 0;
  timerDisplay.textContent = "0s";
  resizeCanvas();
  generateCards();

  // timer
  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = `${timer}s`;
  }, 1000);
}

// show modal & confetti
function showWinModal() {
  finalTime.textContent = timer;
  finalMoves.textContent = moves;
  winModal.classList.remove("hidden");
  winModal.classList.add("flex");
  launchConfetti();
}

// close modal and restart
function closeWinModal() {
  winModal.classList.add("hidden");
  winModal.classList.remove("flex");
  stopConfetti();
  startGame();
}

// -------- CONFETTI --------
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function launchConfetti() {
  resizeCanvas();
  confettiParticles = Array.from({ length: 100 }).map(() => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * -confettiCanvas.height,
    r: Math.random() * 8 + 4,
    d: Math.random() * 100,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`,
    tilt: Math.random() * 20 - 10,
    speedX: Math.random() * 2 - 1,
    speedY: Math.random() * 3 + 2
  }));
  if (!confettiAnimation) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.tilt * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
    ctx.restore();

    p.x += p.speedX + Math.sin(p.d) * 0.5;
    p.y += p.speedY;
    p.d += 0.01;

    if (p.y > confettiCanvas.height + 20) {
      p.y = Math.random() * -confettiCanvas.height;
      p.x = Math.random() * confettiCanvas.width;
    }
  });
  confettiAnimation = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (confettiAnimation) cancelAnimationFrame(confettiAnimation);
  confettiAnimation = null;
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// ------- events -------
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", closeWinModal);
difficultySelect.addEventListener("change", startGame);
window.addEventListener("resize", resizeCanvas);

// initial start
startGame();
