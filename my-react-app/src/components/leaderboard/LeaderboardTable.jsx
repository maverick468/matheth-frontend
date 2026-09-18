import React from 'react'

export default function LeaderboardTable({ entries = [] }) {
  const defaultEntries = [
    { rank: 1, username: 'Abeni', points: 4500, gamesPlayed: 24 },
    { rank: 2, username: 'Dawit', points: 4120, gamesPlayed: 21 },
    { rank: 3, username: 'Sofonyas', points: 3890, gamesPlayed: 19 },
    { rank: 4, username: 'Kebron', points: 3450, gamesPlayed: 17 },
    { rank: 5, username: 'Emanda', points: 3200, gamesPlayed: 15 },
  ]

  const data = entries.length > 0 ? entries : defaultEntries

  return (
    <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Rank</th>
              <th className="py-3 px-4 font-semibold">Player</th>
              <th className="py-3 px-4 font-semibold text-right">Points</th>
              <th className="py-3 px-4 font-semibold text-right">Games</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {data.map((user) => (
              <tr key={user.rank} className="hover:bg-slate-700/30 transition-colors">
                <td className="py-3 px-4 font-bold text-cyan-400">#{user.rank}</td>
                <td className="py-3 px-4 font-medium text-slate-200">{user.username}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-300">{user.points}</td>
                <td className="py-3 px-4 text-right text-slate-400">{user.gamesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}