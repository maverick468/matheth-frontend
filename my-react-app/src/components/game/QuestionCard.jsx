import React from 'react'

export default function QuestionCard({ question = "What is the result of 5 + 7 * 2?" }) {
  return (
    <div className="max-w-xl w-full p-8 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl text-center mb-6">
      <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-2 block">Question</span>
      <h2 className="text-xl md:text-2xl font-bold text-white">{question}</h2>
    </div>
  )
}