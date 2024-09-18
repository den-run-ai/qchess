import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import Chess from 'chess.js';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [history, setHistory] = useState([]);
  const [evalScores, setEvalScores] = useState([]);
  const [apiStatus, setApiStatus] = useState(''); // For tracking API status

  const onDrop = (sourceSquare, targetSquare) => {
    let newGame = new Chess(game.fen());
    let move = newGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) return;

    setGame(newGame);
    setFen(newGame.fen());

    setHistory([...history, move.san]);

    fetchEval(newGame.history());
  };

  const fetchEval = async (history) => {
    const moves = history.join(' ');

    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      setApiStatus('Missing OpenAI API Key');
      return;
    }

    setApiStatus('Loading...');
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moves }),
      });

      if (!response.ok) {
        setApiStatus('Failed to fetch evaluation from OpenAI');
        return;
      }

      const data = await response.json();
      setEvalScores(data.scores);
      setApiStatus('Success');
    } catch (error) {
      setApiStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardWidth={600}  // Adjust width here
      />
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
      <div>
        <h3>API Status: {apiStatus}</h3>
      </div>
    </div>
  );
};

export default ChessGame;
