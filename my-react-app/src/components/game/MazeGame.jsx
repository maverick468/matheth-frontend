// frontend/src/components/game/MazeGame.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Skull, Footprints, RotateCcw, ArrowRight, ArrowLeft, Play, Sparkles } from 'lucide-react';
import { useGameRunner } from '../../hooks/ugr';

export function MazeGame({ questions, sessionMetadata = {}, onComplete, hasNextLevel = false, onNextLevel, onBackToLevels }) {
  const navigate = useNavigate();
  const {
    currentIndex,
    currentQuestion,
    runnerPosition,
    score,
    correctCount,
    wrongCount,
    maxMistakes,
    totalQuestions,
    gameState,
    incorrectQuestions,
    handleAnswer,
    resetGame,
  } = useGameRunner(questions, onComplete);

  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const handleContinueNextLevel = () => {
    if (onNextLevel) {
      onNextLevel();
    } else {
      navigate('/play');
    }
  };

  const handleBack = () => {
    if (onBackToLevels) {
      onBackToLevels();
    } else {
      navigate('/play');
    }
  };

  // ---------- OUTCOME SCREENS ----------

  if (gameState === 'eaten') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900 rounded-2xl border border-red-900/30 max-w-xl mx-auto w-full my-auto shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.4),transparent_60%)]" />
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full animate-pulse border border-red-500/20 relative z-10">
          <Skull className="w-12 h-12" />
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl font-black text-red-400">Caught by the Monster!</h2>
          <p className="text-slate-300 text-sm max-w-md">
            {wrongCount} mistakes (max {maxMistakes}) — the monster caught up to your runner.
          </p>
          <span className="text-cyan-400 font-bold text-xl mt-2 block">Score: {score}</span>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2 relative z-10">
          <button
            onClick={resetGame}
            className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          {incorrectQuestions.length > 0 && (
            <button
              onClick={() => { setReviewMode(true); setReviewIndex(0); }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Review Incorrect Questions ({incorrectQuestions.length})
            </button>
          )}
          <button
            onClick={handleBack}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Quit to Levels
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'perfect') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 rounded-2xl border border-emerald-900/30 max-w-xl mx-auto w-full my-auto shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.4),transparent_60%)]" />
        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full animate-bounce border border-amber-500/20 relative z-10">
          <Trophy className="w-12 h-12" />
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl font-black text-emerald-400">Perfect Escape!</h2>
          <p className="text-slate-400 text-sm">
            All <span className="text-cyan-400 font-bold">{totalQuestions}</span> out of <span className="text-slate-200 font-bold">{totalQuestions}</span> correct — flawless run!
          </p>
          <span className="text-cyan-400 font-bold text-2xl mt-2 block">Score: {score}</span>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2 relative z-10">
          {hasNextLevel ? (
            <button
              onClick={handleContinueNextLevel}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4" />
              Next Level
            </button>
          ) : (
            <button
              onClick={handleBack}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Main Menu
            </button>
          )}
          <button
            onClick={resetGame}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Replay Level
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'partial') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 rounded-2xl border border-amber-900/30 max-w-xl mx-auto w-full my-auto shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.4),transparent_60%)]" />
        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full animate-pulse border border-amber-500/20 relative z-10">
          <Sparkles className="w-12 h-12" />
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl font-black text-amber-400">So Close!</h2>
          <p className="text-slate-300 text-sm max-w-md">
            You escaped with <span className="text-amber-300 font-bold">{correctCount}/{totalQuestions}</span> correct — nearly a flawless run!
          </p>
          <span className="text-cyan-400 font-bold text-2xl mt-2 block">Score: {score}</span>
          <p className="text-slate-500 text-xs">Nail all {totalQuestions} next time for a perfect escape.</p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-2 relative z-10">
          <button
            onClick={resetGame}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          {incorrectQuestions.length > 0 && (
            <button
              onClick={() => { setReviewMode(true); setReviewIndex(0); }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Review Incorrect Questions ({incorrectQuestions.length})
            </button>
          )}
          <button
            onClick={handleBack}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Levels
          </button>
        </div>
      </div>
    );
  }

  // ---------- REVIEW MODE ----------

  if (reviewMode && incorrectQuestions.length > 0) {
    const currentReviewQ = incorrectQuestions[reviewIndex];
    return (
      <div className="flex flex-col w-full max-w-xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-6 my-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-amber-400">Review Mistake {reviewIndex + 1} of {incorrectQuestions.length}</h3>
          <button
            onClick={() => setReviewMode(false)}
            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
          >
            Exit Review
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-100 font-semibold">{currentReviewQ.question}</p>
          <div className="grid grid-cols-1 gap-2">
            {currentReviewQ.choices.map((choice, idx) => {
              const isCorrect = idx === currentReviewQ.correctIndex;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-sm font-medium border ${
                    isCorrect 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  {choice} {isCorrect && '✓ (Correct Answer)'}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <button
            disabled={reviewIndex === 0}
            onClick={() => setReviewIndex(prev => prev - 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-sm rounded-xl cursor-pointer"
          >
            Previous
          </button>
          <button
            disabled={reviewIndex === incorrectQuestions.length - 1}
            onClick={() => setReviewIndex(prev => prev + 1)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-sm rounded-xl cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // ---------- ACTIVE GAMEPLAY ----------

  return (
    <div className="flex flex-col w-full h-full max-w-2xl mx-auto p-6 space-y-6 justify-center">
      {/* Maze Distance Track Bar */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 h-32 flex items-center justify-between overflow-hidden shadow-inner">
        <div className="flex flex-col items-center text-red-500 z-10">
          <Skull className="w-7 h-7 animate-pulse" />
          <span className="text-[10px] font-semibold mt-1">Monster</span>
        </div>

        <div className="absolute left-14 right-14 h-2 bg-slate-800 rounded-full">
          <div 
            className="absolute top-0 bottom-0 bg-gradient-to-r from-red-500 via-cyan-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${runnerPosition}%` }}
          />
        </div>

        <div 
          className="absolute z-20 transition-all duration-500 flex flex-col items-center -translate-x-1/2"
          style={{ left: `calc(${runnerPosition}% + 28px - (56px * ${runnerPosition / 100}))` }}
        >
          <div className="p-2 bg-cyan-500/20 border border-cyan-400 text-cyan-400 rounded-full shadow-lg shadow-cyan-500/50">
            <Footprints className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-cyan-400 mt-1">{runnerPosition}%</span>
        </div>

        <div className="flex flex-col items-center text-amber-400 z-10">
          <Trophy className="w-7 h-7" />
          <span className="text-[10px] font-semibold mt-1">Escape</span>
        </div>
      </div>

      {/* Active Question Card */}
      {currentQuestion && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Question {currentIndex + 1} of {totalQuestions}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded-lg border border-slate-700">
                {wrongCount}/{maxMistakes} mistakes
              </span>
              <span className="text-cyan-400 font-bold">Score: {score}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-100 leading-snug">{currentQuestion.question}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {currentQuestion.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx === currentQuestion.correctIndex)}
                className="p-4 bg-slate-800/60 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500 text-slate-200 text-sm font-medium rounded-xl transition-all text-left cursor-pointer flex items-center justify-between group"
              >
                <span>{choice}</span>
                <span className="w-6 h-6 rounded-lg bg-slate-700 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center text-xs font-bold text-slate-300 transition-colors shrink-0 ml-3">
                  {String.fromCharCode(65 + idx)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}