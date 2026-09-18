import React from 'react'

export default function ReferralStats({ stats = { totalReferrals: 5, activeUsers: 3, pointsEarned: 1500 } }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md w-full">
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-center shadow-lg">
        <span className="text-2xl font-bold text-cyan-400">{stats.totalReferrals}</span>
        <p className="text-xs text-slate-400 mt-1">Total Referrals</p>
      </div>
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-center shadow-lg">
        <span className="text-2xl font-bold text-cyan-400">{stats.activeUsers}</span>
        <p className="text-xs text-slate-400 mt-1">Active Players</p>
      </div>
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-center shadow-lg">
        <span className="text-2xl font-bold text-cyan-400">{stats.pointsEarned}</span>
        <p className="text-xs text-slate-400 mt-1">Points Earned</p>
      </div>
    </div>
  )
}