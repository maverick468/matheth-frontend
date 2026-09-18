import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Matheth. All rights reserved.</p>
        <div className="flex space-x-6">
          <Link to="/faq" className="hover:text-slate-400 transition-colors">FAQ</Link>
          <Link to="/admin/login" className="hover:text-slate-400 transition-colors">Admin Portal</Link>
        </div>
      </div>
    </footer>
  )
}