import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Brain, CheckCircle2, Activity, RefreshCw, AlertTriangle, XCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '../../lib/queryClient'
import api from '../../lib/axios'
import {
  useTodayCheckin,
  useCheckinHistory,
  useSubmitCheckin,
  useBaseline,
} from '../../hooks/usePsychology'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { Textarea } from '../../components/shared/Input'
import { Badge } from '../../components/shared/Badge'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'

// ------ Slider helpers ------
const SLIDER_FIELDS = [
  { name: 'sleepQuality', label: 'Sleep quality last night', inverted: false },
  { name: 'stressLevel', label: 'Current stress level', inverted: true, hint: '1 = very low, 10 = very high' },
  { name: 'confidence', label: 'Confidence in your strategy today', inverted: false },
  { name: 'financialPressure', label: 'Financial pressure right now', inverted: true, hint: '1 = none, 10 = extreme' },
  { name: 'focus', label: 'Focus and mental clarity', inverted: false },
  { name: 'emotionalStability', label: 'Emotional stability today', inverted: false },
  { name: 'overallReadiness', label: 'Overall readiness to trade', inverted: false },
]

const schema = z.object({
  sleepQuality: z.coerce.number().min(1).max(10),
  stressLevel: z.coerce.number().min(1).max(10),
  confidence: z.coerce.number().min(1).max(10),
  financialPressure: z.coerce.number().min(1).max(10),
  focus: z.coerce.number().min(1).max(10),
  emotionalStability: z.coerce.number().min(1).max(10),
  overallReadiness: z.coerce.number().min(1).max(10),
})

function computeRecommendation(values) {
  // Critical immediate NO-GO triggers
  if (values.sleepQuality <= 3) return { level: 'NO_GO', trigger: 'Sleep quality is critically low (3 or below).' }
  if (values.stressLevel >= 8) return { level: 'NO_GO', trigger: 'Stress level is dangerously high (8 or above).' }
  if (values.financialPressure >= 8) return { level: 'NO_GO', trigger: 'Financial pressure is extreme (8 or above). Trading under financial desperation is high-risk.' }
  if (values.overallReadiness <= 3) return { level: 'NO_GO', trigger: 'Overall readiness is too low to trade effectively.' }

  // Compute composite score (invert stress and financial pressure)
  const composite =
    values.sleepQuality +
    (11 - values.stressLevel) +
    values.confidence +
    (11 - values.financialPressure) +
    values.focus +
    values.emotionalStability +
    values.overallReadiness

  const maxPossible = 7 * 10
  const pct = (composite / maxPossible) * 100

  if (pct >= 65) return { level: 'GO', trigger: null, score: Math.round(pct) }
  if (pct >= 45) return { level: 'CAUTION', trigger: null, score: Math.round(pct) }
  return { level: 'NO_GO', trigger: 'Multiple factors are below threshold.', score: Math.round(pct) }
}

const RECOMMENDATION_CONFIG = {
  GO: {
    bg: 'bg-accent/10 border-accent/40',
    badgeColor: 'bg-accent text-background',
    icon: CheckCircle2,
    iconColor: 'text-accent',
    title: 'GO — You are ready to trade',
    message: 'All systems green. Follow your plan, stick to your rules, and stay disciplined.',
  },
  CAUTION: {
    bg: 'bg-warning/10 border-warning/40',
    badgeColor: 'bg-warning text-background',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    title: 'CAUTION — Consider reduced size today',
    message: 'Some factors are below optimal. Trade at half normal size and be more selective with setups.',
  },
  NO_GO: {
    bg: 'bg-danger/10 border-danger/40',
    badgeColor: 'bg-danger text-white',
    icon: XCircle,
    iconColor: 'text-danger',
    title: 'NO-GO — Consider sitting out today',
    message: 'Your mental state is not optimal for trading. Protect your capital — there will be better days.',
  },
}

