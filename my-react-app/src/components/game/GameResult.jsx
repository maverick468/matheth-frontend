import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function GameResult(props) {
  const location = useLocation()

  const {
    outcome = 'perfect', // 'eaten' | 'perfect' | 'partial'
    score = 850,
    correctAnswers = 8,
    totalQuestions = 10,
    mistakes,
    hasNextLevel = false,
  } = { ...props, ...(location.state || {}) }

  const theme = {
    eaten:   { emoji: '💀', title: 'Session Failed',   subtitle: 'The monster caught up — try again!',      accent: 'text-red-400' },
    perfect: { emoji: '🏆', title: 'Perfect Escape!',  subtitle: 'Flawless run — every question correct!',  accent: 'text-emerald-400' },
    partial: { emoji: '✨', title: 'So Close!',         subtitle: 'Nearly a flawless run — try again for perfect.', accent: 'text-amber-400' },
  }[outcome];

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
      <div className="max-w-md w-full p-8 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl">
        <span className="text-4xl mb-4 block">{theme.emoji}</span>
        <h2 className={`text-2xl font-bold mb-1 ${theme.accent}`}>{theme.title}</h2>
        <p className="text-slate-400 text-sm mb-6">{theme.subtitle}</p>

        <div className={`grid ${mistakes !== undefined ? 'grid-cols-3' : 'grid-cols-2'} gap-4 border-t border-b border-slate-700 py-4 mb-6`}>
          <div>
            <span className="text-2xl font-bold text-cyan-400 font-mono">{score}</span>
            <p className="text-xs text-slate-400">Total Points</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-cyan-400 font-mono">{correctAnswers}/{totalQuestions}</span>
            <p className="text-xs text-slate-400">Correct</p>
          </div>
          {mistakes !== undefined && (
            <div>
              <span className="text-2xl font-bold text-red-400 font-mono">{mistakes}</span>
              <p className="text-xs text-slate-400">Mistakes</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          {outcome === 'perfect' && hasNextLevel ? (
            <Link to="/play" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all text-sm text-center">
              Next Level
            </Link>
          ) : (
            <Link to="/play" className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all text-sm text-center">
              {outcome === 'perfect' ? 'Back to Levels' : 'Play Again'}
            </Link>
          )}
          <Link to="/leaderboard" className="flex-1 py-3 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 font-semibold rounded-lg transition-all text-sm text-center">
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}