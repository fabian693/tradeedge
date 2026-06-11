export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(value, currency = 'USD') {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value, decimals = 1) {
  if (value == null) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatRR(value) {
  if (value == null) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`
}

export function getTradeColor(pnl) {
  if (pnl > 0) return 'text-accent'
  if (pnl < 0) return 'text-danger'
  return 'text-secondary'
}

export function getPnlBg(pnl) {
  if (pnl > 0) return 'bg-accent/10 text-accent'
  if (pnl < 0) return 'bg-danger/10 text-danger'
  return 'bg-secondary/10 text-secondary'
}
