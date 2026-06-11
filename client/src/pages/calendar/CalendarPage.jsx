import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday, parseISO,
} from 'date-fns'
import { useCalendar } from '../../hooks/useAnalytics'
import { useAccounts } from '../../hooks/useAccounts'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { Select } from '../../components/shared/Select'
import { Button } from '../../components/shared/Button'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { formatCurrency, cn } from '../../lib/utils'

export default function CalendarPage() {
  const [accountId, setAccountId] = useState('')
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const navigate = useNavigate()

  const { data: accounts } = useAccounts()
  const monthKey = format(cursor, 'yyyy-MM')
  const { data, isLoading } = useCalendar(accountId || undefined, monthKey)

  const dayMap = useMemo(() => {
    const map = {}
    for (const d of data?.days ?? []) map[d.date] = d
    return map
  }, [data])

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(cursor)
    const monthEnd = endOfMonth(cursor)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [cursor])

  const summary = data?.summary

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">Trading Calendar</h1>
          <p className="text-sm text-secondary mt-0.5">Daily P&amp;L at a glance</p>
        </div>
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} containerClassName="w-44" className="h-9">
          <option value="">All Accounts</option>
          {(accounts ?? []).map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCursor((c) => subMonths(c, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="!text-base !text-primary !normal-case !tracking-normal min-w-[140px] text-center">
              {format(cursor, 'MMMM yyyy')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCursor((c) => addMonths(c, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {summary && (
            <div className="flex items-center gap-4 text-sm">
              <span className={cn('font-mono font-semibold', summary.totalPnl > 0 ? 'text-success' : summary.totalPnl < 0 ? 'text-danger' : 'text-secondary')}>
                {formatCurrency(summary.totalPnl)}
              </span>
              <span className="text-secondary">{summary.totalTrades} trade{summary.totalTrades !== 1 ? 's' : ''}</span>
              <span className="text-secondary">{summary.tradingDays} trading day{summary.tradingDays !== 1 ? 's' : ''}</span>
            </div>
          )}
        </CardHeader>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-secondary uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
            {gridDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const entry = dayMap[key]
              const inMonth = isSameMonth(day, cursor)
              const pnl = entry?.pnl ?? 0
              const hasTrades = !!entry?.trades

              return (
                <button
                  key={key}
                  disabled={!hasTrades}
                  onClick={() => navigate(`/journal?date=${key}`)}
                  className={cn(
                    'aspect-square rounded-xl p-2 flex flex-col justify-between text-left transition-colors border',
                    !inMonth && 'opacity-30',
                    hasTrades
                      ? pnl > 0
                        ? 'bg-success/10 border-success/30 hover:bg-success/20 cursor-pointer'
                        : pnl < 0
                          ? 'bg-danger/10 border-danger/30 hover:bg-danger/20 cursor-pointer'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                      : 'bg-transparent border-transparent cursor-default',
                    isToday(day) && 'ring-1 ring-accent'
                  )}
                >
                  <span className={cn('text-xs font-medium', inMonth ? 'text-secondary' : 'text-secondary/50')}>
                    {format(day, 'd')}
                  </span>
                  {hasTrades && (
                    <div className="space-y-0.5">
                      <p className={cn('text-xs sm:text-sm font-mono font-semibold', pnl > 0 ? 'text-success' : pnl < 0 ? 'text-danger' : 'text-secondary')}>
                        {formatCurrency(pnl)}
                      </p>
                      <p className="text-[10px] text-secondary">{entry.trades} trade{entry.trades !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
