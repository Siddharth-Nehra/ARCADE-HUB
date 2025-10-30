//inserting the images
function insertImage() {
    document.querySelectorAll('.box').forEach(image => {
        if (image.innerText.length !== 0) {
            if (image.innerText == 'Wpawn' || image.innerText == 'Bpawn') {
                image.innerHTML = `${image.innerText} <img class='all-img all-pown' src="${image.innerText}.png" alt="">`
                image.style.cursor = 'pointer'
            }
            else {
                image.innerHTML = `${image.innerText} <img class='all-img' src="${image.innerText}.png" alt="">`
                image.style.cursor = 'pointer'
            }
        }
    })
}
insertImage()


//Coloring the board

function coloring() {
    const color = document.querySelectorAll('.box')

    color.forEach(color => {
        getId = color.id
        arr = Array.from(getId)
        arr.shift()
        aside = eval(arr.pop())
        aup = eval(arr.shift())
        a = aside + aup

        if (a % 2 == 0) {
            color.style.backgroundColor = 'rgb(232 235 239)'
        }
        if (a % 2 !== 0) {
            color.style.backgroundColor = 'rgb(125 135 150)'
        }
    })
}
coloring()

insertImage()
coloring()

// ← Paste the checkKing() and endGame() functions here
function checkKing() {
    let whiteKing = false;
    let blackKing = false;

    // ---------------------------
// Check and Checkmate Detection
// ---------------------------
function checkForCheck() {
    let whiteKingPos = null;
    let blackKingPos = null;

    // Find both kings' positions
    document.querySelectorAll('.box').forEach(box => {
        if (box.innerText === 'Wking') whiteKingPos = box.id;
        if (box.innerText === 'Bking') blackKingPos = box.id;
    });

    if (!whiteKingPos || !blackKingPos) return; // no kings found yet

    // Check if any black piece can attack white king
    let whiteInCheck = canAttackKing('B', whiteKingPos);
    let blackInCheck = canAttackKing('W', blackKingPos);

    if (whiteInCheck) {
        document.getElementById('gameMessage').innerText = "⚠️ White King is in CHECK!";
        document.getElementById('gameMessage').style.color = "red";
    } 
    else if (blackInCheck) {
        document.getElementById('gameMessage').innerText = "⚠️ Black King is in CHECK!";
        document.getElementById('gameMessage').style.color = "red";
    } 
    else {
        document.getElementById('gameMessage').innerText = ""; // clear if safe
    }
}

// ---------------------------
// Check if given side can attack opponent King
// ---------------------------
function canAttackKing(attackerColor, kingId) {
    let attack = false;

    document.querySelectorAll('.box').forEach(box => {
        let piece = box.innerText;
        if (piece.startsWith(attackerColor)) {
            // Simulate selecting this piece
            let id = box.id;
            highlightPossibleMoves(piece, id);

            // Check if any move can reach king
            document.querySelectorAll('.box').forEach(target => {
                if (target.style.backgroundColor === 'burlywood' && target.id === kingId) {
                    attack = true;
                }
            });

            // Reset colors after test
            coloring();
        }
    });

    return attack;
}

// ---------------------------
// Helper: Simulate moves (simplified from whosTurn)
// ---------------------------
function highlightPossibleMoves(piece, id) {
    // reuse your same logic from whosTurn()
    // but simplified — just mark possible moves, not toggle turn

    // you can copy your logic here but minimal for detecting attack.
    // For now, this simplified version assumes piece attacks adjacent cells:
    let item = document.getElementById(id);
    let getId = item.id;
    let arr = Array.from(getId);
    arr.shift();
    let aside = eval(arr.pop());
    arr.push('0');
    let aup = eval(arr.join(''));
    let a = aside + aup;

    function mark(id) {
        let el = document.getElementById(`b${id}`);
        if (el) el.style.backgroundColor = 'burlywood';
    }

    if (piece.includes('pawn')) {
        if (piece.startsWith('W')) {
            mark(a + 100 + 1);
            mark(a + 100 - 1);
        } else {
            mark(a - 100 + 1);
            mark(a - 100 - 1);
        }
    }
    if (piece.includes('king')) {
        mark(a + 1); mark(a - 1);
        mark(a + 100); mark(a - 100);
        mark(a + 101); mark(a + 99);
        mark(a - 101); mark(a - 99);
    }
    if (piece.includes('knight')) {
        [a + 102, a - 102, a + 98, a - 98, a + 201, a - 201, a + 199, a - 199].forEach(mark);
    }
}


    document.querySelectorAll('.box').forEach(box => {
        if (box.innerText == 'Wking') whiteKing = true;
        if (box.innerText == 'Bking') blackKing = true;
    });

    if (!whiteKing) {
        setTimeout(() => {
            alert("Black Wins! White King is captured.");
            endGame();
        }, 100);
        return true;
    }
    if (!blackKing) {
        setTimeout(() => {
            alert("White Wins! Black King is captured.");
            endGame();
        }, 100);
        return true;
    }
    return false;
}

