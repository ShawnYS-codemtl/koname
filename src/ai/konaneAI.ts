import { GameState, AIDifficulty, Position, Player, Piece } from '../types/game.types';
import { getAllKonaneMoves, simulateKonaneMove, getKonaneValidMoves } from '../utils/konaneLogic';
import { minimax } from './minimax';
import { evaluateBoardSimple, evaluateKonaneAdvanced } from './evaluation';

export const getKonaneAIMove = (
  gameState: GameState,
  aiPlayer: Player,
  difficulty: AIDifficulty
): { move: {from: Position, to: Position} | null, positionsEvaluated: number } => {
  const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;

  const evaluateFn = difficulty === 'hard' 
    ? (board: (Piece | null)[][], player: Player) => 
        evaluateKonaneAdvanced(board, player, getKonaneValidMoves)  // ← Konane-specific
    : evaluateBoardSimple;

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
      alpha: -Infinity,
      beta: Infinity,
      maximizingPlayer: false,
      aiPlayer,
      getAllMovesFn: getAllKonaneMoves,        // ← Konane-specific
      simulateMoveFn: simulateKonaneMove,      // ← Konane-specific
      evaluateFn: evaluateFn,
      positionsEvaluated
    });
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return { move: bestMove, positionsEvaluated: positionsEvaluated.count };
};