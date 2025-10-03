import React from 'react';
import { Piece, GameMode } from '../types/game.types';


const GamePiece: React.FC<{ piece: Piece; cellSize: number, gameMode: GameMode }> = ({ piece, cellSize, gameMode }) => {
  const getColorClasses = () => {
    if (gameMode === 'konane') {
      return piece.player === 'black' 
        ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-inner' 
        : 'bg-gradient-to-br from-stone-200 via-stone-100 to-white shadow-inner border border-stone-300';
    }
    return piece.player === 'red' 
      ? 'bg-gradient-to-br from-red-500 to-red-700' 
      : 'bg-gradient-to-br from-gray-800 to-black';
  };

  const isPebble = gameMode === 'konane';
  const pieceSize = isPebble ? cellSize * 0.6 : cellSize * 0.7; // Pebbles are smaller

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shadow-lg ${getColorClasses()} ${
        isPebble ? 'shadow-xl' : ''
      }`}
      style={{ 
        width: pieceSize, 
        height: pieceSize,
        ...(isPebble && {
          boxShadow: piece.player === 'black' 
            ? 'inset -2px -2px 8px rgba(0,0,0,0.5), inset 2px 2px 8px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.3)'
            : 'inset -2px -2px 8px rgba(0,0,0,0.15), inset 2px 2px 8px rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.2)'
        })
      }}
    >
      {piece.type === 'king' && <span className="text-yellow-300" style={{ fontSize: cellSize * 0.4 }}>♔</span>}
    </div>
  );
};

export default GamePiece;