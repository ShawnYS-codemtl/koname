import React, { useState, useEffect } from 'react';
import GameControls from './components/GameControls';
import Board from './components/Board';
import {Position, GameState, GameMode} from './types/game.types';
import { initializeCheckersBoard, getCheckersValidMoves} from './utils/checkersLogic';
import { initializeKonaneBoard, getKonaneValidMoves } from './utils/konaneLogic';
import { hasAvailableCaptures, hasAnyValidMoves, checkWinner } from './utils/gameUtils';
  

const CheckersGame: React.FC = () => {
  const [boardSize, setBoardSize] = useState(8);
  const [showSettings, setShowSettings] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<GameState[]>([]);

  useEffect(() => {
    resetGame();
  }, [boardSize]);

  const resetGame = (mode?: GameMode) => {
    const selectedMode = mode || gameState?.gameMode || 'checkers';
    const board = selectedMode === 'checkers' 
      ? initializeCheckersBoard(boardSize)
      : initializeKonaneBoard(boardSize);

    setGameState({
      board,
      currentPlayer: 'black',
      selectedPiece: null,
      validMoves: [],
      mustCapture: false,
      winner: null,
      gameMode: selectedMode,
      konaneSetupPhase: selectedMode === 'konane',
      konaneSetupCount: 0,
      lastMoveDirection: undefined,
    });
    setHistory([]); // Clear history on reset
  };

  const handleGameModeChange = (mode: GameMode) => {
    resetGame(mode);
  };

  const handleEndTurn = () => {
    if (!gameState) return;

    // Save current state to history before changing
    setHistory([...history, gameState]);

    const opponent = gameState.currentPlayer === 'red' ? 'black' : 'red';
    const opponentHasMoves = hasAnyValidMoves(gameState.board, opponent, gameState.gameMode);

    setGameState({
      ...gameState,
      currentPlayer: opponent,
      selectedPiece: null,
      validMoves: [],
      mustCapture: false,
      winner: !opponentHasMoves ? gameState.currentPlayer : null,
      lastMoveDirection: undefined,
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    setGameState(previousState);
    setHistory(newHistory);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!gameState || gameState.winner) return;

    // Konane setup phase
    if (gameState.konaneSetupPhase) {
      const clickedPiece = gameState.board[row][col];
      if (!clickedPiece) return;

      const size = gameState.board.length;
      const center = Math.floor(size / 2);

      if (gameState.konaneSetupCount === 0) {
        // First piece: must be black and in the center 4 squares
        if (clickedPiece.player !== 'black') return;
        
        // Check if in center area (middle 2x2 squares)
        const isInCenter = (row === center - 1 || row === center) && 
                          (col === center - 1 || col === center);
        if (!isInCenter) return;
      } else if (gameState.konaneSetupCount === 1) {
        // Second piece: must be red and adjacent (orthogonally) to the removed piece
        if (clickedPiece.player !== 'red') return;
        
        // Find the removed piece location
        let removedRow = -1, removedCol = -1;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (!gameState.board[r][c]) {
              removedRow = r;
              removedCol = c;
              break;
            }
          }
          if (removedRow !== -1) break;
        }
        
        // Check if adjacent (orthogonally)
        const isAdjacent = (Math.abs(row - removedRow) === 1 && col === removedCol) ||
                          (Math.abs(col - removedCol) === 1 && row === removedRow);
        if (!isAdjacent) return;
      }

      const newBoard = gameState.board.map(r => [...r]);
      newBoard[row][col] = null;

      const newCount = gameState.konaneSetupCount + 1;
      setGameState({
        ...gameState,
        board: newBoard,
        konaneSetupPhase: newCount < 2,
        konaneSetupCount: newCount,
        currentPlayer: newCount === 1 ? 'red' : 'black', // Switch to red for second removal, then black starts
      });
      return;
    }

    const { board, currentPlayer, selectedPiece, validMoves, gameMode } = gameState;
    const clickedPiece = board[row][col];

    if (selectedPiece) {
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      if (isValidMove) {
        makeMove(selectedPiece, { row, col });
        return;
      }
    }

    if (clickedPiece && clickedPiece.player === currentPlayer) {
      let availableMoves: Position[] = [];
      
      if (gameMode === 'konane') {
        availableMoves = getKonaneValidMoves(board, { row, col }, clickedPiece, gameState.lastMoveDirection);
      } else {
        const { moves, captures } = getCheckersValidMoves(board, { row, col }, clickedPiece);
        const mustCapture = hasAvailableCaptures(board, currentPlayer, gameMode);
        availableMoves = mustCapture ? captures : [...moves, ...captures];
      }

      setGameState({
        ...gameState,
        selectedPiece: { row, col },
        validMoves: availableMoves,
        mustCapture: gameMode === 'checkers' && hasAvailableCaptures(board, currentPlayer, gameMode),
      });
    } else {
      setGameState({
        ...gameState,
        selectedPiece: null,
        validMoves: [],
        mustCapture: false,
      });
    }
  };

  const makeMove = (from: Position, to: Position) => {
    if (!gameState) return;

    // Save current state to history before making move
    setHistory([...history, gameState]);

    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[from.row][from.col]!;

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    let capturedPiece = false;

    // Handle captures
    if (gameState.gameMode === 'konane') {
      // Konane: remove all jumped pieces in the path
      const rowDir = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
      const colDir = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
      let currentRow = from.row + rowDir;
      let currentCol = from.col + colDir;

      while (currentRow !== to.row || currentCol !== to.col) {
        if (newBoard[currentRow][currentCol]) {
          newBoard[currentRow][currentCol] = null;
          capturedPiece = true;
        }
        currentRow += rowDir;
        currentCol += colDir;
      }

      // Check for additional captures in SAME direction only (optional continuation)
      const direction: [number, number] = [rowDir, colDir];
      const additionalCaptures = getKonaneValidMoves(newBoard, to, piece, direction);
      if (additionalCaptures.length > 0) {
        setGameState({
          ...gameState,
          board: newBoard,
          selectedPiece: to,
          validMoves: additionalCaptures,
          mustCapture: false,  // optional in konane
          lastMoveDirection: direction,
        });
        return;
      }
    } else {
      // Checkers: single jump
      if (Math.abs(rowDiff) === 2) {
        const capturedRow = from.row + rowDiff / 2;
        const capturedCol = from.col + colDiff / 2;
        newBoard[capturedRow][capturedCol] = null;
        capturedPiece = true;
      }

      // Promote to king
      if ((piece.player === 'red' && to.row === 0) || (piece.player === 'black' && to.row === boardSize - 1)) {
        newBoard[to.row][to.col] = { ...piece, type: 'king' };
      }

      // Check for additional captures
      if (capturedPiece) {
        const { captures } = getCheckersValidMoves(newBoard, to, newBoard[to.row][to.col]!);
        if (captures.length > 0) {
          setGameState({
            ...gameState,
            board: newBoard,
            selectedPiece: to,
            validMoves: captures,
            mustCapture: true,
          });
          return;
        }
      }
    }

    const opponent = gameState.currentPlayer === 'red' ? 'black' : 'red';
    const opponentHasMoves = hasAnyValidMoves(newBoard, opponent, gameState.gameMode);

    setGameState({
      board: newBoard,
      currentPlayer: opponent,
      selectedPiece: null,
      validMoves: [],
      mustCapture: false,
      winner: !opponentHasMoves ? gameState.currentPlayer : null,
      gameMode: gameState.gameMode,
      konaneSetupPhase: false,
      konaneSetupCount: 2,
      lastMoveDirection: undefined
    });
  };

  if (!gameState) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const cellSize = Math.min(600 / boardSize, 60);
  const showEndTurnButton = gameState.gameMode === 'konane' && 
                            gameState.selectedPiece !== null && 
                            gameState.validMoves.length > 0 &&
                            gameState.lastMoveDirection !== undefined;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${ gameState.gameMode === 'checkers' ? 'checkers-bg' : 'konane-bg'}`}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 flex flex-col items-center">
        <div className="w-full">
          <GameControls
            boardSize={boardSize}
            showSettings={showSettings}
            currentPlayer={gameState.currentPlayer}
            winner={gameState.winner}
            mustCapture={gameState.mustCapture}
            gameMode={gameState.gameMode}
            konaneSetupPhase={gameState.konaneSetupPhase}
            konaneSetupCount={gameState.konaneSetupCount}
            showEndTurn={showEndTurnButton}
            historyLength={history.length}
            onBoardSizeChange={setBoardSize}
            onGameModeChange={handleGameModeChange}
            onToggleSettings={() => setShowSettings(!showSettings)}
            onReset={() => resetGame()}
            onEndTurn={handleEndTurn}
            onUndo={handleUndo}
          />
        </div>

        <div className="flex justify-center">
          <Board
            board={gameState.board}
            selectedPiece={gameState.selectedPiece}
            validMoves={gameState.validMoves}
            cellSize={cellSize}
            onSquareClick={handleSquareClick}
            gameMode={gameState.gameMode}
          />
        </div>

        <div className="mt-6 text-sm text-slate-400 text-center max-w-md">
          {gameState.gameMode === 'checkers' ? (
            <>
              <p>Click a piece to select it, then click a highlighted square to move.</p>
              <p className="mt-1">Pieces become kings when reaching the opposite end.</p>
            </>
          ) : gameState.konaneSetupPhase ? (
            <>
              <p className="font-semibold text-slate-300">Setup Phase:</p>
              <p className="mt-1">
                {gameState.konaneSetupCount === 0 
                  ? "Black: Remove one piece from the center 4 squares" 
                  : "Red: Remove a piece adjacent to the empty square"}
              </p>
            </>
          ) : (
            <>
              <p>Kōnane: Jump over adjacent opponent pieces horizontally or vertically.</p>
              <p className="mt-1">Chain multiple jumps in one direction. No regular moves allowed!</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckersGame;
