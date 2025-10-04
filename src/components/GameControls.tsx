import React, { useState, useEffect } from 'react';
import { RotateCcw, Settings } from 'lucide-react';
import { Player, GameMode, AIState, GameType, AIDifficulty } from '../types/game.types';

const GameControls: React.FC<{
  boardSize: number;
  showSettings: boolean;
  currentPlayer: Player;
  winner: Player | null;
  mustCapture: boolean;
  gameMode: GameMode;
  konaneSetupPhase: boolean;
  konaneSetupCount: number;
  showEndTurn: boolean;
  historyLength: number;
  aiState: AIState;
  onBoardSizeChange: (size: number) => void;
  onGameModeChange: (mode: GameMode) => void;
  onGameTypeChange: (type: GameType) => void;
  onAIPlayerChange: (player: Player) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  onToggleSettings: () => void;
  onReset: () => void;
  onEndTurn: () => void;
  onUndo: () => void;
}> = ({ boardSize, showSettings, currentPlayer, winner, mustCapture, gameMode, konaneSetupPhase, konaneSetupCount, showEndTurn, historyLength, aiState, onBoardSizeChange, onGameModeChange, onGameTypeChange, onAIPlayerChange, onDifficultyChange, onToggleSettings, onReset, onEndTurn, onUndo  }) => (
  <>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-white">{gameMode === 'checkers' ? 'Checkers' : 'Kōnane'}</h1>
      <div className="flex gap-2">
        <button onClick={onToggleSettings} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-white" />
        </button>
        <button 
          onClick={onUndo} 
          disabled={historyLength === 0}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={historyLength > 0 ? `Undo (${historyLength} moves available)` : 'No moves to undo'}
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
        <button onClick={onReset} className="p-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors">
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>

    {showSettings && (
      <div className="mb-6 p-4 bg-slate-700 rounded-lg space-y-4">
        <div>
          <label className="block text-white mb-2 font-medium">Game Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => onGameModeChange('checkers')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                gameMode === 'checkers' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Checkers
            </button>
            <button
              onClick={() => onGameModeChange('konane')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                gameMode === 'konane' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Kōnane
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white mb-2 font-medium">Opponent</label>
          <div className="flex gap-2">
            <button
              onClick={() => onGameTypeChange('pvp')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                aiState.gameType === 'pvp' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Human vs Human
            </button>
            <button
              onClick={() => onGameTypeChange('ai')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                aiState.gameType === 'ai' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Human vs AI
            </button>
          </div>
        </div>

        {aiState.gameType === 'ai' && (
          <>
            <div>
              <label className="block text-white mb-2 font-medium">AI Plays As</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onAIPlayerChange('black')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    aiState.aiPlayer === 'black' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  ⚫ Black
                </button>
                <button
                  onClick={() => onAIPlayerChange('red')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    aiState.aiPlayer === 'red' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  {gameMode === 'konane' ? '⚪ White' : '🔴 Red'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white mb-2 font-medium">Difficulty</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onDifficultyChange('easy')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    aiState.difficulty === 'easy' ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => onDifficultyChange('medium')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    aiState.difficulty === 'medium' ? 'bg-yellow-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => onDifficultyChange('hard')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    aiState.difficulty === 'hard' ? 'bg-red-600 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  Hard
                </button>
              </div>
            </div>
          </>
        )}
        <div>
          <label className="block text-white mb-2 font-medium">Board Size: {boardSize}x{boardSize}</label>
          <input type="range" min="6" max="14" step="2" value={boardSize} onChange={(e) => onBoardSizeChange(Number(e.target.value))} className="w-full" />
        </div>
      </div>
    )}

    <div className="mb-4 text-center">
      {winner ? (
        <div className="text-2xl font-bold text-white">
          {winner === 'red' ? (gameMode === 'konane' ? '⚪' : '🔴') : '⚫'} {gameMode === 'konane' && winner === 'red' ? 'WHITE' : winner.toUpperCase()} WINS!
        </div>
      ) : konaneSetupPhase ? (
        <div className="text-xl font-semibold text-white">
          Setup: {currentPlayer === 'black' ? '⚫ Black' : (gameMode === 'konane' ? '⚪ White' : '🔴 Red')} remove a piece ({konaneSetupCount}/2)
        </div>
      ) : (
        <>
        <div className="text-xl font-semibold text-white">
          Current Player: {currentPlayer === 'red' ? (gameMode === 'konane' ? '⚪ White' : '🔴 Red') : '⚫ Black'}
          {mustCapture && <span className="ml-2 text-yellow-400">(Must capture!)</span>}
        </div>
        {aiState.isThinking && (
            <div className="mt-2 text-sm text-blue-400 animate-pulse">
              🤖 AI is thinking... ({aiState.positionsEvaluated.toLocaleString()} positions evaluated)
            </div>
          )}
        {showEndTurn && (
            <button
              onClick={onEndTurn}
              className="mt-3 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              End Turn (Continue Jumping Optional)
            </button>
          )}
        </>   
      )}
    </div>
  </>
);

export default GameControls;