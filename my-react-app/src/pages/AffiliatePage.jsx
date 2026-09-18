import React from 'react'

export default function AffiliatePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
      <h2 className="text-3xl font-bold mb-2 text-white">Affiliate Program</h2>
      <p className="text-slate-400 max-w-md mb-6">Invite friends to Matheth and earn rewards for every active user who joins through your link.</p>
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-cyan-400 font-mono text-sm">
        https://matheth.app/register?ref=player
      </div>
    </div>
  )
}