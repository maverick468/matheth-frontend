import React from 'react'

export default function LeaderboardFilters({ activeFilter = 'global', onFilterChange }) {
  const filters = [
    { id: 'global', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
  ]

  return (
    <div className="flex space-x-2 bg-slate-900 p-1.5 border border-slate-800 rounded-xl mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange && onFilterChange(filter.id)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeFilter === filter.id
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}