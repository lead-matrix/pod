import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isPositive }) => {
  return (
    <div className="glass-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
      <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
      {change && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span className="text-[10px] text-gray-600 font-medium">vs last month</span>
        </div>
      )}
    </div>
  )
}
