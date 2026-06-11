import { cn } from '../../lib/utils'

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-[3px]',
}

export function LoadingSpinner({ size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-transparent border-t-accent animate-spin',
        sizes[size] ?? sizes.md,
        className
      )}
    />
  )
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-secondary text-sm">Loading TradeEdge…</p>
      </div>
    </div>
  )
}
