import React from 'react'

export default function ActivityHistory({ activities = [] }) {
  const defaultActivities = [
    { id: 1, title: 'Quiz Challenge Completed', points: '+150 pts', date: 'Today, 2:45 PM' },
    { id: 2, title: 'AI PDF Generated: Calculus.pdf', points: '+300 pts', date: 'Yesterday, 11:20 AM' },
    { id: 3, title: 'Badge Unlocked: Speed Demon', points: '⚡', date: 'May 12, 2026' },
  ]

  const data = activities.length > 0 ? activities : defaultActivities

  return (
    <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-200">{item.title}</p>
              <span className="text-xs text-slate-400">{item.date}</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">{item.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}