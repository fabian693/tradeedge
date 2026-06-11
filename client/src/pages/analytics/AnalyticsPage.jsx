import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  LineChart, Line, ReferenceLine, PieChart, Pie, Legend,
  ScatterChart, Scatter, ZAxis,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react'
import { useAnalyticsSummary, useEquityCurve } from '../../hooks/useAnalytics'
import { useTrades } from '../../hooks/useTrades'
import { useCheckinHistory } from '../../hooks/usePsychology'
import { useAccounts } from '../../hooks/useAccounts'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { StatCard } from '../../components/shared/StatCard'
import { Select } from '../../components/shared/Select'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatCurrency } from '../../lib/utils'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#8888AA' },
}

function BarTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  const v = payload[0]?.value
  return (
    <div className="bg-surface2 border border-border rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-secondary mb-1">{label}</p>
      <p className="text-sm font-mono font-semibold text-primary">{formatter ? formatter(v) : v}</p>
    </div>
  )
}

function PulseDot({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#00C896" stroke="#0A0A0F" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={5} fill="none" stroke="#00C896" strokeWidth={2}>
        <animate attributeName="r" from="5" to="12" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  )
}

// Derived analytics from trades array
function deriveStats(trades) {
  if (!trades?.length) return null
  const wins = trades.filter((t) => t.result === 'Win')
  const losses = trades.filter((t) => t.result === 'Loss')
  const winRate = (wins.length / trades.length) * 100
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const avgRR = trades.filter((t) => t.rr != null).reduce((s, t) => s + t.rr, 0) / Math.max(1, trades.filter((t) => t.rr != null).length)
  const bestRR = Math.max(...trades.map((t) => t.rr ?? 0))

  // Streak
  let streak = 0
  let best = 0
  for (let i = trades.length - 1; i >= 0; i--) {
    if (trades[i].result === 'Win') { streak++; best = Math.max(best, streak) } else break
  }

  // By session
  const sessions = ['London', 'NY']
  const bySession = sessions.map((s) => {
    const st = trades.filter((t) => t.session === s)
    return { session: s, winRate: st.length ? (st.filter((t) => t.result === 'Win').length / st.length) * 100 : 0, trades: st.length }
  })

  // By market
  const markets = ['NQ', 'ES']
  const byMarket = markets.map((m) => {
    const mt = trades.filter((t) => t.market === m)
    return { name: m, value: mt.length ? (mt.filter((t) => t.result === 'Win').length / mt.length) * 100 : 0, fill: m === 'NQ' ? '#00C896' : '#3B82F6' }
  })

  // By setup grade
  const grades = ['A+', 'A', 'B']
  const byGrade = grades.map((g) => {
    const gt = trades.filter((t) => t.setupGrade === g)
    return { grade: g, winRate: gt.length ? (gt.filter((t) => t.result === 'Win').length / gt.length) * 100 : 0, trades: gt.length }
  })

  // By confirmation combo
  const combos = {}
  trades.forEach((t) => {
    if (!t.confirmation1 || !t.confirmation2) return
    const key = `${t.confirmation1.split(' ')[0]}+${t.confirmation2.split(' ')[0]}`
    if (!combos[key]) combos[key] = { wins: 0, total: 0 }
    combos[key].total++
    if (t.result === 'Win') combos[key].wins++
  })
  const topCombos = Object.entries(combos)
    .map(([k, v]) => ({ combo: k, winRate: (v.wins / v.total) * 100, trades: v.total }))
    .sort((a, b) => b.trades - a.trades)
    .slice(0, 5)

  // Avg RR by session
  const rrBySession = sessions.map((s) => {
    const st = trades.filter((t) => t.session === s && t.rr != null)
    return { session: s, avgRR: st.length ? st.reduce((sum, t) => sum + t.rr, 0) / st.length : 0 }
  })

  return {
    winRate, totalPnl, avgRR, bestRR, streak, totalTrades: trades.length,
    bySession, byMarket, byGrade, topCombos, rrBySession,
    bestCombo: topCombos[0] ?? null,
    worstCombo: topCombos.length > 1 ? [...topCombos].sort((a, b) => a.winRate - b.winRate)[0] : null,
  }
}

