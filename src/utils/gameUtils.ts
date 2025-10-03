import { getCheckersValidMoves } from './checkersLogic';
import { getKonaneValidMoves } from './konaneLogic';
import { Player, Piece, Position, GameMode } from '../types/game.types';

export const hasAvailableCaptures = (
  board: (Piece | null)[][],
  player: Player,
  gameMode: GameMode
): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        if (gameMode === 'konane') {
          const captures = getKonaneValidMoves(board, { row, col }, piece);
          if (captures.length > 0) return true;
        } else {
          const { captures } = getCheckersValidMoves(board, { row, col }, piece);
          if (captures.length > 0) return true;
        }
      }
    }
  }
  return false;
};

export const hasAnyValidMoves = (
  board: (Piece | null)[][],
  player: Player,
  gameMode: GameMode
): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        if (gameMode === 'konane') {
          const captures = getKonaneValidMoves(board, { row, col }, piece);
          if (captures.length > 0) return true;
        } else {
          const { moves, captures } = getCheckersValidMoves(board, { row, col }, piece);
          if (moves.length > 0 || captures.length > 0) return true;
        }
      }
    }
  }
  return false;
};

export const checkWinner = (
  board: (Piece | null)[][],
  currentPlayer: Player,
  gameMode: GameMode
): Player | null => {
  const opponent = currentPlayer === 'red' ? 'black' : 'red';
  const opponentHasPieces = board.some(row => row.some(p => p && p.player === opponent));
  const opponentHasMoves = opponentHasPieces && hasAnyValidMoves(board, opponent, gameMode);
  
  return !opponentHasPieces || !opponentHasMoves ? currentPlayer : null;
};