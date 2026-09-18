import React from 'react'
import { Link } from 'react-router-dom'

export default function ProfileProgressSection() {
  return (
    <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl mx-auto mb-12">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Your Progress</h3>
        <Link to="/profile" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
          Open Profile &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-700/60 rounded-xl text-center">
          <span className="text-2xl font-bold text-cyan-400 font-mono">12</span>
          <p className="text-xs text-slate-400 mt-1">Quizzes Completed</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-700/60 rounded-xl text-center">
          <span className="text-2xl font-bold text-cyan-400 font-mono">850</span>
          <p className="text-xs text-slate-400 mt-1">High Score</p>
        </div>
      </div>
    </div>
  )
}