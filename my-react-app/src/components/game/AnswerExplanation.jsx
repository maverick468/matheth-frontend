import React from 'react'

export default function AnswerExplanation({ explanation = "Multiplication must be performed before addition according to the order of operations (PEMDAS): 7 * 2 = 14, then 5 + 14 = 19." }) {
  return (
    <div className="max-w-xl w-full p-6 bg-slate-800 border border-cyan-500/30 rounded-2xl shadow-xl">
      <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1 block">Explanation</span>
      <p className="text-slate-300 text-sm leading-relaxed">{explanation}</p>
    </div>
  )
}