import { cn } from '../../lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

const variants = {
  primary: 'bg-accent text-background hover:bg-accent/90 font-semibold shadow-lg shadow-accent/20',
  secondary: 'bg-surface2 text-primary border border-border hover:bg-border/60',
  danger: 'bg-danger text-white hover:bg-danger/85 font-semibold',
  ghost: 'text-secondary hover:text-primary hover:bg-surface2',
  outline: 'border border-accent text-accent hover:bg-accent/10',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-150 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
