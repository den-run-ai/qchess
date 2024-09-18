import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState('w');

  const makeMove = useCallback((move) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if (result) {
      setGame(gameCopy);
      return true;
    }
    return false;
  }, [game]);

  const makeRandomMove = useCallback(() => {
    const moves = game.moves();
    if (moves.length > 0 && !game.isGameOver()) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      makeMove(randomMove);
    }
  }, [game, makeMove]);

  useEffect(() => {
    if (game.turn() !== playerColor && !game.isGameOver()) {
      setTimeout(makeRandomMove, 300);
    }
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
  };

  return (
    <div>
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop}
        boardOrientation={playerColor === 'w' ? 'white' : 'black'}
      />
      {game.isGameOver() && <div>Game Over! {game.isCheckmate() ? `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!` : 'Draw!'}</div>}
      <button onClick={resetGame}>Reset Game</button>
      <button onClick={() => setPlayerColor(playerColor === 'w' ? 'b' : 'w')}>Switch Sides</button>
    </div>
  );
};

export default ChessGame;
