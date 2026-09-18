import React from 'react'

export default function PointBalance({ points = 1250 }) {
  return (
    <div className="max-w-md w-full p-6 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Point Balance</p>
        <span className="text-3xl font-extrabold text-cyan-400 font-mono">{points.toLocaleString()}</span>
      </div>
      <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 text-xl font-bold">
        💎
      </div>
    </div>
  )
}