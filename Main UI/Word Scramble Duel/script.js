// --- Configuration & Dictionary ---
const DICTIONARY = new Set([
    "cat", "act", "tack", "cake", "take", "ace", "kit", "tike",
    "cite", "tick", "eat", "tea", "ate", "neat", "tank", "knit",
    "time", "mice", "meet", "item", "caste", "steak", "test",
    "read", "dare", "ride", "tired", "star", "rats", "art", "rate",
    "deal", "lead", "pale", "leap", "plea", "ape", "lame", "meal",
    "stark", "rates", "dream", "meat", "team", "care", "race", "scar",
    "scan", "can", "ran", "air", "rain", "nail", "ant", "tan", 
    "master", "stream", "tamer", "smart", "stare", "tame", "rate",
    "streamer", "marker", "tangle", "angel", "angle", "alert", "later"
]);

const SCORE_SCHEME = {
    3: 1,
    4: 1,
    5: 2,
    6: 3,
    7: 5 
};
const HINT_PENALTY = 5; 
const GAME_TIME = 60; 

// --- Game Class Definition ---
class ScrambleGame {
    constructor() {
        this.dom = this._getDomElements();

        // Game State Variables
        this.gameActive = false;
        this.score = 0;             
        this.penaltyPoints = 0;     
        this.timeLeft = GAME_TIME;
        this.timerInterval = null;
        this.scrambledLetters = '';
        this.foundWords = new Set();
        this.possibleWords = []; 

        this._initListeners();
        this._resetUI();
    }

    // --- DOM Accessors ---
    _getDomElements() {
        return {
            startGameBtn: document.getElementById('start-game'),
            timeDisplay: document.getElementById('time-display'),
            scoreDisplay: document.getElementById('score-display'),
            penaltyDisplay: document.getElementById('penalty-display'),
            lettersDisplay: document.getElementById('scrambled-letters'),
            wordInput: document.getElementById('word-input'),
            submitWordBtn: document.getElementById('submit-word'),
            hintButton: document.getElementById('hint-button'),
            foundWordsList: document.getElementById('found-words-list'),
            messageArea: document.getElementById('message'),
            gameMain: document.getElementById('game-main'),
            gameStats: document.getElementById('game-stats'),
            statFound: document.getElementById('stat-found'),
            statPossible: document.getElementById('stat-possible'),
            statLongest: document.getElementById('stat-longest'),
            statBreakdown: document.getElementById('stat-breakdown'),
        };
    }

    // --- Core Utilities ---

    _showMessage(text, type = 'success') {
        this.dom.messageArea.className = 'message-area text-center rounded-lg w-1/2 font-medium';
        this.dom.messageArea.textContent = text;
        
        const classes = {
            success: ['message-success', 'bg-green-100', 'text-success'],
            error: ['message-error', 'bg-red-100', 'text-error'],
            hint: ['message-hint', 'bg-yellow-100', 'text-yellow-700']
        };
        
        this.dom.messageArea.classList.add(...classes[type]);

        setTimeout(() => {
            this.dom.messageArea.className = 'message-area text-center rounded-lg w-1/2 font-medium';
        }, 2000);
    }

    _isFormable(word, letters) {
        const letterCounts = {};
        for (const char of letters.toUpperCase()) {
            letterCounts[char] = (letterCounts[char] || 0) + 1;
        }

        for (const char of word.toUpperCase()) {
            if (!letterCounts[char] || letterCounts[char] === 0) {
                return false;
            }
            letterCounts[char]--;
        }
        return true;
    }
    
    // --- Letter Generation and Word Calculation ---

    _generateScrambledLetters() {
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const vowels = 'AEIOU';
        let letters = [];

        for (let i = 0; i < 4; i++) {
            letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
        }
        for (let i = 0; i < 3; i++) {
            letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        }

        // Fisher-Yates shuffle
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        
        this.scrambledLetters = letters.join('');
        this.dom.lettersDisplay.innerHTML = letters.map(l => `<span class="letter-tile">${l}</span>`).join(' ');
    }

    _calculatePossibleWords() {
        this.possibleWords = [];
        const scrambleUpper = this.scrambledLetters.toUpperCase();
        
        for (const word of DICTIONARY) {
            if (word.length >= 3 && word.length <= 7 && this._isFormable(word, scrambleUpper)) {
                this.possibleWords.push(word);
            }
        }
        this.possibleWords.sort((a, b) => b.length - a.length);
    }

    // --- Event Handlers & Initialization ---

