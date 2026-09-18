import React, { useState, useEffect } from 'react'

export default function GameTimer({ duration = 30, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp])

  const percentage = (timeLeft / duration) * 100

  return (
    <div className="flex items-center space-x-4 max-w-xl w-full mb-6 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg">
      <span className="text-sm font-bold text-cyan-400 font-mono w-12">{timeLeft}s</span>
      <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${
            timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}