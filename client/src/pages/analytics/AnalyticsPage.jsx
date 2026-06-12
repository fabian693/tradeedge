import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  LineChart, Line, ReferenceLine, PieChart, Pie, Legend,
  ScatterChart, Scatter, ZAxis, LabelList,
} from 'recharts'
import { Award, AlertCircle } from 'lucide-react'
import {
  useAnalyticsSummary, useEquityCurve, useWinRateBySession, useWinRateByMarket,
  useWinRateByGrade, useWinRateByConfirmation, usePsychologyCorrelation, useWeeklyComparison,
} from '../../hooks/useAnalytics'
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
  itemStyle: { color: '#FFFFFF' },
}

const PCT_LABEL = { fill: '#FFFFFF', fontSize: 11, fontWeight: 600 }

const SESSION_LABELS = { LONDON: 'London', NY: 'NY' }
const GRADE_LABELS = { A_PLUS: 'A+', A: 'A', B: 'B' }
const RESULT_COLORS = { WIN: '#00C896', LOSS: '#E74C3C', BREAKEVEN: '#8888AA' }

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

const RADIAN = Math.PI / 180
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }) {
  if (!value) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${value}%`}
    </text>
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

export default function AnalyticsPage() {
  const [accountId, setAccountId] = useState('')

  const { data: accounts } = useAccounts()
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(accountId || undefined)
  const { data: equity, isLoading: equityLoading } = useEquityCurve(accountId || undefined)
  const { data: bySession } = useWinRateBySession(accountId || undefined)
  const { data: byMarket } = useWinRateByMarket(accountId || undefined)
  const { data: byGrade } = useWinRateByGrade(accountId || undefined)
  const { data: byConfirmation } = useWinRateByConfirmation(accountId || undefined)
  const { data: psychCorr } = usePsychologyCorrelation(accountId || undefined)
  const { data: weekly } = useWeeklyComparison(accountId || undefined)

  const hasTrades = (summary?.totalTrades ?? 0) > 0

  const selectedAccount = accounts?.find((a) => a.id === accountId)
  const profitTarget = selectedAccount?.profitTarget
  const maxDrawdown = selectedAccount?.drawdownValue

  const sessionData = (bySession ?? []).map((d) => ({ ...d, label: SESSION_LABELS[d.session] ?? d.session }))
  const gradeData = (byGrade ?? []).map((d) => ({ ...d, label: GRADE_LABELS[d.grade] ?? d.grade }))
  const marketData = (byMarket ?? []).map((d) => ({
    name: d.market,
    value: d.winRate,
    fill: d.market === 'NQ' ? '#00C896' : '#3B82F6',
  }))
  const topCombos = (byConfirmation ?? [])
    .filter((d) => d.combo !== 'None')
    .sort((a, b) => b.trades - a.trades)
    .slice(0, 5)
  const bestCombo = topCombos[0] ?? null
  const worstCombo = topCombos.length > 1 ? [...topCombos].sort((a, b) => a.winRate - b.winRate)[0] : null

  const psychPoints = (psychCorr ?? []).filter((p) => p.psychologyScore != null && p.rrAchieved != null)

  if (summaryLoading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">Analytics</h1>
          <p className="text-sm text-secondary mt-0.5">Deep dive into your trading performance</p>
        </div>
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} containerClassName="w-44" className="h-9">
          <option value="">All Accounts</option>
          {(accounts ?? []).map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </div>

      {/* 6 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Trades" value={summary?.totalTrades ?? '—'} mono />
        <StatCard label="Win Rate" value={summary ? `${summary.winRate}%` : '—'} />
        <StatCard label="Avg R:R" value={summary ? `${summary.avgRr.toFixed(2)}R` : '—'} />
        <StatCard
          label="Total P&L"
          value={summary ? formatCurrency(summary.totalPnl) : '—'}
          valueClassName={summary && summary.totalPnl >= 0 ? 'text-accent' : 'text-danger'}
        />
        <StatCard label="Win Streak" value={summary?.currentStreak ?? '—'} />
        <StatCard label="Best R:R" value={summary ? `${summary.bestRr.toFixed(2)}R` : '—'} valueClassName="text-accent" />
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        {equityLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : !equity?.length ? (
          <EmptyState title="No data yet" description="Log trades with $ P&L to see your equity curve." />
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="date" tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [formatCurrency(v), 'P&L']} />
                {profitTarget && equity[0] && (
                  <ReferenceLine
                    y={(equity[0]?.balance ?? 0) + profitTarget}
                    stroke="#00C896"
                    strokeDasharray="5 5"
                    label={{ value: 'Target', fill: '#00C896', fontSize: 10, position: 'right' }}
                  />
                )}
                {maxDrawdown && equity[0] && (
                  <ReferenceLine
                    y={(equity[0]?.balance ?? 0) - maxDrawdown}
                    stroke="#E74C3C"
                    strokeDasharray="5 5"
                    label={{ value: 'Floor', fill: '#E74C3C', fontSize: 10, position: 'right' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#00C896"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#00C896', stroke: '#0A0A0F', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="none"
                  dot={(props) => {
                    const isLast = props.index === equity.length - 1
                    if (!isLast) return <g key={props.key} />
                    return <PulseDot key={props.key} cx={props.cx} cy={props.cy} />
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {!hasTrades ? (
        <EmptyState title="No trade data" description="Log your first trades to see performance analytics." />
      ) : (
        <>
          {/* Performance section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Rate by Session */}
            <Card>
              <CardHeader><CardTitle>Win Rate by Session</CardTitle></CardHeader>
              {sessionData.length === 0 ? (
                <EmptyState title="No data" description="No completed trades yet." />
              ) : (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData} margin={{ top: 16, right: 16, left: -30, bottom: 0 }} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<BarTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="winRate" radius={[6, 6, 0, 0]} maxBarSize={64}>
                        {sessionData.map((d, i) => (
                          <Cell key={i} fill={d.winRate >= 50 ? '#00C896' : '#F5A623'} />
                        ))}
                        <LabelList dataKey="winRate" position="top" formatter={(v) => `${v}%`} style={PCT_LABEL} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Win Rate by Market */}
            <Card>
              <CardHeader><CardTitle>Win Rate by Market</CardTitle></CardHeader>
              {marketData.length === 0 ? (
                <EmptyState title="No data" description="No completed trades yet." />
              ) : (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        label={renderPieLabel}
                        labelLine={false}
                      >
                        {marketData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        height={24}
                        formatter={(v) => <span style={{ color: '#8888AA', fontSize: 12 }}>{v}</span>}
                      />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Win Rate']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Win Rate by Setup Grade */}
            <Card>
              <CardHeader><CardTitle>Win Rate by Setup Grade</CardTitle></CardHeader>
              {gradeData.length === 0 ? (
                <EmptyState title="No data" description="No completed trades yet." />
              ) : (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeData} margin={{ top: 16, right: 16, left: -30, bottom: 0 }} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<BarTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="winRate" fill="#00C896" radius={[6, 6, 0, 0]} maxBarSize={64}>
                        <LabelList dataKey="winRate" position="top" formatter={(v) => `${v}%`} style={PCT_LABEL} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Avg RR by Session */}
            <Card>
              <CardHeader><CardTitle>Avg R:R by Session</CardTitle></CardHeader>
              {sessionData.length === 0 ? (
                <EmptyState title="No data" description="No completed trades yet." />
              ) : (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData} margin={{ top: 16, right: 16, left: -30, bottom: 0 }} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#8888AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<BarTooltip formatter={(v) => `${v.toFixed(2)}R`} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="avgRr" fill="#F5A623" radius={[6, 6, 0, 0]} maxBarSize={64}>
                        <LabelList dataKey="avgRr" position="top" formatter={(v) => `${v.toFixed(2)}R`} style={PCT_LABEL} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Confirmation combos */}
          {topCombos.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Win Rate by Confirmation Combo (Top 5)</CardTitle></CardHeader>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCombos} margin={{ top: 16, right: 16, left: -30, bottom: 0 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                    <XAxis dataKey="combo" tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="winRate" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {topCombos.map((d, i) => (
                        <Cell key={i} fill={d.winRate >= 60 ? '#00C896' : d.winRate >= 45 ? '#F5A623' : '#E74C3C'} />
                      ))}
                      <LabelList dataKey="winRate" position="top" formatter={(v) => `${v}%`} style={PCT_LABEL} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Highlight cards */}
          {(bestCombo || worstCombo) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bestCombo && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-accent" />
                    <p className="text-sm font-semibold text-accent">Best Confirmation Pair</p>
                  </div>
                  <p className="text-2xl font-mono font-bold text-primary">{bestCombo.combo}</p>
                  <p className="text-sm text-secondary mt-1">{bestCombo.winRate}% win rate · {bestCombo.trades} trades</p>
                </div>
              )}
              {worstCombo && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-danger" />
                    <p className="text-sm font-semibold text-danger">Worst Confirmation Pair</p>
                  </div>
                  <p className="text-2xl font-mono font-bold text-primary">{worstCombo.combo}</p>
                  <p className="text-sm text-secondary mt-1">{worstCombo.winRate}% win rate · {worstCombo.trades} trades</p>
                </div>
              )}
            </div>
          )}

          {/* Psychology correlation */}
          {psychPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Psychology Score vs R-Multiple</CardTitle>
              </CardHeader>
              <p className="text-xs text-secondary mb-4">Each dot = one trade. Green = Win, Red = Loss, Gray = Breakeven.</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis type="number" dataKey="psychologyScore" name="Psychology Score" domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Psychology Score', fill: '#8888AA', fontSize: 10, position: 'insideBottom', offset: -2 }} />
                    <YAxis type="number" dataKey="rrAchieved" name="R-Multiple" tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                      contentStyle={{ background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: '#8888AA' }}
                      itemStyle={{ color: '#FFFFFF' }}
                      formatter={(v, name) => [name === 'R-Multiple' ? `${v.toFixed(2)}R` : v, name]}
                    />
                    <ReferenceLine y={0} stroke="#8888AA" strokeDasharray="4 4" />
                    {['WIN', 'LOSS', 'BREAKEVEN'].map((r) => (
                      <Scatter key={r} data={psychPoints.filter((p) => p.result === r)} fill={RESULT_COLORS[r]} opacity={0.8} />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Weekly comparison */}
          {weekly?.thisWeek && weekly?.lastWeek && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'This Week', data: weekly.thisWeek, color: 'border-accent/30' },
                { label: 'Last Week', data: weekly.lastWeek, color: 'border-border' },
              ].map(({ label, data, color }) => (
                <Card key={label} className={`border ${color}`}>
                  <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'totalTrades', label: 'Trades', fmt: (v) => v },
                      { key: 'winRate', label: 'Win Rate', fmt: (v) => `${v}%` },
                      { key: 'avgRr', label: 'Avg R:R', fmt: (v) => `${v.toFixed(2)}R` },
                      { key: 'totalPnl', label: 'P&L', fmt: (v) => formatCurrency(v) },
                    ].map(({ key, label: kl, fmt }) => (
                      <div key={key} className="bg-surface2 rounded-xl p-3">
                        <p className="text-xs text-secondary mb-1">{kl}</p>
                        <p className={`font-mono font-bold ${key === 'totalPnl' ? (data[key] >= 0 ? 'text-accent' : 'text-danger') : 'text-primary'}`}>
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
