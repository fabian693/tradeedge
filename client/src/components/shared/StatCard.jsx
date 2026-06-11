import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Card } from './Card'

export function StatCard({
  label,
  value,
  trend,
  trendLabel,
  suffix,
  mono = true,
  className,
  valueClassName,
}) {
  const trendPositive = trend > 0
  const trendNeutral = trend === 0 || trend == null

  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <p className="text-xs font-medium text-secondary uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span
          className={cn(
            'text-2xl font-semibold text-primary',
            mono && 'font-mono',
            valueClassName
          )}
        >
          {value}
          {suffix && <span className="text-base text-secondary ml-1">{suffix}</span>}
        </span>
        {trend != null && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium pb-0.5',
              trendNeutral
                ? 'text-secondary'
                : trendPositive
                ? 'text-accent'
                : 'text-danger'
            )}
          >
            {trendNeutral ? (
              <Minus className="w-3 h-3" />
            ) : trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendLabel ?? `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
    </Card>
  )
}
