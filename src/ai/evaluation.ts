import { Piece, Player, Position} from "../types/game.types";

// AI Evaluation Function
export const evaluateBoardSimple = (board: (Piece | null)[][], player: Player): number => {
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

export const evaluateCheckersAdvanced = (
  board: (Piece | null)[][],
  player: Player
): number => {
  let score = 0;
  const size = board.length;
  const center = size / 2;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      
      const isAI = piece.player === player;
      const multiplier = isAI ? 1 : -1;
      
      // 1. Base piece value
      let pieceScore = piece.type === 'king' ? 5 : 1;  // Kings more valuable
      
      // 2. Advancement bonus (regular pieces moving forward)
      if (piece.type === 'regular') {
        const advancement = piece.player === 'red' 
          ? (size - 1 - row)  // Red moves up (decreasing row)
          : row;               // Black moves down (increasing row)
        pieceScore += advancement * 0.1;  // Small bonus for advancement
      }
      
      // 3. Center control (pieces near center more valuable)
      const distanceFromCenter = Math.abs(row - center) + Math.abs(col - center);
      pieceScore += (size - distanceFromCenter) * 0.05;
      
      // 4. Back row protection (keep some pieces on back row for defense)
      if (piece.type === 'regular') {
        const isBackRow = (piece.player === 'red' && row === size - 1) || 
                          (piece.player === 'black' && row === 0);
        if (isBackRow) {
          pieceScore += 0.5;  // Bonus for protecting back row
        }
      }
      
      // 5. King on back row (extra valuable - can't be promoted)
      if (piece.type === 'king') {
        const isBackRow = (piece.player === 'red' && row === size - 1) || 
                          (piece.player === 'black' && row === 0);
        if (isBackRow) {
          pieceScore += 1;  // Kings on back row are defensive
        }
      }
      
      // 6. Edge pieces (slightly vulnerable)
      if (row === 0 || row === size - 1 || col === 0 || col === size - 1) {
        pieceScore -= 0.2;
      }
      
      score += pieceScore * multiplier;
    }
  }
  
  return score;
};

export const evaluateKonaneAdvanced = (
  board: (Piece | null)[][],
  player: Player,
  getValidMovesFn: (board: (Piece | null)[][], pos: Position, piece: Piece) => Position[]
): number => {
  let score = 0;
  const size = board.length;
  const center = size / 2;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      
      const isAI = piece.player === player;
      const multiplier = isAI ? 1 : -1;
      
      // 1. Base value - all pieces equal in Konane
      let pieceScore = 1;
      
      // 2. Mobility - pieces with more moves are more valuable
      const validMoves = getValidMovesFn(board, { row, col }, piece);
      pieceScore += validMoves.length * 0.5;  // Each possible jump adds value
      
      // 3. Center control - central pieces can jump in more directions
      const distanceFromCenter = Math.abs(row - center) + Math.abs(col - center);
      pieceScore += (size - distanceFromCenter) * 0.1;
      
      // 4. Connectivity - pieces near allies are safer (harder to capture)
      let nearbyAllies = 0;
      const neighbors = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 }
      ];
      
      for (const neighbor of neighbors) {
        if (neighbor.row >= 0 && neighbor.row < size && 
            neighbor.col >= 0 && neighbor.col < size) {
          const neighborPiece = board[neighbor.row][neighbor.col];
          if (neighborPiece && neighborPiece.player === piece.player) {
            nearbyAllies++;
          }
        }
      }
      pieceScore += nearbyAllies * 0.3;
      
      // 5. Spacing - pieces with empty spaces nearby can make jumps
      let nearbyEmpty = 0;
      for (const neighbor of neighbors) {
        if (neighbor.row >= 0 && neighbor.row < size && 
            neighbor.col >= 0 && neighbor.col < size) {
          if (!board[neighbor.row][neighbor.col]) {
            nearbyEmpty++;
          }
        }
      }
      pieceScore += nearbyEmpty * 0.2;
      
      score += pieceScore * multiplier;
    }
  }
  
  return score;
};