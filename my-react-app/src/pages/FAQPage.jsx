import React from 'react'

export default function FAQPage() {
  return (
    <div className="flex flex-col items-center flex-grow p-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
      <div className="max-w-xl w-full space-y-4">
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <h3 className="font-bold text-white mb-1">How does gesture control work?</h3>
          <p className="text-slate-400 text-sm">Matheth uses your device camera and computer vision to track hand movements to answer multiple-choice options hands-free.</p>
        </div>
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <h3 className="font-bold text-white mb-1">Can I upload my own study documents?</h3>
          <p className="text-slate-400 text-sm">Yes! You can upload any PDF study material via the AI PDF mode to instantly generate custom quiz sessions.</p>
        </div>
      </div>
    </div>
  )
}