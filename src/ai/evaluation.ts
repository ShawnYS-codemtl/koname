import { Piece, Player} from "../types/game.types";

// AI Evaluation Function
export const evaluateBoard = (board: (Piece | null)[][], player: Player): number => {
  let score = 0;
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = piece.type === 'king' ? 3 : 1;
        if (piece.player === player) {
          score += pieceValue;
        } else {
          score -= pieceValue;
        }
      }
    }
  }
  
  return score;
};