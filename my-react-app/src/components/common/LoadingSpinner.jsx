import React from 'react'

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size] || sizes.md} border-slate-700 border-t-cyan-500 rounded-full animate-spin`} />
    </div>
  )
}