import { cn } from '../../lib/utils'

const variants = {
  green: 'bg-accent/15 text-accent border-accent/30',
  amber: 'bg-warning/15 text-warning border-warning/30',
  red: 'bg-danger/15 text-danger border-danger/30',
  gray: 'bg-secondary/15 text-secondary border-secondary/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

export function Badge({ children, variant = 'gray', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        variants[variant] ?? variants.gray,
        className
      )}
    >
      {children}
    </span>
  )
}
