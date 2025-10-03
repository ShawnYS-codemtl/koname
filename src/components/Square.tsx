import React from "react";
import { Piece, GameMode } from "../types/game.types";
import GamePiece from "./GamePiece";



const Square: React.FC<{
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  cellSize: number;
  onClick: () => void;
  gameMode: GameMode;
}> = ({ piece, isLight, isSelected, isValidMove, cellSize, onClick, gameMode }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-center cursor-pointer transition-all ${
      isLight ? 'bg-amber-100' : 'bg-amber-800'
    } ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''} ${
      isValidMove ? 'ring-4 ring-green-400 ring-inset' : ''
    } hover:opacity-80`}
    style={{ width: cellSize, height: cellSize }}
  >
    {piece && <GamePiece piece={piece} cellSize={cellSize} gameMode={gameMode} />}
    {isValidMove && !piece && <div className="w-3 h-3 bg-green-400 rounded-full opacity-70" />}
  </div>
);

export default Square;