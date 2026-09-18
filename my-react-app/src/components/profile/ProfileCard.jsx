import React from 'react'

export default function ProfileCard({ user = { username: 'Player One', email: 'player@matheth.app', avatar: null } }) {
  return (
    <div className="flex flex-col items-center p-6 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full text-center">
      <div className="w-20 h-20 bg-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-950 text-2xl font-bold shadow-md">
        {user.avatar ? (
          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
        ) : (
          user.username ? user.username.charAt(0).toUpperCase() : 'U'
        )}
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{user.username}</h3>
      <p className="text-slate-400 text-sm">{user.email}</p>
    </div>
  )
}