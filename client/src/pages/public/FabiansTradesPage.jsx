import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import {
  ArrowRight, ArrowUp, ArrowDown, Zap, Radio, Lock,
} from 'lucide-react'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { LogoIcon } from '../../components/shared/Logo'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { useAuth } from '../../hooks/useAuth'
import { usePublicTrades, useLiveTrades } from '../../hooks/usePublicTrades'
import { formatCurrency, cn } from '../../lib/utils'

const RESULT_LABEL = { WIN: 'Win', LOSS: 'Loss', BREAKEVEN: 'BE' }
const RESULT_BADGE = { WIN: 'green', LOSS: 'red', BREAKEVEN: 'gray' }
const SESSION_LABEL = { LONDON: 'London', NY: 'NY' }

function TradeRow({ trade }) {
  const isLong = trade.direction === 'LONG'
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('p-2 rounded-lg', isLong ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
          {isLong ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">
            {trade.market} · {isLong ? 'Long' : 'Short'}
            {trade.setupGrade && <span className="text-secondary"> · {trade.setupGrade.replace('_PLUS', '+')}</span>}
          </p>
          <p className="text-xs text-secondary truncate">
            {format(parseISO(trade.dateTime), 'EEE d MMM, HH:mm')} · {SESSION_LABEL[trade.session] ?? trade.session}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        {trade.result && <Badge variant={RESULT_BADGE[trade.result] ?? 'gray'}>{RESULT_LABEL[trade.result] ?? trade.result}</Badge>}
        {trade.pnl != null && (
          <p className={cn('text-sm font-mono font-semibold mt-1', trade.pnl > 0 ? 'text-success' : trade.pnl < 0 ? 'text-danger' : 'text-secondary')}>
            {formatCurrency(trade.pnl)}
          </p>
        )}
        {trade.rrAchieved != null && (
          <p className="text-xs text-secondary font-mono">{trade.rrAchieved.toFixed(2)}R</p>
        )}
      </div>
    </div>
  )
}

function LiveSection() {
  const { user, isAuthenticated } = useAuth()
  const isPro = user?.tier === 'PRO'
  const { data, isLoading, error } = useLiveTrades(isAuthenticated && isPro)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-accent" />
          <CardTitle className="!text-primary !text-base !normal-case !tracking-normal">Live Feed</CardTitle>
        </div>
        {isAuthenticated && isPro && (
          <span className="flex items-center gap-1.5 text-xs text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        )}
      </CardHeader>

      {!isAuthenticated || !isPro ? (
        <div className="bg-accent/8 border border-accent/20 rounded-2xl p-6 text-center space-y-3">
          <Lock className="w-6 h-6 text-accent mx-auto" />
          <p className="text-sm text-primary font-medium">Get notified the moment a trade goes live</p>
          <p className="text-xs text-secondary">
            PRO members see today's trades in real-time, with instant notifications when a new trade is logged.
          </p>
          {!isAuthenticated ? (
            <Link to="/register">
              <Button className="w-full" leftIcon={<Zap className="w-4 h-4" />}>
                Create a free account
              </Button>
            </Link>
          ) : (
            <Button className="w-full" leftIcon={<Zap className="w-4 h-4" />} onClick={() => toast('Stripe integration coming soon!')}>
              Upgrade to Pro: £20/month
            </Button>
          )}
        </div>
      ) : isLoading ? (
        <div className="py-10 flex justify-center"><LoadingSpinner /></div>
      ) : error ? (
        <p className="text-sm text-secondary text-center py-6">Live feed unavailable right now.</p>
      ) : !data?.trades?.length ? (
        <p className="text-sm text-secondary text-center py-6">No trades yet today — check back soon.</p>
      ) : (
        <div className="space-y-2">
          {data.trades.map((t) => <TradeRow key={t.id} trade={t} />)}
        </div>
      )}
    </Card>
  )
}

export default function FabiansTradesPage() {
  const { data, isLoading } = usePublicTrades()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoIcon className="w-8 h-8" />
            <span className="text-lg font-bold tracking-tight text-primary">TradeEdge</span>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>Sign in</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Fabian's Trades</h1>
          <p className="text-sm text-secondary mt-1">
            Follow along with real trades — free viewers see last week's activity (delayed), PRO members get a live feed.
          </p>
        </div>

        <LiveSection />

        <Card>
          <CardHeader>
            <CardTitle className="!text-primary !text-base !normal-case !tracking-normal">Last 7 Days</CardTitle>
            <Badge variant="gray">Delayed</Badge>
          </CardHeader>

          {isLoading ? (
            <div className="py-10 flex justify-center"><LoadingSpinner /></div>
          ) : !data?.trader ? (
            <EmptyState title="No public trades yet" description="Check back soon." />
          ) : !data?.trades?.length ? (
            <p className="text-sm text-secondary text-center py-6">No public trades from {data.trader.name} in the last 7 days.</p>
          ) : (
            <div className="space-y-2">
              {data.trades.map((t) => <TradeRow key={t.id} trade={t} />)}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
