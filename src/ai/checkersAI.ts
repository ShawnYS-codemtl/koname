import { GameState, AIDifficulty, Position, Player } from '../types/game.types';
import { getAllCheckersMoves, simulateCheckersMove } from '../utils/checkersLogic';
import { minimax } from './minimax';
import { evaluateBoardSimple, evaluateCheckersAdvanced } from './evaluation';

export const getCheckersAIMove = (
  gameState: GameState,
  aiPlayer: Player,
  difficulty: AIDifficulty
): { move: {from: Position, to: Position} | null, positionsEvaluated: number } => {
  const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;

  // Choose evaluation function based on difficulty
  const evaluateFn = difficulty === 'hard' 
    ? evaluateCheckersAdvanced 
    : evaluateBoardSimple;

  const moves = getAllCheckersMoves(gameState.board, aiPlayer);
  
  if (moves.length === 0) return { move: null, positionsEvaluated: 0 };
  
  let bestMove = moves[0];
  let bestValue = -Infinity;
  const positionsEvaluated = { count: 0 };
  
  for (const move of moves) {
    const newBoard = simulateCheckersMove(gameState.board, move.from, move.to);
    const value = minimax({
      board: newBoard,
      depth: depth - 1,
      alpha: -Infinity,
      beta: Infinity,
      maximizingPlayer: false,
      aiPlayer,
      getAllMovesFn: getAllCheckersMoves,
      simulateMoveFn: simulateCheckersMove,
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