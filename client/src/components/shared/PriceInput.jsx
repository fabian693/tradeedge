import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const PriceInput = forwardRef(function PriceInput(
  { label, error, hint, className, containerClassName, currency = '$', ...props },
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary font-mono">
          {currency}
        </span>
        <input
          ref={ref}
          type="number"
          step="0.01"
          className={cn(
            'w-full bg-surface2 border border-border rounded-lg text-sm text-primary',
            'h-10 pl-7 pr-3 font-mono transition-colors',
            'focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            error && 'border-danger/60',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  )
})
