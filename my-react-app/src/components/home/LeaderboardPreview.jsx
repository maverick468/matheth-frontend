import React from 'react'
import { Link } from 'react-router-dom'

export default function LeaderboardPreview() {
  const topPlayers = [
    { rank: 1, name: 'Abeni', points: 4500 },
    { rank: 2, name: 'Dawit', points: 4120 },
    { rank: 3, name: 'Sofonyas', points: 3890 },
  ]

  return (
    <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Top Standings</h3>
        <Link to="/leaderboard" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
          View All &rarr;
        </Link>
      </div>
      <div className="space-y-3">
        {topPlayers.map((player) => (
          <div key={player.rank} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700/60 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-cyan-400 text-sm">#{player.rank}</span>
              <span className="text-slate-200 font-medium text-sm">{player.name}</span>
            </div>
            <span className="text-slate-400 font-mono text-sm">{player.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}