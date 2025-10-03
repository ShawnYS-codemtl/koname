import Square from "../components/Square";
import { Piece, Position, GameMode } from "../types/game.types";


const Board: React.FC<{
  board: (Piece | null)[][];
  selectedPiece: Position | null;
  validMoves: Position[];
  cellSize: number;
  onSquareClick: (row: number, col: number) => void;
  gameMode: GameMode;
}> = ({ board, selectedPiece, validMoves, cellSize, onSquareClick, gameMode }) => {
  const boardWidth = cellSize * board.length;

  return (
    <div className="border-4 border-slate-900 rounded-lg overflow-hidden shadow-xl" style={{ width: boardWidth, height: boardWidth }}>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
            const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);

            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isValidMove={isValidMove}
                cellSize={cellSize}
                onClick={() => onSquareClick(rowIndex, colIndex)}
                gameMode={gameMode}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;