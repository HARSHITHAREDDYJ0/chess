import React, { useState, useEffect } from 'react';
import Chessboard from 'chessboardjsx';
import axios from 'axios';
import { Chess } from 'chess.js';
import './App.css';

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [userMoves, setUserMoves] = useState([]);
  const [botMoves, setBotMoves] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = async () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen('start');
    setUserMoves([]);
    setBotMoves([]);
    setStatus('');
    await axios.post('http://localhost:5000/reset');
  };

  const onDrop = async ({ sourceSquare, targetSquare }) => {
    const moveString = sourceSquare + targetSquare;

    try {
      const response = await axios.post('http://localhost:5000/move', {
        move: moveString,
      });

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      const botMove = response.data.bot_move;

      const updatedGame = new Chess(game.fen());
      updatedGame.move({ from: sourceSquare, to: targetSquare });

      if (botMove) {
        updatedGame.move({
          from: botMove.slice(0, 2),
          to: botMove.slice(2, 4),
        });
      }

      if (updatedGame.moves().length === 0) {
        const winner = updatedGame.turn() === 'w' ? 'Bot Wins' : 'You Win';
        setStatus(`${winner} - Game Over`);
      }

      setGame(updatedGame);
      setFen(updatedGame.fen());
      setUserMoves([...userMoves, moveString]);
      setBotMoves([...botMoves, botMove]);
    } catch (err) {
      alert('Invalid move or server error.');
    }
  };

  return (
    <div className="app">
      <h1 className="title">♟ Chess Bot</h1>
      <div className="game-container">
        <div className="chessboard-container">
          <Chessboard
            width={600}
            position={fen}
            onDrop={onDrop}
            boardStyle={{
              borderRadius: '8px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
            }}
            lightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            darkSquareStyle={{ backgroundColor: '#b58863' }}
          />
          <button onClick={resetGame}>Reset Game</button>
        </div>

        <div className="move-history-container">
          {status.includes('Win') ? (
            <div className="winner-banner">{status}</div>
          ) : (
            <div className="status">Status: {status || 'Your turn!'}</div>
          )}

          <div className="move-history">
            <h2>Your Moves</h2>
            <ul>
              {userMoves.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="move-history">
            <h2>Bot's Moves</h2>
            <ul>
              {botMoves.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