function SliderField({ label, name, hint, inverted, register, watch }) {
  const raw = watch(name) ?? 5
  const effective = inverted ? 11 - raw : raw
  const color = effective >= 7 ? 'text-accent' : effective >= 4 ? 'text-warning' : 'text-danger'
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <div>
          <label className="text-xs font-medium text-secondary uppercase tracking-wider">{label}</label>
          {hint && <p className="text-[10px] text-secondary/60 mt-0.5">{hint}</p>}
        </div>
        <span className={`text-sm font-mono font-bold ${color} shrink-0 ml-2`}>{raw}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface2 accent-accent"
        {...register(name, { valueAsNumber: true })}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-secondary">1</span>
        <span className="text-[10px] text-secondary">10</span>
      </div>
    </div>
  )
}

function ResultOverlay({ result, onClose }) {
  const cfg = RECOMMENDATION_CONFIG[result.level]
  const Icon = cfg.icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-md border-2 rounded-2xl p-8 shadow-2xl ${cfg.bg}`}>
        <div className="text-center">
          <Icon className={`w-16 h-16 mx-auto mb-4 ${cfg.iconColor}`} />
          <h2 className="text-xl font-bold text-primary mb-3">{cfg.title}</h2>
          {result.trigger && (
            <div className="bg-background/40 rounded-xl p-3 mb-4">
              <p className="text-sm text-primary/80">
                <span className="font-semibold">Trigger: </span>{result.trigger}
              </p>
            </div>
          )}
          <p className="text-sm text-secondary mb-6 leading-relaxed">{cfg.message}</p>
          <Button className="w-full" onClick={onClose}>Got it</Button>
        </div>
      </div>
    </div>
  )
}

// Post-session reflection
const REFLECTION_FIELDS_TOGGLE = [
  { name: 'followedRules', label: 'Followed my rules', options: ['Yes', 'Mostly', 'No'] },
  { name: 'feltEmotional', label: 'Felt emotional during trading', options: ['Yes', 'No'] },
  { name: 'revengeTrade', label: 'Placed a revenge trade', options: ['Yes', 'No'] },
  { name: 'overtraded', label: 'Overtraded today', options: ['Yes', 'No'] },
  { name: 'disciplineGrade', label: 'Discipline grade', options: ['A', 'B', 'C', 'D'] },
]

function ButtonGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            value === opt
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-border bg-surface2 text-secondary hover:text-primary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// Profile label map
const PROFILE_LABEL = {
  DISCIPLINED: { label: 'Disciplined', color: 'green' },
  DEVELOPING: { label: 'Developing', color: 'amber' },
  EMOTIONAL: { label: 'Emotional', color: 'amber' },
  HIGH_RISK: { label: 'High Risk', color: 'red' },
}

export default function PsychologyPage() {
  const { data: checkin, isLoading: checkinLoading } = useTodayCheckin()
  const { data: history, isLoading: historyLoading } = useCheckinHistory(14)
  const { data: baseline } = useBaseline()
  const submitCheckin = useSubmitCheckin()
  const submitReflection = useMutation({
    mutationFn: (payload) => api.post('/psychology/reflection', payload).then((r) => r.data),
    onSuccess: () => toast.success('Reflection saved!'),
    onError: () => toast.error('Failed to save reflection.'),
  })

  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayResult, setOverlayResult] = useState(null)
  const [reflection, setReflection] = useState({
    followedRules: null, feltEmotional: null, revengeTrade: null,
    overtraded: null, disciplineGrade: null, wentWell: '', toImprove: '',
  })

  const {
    register,
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      sleepQuality: 7, stressLevel: 4, confidence: 7,
      financialPressure: 3, focus: 7, emotionalStability: 7, overallReadiness: 7,
    },
  })

  async function onSubmitCheckin(values) {
    const rec = computeRecommendation(values)
    const payload = { ...values, recommendation: rec.level, score: rec.score ?? null }
    try {
      await submitCheckin.mutateAsync(payload)
      setOverlayResult(rec)
      setShowOverlay(true)
    } catch {
      toast.error('Failed to save check-in.')
    }
  }

  async function onSubmitReflection() {
    await submitReflection.mutateAsync(reflection)
  }

  // Build 14-day history for chart
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i)
    const label = format(date, 'MMM d')
    const dayData = history?.find((h) => {
      try { return format(new Date(h.createdAt), 'MMM d') === label } catch { return false }
    })
    return {
      date: label,
      score: dayData?.score ?? null,
      level: dayData?.recommendation ?? null,
    }
  })

  const checkinDone = !!checkin

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {showOverlay && overlayResult && (
        <ResultOverlay result={overlayResult} onClose={() => setShowOverlay(false)} />
      )}

      <div>
        <h1 className="text-xl font-bold text-primary">Psychology</h1>
        <p className="text-sm text-secondary mt-0.5">Daily check-in, mental performance tracking and reflection</p>
      </div>

      {/* Today's result banner OR check-in form */}
      {checkinLoading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : checkinDone ? (
        (() => {
          const cfg = RECOMMENDATION_CONFIG[checkin.recommendation ?? 'GO']
          const Icon = cfg.icon
          return (
            <div className={`border rounded-xl p-5 flex items-center gap-4 ${cfg.bg}`}>
              <Icon className={`w-8 h-8 shrink-0 ${cfg.iconColor}`} />
              <div className="flex-1">
                <p className="font-bold text-primary">{cfg.title}</p>
                <p className="text-sm text-secondary mt-0.5">{cfg.message}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.badgeColor}`}>
                {checkin.recommendation ?? 'GO'}
              </span>
            </div>
          )
        })()
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Daily Check-in</CardTitle>
            <Activity className="w-5 h-5 text-secondary" />
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmitCheckin)} className="space-y-5">
            {SLIDER_FIELDS.map((f) => (
              <SliderField key={f.name} {...f} register={register} watch={watch} />
            ))}
            <Button type="submit" className="w-full" loading={submitCheckin.isPending}>
              Submit Check-in
            </Button>
          </form>
        </Card>
      )}

      {/* 14-day history chart */}
      <Card>
        <CardHeader>
          <CardTitle>14-Day Score History</CardTitle>
        </CardHeader>
        {historyLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="date" tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8888AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 12 }}
                  labelStyle={{ color: '#8888AA', fontSize: 11 }}
                  formatter={(v) => [`${v}%`, 'Score']}
                />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.level === 'GO' ? '#00C896'
                          : d.level === 'CAUTION' ? '#F5A623'
                          : d.level === 'NO_GO' ? '#E74C3C'
                          : '#2A2A3A'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Baseline summary */}
      {baseline && (
        <Card>
          <CardHeader>
            <CardTitle>Baseline Profile</CardTitle>
            <Link to="/psychology/baseline">
              <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retake
              </Button>
            </Link>
          </CardHeader>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-secondary mb-1">Profile Type</p>
              <Badge variant={PROFILE_LABEL[baseline.profile]?.color ?? 'gray'}>
                {PROFILE_LABEL[baseline.profile]?.label ?? baseline.profile}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-secondary mb-1">Score</p>
              <p className="text-2xl font-mono font-bold text-primary">
                {baseline.score ?? '—'}
                <span className="text-secondary text-sm font-normal">/100</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Post-session reflection */}
      <Card>
        <CardHeader>
          <CardTitle>Post-Session Reflection</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          {REFLECTION_FIELDS_TOGGLE.map((f) => (
            <div key={f.name} className="flex items-center justify-between gap-4">
              <label className="text-sm text-primary">{f.label}</label>
              <ButtonGroup
                options={f.options}
                value={reflection[f.name]}
                onChange={(v) => setReflection((r) => ({ ...r, [f.name]: v }))}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">
              What went well
            </label>
            <textarea
              rows={3}
              className="w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60 px-3 py-2.5 resize-y focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30"
              placeholder="Describe what you executed well today…"
              value={reflection.wentWell}
              onChange={(e) => setReflection((r) => ({ ...r, wentWell: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">
              What to improve
            </label>
            <textarea
              rows={3}
              className="w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60 px-3 py-2.5 resize-y focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30"
              placeholder="What would you do differently next time…"
              value={reflection.toImprove}
              onChange={(e) => setReflection((r) => ({ ...r, toImprove: e.target.value }))}
            />
          </div>

          <Button
            className="w-full"
            onClick={onSubmitReflection}
            loading={submitReflection.isPending}
            variant="secondary"
          >
            Save Reflection
          </Button>
        </div>
      </Card>
    </div>
  )
}