function endGame() {
    document.querySelectorAll('.box').forEach(box => {
        box.style.pointerEvents = 'none'; // Disable further clicks
    });
    document.getElementById('tog').innerText = "Game Over";
}



//function to not remove the same team element

function reddish() {
    document.querySelectorAll('.box').forEach(i1 => {
        if (i1.style.backgroundColor == 'saddlebrown') {

            document.querySelectorAll('.box').forEach(i2 => {

                if (i2.style.backgroundColor == 'burlywood' && i2.innerText.length !== 0) {


                    burlywoodText = i2.innerText

                    saddlebrownText = i1.innerText

                    saddlebrownColor = ((Array.from(saddlebrownText)).shift()).toString()
                    burlywoodColor = ((Array.from(burlywoodText)).shift()).toString()

                    getId = i2.id
                    arr = Array.from(getId)
                    arr.shift()
                    aside = eval(arr.pop())
                    aup = eval(arr.shift())
                    a = aside + aup

                    if (a % 2 == 0 && saddlebrownColor == burlywoodColor) {
                        i2.style.backgroundColor = 'rgb(232 235 239)'
                    }
                    if (a % 2 !== 0 && saddlebrownColor == burlywoodColor) {
                        i2.style.backgroundColor = 'rgb(125 135 150)'
                    }

                }
            })
        }
    })
}

//reset button
document.getElementById("reset-btn").addEventListener("click", function () {
    location.reload();
});


tog = 1

