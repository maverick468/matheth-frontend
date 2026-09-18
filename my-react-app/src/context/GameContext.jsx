import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    mode: 'quiz',
    activeSession: false,
    questions: [],
    currentQuestionIndex: 0
  });

  const updateScore = (points) => {
    setGameState(prev => ({ ...prev, score: prev.score + points }));
  };

  const setGameMode = (mode) => {
    setGameState(prev => ({ ...prev, mode }));
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      mode: 'quiz',
      activeSession: false,
      questions: [],
      currentQuestionIndex: 0
    });
  };

  return (
    <GameContext.Provider value={{ gameState, setGameState, updateScore, setGameMode, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}