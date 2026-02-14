'use client'

interface LineChartProps {
  title: string
  data: { label: string; value: number }[]
  height?: number
}

export function LineChart({ title, data, height = 300 }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = 0
  const range = maxValue - minValue

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <svg width="100%" height={height} viewBox={`0 0 600 ${height}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((i) => (
          <line
            key={`grid-${i}`}
            x1="60"
            y1={height * (1 - i)}
            x2="600"
            y2={height * (1 - i)}
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:text-slate-700"
            opacity="0.5"
          />
        ))}

        {/* Axes */}
        <line x1="60" y1="0" x2="60" y2={height} stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-slate-600" />
        <line x1="60" y1={height} x2="600" y2={height} stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-slate-600" />

        {/* Line chart */}
        <polyline
          points={data
            .map((d, i) => {
              const x = 60 + (i / (data.length - 1)) * 540
              const y = height - ((d.value - minValue) / range) * (height - 20)
              return `${x},${y}`
            })
            .join(' ')}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {data.map((d, i) => {
          const x = 60 + (i / (data.length - 1)) * 540
          const y = height - ((d.value - minValue) / range) * (height - 20)
          return (
            <g key={`point-${i}`}>
              <circle cx={x} cy={y} r="4" fill="rgb(168, 85, 247)" />
              <circle cx={x} cy={y} r="8" fill="rgb(168, 85, 247)" opacity="0" className="hover:opacity-20" />
            </g>
          )
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null
          const x = 60 + (i / (data.length - 1)) * 540
          return (
            <text key={`label-${i}`} x={x} y={height + 20} textAnchor="middle" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400">
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
