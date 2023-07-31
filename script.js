// Create gameboard IIFE module
const Gameboard = (() => {
  let board = ['', '', '', '', '', '', '', '', '']; // Gameboard array
  const getBoard = () => board;
  const updateCell = (index, symbol) => {
    if (board[index] === '') {
      board[index] = symbol;
      return true;
    }
    return false;
  };
  const resetBoard = () => {
    board = ['', '', '', '', '', '', '', '', ''];
  };
  return { getBoard, updateCell, resetBoard };
})();
// Create Player factory function (player object)
const Player = (name, symbol) => {
  return { name, symbol, score: 0 };
};
const optionButtons = document.querySelectorAll('input[name="playerOption"]');
let playWithHuman = true;
optionButtons.forEach(button => {
  button.addEventListener('change', () => {
    playWithHuman = button.id === 'playWithHuman';
    const player2NameInput = document.getElementById('player2Name');
// Update the default value for Player 2 name based on the selected option
    if (playWithHuman) {
      player2NameInput.value = ''; // Empty the input when playing with another human
    } else {
      player2NameInput.value = 'AI'; // Set default name for Player 2 as 'AI' for computer play
    }

    // Disable or enable the player2Name input field based on the selected option
    player2NameInput.disabled = !playWithHuman;
  });
});
// Initialize player objects outside of the displayController to evaluate scores
let player1 = Player('Player 1', '❌');
let player2 = Player('Player 2', '⭕');

// Create displayController IIFE module
const displayController = (() => {
  const cells = document.querySelectorAll('.cell');
  const resultElement = document.getElementById('result');
  const inputForm = document.getElementById('inputForm');
  const startButton = document.getElementById('startButton');
  const resetButton = document.getElementById('resetButton');
  const player1ScoreElement = document.getElementById('player1Score');
  const player2ScoreElement = document.getElementById('player2Score');
  let currentPlayer;  // Initialize currentPlayer variable
  let gameActive = false; // Initialize gameActive variable
  // Display the gameboard
  const displayBoard = (board) => { 
    board.forEach((symbol, index) => {
      cells[index].textContent = symbol;
    });
  };
  // Creare function to play sound during game play
  function playSound(player, win, tie) {
    let soundId;
    if (tie) {
      soundId = 'tieSound';
    } else if (win) {
      soundId = 'winSound';
    } else {
      soundId = player === player1 ? 'player1Sound' : 'player2Sound';
    }
    const sound = document.getElementById(soundId);
    // Check if the sound is already playing and if so, pause and reset it
    if (!sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
    // Play the sound
    sound.play().catch((error) => {
      console.error('Error playing sound:', error);
    });
  } 
  // Handle click event on the gameboard
  const handleClick = (event) => {
    const cellIndex = event.target.dataset.index;
    if (!gameActive || !Gameboard.updateCell(cellIndex, currentPlayer.symbol)) return;
    displayBoard(Gameboard.getBoard());
      // Play the drum sound
    playSound(currentPlayer, false, false); // Play sound for player's click
    if (checkWin(currentPlayer.symbol)) {
      resultElement.textContent = `${currentPlayer.name} wins! 🦋`;
      currentPlayer.score++;
      updateScores();
      gameActive = false;
      playSound(currentPlayer, true, false); // Play the winning sound
    } else if (checkTie()) {
      resultElement.textContent = "It's a tie! 🦋 🦋";
      gameActive = false;
      playSound(currentPlayer, false, true);
    } else {
      if (playWithHuman) {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
      } else {
    // Computer's turn (random move)
        const availableCells = Gameboard.getBoard().map((symbol, index) => (symbol === '' ? index : null)).filter(i => i !== null);
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const computerCellIndex = availableCells[randomIndex];
        Gameboard.updateCell(computerCellIndex, player2.symbol);
        displayBoard(Gameboard.getBoard());
        if (checkWin(player2.symbol)) {
          resultElement.textContent = `${player2.name} wins! 🦋`;
          player2.score++;
          updateScores();
          gameActive = false;
        } else if (checkTie()) {
          resultElement.textContent = "It's a tie! 🦋 🦋";
          gameActive = false;
        }
        currentPlayer = player1; // Switch back to human's turn
      }
    }
  };
  // Check if a player has won
  const checkWin = (symbol) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return winningCombinations.some(combination =>
      combination.every(index => Gameboard.getBoard()[index] === symbol)
    );
  };
  // Check if the game is a tie
  const checkTie = () => {
    return Gameboard.getBoard().every(symbol => symbol !== '');
  };
  // Handle click event on the Start button
  const handleStartGame = () => {
    const player1Name = document.getElementById('player1Name').value.trim();
    const player2NameInput = document.getElementById('player2Name');
    const player2Name = player2NameInput.value.trim();
  // Check if both player names are entered before starting the game
    if (!player1Name || (playWithHuman && !player2Name)) {
      alert("Please enter names for both players and click Start to begin.");
      return;
    }
  // Update names of existing player objects
    player1.name = player1Name;
    if (playWithHuman) {
      // Check if player2Name is 'AI', if so, empty it for a new value to be entered
      if (player2Name === 'AI') {
        player2NameInput.value = '';
      }
      player2.name = player2Name;
    } else {
      player2.name = 'AI';
      player2NameInput.value = 'AI'; // Set the input value to 'AI' when playing with computer
    }
    //Reset the gameboard
    Gameboard.resetBoard();
    displayBoard(Gameboard.getBoard());
    currentPlayer = player1;
    gameActive = true;
    resultElement.textContent = '';
    updateScores();
    // Disable the option buttons until the game is reset
    optionButtons.forEach(btn => {
      btn.disabled = true;
    });
  };
  // Handle click event on the Reset button
  const handleResetGame = () => {
    Gameboard.resetBoard();
    displayBoard(Gameboard.getBoard());
  // Reset player scores
    player1.score = 0;
    player2.score = 0;
    updateScores();
  // Reset the game
    gameActive = true;
    resultElement.textContent = '';
  // Uncheck the option buttons and remove their event listeners
    optionButtons.forEach(btn => {
      btn.checked = false;
      btn.removeEventListener('change', handleStartGame);
    });
  // Empty the player name inputs
    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';
  // Re-enable option buttons after the game is reset
    optionButtons.forEach(btn => {
      btn.disabled = false;
    });
  // Refresh the page
    window.location.reload();
  };
  // Update player scores
  const updateScores = () => {
    player1ScoreElement.textContent = player1.score;
    player2ScoreElement.textContent = player2.score;
  };
  // Add event listeners
  cells.forEach(cell => cell.addEventListener('click', handleClick));
  startButton.addEventListener('click', handleStartGame);
  resetButton.addEventListener('click', handleResetGame);
 
  return { handleStartGame };
})();
