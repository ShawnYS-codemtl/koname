import { Piece, Position, Player } from "../types/game.types";
import { hasAvailableCaptures } from "./gameUtils";


// Game Logic Functions
export const initializeCheckersBoard = (size: number): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  const rows = Math.floor((size - 2) / 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < size; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 'black', type: 'regular' };
      }
    }
  }

  for (let row = size - rows; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 'red', type: 'regular' };
      }
    }
  }

  return board;
};

export const getCheckersValidMoves = (board: (Piece | null)[][], pos: Position, piece: Piece): { moves: Position[], captures: Position[] } => {
  const moves: Position[] = [];
  const captures: Position[] = [];
  const { row, col } = pos;
  const size = board.length;

  const directions = piece.type === 'king' 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
    : piece.player === 'red' 
      ? [[-1, -1], [-1, 1]] 
      : [[1, -1], [1, 1]];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && !board[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol });
    }

    const jumpRow = row + dRow * 2;
    const jumpCol = col + dCol * 2;
    if (jumpRow >= 0 && jumpRow < size && jumpCol >= 0 && jumpCol < size) {
      const middlePiece = board[newRow][newCol];
      if (middlePiece && middlePiece.player !== piece.player && !board[jumpRow][jumpCol]) {
        captures.push({ row: jumpRow, col: jumpCol });
      }
    }
  }

  return { moves, captures };
};

export const getAllCheckersMoves = (
  board: (Piece | null)[][],
  player: Player
): Array<{from: Position, to: Position}> => {
  const moves: Array<{from: Position, to: Position}> = [];
  const mustCapture = hasAvailableCaptures(board, player, 'checkers');
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const from = { row, col };
        const { moves: regularMoves, captures } = getCheckersValidMoves(board, from, piece);
        const validMoves = mustCapture ? captures : [...regularMoves, ...captures];
        validMoves.forEach(to => moves.push({ from, to }));
      }
    }
  }
  return moves;
};

// Simulate a move and return new board state
export const simulateCheckersMove = (board: (Piece | null)[][], from: Position, to: Position): (Piece | null)[][] => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col]!;
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  
  if (Math.abs(rowDiff) === 2) {
    const capturedRow = from.row + rowDiff / 2;
    const capturedCol = from.col + colDiff / 2;
    newBoard[capturedRow][capturedCol] = null;
  }
    
  // Promote to king
  const boardSize = board.length;
  if ((piece.player === 'red' && to.row === 0) || (piece.player === 'black' && to.row === boardSize - 1)) {
    newBoard[to.row][to.col] = { ...piece, type: 'king' };
  }

  return newBoard;
}