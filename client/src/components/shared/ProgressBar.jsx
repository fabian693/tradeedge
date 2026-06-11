import { cn } from '../../lib/utils'

function getBarColor(value) {
  if (value >= 70) return 'bg-accent'
  if (value >= 40) return 'bg-warning'
  return 'bg-danger'
}

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showLabel = true,
  colorAuto = true,
  color,
  className,
  size = 'md',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const barColor = color ?? (colorAuto ? getBarColor(pct) : 'bg-accent')

  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-secondary">{label}</span>}
          {showLabel && (
            <span className="text-xs font-mono text-secondary ml-auto">{pct.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-surface2 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
