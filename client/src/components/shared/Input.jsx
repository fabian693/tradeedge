import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef(function Input(
  { label, error, hint, className, containerClassName, leftIcon, rightIcon, ...props },
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
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60',
            'h-10 px-3 transition-colors',
            'focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-danger/60 focus:border-danger/80 focus:ring-danger/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, containerClassName, rows = 4, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-xs font-medium text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60',
          'px-3 py-2.5 resize-y transition-colors',
          'focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger/60 focus:border-danger/80 focus:ring-danger/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  )
})
