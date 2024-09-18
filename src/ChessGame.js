import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState('w');
  const [gameOver, setGameOver] = useState(false);

  const makeMove = useCallback((move) => {
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
  }, [game]);

  const makeRandomMove = useCallback(() => {
    const moves = game.moves();
    if (moves.length > 0 && !game.game_over()) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      makeMove(randomMove);
    }
  }, [game, makeMove]);

  useEffect(() => {
    if (game.turn() !== playerColor && !game.game_over()) {
      setTimeout(makeRandomMove, 300);
    }
    setGameOver(game.game_over());
  }, [game, makeRandomMove, playerColor]);

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
  };

  return (
    <div>
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop}
        boardOrientation={playerColor === 'w' ? 'white' : 'black'}
      />
      {gameOver && <div>Game Over! {game.in_checkmate() ? `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!` : 'Draw!'}</div>}
      <button onClick={resetGame}>Reset Game</button>
      <button onClick={() => setPlayerColor(playerColor === 'w' ? 'b' : 'w')}>Switch Sides</button>
    </div>
  );
};

export default ChessGame;
