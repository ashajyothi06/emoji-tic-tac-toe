import React, { useState } from 'react';
import './App.css';

const emojiCategories = {
  Animals: { emojis: ['🐶', '🐱', '🐵', '🐰'], color: '#FF9AA2' },
  Food: { emojis: ['🍕', '🍟', '🍔', '🍩'], color: '#FFB7B2' },
  Sports: { emojis: ['⚽️', '🏀', '🏈', '🎾'], color: '#FFDAC1' },
  Faces: { emojis: ['😀', '😎', '🤩', '🥳'], color: '#E2F0CB' },
  Nature: { emojis: ['🌹', '🌻', '🌴', '🌞'], color: '#B5EAD7' }
};

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player1, setPlayer1] = useState({ 
    category: null, 
    emojis: [], 
    score: 0,
    avatar: '👨'
  });
  const [player2, setPlayer2] = useState({ 
    category: null, 
    emojis: [], 
    score: 0,
    avatar: '👩'
  });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showWinEffect, setShowWinEffect] = useState(false);

  const getRandomEmoji = (category) => {
    const emojis = emojiCategories[category].emojis;
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const checkWinner = (currentBoard) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] && 
          currentBoard[a] === currentBoard[b] && 
          currentBoard[a] === currentBoard[c]) {
        return currentPlayer;
      }
    }
    return null;
  };

  const handleCellClick = (index) => {
    if (winner || !gameStarted || board[index] === player1.emojis[0]?.emoji || board[index] === player2.emojis[0]?.emoji) {
      return;
    }

    const currentPlayerData = currentPlayer === 1 ? player1 : player2;
    const newEmoji = getRandomEmoji(currentPlayerData.category);
    const newEmojiObj = { emoji: newEmoji, position: index, timestamp: Date.now() };

    let updatedEmojis = [...currentPlayerData.emojis, newEmojiObj];
    
    if (updatedEmojis.length > 3) {
      const oldestEmoji = updatedEmojis.shift();
      const newBoard = [...board];
      newBoard[oldestEmoji.position] = null;
      setBoard(newBoard);
    }

    const playerUpdater = currentPlayer === 1 ? setPlayer1 : setPlayer2;
    playerUpdater(prev => ({ ...prev, emojis: updatedEmojis }));

    const newBoard = [...board];
    newBoard[index] = newEmoji;
    setBoard(newBoard);

    setTimeout(() => {
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setShowWinEffect(true);
        setWinner(gameWinner);
        if (gameWinner === 1) {
          setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
        } else {
          setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
        }
        return;
      }
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }, 100);
  };

  const startGame = () => {
    if (!player1.category || !player2.category) {
      alert('Both players must select an emoji category!');
      return;
    }
    setBoard(Array(9).fill(null));
    setPlayer1(prev => ({ ...prev, emojis: [] }));
    setPlayer2(prev => ({ ...prev, emojis: [] }));
    setCurrentPlayer(1);
    setWinner(null);
    setShowWinEffect(false);
    setGameStarted(true);
  };

  const renderCell = (index) => {
    const cellValue = board[index];
    const isDisabled = (
      !gameStarted || 
      winner || 
      cellValue === player1.emojis[0]?.emoji || 
      cellValue === player2.emojis[0]?.emoji
    );
    
    let cellColor = 'white';
    if (cellValue) {
      cellColor = player1.emojis.some(e => e.emoji === cellValue) 
        ? emojiCategories[player1.category].color 
        : emojiCategories[player2.category].color;
    }

    return (
      <button 
        className={`cell ${cellValue ? 'emoji-placed' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={() => handleCellClick(index)}
        disabled={isDisabled}
        style={{ backgroundColor: cellColor }}
        aria-label={`Cell ${index} ${cellValue ? `containing ${cellValue}` : 'empty'}`}
      >
        {cellValue}
      </button>
    );
  };

  return (
    <div className="app">
      {showWinEffect && (
        <div className="win-effect">
          {Array(20).fill().map((_, i) => (
            <div key={i} className="win-emoji">
              {winner === 1 ? player1.avatar : player2.avatar}
            </div>
          ))}
        </div>
      )}
      
      <header className="app-header">
        <h1>🎮 Twisted Tic Tac Toe ✨</h1>
        <div className="scores">
          <div className={`player-score ${currentPlayer === 1 ? 'active' : ''}`}>
            <span className="avatar">{player1.avatar}</span>
            <span className="score">{player1.score}</span>
          </div>
          <div className="vs">VS</div>
          <div className={`player-score ${currentPlayer === 2 ? 'active' : ''}`}>
            <span className="score">{player2.score}</span>
            <span className="avatar">{player2.avatar}</span>
          </div>
        </div>
      </header>
      
      <button 
        className={`help-button ${showHelp ? 'active' : ''}`} 
        onClick={() => setShowHelp(!showHelp)}
        aria-expanded={showHelp}
      >
        {showHelp ? '✖ Hide Help' : '❓ How to Play'}
      </button>
      
      {showHelp && (
        <div className="help-section slide-in">
          <h3>🌟 How to Play:</h3>
          <ul>
            <li>🎯 Each player selects an emoji category</li>
            <li>🔄 Take turns placing random emojis from your category</li>
            <li>🧙‍♂️ You can only have 3 emojis on the board at once</li>
            <li>💨 When placing a 4th emoji, your oldest one vanishes!</li>
            <li>🚫 You can't place where your oldest emoji was</li>
            <li>🏆 First to get 3 in a row wins!</li>
          </ul>
        </div>
      )}
      
      {(!gameStarted || winner) ? (
        <div className="setup fade-in">
          <h2>{winner ? `Player ${winner} Won!` : 'Select Emoji Categories'}</h2>
          <div className="player-selection">
            <div className="player-option" style={{ borderColor: emojiCategories[player1.category]?.color }}>
              <h3>Player 1</h3>
              <div className="avatar-selector">
                <span className="avatar-large">{player1.avatar}</span>
                <select
                  value={player1.avatar}
                  onChange={(e) => setPlayer1({ ...player1, avatar: e.target.value })}
                  aria-label="Select player 1 avatar"
                >
                  <option value="👨">👨</option>
                  <option value="👩">👩</option>
                  <option value="👦">👦</option>
                  <option value="👧">👧</option>
                  <option value="🧙‍♂️">🧙‍♂️</option>
                  <option value="🧙‍♀️">🧙‍♀️</option>
                </select>
              </div>
              <select 
                value={player1.category || ''} 
                onChange={(e) => setPlayer1({ ...player1, category: e.target.value, emojis: [] })}
                aria-label="Select player 1 category"
              >
                <option value="">Select Category</option>
                {Object.keys(emojiCategories).map(category => (
                  <option key={`p1-${category}`} value={category}>{category}</option>
                ))}
              </select>
              {player1.category && (
                <div className="emoji-preview" style={{ backgroundColor: emojiCategories[player1.category].color }}>
                  {emojiCategories[player1.category].emojis.join(' ')}
                </div>
              )}
            </div>
            
            <div className="player-option" style={{ borderColor: emojiCategories[player2.category]?.color }}>
              <h3>Player 2</h3>
              <div className="avatar-selector">
                <span className="avatar-large">{player2.avatar}</span>
                <select
                  value={player2.avatar}
                  onChange={(e) => setPlayer2({ ...player2, avatar: e.target.value })}
                  aria-label="Select player 2 avatar"
                >
                  <option value="👩">👩</option>
                  <option value="👨">👨</option>
                  <option value="👧">👧</option>
                  <option value="👦">👦</option>
                  <option value="🧙‍♀️">🧙‍♀️</option>
                  <option value="🧙‍♂️">🧙‍♂️</option>
                </select>
              </div>
              <select 
                value={player2.category || ''} 
                onChange={(e) => setPlayer2({ ...player2, category: e.target.value, emojis: [] })}
                aria-label="Select player 2 category"
              >
                <option value="">Select Category</option>
                {Object.keys(emojiCategories).map(category => (
                  <option key={`p2-${category}`} value={category}>{category}</option>
                ))}
              </select>
              {player2.category && (
                <div className="emoji-preview" style={{ backgroundColor: emojiCategories[player2.category].color }}>
                  {emojiCategories[player2.category].emojis.join(' ')}
                </div>
              )}
            </div>
          </div>
          
          <button className="start-button pulse" onClick={startGame}>
            {winner ? '🔄 Play Again' : '🚀 Start Game'}
          </button>
        </div>
      ) : (
        <div className="game-container">
          <div className={`player-turn ${currentPlayer === 1 ? 'active' : ''}`}
               style={{ backgroundColor: emojiCategories[player1.category]?.color }}>
            <span className="avatar-turn">{player1.avatar}</span>
            Player 1: {player1.category} 
            {currentPlayer === 1 && <span className="pulse">▶</span>}
          </div>
          
          <div className="board">
            {Array(9).fill().map((_, index) => (
              <div key={index} className="cell-container">
                {renderCell(index)}
              </div>
            ))}
          </div>
          
          <div className={`player-turn ${currentPlayer === 2 ? 'active' : ''}`}
               style={{ backgroundColor: emojiCategories[player2.category]?.color }}>
            <span className="avatar-turn">{player2.avatar}</span>
            Player 2: {player2.category}
            {currentPlayer === 2 && <span className="pulse">▶</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;