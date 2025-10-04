import { GameState, AIDifficulty, Position, Player } from '../types/game.types';
import { getAllKonaneMoves, simulateKonaneMove } from '../utils/konaneLogic';
import { minimax } from './minimax';
import { evaluateBoard } from './evaluation';

export const getKonaneAIMove = (
  gameState: GameState,
  aiPlayer: Player,
  difficulty: AIDifficulty
): { move: {from: Position, to: Position} | null, positionsEvaluated: number } => {
  const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
  const moves = getAllKonaneMoves(gameState.board, aiPlayer);
  
  if (moves.length === 0) return { move: null, positionsEvaluated: 0 };
  
  let bestMove = moves[0];
  let bestValue = -Infinity;
  const positionsEvaluated = { count: 0 };
  
  for (const move of moves) {
    const newBoard = simulateKonaneMove(gameState.board, move.from, move.to);
    const value = minimax({
      board: newBoard,
      depth: depth - 1,
      maximizingPlayer: false,
      aiPlayer,
      getAllMovesFn: getAllKonaneMoves,        // ← Konane-specific
      simulateMoveFn: simulateKonaneMove,      // ← Konane-specific
      evaluateFn: evaluateBoard,
      positionsEvaluated
    });
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return { move: bestMove, positionsEvaluated: positionsEvaluated.count };
};