import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, TrendingUp, TrendingDown, Activity, Target, Flame, Award,
  ArrowUp, ArrowDown, BookOpen, Brain, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { useTrades } from '../hooks/useTrades'
import { useAnalyticsSummary, useEquityCurve } from '../hooks/useAnalytics'
import { useTodayCheckin } from '../hooks/usePsychology'
import { useAccounts } from '../hooks/useAccounts'
import { Card, CardHeader, CardTitle } from '../components/shared/Card'
import { StatCard } from '../components/shared/StatCard'
import { Badge } from '../components/shared/Badge'
import { Button } from '../components/shared/Button'
import { EmptyState } from '../components/shared/EmptyState'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { ProgressBar } from '../components/shared/ProgressBar'
import { formatCurrency, getTradeColor, cn } from '../lib/utils'

function EquityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-surface2 border border-border rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-secondary mb-0.5">{label}</p>
      <p className={cn('text-sm font-mono font-semibold', val >= 0 ? 'text-accent' : 'text-danger')}>
        {formatCurrency(val)}
      </p>
    </div>
  )
}

function PulseDot({ cx, cy }) {
  if (!cx || !cy) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#00C896" stroke="#0A0A0F" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={5} fill="none" stroke="#00C896" strokeWidth={1.5} opacity={0.8}>
        <animate attributeName="r" from="5" to="14" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </g>
  )
}

function CheckinBanner({ checkin }) {
  if (!checkin) {
    return (
      <div className="bg-accent/8 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Daily check-in not completed</p>
            <p className="text-xs text-secondary mt-0.5">Complete your psychology check-in before trading today</p>
          </div>
        </div>
        <Link to="/psychology">
          <Button size="sm" variant="outline">Check in now</Button>
        </Link>
      </div>
    )
  }

  const configs = {
    GO:      { bg: 'bg-accent/8 border-accent/25',   Icon: TrendingUp,    iconColor: 'text-accent',  label: 'GO — Ready to trade',              textColor: 'text-accent' },
    CAUTION: { bg: 'bg-warning/8 border-warning/25', Icon: AlertTriangle, iconColor: 'text-warning', label: 'CAUTION — Consider reduced size',   textColor: 'text-warning' },
    NO_GO:   { bg: 'bg-danger/8 border-danger/25',   Icon: Activity,      iconColor: 'text-danger',  label: 'NO-GO — Consider sitting out today', textColor: 'text-danger' },
  }
  const cfg = configs[checkin.recommendation] ?? configs.GO
  const { Icon } = cfg

  return (
    <div className={cn('border rounded-xl p-4 flex items-center justify-between', cfg.bg)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg)}>
          <Icon className={cn('w-4 h-4', cfg.iconColor)} />
        </div>
        <div>
          <p className={cn('text-sm font-bold', cfg.textColor)}>{cfg.label}</p>
          <p className="text-xs text-secondary mt-0.5">
            Psychology score: {checkin.overallScore?.toFixed(1) ?? '—'}/10
          </p>
        </div>
      </div>
      <span className={cn('text-xs font-mono font-bold px-2.5 py-1 rounded-lg', cfg.bg, cfg.textColor)}>
        {checkin.recommendation?.replace('_', '-')}
      </span>
    </div>
  )
}

function AccountMiniCard({ account }) {
  const pnl = account.currentBalance - account.startingBalance
  const profitPct = Math.max(0, Math.min(100, (pnl / account.profitTarget) * 100))
  const drawdownUsed = Math.max(0, account.startingBalance - account.currentBalance)
  const drawdownPct  = Math.max(0, Math.min(100, 100 - (drawdownUsed / account.maxDrawdownValue) * 100))
  const ddColor = drawdownPct >= 60 ? 'bg-accent' : drawdownPct >= 30 ? 'bg-warning' : 'bg-danger'

  return (
    <Card className="min-w-[200px] flex-shrink-0">
      <p className="text-xs text-secondary truncate mb-0.5">{account.propFirmName || account.name}</p>
      <p className="text-sm font-semibold text-primary truncate mb-3">{account.name}</p>
      <p className={cn('text-xl font-mono font-bold mb-3', pnl >= 0 ? 'text-accent' : 'text-danger')}>
        {formatCurrency(account.currentBalance)}
      </p>
      <div className="space-y-2">
        <ProgressBar value={profitPct} label="Profit target" size="sm" color="bg-accent" />
        <ProgressBar value={drawdownPct} label="Drawdown" size="sm" colorClass={ddColor} />
      </div>
    </Card>
  )
}