// Weekly comparison
function weekStats(trades, weekStart) {
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
  const week = trades.filter((t) => {
    const d = new Date(t.tradeDate)
    return d >= weekStart && d < weekEnd
  })
  const wins = week.filter((t) => t.result === 'Win')
  return {
    trades: week.length,
    winRate: week.length ? (wins.length / week.length) * 100 : 0,
    pnl: week.reduce((s, t) => s + (t.pnl ?? 0), 0),
    avgRR: week.filter((t) => t.rr != null).reduce((s, t) => s + t.rr, 0) / Math.max(1, week.filter((t) => t.rr != null).length),
  }
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(null, period)
  const { data: equityData, isLoading: equityLoading } = useEquityCurve(null, period)
  const { data: tradesData } = useTrades({ limit: 500 })
  const { data: checkins } = useCheckinHistory(30)
  const { data: accounts } = useAccounts()

  const trades = tradesData?.trades ?? tradesData ?? []
  const stats = deriveStats(trades)

  // Equity curve: use API data or derive from trades
  const equity = equityData ?? (() => {
    let balance = accounts?.[0]?.startingBalance ?? 10000
    return trades
      .sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate))
      .map((t) => {
        balance += t.pnl ?? 0
        return { date: format(new Date(t.tradeDate), 'MMM d'), equity: balance }
      })
  })()

  const profitTarget = accounts?.[0]?.profitTarget
  const maxDrawdown = accounts?.[0]?.maxDrawdownValue

  // Psychology correlation
  const psychCorr = checkins?.map((c) => {
    const dayTrades = trades.filter((t) => {
      try { return format(new Date(t.tradeDate), 'yyyy-MM-dd') === format(new Date(c.createdAt), 'yyyy-MM-dd') } catch { return false }
    })
    const wr = dayTrades.length > 0 ? (dayTrades.filter((t) => t.result === 'Win').length / dayTrades.length) * 100 : null
    if (wr === null) return null
    return {
      score: c.score ?? 70,
      winRate: wr,
      level: c.recommendation ?? 'GO',
    }
  }).filter(Boolean) ?? []

  // This week vs last week
  const now = new Date()
  const thisWeekStart = new Date(now.getTime() - now.getDay() * 86400000)
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 86400000)
  const thisWeek = stats ? weekStats(trades, thisWeekStart) : null
  const lastWeek = stats ? weekStats(trades, lastWeekStart) : null

  if (summaryLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Analytics</h1>
          <p className="text-sm text-secondary mt-0.5">Deep dive into your trading performance</p>
        </div>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9 w-36">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="ytd">Year to date</option>
          <option value="all">All time</option>
        </Select>
      </div>

      {/* 6 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Trades" value={stats?.totalTrades ?? summary?.totalTrades ?? '—'} mono />
        <StatCard label="Win Rate" value={stats ? `${stats.winRate.toFixed(1)}%` : summary?.winRate ?? '—'} />
        <StatCard label="Avg R:R" value={stats ? `${stats.avgRR.toFixed(2)}R` : summary?.avgRR ?? '—'} />
        <StatCard
          label="Total P&L"
          value={stats ? formatCurrency(stats.totalPnl) : summary?.totalPnl ?? '—'}
          valueClassName={stats && stats.totalPnl >= 0 ? 'text-accent' : 'text-danger'}
        />
        <StatCard label="Win Streak" value={stats?.streak ?? '—'} />
        <StatCard label="Best R:R" value={stats ? `${stats.bestRR.toFixed(2)}R` : '—'} valueClassName="text-accent" />
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        {equityLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : equity.length === 0 ? (
          <EmptyState title="No data yet" description="Log trades to see your equity curve." />
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00C896" />
                    <stop offset="100%" stopColor="#00C896" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="date" tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [formatCurrency(v), 'Balance']} />
                {profitTarget && equity[0] && (
                  <ReferenceLine
                    y={(equity[0]?.equity ?? 0) + profitTarget}
                    stroke="#00C896"
                    strokeDasharray="5 5"
                    label={{ value: 'Target', fill: '#00C896', fontSize: 10, position: 'right' }}
                  />
                )}
                {maxDrawdown && equity[0] && (
                  <ReferenceLine
                    y={(equity[0]?.equity ?? 0) - maxDrawdown}
                    stroke="#E74C3C"
                    strokeDasharray="5 5"
                    label={{ value: 'Floor', fill: '#E74C3C', fontSize: 10, position: 'right' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#00C896"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#00C896', stroke: '#0A0A0F', strokeWidth: 2 }}
                />
                {equity.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="none"
                    dot={(props) => {
                      const isLast = props.index === equity.length - 1
                      if (!isLast) return <g key={props.key} />
                      return <PulseDot key={props.key} cx={props.cx} cy={props.cy} />
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {!stats ? (
        <EmptyState title="No trade data" description="Log your first trades to see performance analytics." />
      ) : (
        <>
          {/* Performance section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Rate by Session */}
            <Card>
              <CardHeader><CardTitle>Win Rate by Session</CardTitle></CardHeader>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.bySession} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis dataKey="session" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                    <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                      {stats.bySession.map((d, i) => (
                        <Cell key={i} fill={d.winRate >= 50 ? '#00C896' : '#F5A623'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Win Rate by Market */}
            <Card>
              <CardHeader><CardTitle>Win Rate by Market</CardTitle></CardHeader>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.byMarket} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                      {stats.byMarket.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Legend formatter={(v) => <span style={{ color: '#8888AA', fontSize: 12 }}>{v}</span>} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v.toFixed(1)}%`, 'Win Rate']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Win Rate by Setup Grade */}
            <Card>
              <CardHeader><CardTitle>Win Rate by Setup Grade</CardTitle></CardHeader>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byGrade} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis dataKey="grade" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                    <Bar dataKey="winRate" fill="#00C896" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Avg RR by Session */}
            <Card>
              <CardHeader><CardTitle>Avg R:R by Session</CardTitle></CardHeader>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.rrBySession} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis dataKey="session" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip formatter={(v) => `${v.toFixed(2)}R`} />} />
                    <Bar dataKey="avgRR" fill="#F5A623" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Confirmation combos */}
          {stats.topCombos.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Win Rate by Confirmation Combo (Top 5)</CardTitle></CardHeader>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topCombos} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis dataKey="combo" tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
                    <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                      {stats.topCombos.map((d, i) => (
                        <Cell key={i} fill={d.winRate >= 60 ? '#00C896' : d.winRate >= 45 ? '#F5A623' : '#E74C3C'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Highlight cards */}
          {(stats.bestCombo || stats.worstCombo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.bestCombo && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-accent" />
                    <p className="text-sm font-semibold text-accent">Best Confirmation Pair</p>
                  </div>
                  <p className="text-2xl font-mono font-bold text-primary">{stats.bestCombo.combo}</p>
                  <p className="text-sm text-secondary mt-1">{stats.bestCombo.winRate.toFixed(1)}% win rate · {stats.bestCombo.trades} trades</p>
                </div>
              )}
              {stats.worstCombo && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-danger" />
                    <p className="text-sm font-semibold text-danger">Worst Confirmation Pair</p>
                  </div>
                  <p className="text-2xl font-mono font-bold text-primary">{stats.worstCombo.combo}</p>
                  <p className="text-sm text-secondary mt-1">{stats.worstCombo.winRate.toFixed(1)}% win rate · {stats.worstCombo.trades} trades</p>
                </div>
              )}
            </div>
          )}

          {/* Psychology correlation */}
          {psychCorr.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Psychology Score vs Win Rate</CardTitle>
              </CardHeader>
              <p className="text-xs text-secondary mb-4">Each dot = one trading day. Green = GO, Amber = CAUTION, Red = NO-GO.</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis type="number" dataKey="score" name="Psychology Score" domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Psychology Score', fill: '#8888AA', fontSize: 10, position: 'insideBottom', offset: -2 }} />
                    <YAxis type="number" dataKey="winRate" name="Win Rate" domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                      contentStyle={{ background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 12, fontSize: 12 }}
                      formatter={(v, name) => [name === 'Win Rate' ? `${v.toFixed(1)}%` : v, name]}
                    />
                    {psychCorr.length > 0 && (
                      <ReferenceLine
                        y={psychCorr.reduce((s, d) => s + d.winRate, 0) / psychCorr.length}
                        stroke="#8888AA"
                        strokeDasharray="4 4"
                      />
                    )}
                    <Scatter data={psychCorr.filter((d) => d.level === 'GO')} fill="#00C896" opacity={0.8} />
                    <Scatter data={psychCorr.filter((d) => d.level === 'CAUTION')} fill="#F5A623" opacity={0.8} />
                    <Scatter data={psychCorr.filter((d) => d.level === 'NO_GO')} fill="#E74C3C" opacity={0.8} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Weekly comparison */}
          {thisWeek && lastWeek && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'This Week', data: thisWeek, color: 'border-accent/30' },
                { label: 'Last Week', data: lastWeek, color: 'border-border' },
              ].map(({ label, data, color }) => (
                <Card key={label} className={`border ${color}`}>
                  <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'trades', label: 'Trades', fmt: (v) => v },
                      { key: 'winRate', label: 'Win Rate', fmt: (v) => `${v.toFixed(1)}%` },
                      { key: 'avgRR', label: 'Avg R:R', fmt: (v) => `${v.toFixed(2)}R` },
                      { key: 'pnl', label: 'P&L', fmt: (v) => formatCurrency(v) },
                    ].map(({ key, label: kl, fmt }) => (
                      <div key={key} className="bg-surface2 rounded-xl p-3">
                        <p className="text-xs text-secondary mb-1">{kl}</p>
                        <p className={`font-mono font-bold ${key === 'pnl' ? (data[key] >= 0 ? 'text-accent' : 'text-danger') : 'text-primary'}`}>
                          {fmt(data[key])}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
