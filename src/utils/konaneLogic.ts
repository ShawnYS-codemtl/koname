
import { Piece, Position, Player } from "../types/game.types";


// Konane Game Logic
export const initializeKonaneBoard = (size: number): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));

  // Fill entire board with alternating pieces
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      board[row][col] = {
        player: (row + col) % 2 === 0 ? 'black' : 'red',
        type: 'regular'
      };
    }
  }

  return board;
};


export const getKonaneValidMoves = (board: (Piece | null)[][], pos: Position, piece: Piece, lastDirection?: [number, number]): Position[] => {
  const captures: Position[] = [];
  const { row, col } = pos;
  const size = board.length;

  // Konane: only orthogonal jumps (no diagonals)
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dRow, dCol] of directions) {
    // If continuing a move, only allow same direction
    if (lastDirection && (lastDirection[0] !== dRow || lastDirection[1] !== dCol)) {
      continue;
    }

    // Check if we can make a single jump in this direction
    const adjacentRow = row + dRow;
    const adjacentCol = col + dCol;
    const jumpRow = row + dRow * 2;
    const jumpCol = col + dCol * 2;

    // Check bounds
    if (jumpRow < 0 || jumpRow >= size || jumpCol < 0 || jumpCol >= size) continue;

    const adjacentPiece = board[adjacentRow][adjacentCol];
    const jumpSquare = board[jumpRow][jumpCol];

    // Must jump over opponent piece into empty square
    if (adjacentPiece && adjacentPiece.player !== piece.player && !jumpSquare) {
      captures.push({ row: jumpRow, col: jumpCol });
    }
  }

  return captures;
};

export const getAllKonaneMoves = (
  board: (Piece | null)[][],
  player: Player
): Array<{from: Position, to: Position}> => {
  const moves: Array<{from: Position, to: Position}> = [];
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const from = { row, col };
        const captures = getKonaneValidMoves(board, from, piece);
        captures.forEach(to => moves.push({ from, to }));
      }
    }
  }
  return moves;
};

// Simulate a move and return new board state
export const simulateKonaneMove = (board: (Piece | null)[][], from: Position, to: Position): (Piece | null)[][] => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col]!;
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  
  const rowDir = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colDir = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
  const jumpedRow = from.row + rowDir;
  const jumpedCol = from.col + colDir;
  if (newBoard[jumpedRow][jumpedCol]) {
    newBoard[jumpedRow][jumpedCol] = null;
  }
   
  return newBoard;
};