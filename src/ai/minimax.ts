import { Piece, Position, Player } from '../types/game.types';

interface MinimaxParams {
  board: (Piece | null)[][];
  depth: number;
  maximizingPlayer: boolean;
  aiPlayer: Player;
  getAllMovesFn: (board: (Piece | null)[][], player: Player) => Array<{from: Position, to: Position}>;
  simulateMoveFn: (board: (Piece | null)[][], from: Position, to: Position) => (Piece | null)[][];
  evaluateFn: (board: (Piece | null)[][], player: Player) => number;
  positionsEvaluated: { count: number };
}

export const minimax = ({
  board,
  depth,
  maximizingPlayer,
  aiPlayer,
  getAllMovesFn,
  simulateMoveFn,
  evaluateFn,
  positionsEvaluated
}: MinimaxParams): number => {
  positionsEvaluated.count++;
  
  const currentPlayer = maximizingPlayer ? aiPlayer : (aiPlayer === 'red' ? 'black' : 'red');
  
  // Base case: depth limit or no moves
  const moves = getAllMovesFn(board, currentPlayer);
  if (depth === 0 || moves.length === 0) {
    return evaluateFn(board, aiPlayer);
  }
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = simulateMoveFn(board, move.from, move.to);
      const evaluation = minimax({
        board: newBoard,
        depth: depth - 1,
        maximizingPlayer: false,
        aiPlayer,
        getAllMovesFn,
        simulateMoveFn,
        evaluateFn,
        positionsEvaluated
      });
      maxEval = Math.max(maxEval, evaluation);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = simulateMoveFn(board, move.from, move.to);
      const evaluation = minimax({
        board: newBoard,
        depth: depth - 1,
        maximizingPlayer: true,
        aiPlayer,
        getAllMovesFn,
        simulateMoveFn,
        evaluateFn,
        positionsEvaluated
      });
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
};