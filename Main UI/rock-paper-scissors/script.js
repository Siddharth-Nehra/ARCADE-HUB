const choices = ["rock", "paper", "scissors"];
const buttons = document.querySelectorAll(".choice-btn");
const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");
const messageEl = document.getElementById("message");
const playerHand = document.getElementById("playerHand");
const computerHand = document.getElementById("computerHand");
const restartBtn = document.getElementById("restartBtn");
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

let playerScore = 0;
let computerScore = 0;
let rounds = 0;
let confettiAnimation;

function getComputerChoice() {
  return choices[Math.floor(Math.random() * 3)];
}

function playRound(playerChoice) {
  if (rounds >= 5) return;
  const computerChoice = getComputerChoice();

  // Start shake animation
  playerHand.classList.add("shake");
  computerHand.classList.add("shake");
  messageEl.textContent = "✊ Shaking hands...";

  setTimeout(() => {
    // Stop shaking
    playerHand.classList.remove("shake");
    computerHand.classList.remove("shake");

    // Show chosen hands
    playerHand.textContent = getEmoji(playerChoice);
    computerHand.textContent = getEmoji(computerChoice);

    // Determine result
    let result;
    if (playerChoice === computerChoice) {
      result = "🤝 It's a draw!";
    } else if (
      (playerChoice === "rock" && computerChoice === "scissors") ||
      (playerChoice === "paper" && computerChoice === "rock") ||
      (playerChoice === "scissors" && computerChoice === "paper")
    ) {
      playerScore++;
      result = `🎉 You win this round! ${capitalize(playerChoice)} beats ${computerChoice}`;
    } else {
      computerScore++;
      result = `💻 Computer wins! ${capitalize(computerChoice)} beats ${playerChoice}`;
    }

    // Update scores
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    messageEl.textContent = result;
    rounds++;

    if (rounds === 5) setTimeout(checkWinner, 1000);
  }, 1500);
}

function checkWinner() {
  if (playerScore > computerScore) {
    messageEl.textContent = "🏆 You win the match!";
    playerScoreEl.classList.add("win-glow");
    launchConfetti();
  } else if (playerScore < computerScore) {
    messageEl.textContent = "💻 Computer wins the match!";
    computerScoreEl.classList.add("win-glow");
  } else {
    messageEl.textContent = "🤝 It's a tie overall!";
  }
  restartBtn.classList.remove("hidden");
}

function restartGame() {
  playerScore = 0;
  computerScore = 0;
  rounds = 0;
  playerScoreEl.textContent = "0";
  computerScoreEl.textContent = "0";
  messageEl.textContent = "Choose your move 👇";
  playerHand.textContent = "✊";
  computerHand.textContent = "✊";
  restartBtn.classList.add("hidden");
  playerScoreEl.classList.remove("win-glow");
  computerScoreEl.classList.remove("win-glow");
  stopConfetti();
}

function getEmoji(choice) {
  if (choice === "rock") return "🪨";
  if (choice === "paper") return "📄";
  return "✂️";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Confetti Animation
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

function launchConfetti() {
  resizeCanvas();
  const confetti = Array.from({ length: 100 }).map(() => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height,
    r: Math.random() * 6 + 2,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`,
    speedX: Math.random() * 2 - 1,
    speedY: Math.random() * 3 + 2
  }));

  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confetti.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y > confettiCanvas.height) p.y = 0;
    });
    confettiAnimation = requestAnimationFrame(draw);
  }
  draw();
}

function stopConfetti() {
  cancelAnimationFrame(confettiAnimation);
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// Event listeners
buttons.forEach(btn =>
  btn.addEventListener("click", () => playRound(btn.dataset.choice))
);
restartBtn.addEventListener("click", restartGame);
