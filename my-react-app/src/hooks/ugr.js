import { useState, useRef } from 'react';

const MAX_MISTAKES = 5;
const RUNNER_START = 50;
const RUNNER_MIN = 6;
const RUNNER_MAX = 94;
const CORRECT_STEP = 10;
const WRONG_STEP = 20;

export function useGameRunner(questions, onSessionComplete) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  // 'playing' | 'eaten' | 'perfect' | 'partial' | 'review'
  const [gameState, setGameState] = useState('playing');

  // Refs mirror the counts so we can read the up-to-date value synchronously
  // within handleAnswer, since the corresponding state setters are async.
  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);

  const runnerPosition = Math.max(
    RUNNER_MIN,
    Math.min(RUNNER_MAX, RUNNER_START + (correctCount * CORRECT_STEP) - (wrongCount * WRONG_STEP))
  );

  const totalQuestions = questions.length;

  const finishSession = (finalOutcome, updatedScore, updatedCorrect, updatedWrong) => {
    setGameState(finalOutcome);
    onSessionComplete?.({
      outcome: finalOutcome,
      completed: finalOutcome === 'perfect',
      score: updatedScore,
      correctAnswers: updatedCorrect,
      totalQuestions,
      mistakes: updatedWrong,
    });
  };

  const handleAnswer = (isCorrect) => {
    if (gameState !== 'playing') return;

    const currentQ = questions[currentIndex];
    let updatedScore = score;
    let updatedCorrect = correctCountRef.current;
    let updatedWrong = wrongCountRef.current;

    if (isCorrect) {
      updatedScore += 10;
      updatedCorrect += 1;
      correctCountRef.current = updatedCorrect;
      setScore(updatedScore);
      setCorrectCount(updatedCorrect);
    } else {
      updatedScore = Math.max(0, updatedScore - 20);
      updatedWrong += 1;
      wrongCountRef.current = updatedWrong;
      setScore(updatedScore);
      setWrongCount(updatedWrong);
      setIncorrectQuestions(prev => [...prev, currentQ]);
    }

    // 1) Too many mistakes -> eaten, regardless of questions remaining.
    if (updatedWrong >= MAX_MISTAKES) {
      finishSession('eaten', updatedScore, updatedCorrect, updatedWrong);
      return;
    }

    // 2) Still more questions in this level -> advance.
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      return;
    }

    // 3) Finished every question -> perfect (0 wrong) or partial (1-4 wrong).
    const finalOutcome = updatedWrong === 0 ? 'perfect' : 'partial';
    finishSession(finalOutcome, updatedScore, updatedCorrect, updatedWrong);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setScore(0);
    setIncorrectQuestions([]);
    setGameState('playing');
    correctCountRef.current = 0;
    wrongCountRef.current = 0;
  };

  return {
    currentIndex,
    currentQuestion: questions[currentIndex],
    runnerPosition,
    score,
    correctCount,
    wrongCount,
    maxMistakes: MAX_MISTAKES,
    totalQuestions,
    gameState,
    incorrectQuestions,
    handleAnswer,
    setGameState,
    resetGame,
  };
}