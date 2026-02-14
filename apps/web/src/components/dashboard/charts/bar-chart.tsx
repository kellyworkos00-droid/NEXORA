'use client'

interface BarChartProps {
  title: string
  data: { label: string; value: number }[]
  height?: number
}

export function BarChart({ title, data, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const barWidth = 540 / data.length

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

        {/* Bars */}
        {data.map((d, i) => {
          const x = 60 + i * barWidth + barWidth * 0.1
          const barH = (d.value / maxValue) * (height - 40)
          const y = height - barH
          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barH}
                fill="rgb(168, 85, 247)"
                rx="4"
                className="hover:opacity-80 transition-opacity"
              />
              <text x={x + barWidth * 0.4} y={height + 20} textAnchor="middle" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400">
                {d.label}
              </text>
            </g>
          )
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((i) => (
          <text key={`y-label-${i}`} x="45" y={height * (1 - i) + 4} textAnchor="end" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-400">
            {Math.round(i * maxValue)}
          </text>
        ))}
      </svg>
    </div>
  )
}
