// Types
export type PieceType = 'regular' | 'king';
export type Player = 'red' | 'black';
export type GameMode = 'checkers' | 'konane';

export interface Piece {
  player: Player;
  type: PieceType;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  selectedPiece: Position | null;
  validMoves: Position[];
  mustCapture: boolean;
  winner: Player | null;
  gameMode: GameMode;
  konaneSetupPhase: boolean;
  konaneSetupCount: number;
  lastMoveDirection?: [number, number];
}