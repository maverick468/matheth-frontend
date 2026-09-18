import React from 'react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent tracking-tight">
        Master Math & AI Learning with Gestures
      </h1>
      <p className="text-slate-400 max-w-2xl mb-8 text-lg leading-relaxed">
        Matheth combines interactive educational games, computer-vision hand tracking, and AI-driven document question generation to supercharge your studies.
      </p>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <Link to="/play" className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-center">
          Start Playing Now
        </Link>
        <Link to="/upload" className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-center">
          Upload Study PDF
        </Link>
      </div>
    </div>
  )
}