    _initListeners() {
        this.dom.startGameBtn.addEventListener('click', () => this.startGame());
        this.dom.submitWordBtn.addEventListener('click', () => this.submitWord());
        this.dom.hintButton.addEventListener('click', () => this.provideHint());
        
        this.dom.wordInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                this.submitWord();
            }
        });
        
        this.dom.wordInput.addEventListener('input', () => this._highlightLetters());
    }
    
    _resetUI() {
        this.dom.lettersDisplay.textContent = 'P L A Y !'; 
        this.dom.gameMain.classList.add('game-not-active');
        this.dom.wordInput.disabled = true;
        this.dom.submitWordBtn.disabled = true;
        this.dom.hintButton.disabled = true;
        this.dom.timeDisplay.textContent = GAME_TIME;
        this.dom.scoreDisplay.textContent = 0;
        this.dom.penaltyDisplay.textContent = 0; 
        this.dom.gameStats.classList.add('hidden');
        this.dom.foundWordsList.innerHTML = '';
    }
    
    // --- Game Flow Methods ---

    startGame() {
        if (this.gameActive) return;
        
        this.dom.startGameBtn.style.display = 'none';
        this.dom.gameStats.classList.add('hidden');
        
        // --- Countdown Animation ---
        const countdown = ['3', '2', '1'];
        this.dom.lettersDisplay.textContent = countdown[0];
        this.dom.lettersDisplay.classList.add('letter-flash', 'text-error');
        
        countdown.forEach((text, index) => {
            setTimeout(() => {
                this.dom.lettersDisplay.textContent = text;
            }, index * 1000);
        });

        // --- Game Setup (Runs after countdown finishes) ---
        setTimeout(() => {
            // Reset Core State
            this.gameActive = true;
            this.score = 0;
            this.penaltyPoints = 0; 
            this.timeLeft = GAME_TIME;
            this.foundWords.clear();
            
            this._generateScrambledLetters();
            this._calculatePossibleWords();
            
            // Enable controls and set initial UI
            this.dom.gameMain.classList.remove('game-not-active', 'game-over');
            this.dom.gameMain.classList.add('game-active');
            this.dom.wordInput.disabled = false;
            this.dom.submitWordBtn.disabled = false;
            this.dom.hintButton.disabled = false; // HINT ACTIVE FROM START
            this.dom.wordInput.focus();
            this.dom.scoreDisplay.textContent = this.score;
            this.dom.penaltyDisplay.textContent = this.penaltyPoints; 
            this.dom.timeDisplay.textContent = this.timeLeft;
            
            this.dom.lettersDisplay.classList.remove('letter-flash', 'text-error');
            
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            this._showMessage("GO! Find words!", 'success');
        }, countdown.length * 1000);
    }
    
    updateTimer() {
        if (!this.gameActive) return;

        this.timeLeft--;
        this.dom.timeDisplay.textContent = this.timeLeft;
        
        if (this.timeLeft <= 10 && this.timeLeft > 0) {
            this.dom.timeDisplay.classList.add('text-error', 'animate-pulse');
        } else {
            this.dom.timeDisplay.classList.remove('text-error', 'animate-pulse');
        }

        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);

        this.dom.gameMain.classList.remove('game-active');
        this.dom.gameMain.classList.add('game-over');
        this.dom.wordInput.disabled = true;
        this.dom.submitWordBtn.disabled = true;
        this.dom.hintButton.disabled = true;

        const finalScore = this.score - this.penaltyPoints;
        this._showMessage(`TIME'S UP! Final Score: ${finalScore}`, 'error');
        this.dom.startGameBtn.textContent = `PLAY AGAIN (Last Score: ${finalScore})`;
        this.dom.startGameBtn.style.display = 'block';
        
        this._displayStats();
    }
    
    // --- Gaming Feature Implementations ---

    _highlightLetters() {
        const inputWord = this.dom.wordInput.value.toUpperCase();
        const letterElements = this.dom.lettersDisplay.querySelectorAll('.letter-tile');
        
        let tempCounts = {};
        for (const char of this.scrambledLetters.toUpperCase()) {
            tempCounts[char] = (tempCounts[char] || 0) + 1;
        }

        letterElements.forEach(el => el.classList.remove('text-success', 'text-error'));

        for (let i = 0; i < inputWord.length; i++) {
            const char = inputWord[i];
            
            let foundTile = null;
            for (let j = 0; j < letterElements.length; j++) {
                const tile = letterElements[j];
                if (tile.textContent === char && !tile.classList.contains('text-success')) {
                    if (tempCounts[char] > 0) {
                        foundTile = tile;
                        tempCounts[char]--;
                        break;
                    }
                }
            }
            
            if (foundTile) {
                foundTile.classList.add('text-success'); 
            } else {
                break; 
            }
        }
    }

    /** * DEBUGGED: Processes a word, handling score logic based on whether it's 
     * a found word or a hint.
     */
    processValidWord(word, isHint = false) {
        this.foundWords.add(word);
        const points = SCORE_SCHEME[word.length] || 0;

        const listItem = document.createElement('li');

        if (isHint) {
            // Hint word: Update penalty score and UI, then show message.
            this.penaltyPoints += HINT_PENALTY;
            this.dom.penaltyDisplay.textContent = this.penaltyPoints;

            listItem.textContent = `${word.toUpperCase()} (HINT: -${HINT_PENALTY} Pts)`;
            listItem.className = 'text-gray-500 italic p-1 border-b border-dashed border-gray-200';
            
            this._showMessage(`Hint Used: ${word.toUpperCase()} (-${HINT_PENALTY} Pts)`, 'hint');
        } else {
            // Found word: Update positive score and show visual flash.
            this.score += points;
            this.dom.scoreDisplay.textContent = this.score;

            listItem.textContent = `${word.toUpperCase()} (+${points} Pts)`;
            listItem.className = 'font-bold text-success p-1 border-b border-dashed border-gray-200 bg-green-50 letter-flash';

            this._showMessage(`+${points} points!`, 'success');
            setTimeout(() => listItem.classList.remove('bg-green-50', 'letter-flash'), 500); 
        }

        this.dom.foundWordsList.prepend(listItem);
    }

    submitWord() {
        if (!this.gameActive) return;

        const word = this.dom.wordInput.value.trim().toLowerCase();
        this.dom.wordInput.value = '';
        this.dom.wordInput.focus();
        this._highlightLetters(); 

        if (word.length < 3 || word.length > 7) {
            this._showMessage("Word must be 3-7 letters long!", 'error');
            return;
        }
        if (this.foundWords.has(word)) {
            this._showMessage(`Already found "${word.toUpperCase()}"!`, 'error');
            return;
        }
        if (!this._isFormable(word, this.scrambledLetters)) {
            this._showMessage(`"${word.toUpperCase()}" uses letters not available!`, 'error');
            return;
        }
        if (!DICTIONARY.has(word)) {
            this._showMessage(`"${word.toUpperCase()}" is not a recognized word!`, 'error');
            return;
        }
        
        this.processValidWord(word, false);
    }

    /** CORRECTED: Provides an unfound word hint. */
    provideHint() {
        if (!this.gameActive) return;

        // Find the first word that hasn't been found yet
        const hintWord = this.possibleWords.find(word => !this.foundWords.has(word));

        if (hintWord) {
            // Call the shared word processing function
            this.processValidWord(hintWord, true);

            // Check if there are any hints left
            if (!this.possibleWords.find(word => !this.foundWords.has(word))) {
                this.dom.hintButton.disabled = true;
            }
        } else {
            this._showMessage("No more hints available! You found them all.", 'error');
            this.dom.hintButton.disabled = true;
        }
    }
    
    _displayStats() {
        this.dom.gameStats.classList.remove('hidden');
        
        const finalScore = this.score - this.penaltyPoints;
        
        const longest = Array.from(this.foundWords).reduce((max, word) => word.length > max.length ? word : max, { length: 0, toUpperCase: () => 'N/A' });
        this.dom.statLongest.textContent = longest.toUpperCase();
        
        this.dom.statFound.textContent = this.foundWords.size;
        this.dom.statPossible.textContent = this.possibleWords.length;
        
        const breakdownCounts = {};
        this.foundWords.forEach(word => {
            const len = word.length;
            breakdownCounts[len] = (breakdownCounts[len] || 0) + 1;
        });
        
        this.dom.statBreakdown.innerHTML = '';
        const finalScoreText = `<li class="font-bold text-lg ${finalScore >= 0 ? 'text-success' : 'text-error'}">NET SCORE: ${finalScore}</li>`;
        const penaltyText = `<li class="font-bold text-error">TOTAL PENALTY: -${this.penaltyPoints}</li>`;
        
        this.dom.statBreakdown.innerHTML += finalScoreText;
        this.dom.statBreakdown.innerHTML += penaltyText;
        
        Object.keys(SCORE_SCHEME).sort().forEach(len => {
            const count = breakdownCounts[len] || 0;
            const li = document.createElement('li');
            li.textContent = `${len} Letters: ${count} word(s) found`;
            this.dom.statBreakdown.appendChild(li);
        });
    }
}

// Initialize the game instance on document load
document.addEventListener('DOMContentLoaded', () => {
    new ScrambleGame();
});