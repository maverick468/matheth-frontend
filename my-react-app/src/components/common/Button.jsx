import React from 'react'

export default function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) {
  const baseStyles = "px-4 py-2 font-bold rounded-lg transition-all focus:outline-none disabled:opacity-50 text-sm cursor-pointer"
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    danger: "bg-red-600 hover:bg-red-500 text-white"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  )
}