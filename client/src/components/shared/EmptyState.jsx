import { Button } from './Button'
import { cn } from '../../lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface2 border border-border flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-secondary" />
        </div>
      )}
      <h3 className="text-base font-semibold text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-secondary max-w-xs mb-6">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
