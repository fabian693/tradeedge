import { useState } from 'react'
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, AlertTriangle, Award, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { queryClient } from '../../lib/queryClient'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { StatCard } from '../../components/shared/StatCard'
import { Button } from '../../components/shared/Button'
import { Textarea } from '../../components/shared/Input'
import { Badge } from '../../components/shared/Badge'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatCurrency, formatRR, cn } from '../../lib/utils'

const schema = z.object({
  whatWorked: z.string().min(1, 'Required'),
  whatToImprove: z.string().min(1, 'Required'),
  nextWeekGoal: z.string().min(1, 'Required'),
  followedRoutine: z.enum(['YES', 'MOSTLY', 'NO']),
  weekGrade: z.enum(['A', 'B', 'C', 'D']),
})

function GradeButton({ value, current, onChange, colorClass }) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'flex-1 py-3 rounded-xl text-sm font-bold transition-all border',
        active
          ? `${colorClass} border-transparent shadow-lg`
          : 'bg-surface2 text-secondary border-border hover:text-primary'
      )}
    >
      {value}
    </button>
  )
}

function OptionButton({ value, label, current, onChange }) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border',
        active
          ? 'bg-accent text-background border-transparent'
          : 'bg-surface2 text-secondary border-border hover:text-primary'
      )}
    >
      {label}
    </button>
  )
}

