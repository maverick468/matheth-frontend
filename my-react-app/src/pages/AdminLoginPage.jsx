// frontend/src/pages/AdminLoginPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  // Fully hardcoded to prevent any .env file overrides
  const ADMIN_SECRET = 'admin321'

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (passcode.trim() === ADMIN_SECRET) {
      localStorage.setItem('isAdminAuthenticated', 'true')
      localStorage.setItem('adminPasscode', passcode.trim()) // Save passcode for API requests
      navigate('/admin/dashboard')
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-2 text-cyan-400">Admin Access</h2>
        <p className="text-sm text-slate-400 mb-6">Enter your admin passcode to access the curation dashboard.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 text-sm rounded-lg">
            Incorrect passcode. Please try again.
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input 
            type="password" 
            placeholder="Admin Passcode" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" 
            required 
          />
          <button type="submit" className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}