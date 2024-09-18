import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

// Replace 'your-openai-api-key' with your actual OpenAI API key.
// For security reasons, do NOT expose your API key on the client side.
// Instead, set up a backend server to handle API requests.
const OPENAI_API_KEY = 'your-openai-api-key';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState('w');
  const [gameOver, setGameOver] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'connecting', 'error'
  const [aiThinking, setAiThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize connection status
  useEffect(() => {
    // Optionally, implement a ping to OpenAI to verify connection
    setConnectionStatus('connected'); // Assuming connection is available
  }, []);

  const makeMove = useCallback(
    (move) => {
      try {
        const result = game.move(move);
        if (result) {
          setGame(new Chess(game.fen()));
          return true;
        }
      } catch (error) {
        console.error('Invalid move:', error);
      }
      return false;
    },
    [game]
  );

  const fetchAIMove = useCallback(async () => {
    setAiThinking(true);
    setConnectionStatus('connecting');
    setErrorMessage('');

    // Prepare the prompt for OpenAI
    const prompt = `
You are a chess engine. Given the current board position in FEN and the history of moves, provide the best next move in UCI format along with an evaluation score.

FEN: ${game.fen()}
Move History: ${game.history().join(' ')}

Provide your response in the following JSON format:
{
  "move": "e2e4",
  "evaluation": 0.35
}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'text-davinci-003', // You can choose a different model if preferred
          prompt: prompt,
          max_tokens: 150,
          temperature: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0].text.trim();

      // Parse the JSON response
      const aiResponse = JSON.parse(text);

      const aiMove = aiResponse.move;
      const evaluation = aiResponse.evaluation;

      // Make the AI move
      const moveResult = makeMove(aiMove);
      if (moveResult) {
        console.log(`AI played ${aiMove} with evaluation ${evaluation}`);
      } else {
        console.error('AI provided an invalid move.');
        setErrorMessage('AI provided an invalid move.');
      }

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching AI move:', error);
      setConnectionStatus('error');
      setErrorMessage('Failed to fetch AI move.');
    } finally {
      setAiThinking(false);
    }
  }, [game, makeMove]);

  useEffect(() => {
    if (game.turn() !== playerColor && !game.game_over()) {
      fetchAIMove();
    }
    setGameOver(game.game_over());
  }, [game, fetchAIMove, playerColor]);

  const onDrop = (sourceSquare, targetSquare) => {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    });
    return move;
  };

  const resetGame = () => {
    setGame(new Chess());
    setGameOver(false);
    setErrorMessage('');
  };

  const switchSides = () => {
    setPlayerColor(playerColor === 'w' ? 'b' : 'w');
    resetGame();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Chess Game with AI Opponent</h1>
      <div style={{ marginBottom: '10px' }}>
        <strong>Connection Status:</strong>{' '}
        {connectionStatus === 'connected' && <span style={{ color: 'green' }}>Connected</span>}
        {connectionStatus === 'connecting' && <span style={{ color: 'orange' }}>Connecting...</span>}
        {connectionStatus === 'error' && <span style={{ color: 'red' }}>Error</span>}
      </div>
      {aiThinking && <div>AI is thinking...</div>}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={playerColor === 'w' ? 'white' : 'black'}
        arePiecesDraggable={playerColor === game.turn()}
      />
      {gameOver && (
        <div style={{ marginTop: '10px' }}>
          Game Over!{' '}
          {game.in_checkmate()
            ? `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`
            : 'Draw!'}
        </div>
      )}
      <div style={{ marginTop: '10px' }}>
        <button onClick={resetGame} style={{ marginRight: '10px' }}>
          Reset Game
        </button>
        <button onClick={switchSides}>Switch Sides</button>
      </div>
    </div>
  );
};

export default ChessGame;