function AchievementCard({ icon: Icon, label, value, subLabel, color = 'text-accent', bg = 'bg-accent/10' }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-secondary">{label}</p>
        <p className={cn('text-lg font-mono font-bold', color)}>{value}</p>
        {subLabel && <p className="text-xs text-secondary truncate">{subLabel}</p>}
      </div>
    </div>
  )
}

const PERIODS = ['7d', '30d', '90d', 'All']

export default function DashboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('30d')

  const { data: checkin }                       = useTodayCheckin()
  const { data: summary, isLoading: sLoading }  = useAnalyticsSummary(null, period)
  const { data: equityData, isLoading: eLoad }  = useEquityCurve(null, period)
  const { data: tradesData, isLoading: tLoad }  = useTrades({ limit: 10, page: 1 })
  const { data: accounts }                      = useAccounts()

  const recentTrades = tradesData?.trades ?? []
  const accountList  = accounts ?? []

  const totalPnl    = summary?.totalPnl    ?? 0
  const winRate     = summary?.winRate     ?? 0   // already 0-100 integer from API
  const avgRR       = summary?.avgRr       ?? summary?.avgRR ?? 0
  const totalTrades = summary?.totalTrades ?? 0
  const curStreak   = summary?.currentStreak ?? 0
  const bestRR      = summary?.bestRr      ?? summary?.bestRR ?? 0
  const winRatePct  = winRate.toFixed(0)          // already a percentage
  const equityPoints = equityData ?? []

  const profitTargetLine = accountList[0]?.profitTarget
    ? accountList[0].startingBalance + accountList[0].profitTarget : null
  const drawdownFloor = accountList[0]
    ? accountList[0].startingBalance - accountList[0].maxDrawdownValue : null

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'Trader'} 👋
          </h1>
          <p className="text-sm text-secondary mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')} · Here's your trading overview
          </p>
        </div>
        <Link to="/journal/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Log Trade</Button>
        </Link>
      </div>

      {/* GO/NO-GO banner */}
      <CheckinBanner checkin={checkin} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 h-24 animate-pulse" />
          ))
        ) : (
          <>
            <StatCard
              label={`P&L (${period})`}
              value={formatCurrency(totalPnl)}
              valueClassName={totalPnl >= 0 ? 'text-accent' : 'text-danger'}
            />
            <StatCard label="Win Rate" value={`${winRatePct}%`} />
            <StatCard label="Avg R:R"  value={`${avgRR.toFixed(2)}R`} />
            <StatCard label="Trades"   value={totalTrades} />
          </>
        )}
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-lg transition-colors',
                  period === p
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-secondary hover:text-primary hover:bg-surface2'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </CardHeader>

        {eLoad ? (
          <div className="h-52 flex items-center justify-center"><LoadingSpinner /></div>
        ) : equityPoints.length < 2 ? (
          <div className="h-52 flex items-center justify-center">
            <EmptyState icon={TrendingUp} title="No equity data yet" description="Log trades to see your equity curve" />
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityPoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00C896" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<EquityTooltip />} />
                {profitTargetLine && (
                  <ReferenceLine y={profitTargetLine} stroke="#00C896" strokeDasharray="4 4" strokeOpacity={0.4}
                    label={{ value: 'Target', fill: '#00C896', fontSize: 10, position: 'insideRight' }} />
                )}
                {drawdownFloor && (
                  <ReferenceLine y={drawdownFloor} stroke="#E74C3C" strokeDasharray="4 4" strokeOpacity={0.4}
                    label={{ value: 'Floor', fill: '#E74C3C', fontSize: 10, position: 'insideRight' }} />
                )}
                <Area type="monotone" dataKey="balance" stroke="#00C896" strokeWidth={2}
                  fill="url(#eqGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#00C896', stroke: '#0A0A0F', strokeWidth: 2 }} />
                {/* Pulse on latest point */}
                <Area type="monotone" dataKey="balance" stroke="none" fill="none"
                  dot={(props) => props.index === equityPoints.length - 1
                    ? <PulseDot key={props.index} cx={props.cx} cy={props.cy} />
                    : null
                  }
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Accounts + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accountList.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">Accounts</h2>
              <Link to="/accounts" className="text-xs text-accent hover:text-accent/80 transition-colors">View all →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {accountList.map(acc => <AccountMiniCard key={acc.id} account={acc} />)}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Streaks & Bests</h2>
          <div className="grid grid-cols-2 gap-3">
            <AchievementCard icon={Flame}  label="Win streak"   value={curStreak} subLabel={`${curStreak} in a row`} color="text-warning" bg="bg-warning/10" />
            <AchievementCard icon={Award}  label="Best R:R ever" value={bestRR ? `${bestRR.toFixed(2)}R` : '—'} />
          </div>
        </div>
      </div>

      {/* Quick actions (mobile) */}
      <div className="flex gap-3 lg:hidden">
        <Link to="/journal/new" className="flex-1">
          <Button className="w-full" leftIcon={<Plus className="w-4 h-4" />}>Log Trade</Button>
        </Link>
        <Link to="/psychology" className="flex-1">
          <Button variant="secondary" className="w-full" leftIcon={<Brain className="w-4 h-4" />}>Check-in</Button>
        </Link>
        <Link to="/checklist" className="flex-1">
          <Button variant="secondary" className="w-full" leftIcon={<BookOpen className="w-4 h-4" />}>Checklist</Button>
        </Link>
      </div>

      {/* Recent trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <Link to="/journal" className="text-xs text-accent hover:text-accent/80 transition-colors">View all →</Link>
        </CardHeader>

        {tLoad ? (
          <div className="flex items-center justify-center py-10"><LoadingSpinner /></div>
        ) : recentTrades.length === 0 ? (
          <EmptyState icon={Target} title="No trades yet" description="Log your first trade to see it here." />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  {['Date', 'Market', 'Session', 'Direction', 'Setup', 'R:R', 'P&L', 'Result'].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-medium text-secondary uppercase tracking-wider px-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTrades.map(t => (
                  <tr key={t.id} className="hover:bg-surface2/50 transition-colors">
                    <td className="py-3 px-5 text-secondary text-xs whitespace-nowrap">
                      {t.dateTime ? format(new Date(t.dateTime), 'MMM d, HH:mm') : '—'}
                    </td>
                    <td className="py-3 px-5 font-mono font-semibold text-primary">{t.market}</td>
                    <td className="py-3 px-5">
                      <Badge variant="gray" size="sm">{t.session}</Badge>
                    </td>
                    <td className="py-3 px-5">
                      {t.direction === 'LONG'
                        ? <span className="inline-flex items-center gap-1 text-accent text-xs font-medium"><ArrowUp className="w-3 h-3" /> Long</span>
                        : <span className="inline-flex items-center gap-1 text-danger text-xs font-medium"><ArrowDown className="w-3 h-3" /> Short</span>
                      }
                    </td>
                    <td className="py-3 px-5">
                      {t.setupGrade && (
                        <Badge variant={t.setupGrade === 'A_PLUS' ? 'green' : 'gray'} size="sm">
                          {t.setupGrade === 'A_PLUS' ? 'A+' : t.setupGrade}
                        </Badge>
                      )}
                    </td>
                    <td className={cn('py-3 px-5 font-mono text-xs', getTradeColor(t.rrAchieved))}>
                      {t.rrAchieved != null ? `${t.rrAchieved > 0 ? '+' : ''}${t.rrAchieved.toFixed(2)}R` : '—'}
                    </td>
                    <td className={cn('py-3 px-5 font-mono text-xs font-semibold', getTradeColor(t.pnl))}>
                      {t.pnl != null ? formatCurrency(t.pnl) : '—'}
                    </td>
                    <td className="py-3 px-5">
                      <Badge variant={t.result === 'WIN' ? 'green' : t.result === 'LOSS' ? 'red' : 'gray'} size="sm">
                        {t.result}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
