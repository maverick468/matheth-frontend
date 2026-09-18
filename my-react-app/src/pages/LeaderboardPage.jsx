import React from 'react'

export default function LeaderboardPage() {
  const rankings = [
    { rank: 1, name: 'Abeni', score: 4500 },
    { rank: 2, name: 'Dawit', score: 4120 },
    { rank: 3, name: 'Sofonyas', score: 3890 },
  ]

  return (
    <div className="flex flex-col items-center flex-grow p-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Global Leaderboard</h2>
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        {rankings.map((user) => (
          <div key={user.rank} className="flex items-center justify-between p-4 border-b border-slate-700 last:border-0">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-cyan-400 w-6">#{user.rank}</span>
              <span className="text-slate-200 font-medium">{user.name}</span>
            </div>
            <span className="text-slate-400 font-mono">{user.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}