function PastReview({ review }) {
  const [open, setOpen] = useState(false)
  const weekStart = new Date(review.weekStartDate)
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  const gradeColor = {
    A: 'text-accent',
    B: 'text-blue-400',
    C: 'text-warning',
    D: 'text-danger',
  }[review.weekGrade] ?? 'text-secondary'

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface2/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-secondary" />
          <span className="text-sm text-primary">
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-lg font-bold font-mono', gradeColor)}>{review.weekGrade}</span>
          <span className={cn('text-sm font-mono', review.totalPnl >= 0 ? 'text-accent' : 'text-danger')}>
            {formatCurrency(review.totalPnl)}
          </span>
          {open ? <ChevronLeft className="w-4 h-4 text-secondary rotate-90" /> : <ChevronRight className="w-4 h-4 text-secondary -rotate-90" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border space-y-4">
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="text-center">
              <p className="text-xs text-secondary">Trades</p>
              <p className="text-lg font-mono font-bold text-primary">{review.totalTrades}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-secondary">Win Rate</p>
              <p className="text-lg font-mono font-bold text-primary">{(review.winRate * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-secondary">Avg RR</p>
              <p className="text-lg font-mono font-bold text-primary">{formatRR(review.avgRr)}</p>
            </div>
          </div>
          {review.whatWorked && (
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider mb-1">What worked</p>
              <p className="text-sm text-primary/90">{review.whatWorked}</p>
            </div>
          )}
          {review.whatToImprove && (
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider mb-1">To improve</p>
              <p className="text-sm text-primary/90">{review.whatToImprove}</p>
            </div>
          )}
          {review.nextWeekGoal && (
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider mb-1">Goal</p>
              <p className="text-sm text-primary/90">{review.nextWeekGoal}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WeeklyReviewPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const isCurrentWeek = weekOffset === 0

  const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const weekStartISO = format(weekStart, 'yyyy-MM-dd')

  // Fetch current week's auto-populated stats
  const { data: weekStats, isLoading: statsLoading } = useQuery({
    queryKey: ['weekly-review', 'stats', weekStartISO],
    queryFn: async () => {
      const { data } = await api.get(`/weekly-reviews/current?weekStart=${weekStartISO}`)
      return data?.stats ?? data
    },
  })

  // Fetch existing review for this week (if saved)
  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ['weekly-review', weekStartISO],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/weekly-reviews/current?weekStart=${weekStartISO}`)
        return data?.existingReview ?? null
      } catch { return null }
    },
  })

  // Fetch all past reviews
  const { data: allReviews } = useQuery({
    queryKey: ['weekly-reviews'],
    queryFn: async () => {
      const { data } = await api.get('/weekly-reviews?limit=20')
      return data?.reviews ?? []
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      whatWorked: existingReview?.whatWorked ?? '',
      whatToImprove: existingReview?.whatToImprove ?? '',
      nextWeekGoal: existingReview?.nextWeekGoal ?? '',
      followedRoutine: existingReview?.followedRoutine ?? 'YES',
      weekGrade: existingReview?.weekGrade ?? 'B',
    },
  })

  const followedRoutine = watch('followedRoutine')
  const weekGrade = watch('weekGrade')

  const saveMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        weekStartDate: weekStartISO,
        ...(weekStats ?? {}),
      }
      if (existingReview?.id) {
        const { data } = await api.put(`/weekly-reviews/${existingReview.id}`, payload)
        return data
      }
      const { data } = await api.post('/weekly-reviews', payload)
      return data
    },
    onSuccess: () => {
      toast.success('Weekly review saved!')
      queryClient.invalidateQueries({ queryKey: ['weekly-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-review', weekStartISO] })
    },
    onError: () => toast.error('Failed to save review'),
  })

  const isLoading = statsLoading || reviewLoading
  const stats = weekStats ?? {}

  const winRatePct = stats.winRate != null ? (stats.winRate).toFixed(0) : '—'
  const avgRrDisplay = stats.avgRr != null ? `${stats.avgRr.toFixed(2)}R` : '—'
  const pnlDisplay = stats.totalPnl != null ? formatCurrency(stats.totalPnl) : '—'
  const pnlPositive = (stats.totalPnl ?? 0) >= 0

  const pastReviews = (allReviews ?? []).filter(r => r.weekStartDate !== weekStartISO)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Weekly Review</h1>
          <p className="text-sm text-secondary mt-0.5">
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            {isCurrentWeek && <span className="ml-2 text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">This week</span>}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface2 transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 rounded-lg text-xs text-secondary hover:text-primary hover:bg-surface2 transition-colors"
            >
              This week
            </button>
          )}
          <button
            onClick={() => setWeekOffset(o => Math.max(0, o - 1))}
            disabled={isCurrentWeek}
            className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface2 disabled:opacity-30 transition-colors"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Auto-populated stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Week P&L"
              value={pnlDisplay}
              valueClassName={pnlPositive ? 'text-accent' : 'text-danger'}
            />
            <StatCard label="Win Rate" value={`${winRatePct}%`} />
            <StatCard label="Avg R:R" value={avgRrDisplay} />
            <StatCard label="Trades" value={stats.totalTrades ?? '—'} />
          </div>

          {/* Highlights row */}
          {(stats.bestTrade || stats.ruleViolations > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.bestTrade && (
                <Card className="border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-accent" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Best Trade</p>
                  </div>
                  <p className="text-sm text-primary">
                    {stats.bestTrade.market} {stats.bestTrade.direction} — {stats.bestTrade.rrAchieved?.toFixed(2)}R
                  </p>
                  <p className="text-xs text-secondary mt-1">{stats.bestTrade.session} session</p>
                </Card>
              )}
              {stats.ruleViolations > 0 && (
                <Card className="border-danger/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Rule Violations</p>
                  </div>
                  <p className="text-2xl font-mono font-bold text-danger">{stats.ruleViolations}</p>
                  <p className="text-xs text-secondary mt-1">this week</p>
                </Card>
              )}
              {stats.avgPsychologyScore != null && (
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Avg Psychology</p>
                  <p className="text-2xl font-mono font-bold text-primary">{stats.avgPsychologyScore?.toFixed(1)}</p>
                  <p className="text-xs text-secondary mt-1">/ 10</p>
                </Card>
              )}
            </div>
          )}

          {/* No trades this week */}
          {(stats.totalTrades === 0 || stats.totalTrades == null) && (
            <Card>
              <EmptyState
                icon={TrendingUp}
                title="No trades this week"
                description="Log your trades in the Journal and they'll appear here automatically."
              />
            </Card>
          )}

          {/* Written review form */}
          <form onSubmit={handleSubmit(v => saveMutation.mutate(v))} className="space-y-5">
            <Card>
              <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-5 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Written Review
              </h2>

              <div className="space-y-5">
                <Textarea
                  label="What worked well this week?"
                  placeholder="Describe the setups, executions, or decisions that went right. Be specific — 'the London IFVG with SMT at PDH' is better than 'entries were good'."
                  rows={3}
                  error={errors.whatWorked?.message}
                  {...register('whatWorked')}
                />

                <Textarea
                  label="What to improve next week?"
                  placeholder="Honest reflection on mistakes, missed trades, or poor decisions. What will you do differently?"
                  rows={3}
                  error={errors.whatToImprove?.message}
                  {...register('whatToImprove')}
                />

                <Textarea
                  label="One specific goal for next week"
                  placeholder="Not 'trade better' — something measurable. E.g. 'Wait for both confirmations every time, even if the first fires perfectly.'"
                  rows={2}
                  error={errors.nextWeekGoal?.message}
                  {...register('nextWeekGoal')}
                />

                {/* Followed routine */}
                <div>
                  <p className="text-sm font-medium text-primary mb-3">
                    Did you follow your pre-killzone routine every session?
                  </p>
                  <div className="flex gap-2">
                    {[
                      { value: 'YES', label: 'Yes, every session' },
                      { value: 'MOSTLY', label: 'Mostly' },
                      { value: 'NO', label: 'No, I skipped' },
                    ].map(o => (
                      <OptionButton
                        key={o.value}
                        value={o.value}
                        label={o.label}
                        current={followedRoutine}
                        onChange={v => setValue('followedRoutine', v)}
                      />
                    ))}
                  </div>
                </div>

                {/* Week grade */}
                <div>
                  <p className="text-sm font-medium text-primary mb-1">Overall week grade</p>
                  <p className="text-xs text-secondary mb-3">A = 80%+ rule adherence · B = 70–79% · C = 60–69% · D = below 60%</p>
                  <div className="flex gap-2">
                    <GradeButton value="A" current={weekGrade} onChange={v => setValue('weekGrade', v)} colorClass="bg-accent text-background" />
                    <GradeButton value="B" current={weekGrade} onChange={v => setValue('weekGrade', v)} colorClass="bg-blue-500 text-white" />
                    <GradeButton value="C" current={weekGrade} onChange={v => setValue('weekGrade', v)} colorClass="bg-warning text-background" />
                    <GradeButton value="D" current={weekGrade} onChange={v => setValue('weekGrade', v)} colorClass="bg-danger text-white" />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              {existingReview && (
                <p className="text-xs text-secondary">
                  Last saved {format(new Date(existingReview.createdAt), 'MMM d, h:mm a')}
                </p>
              )}
              <Button type="submit" loading={isSubmitting} className="ml-auto">
                {existingReview ? 'Update Review' : 'Save Review'}
              </Button>
            </div>
          </form>

          {/* Past reviews */}
          {pastReviews.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Past Reviews</h2>
              <div className="space-y-2">
                {pastReviews.map(r => (
                  <PastReview key={r.id} review={r} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
