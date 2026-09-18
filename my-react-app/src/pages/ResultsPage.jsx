import React from 'react'
import { Link } from 'react-router-dom'

export default function ResultsPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
      <h2 className="text-3xl font-bold mb-2 text-white">Round Completed!</h2>
      <p className="text-slate-400 mb-6">Here is how you performed in this session.</p>
      
      <div className="p-8 bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full mb-8 shadow-xl">
        <span className="text-5xl font-extrabold text-cyan-400">850</span>
        <p className="text-slate-400 mt-2 text-sm">Total Points Earned</p>
      </div>

      <div className="flex space-x-4">
        <Link to="/play" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg transition-all">
          Play Again
        </Link>
        <Link to="/leaderboard" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition-all">
          Leaderboard
        </Link>
      </div>
    </div>
  )
}