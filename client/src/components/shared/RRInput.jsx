import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const RRInput = forwardRef(function RRInput(
  { label, error, hint, className, containerClassName, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-xs font-medium text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type="number"
          step="0.1"
          min="0"
          className={cn(
            'w-full bg-surface2 border border-border rounded-lg text-sm text-primary',
            'h-10 pl-3 pr-7 font-mono transition-colors',
            'focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            error && 'border-danger/60',
            className
          )}
          {...props}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary font-mono">
          R
        </span>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  )
})
