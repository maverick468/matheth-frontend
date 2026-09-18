import React from 'react'

export default function BadgeGrid({ badges = [] }) {
  const defaultBadges = [
    { id: 1, name: 'Speed Demon', icon: '⚡', description: 'Answered questions within 3 seconds' },
    { id: 2, name: 'AI Master', icon: '🤖', description: 'Completed 5 AI PDF quiz rounds' },
    { id: 3, name: 'Gesture Pro', icon: '👋', description: 'Used hand gestures successfully' },
  ]

  const userBadges = badges.length > 0 ? badges : defaultBadges

  return (
    <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Unlocked Badges</h3>
      <div className="grid grid-cols-3 gap-4">
        {userBadges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center p-3 bg-slate-900 border border-slate-700/60 rounded-xl text-center">
            <span className="text-3xl mb-1">{badge.icon}</span>
            <span className="text-xs font-semibold text-slate-200">{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}