
import React, { useState } from 'react';
import Chessboard from 'chessboardjsx';
import Chess from 'chess.js';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [history, setHistory] = useState([]);
  const [evalScores, setEvalScores] = useState([]);

  const onDrop = ({ sourceSquare, targetSquare }) => {
    let newGame = { ...game };
    let move = newGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    });

    if (move === null) return;

    setGame(newGame);
    setFen(newGame.fen());
    setHistory(newGame.history());

    fetchEval(newGame.history());
  };

  const fetchEval = async (history) => {
    const moves = history.join(' ');
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moves }),
    });

    const data = await response.json();
    setEvalScores(data.scores);
  };

  return (
    <div>
      <Chessboard position={fen} onDrop={onDrop} />
      <div>
        <h3>Move History</h3>
        <ul>
          {history.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
        </ul>
        <h3>Evaluation Scores</h3>
        <ul>
          {evalScores.map((score, index) => (
            <li key={index}>Move {index + 1}: {score}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChessGame;
