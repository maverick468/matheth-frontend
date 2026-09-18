import React, { useState } from 'react'
import Button from '../common/Button'

export default function ReferralCode({ code = 'PLAYER123' }) {
  const [copied, setCopied] = useState(false)
  const referralLink = `https://matheth.app/register?ref=${code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full">
      <h3 className="text-xl font-bold text-white mb-2">Your Referral Link</h3>
      <p className="text-slate-400 text-sm mb-4">Share your unique link with friends to earn bonus rewards when they join.</p>
      
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-lg p-2">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="bg-transparent text-slate-300 text-sm w-full px-2 focus:outline-none"
        />
        <Button onClick={handleCopy} variant="primary">
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}