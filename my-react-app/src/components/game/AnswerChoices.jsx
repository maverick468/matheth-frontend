// frontend/src/components/game/AnswerChoices.jsx
import React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function AnswerChoices({
  choices = ['15', '19', '24', '14'],
  onSelect,
  selectedIndex = null,   // index currently highlighted (gesture in progress, not locked yet)
  lockedIndex = null,     // index the player actually locked in
  correctIndex = null,    // index of the correct answer (shown once locked)
  showResult = false,     // true once an answer is locked, reveals correct/incorrect styling
  disabled = false,       // true while locked or transitioning between questions
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl w-full">
      {choices.map((choice, index) => {
        const letter = String.fromCharCode(65 + index)
        const isSelected = selectedIndex === index
        const isLocked = lockedIndex === index
        const isCorrect = correctIndex === index

        let style = 'bg-slate-800 border-slate-700 hover:border-cyan-500 hover:bg-slate-750 text-slate-200'
        let icon = null

        if (showResult) {
          if (isCorrect) {
            style = 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          } else if (isLocked) {
            style = 'bg-red-500/15 border-red-500 text-red-300'
            icon = <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          }
        } else if (isSelected) {
          style = 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
        }

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelect && onSelect(choice, index)}
            disabled={disabled}
            className={`p-4 border rounded-xl transition-all text-left flex items-center justify-between space-x-4 shadow-md font-semibold ${style} ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            <div className="flex items-center space-x-4">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${isSelected && !showResult ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-cyan-400'}`}>
                {letter}
              </span>
              <span className="text-sm">{choice}</span>
            </div>
            {icon}
          </button>
        )
      })}
    </div>
  )
}