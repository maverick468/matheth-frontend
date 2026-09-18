import React from 'react'

export default function ErrorMessage({ message, className = '' }) {
  if (!message) return null

  return (
    <div className={`p-4 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-xl ${className}`}>
      {message}
    </div>
  )
}