document.querySelectorAll('.box').forEach(item => {


    item.addEventListener('click', function () {

        if (item.style.backgroundColor == 'burlywood' && item.innerText.length == 0) {
            tog = tog + 1
        }

        else if (item.style.backgroundColor == 'burlywood' && item.innerText.length !== 0) {

            document.querySelectorAll('.box').forEach(i => {
                if (i.style.backgroundColor == 'saddlebrown') {
                    saddlebrownId = i.id
                    saddlebrownText = i.innerText

                    document.getElementById(saddlebrownId).innerText = ''
                    item.innerText = saddlebrownText
                    coloring()
                    insertImage()
                    // Function to check if a king is captured
function checkKing() {
    let whiteKing = false;
    let blackKing = false;

    document.querySelectorAll('.box').forEach(box => {
        if (box.innerText == 'Wking') whiteKing = true;
        if (box.innerText == 'Bking') blackKing = true;
    });

    if (!whiteKing) {
        endGame("👑 Victory for Black — White King has fallen.");
        return true;
    }
    if (!blackKing) {
        endGame("👑 Victory for White — Black King has fallen.");
        return true;
    }
    return false;
}

// Function to end the game
function endGame(message) {
    document.querySelectorAll('.box').forEach(box => {
        box.style.pointerEvents = 'none'; // Disable further clicks
    });
    document.getElementById('tog').innerText = "Game Over";
    document.getElementById('gameMessage').innerText = message; // Show message on page
}

                    checkKing(); // <-- add this line
                    checkForCheck();


                    tog = tog + 1

                }
            })
        }



        getId = item.id
        arr = Array.from(getId)
        arr.shift()
        aside = eval(arr.pop())
        arr.push('0')
        aup = eval(arr.join(''))
        a = aside + aup

        //function to display the available paths for all pieces

        function whosTurn(toggle) {
            // PAWN

            if (item.innerText == `${toggle}pawn`) {
                item.style.backgroundColor = 'saddlebrown';

                if (tog % 2 !== 0 && aup < 800) {
                    // First move for white pawns
                    if (document.getElementById(`b${a + 100}`).innerText.length == 0) {
                        document.getElementById(`b${a + 100}`).style.backgroundColor = 'burlywood';
                        if (document.getElementById(`b${a + 200}`).innerText.length == 0 && aup < 300) {
                            document.getElementById(`b${a + 200}`).style.backgroundColor = 'burlywood';
                        }
                    }
                    if (aside < 8 && document.getElementById(`b${a + 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 + 1}`).style.backgroundColor = 'burlywood';
                    }
                    if (aside > 1 && document.getElementById(`b${a + 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 - 1}`).style.backgroundColor = 'burlywood';
                    }
                }

                if (tog % 2 == 0 && aup > 100) {
                    // First move for black pawns
                    if (document.getElementById(`b${a - 100}`).innerText.length == 0) {
                        document.getElementById(`b${a - 100}`).style.backgroundColor = 'burlywood';
                        if (document.getElementById(`b${a - 200}`).innerText.length == 0 && aup > 600) {
                            document.getElementById(`b${a - 200}`).style.backgroundColor = 'burlywood';
                        }
                    }
                    if (aside < 8 && document.getElementById(`b${a - 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 + 1}`).style.backgroundColor = 'burlywood';
                    }
                    if (aside > 1 && document.getElementById(`b${a - 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 - 1}`).style.backgroundColor = 'burlywood';
                    }
                }
                // Second move for pawns
                if (tog % 2 !== 0 && aup >= 800) {
                    if (document.getElementById(`b${a + 100}`).innerText.length == 0) {
                        document.getElementById(`b${a + 100}`).style.backgroundColor = 'burlywood';
                    }
                    if (aside < 8 && document.getElementById(`b${a + 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 + 1}`).style.backgroundColor = 'burlywood';
                    }
                    if (aside > 1 && document.getElementById(`b${a + 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a + 100 - 1}`).style.backgroundColor = 'burlywood';
                    }
                }
                if (tog % 2 == 0 && aup <= 100) {
                    if (document.getElementById(`b${a - 100}`).innerText.length == 0) {
                        document.getElementById(`b${a - 100}`).style.backgroundColor = 'burlywood';
                    }
                    if (aside < 8 && document.getElementById(`b${a - 100 + 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 + 1}`).style.backgroundColor = 'burlywood';
                    }
                    if (aside > 1 && document.getElementById(`b${a - 100 - 1}`).innerText.length !== 0) {
                        document.getElementById(`b${a - 100 - 1}`).style.backgroundColor = 'burlywood';
                    }
                }
            }

            // KING

            if (item.innerText == `${toggle}king`) {


                if (aside < 8) {
                    document.getElementById(`b${a + 1}`).style.backgroundColor = 'burlywood'

                }
                if (aside > 1) {

                    document.getElementById(`b${a - 1}`).style.backgroundColor = 'burlywood'
                }
                if (aup < 800) {

                    document.getElementById(`b${a + 100}`).style.backgroundColor = 'burlywood'
                }
                if (aup > 100) {

                    document.getElementById(`b${a - 100}`).style.backgroundColor = 'burlywood'
                }

                if (aup > 100 && aside < 8) {

                    document.getElementById(`b${a - 100 + 1}`).style.backgroundColor = 'burlywood'
                }
                if (aup > 100 && aside > 1) {

                    document.getElementById(`b${a - 100 - 1}`).style.backgroundColor = 'burlywood'
                }
                if (aup < 800 && aside < 8) {

                    document.getElementById(`b${a + 100 + 1}`).style.backgroundColor = 'burlywood'
                }
                if (aup < 800 && aside > 1) {

                    document.getElementById(`b${a + 100 - 1}`).style.backgroundColor = 'burlywood'
                }

                item.style.backgroundColor = 'saddlebrown'

            }

            // KNIGHT

            if (item.innerText == `${toggle}knight`) {


                if (aside < 7 && aup < 800) {
                    document.getElementById(`b${a + 100 + 2}`).style.backgroundColor = 'burlywood'
                }
                if (aside < 7 && aup > 200) {
                    document.getElementById(`b${a - 100 + 2}`).style.backgroundColor = 'burlywood'
                }
                if (aside < 8 && aup < 700) {
                    document.getElementById(`b${a + 200 + 1}`).style.backgroundColor = 'burlywood'
                }
                if (aside > 1 && aup < 700) {
                    document.getElementById(`b${a + 200 - 1}`).style.backgroundColor = 'burlywood'
                }
                if (aside > 2 && aup < 800) {
                    document.getElementById(`b${a - 2 + 100}`).style.backgroundColor = 'burlywood'
                }
                if (aside > 2 && aup > 100) {
                    document.getElementById(`b${a - 2 - 100}`).style.backgroundColor = 'burlywood'
                }
                if (aside < 8 && aup > 200) {
                    document.getElementById(`b${a - 200 + 1}`).style.backgroundColor = 'burlywood'
                }
                if (aside > 1 && aup > 200) {
                    document.getElementById(`b${a - 200 - 1}`).style.backgroundColor = 'burlywood'
                }

                item.style.backgroundColor = 'saddlebrown'

            }

            // QUEEN

            if (item.innerText == `${toggle}queen`) {


                for (let i = 1; i < 9; i++) {

                    if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText == 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText !== 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText == 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText !== 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText == 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText !== 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText == 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText !== 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }



                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'burlywood'
                        break
                    }

                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }



                item.style.backgroundColor = 'saddlebrown'

            }

            // BISHOP

            if (item.innerText == `${toggle}bishop`) {


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < (900 - aup) / 100 && i < 9 - aside && document.getElementById(`b${a + i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 + i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < aup / 100 && i < 9 - aside && document.getElementById(`b${a - i * 100 + i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 + i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < (900 - aup) / 100 && i < aside && document.getElementById(`b${a + i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a + i * 100 - i}`).style.backgroundColor = 'burlywood'
                        break
                    }

                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length == 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'burlywood'
                    }
                    else if (i < aup / 100 && i < aside && document.getElementById(`b${a - i * 100 - i}`).innerText.length !== 0) {
                        document.getElementById(`b${a - i * 100 - i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }



                item.style.backgroundColor = 'saddlebrown'

            }

            // ROOK

            if (item.innerText == `${toggle}rook`) {

                for (let i = 1; i < 9; i++) {

                    if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText == 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a + i * 100) < 900 && document.getElementById(`b${a + i * 100}`).innerText !== 0) {
                        document.getElementById(`b${a + i * 100}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText == 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a - i * 100) > 100 && document.getElementById(`b${a - i * 100}`).innerText !== 0) {
                        document.getElementById(`b${a - i * 100}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText == 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a + i) < (aup + 9) && document.getElementById(`b${a + i}`).innerText !== 0) {
                        document.getElementById(`b${a + i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText == 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'burlywood'
                    }
                    else if ((a - i) > (aup) && document.getElementById(`b${a - i}`).innerText !== 0) {
                        document.getElementById(`b${a - i}`).style.backgroundColor = 'burlywood'
                        break
                    }
                }

                item.style.backgroundColor = 'saddlebrown'
            }

        }

        // Toggling the turn

        if (tog % 2 !== 0) {
            document.getElementById('tog').innerText = "White's Turn"
            whosTurn('W')
        }
        if (tog % 2 == 0) {
            document.getElementById('tog').innerText = "Black's Turn"
            whosTurn('B')
        }

        reddish()



    })
})

// Moving the element
document.querySelectorAll('.box').forEach(hathiTest => {

    hathiTest.addEventListener('click', function () {

        if (hathiTest.style.backgroundColor == 'saddlebrown') {

            saddlebrownId = hathiTest.id
            saddlebrownText = hathiTest.innerText

            document.querySelectorAll('.box').forEach(hathiTest2 => {

                hathiTest2.addEventListener('click', function () {
                    if (hathiTest2.style.backgroundColor == 'burlywood' && hathiTest2.innerText.length == 0) {
                        document.getElementById(saddlebrownId).innerText = ''
                        hathiTest2.innerText = saddlebrownText
                        coloring()
                        insertImage()
                        checkKing(); // <-- add here as well

                    }

                })
            })

        }

    })

})




// Prvents from selecting multiple elements
z = 0
document.querySelectorAll('.box').forEach(ee => {
  ee.addEventListener('click', function () {
      z = z + 1
      if (z % 2 == 0 && ee.style.backgroundColor !== 'burlywood') {
          coloring()
      }
  })
})




