import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Circle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAccounts } from '../../hooks/useAccounts'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { Badge } from '../../components/shared/Badge'

// ---- Checklist structure ----
const PHASE1_ITEMS = [
  { id: 'p1_bias', type: 'select', label: 'Daily bias set on 1D timeframe', options: ['Bullish', 'Bearish', 'Neutral'], key: 'dailyBias' },
  { id: 'p1_hl', type: 'checkbox', label: 'Session highs and lows marked' },
  { id: 'p1_pd', type: 'checkbox', label: 'Premium and discount zones set' },
  { id: 'p1_prep', type: 'checkbox', label: 'Prep completed 30 mins before killzone' },
  { id: 'p1_htlt', type: 'checkbox', label: 'HT/LT indications reviewed (optional)' },
  { id: 'p1_eco', type: 'checkbox', label: 'Economic calendar checked' },
  { id: 'p1_kz', type: 'select', label: 'Killzone selected', options: ['London', 'NY'], key: 'killzone' },
]

const PHASE2_ITEMS = [
  { id: 'p2_ifvg', type: 'checkbox', label: 'IFVG identified on 1min or 2min TF' },
  { id: 'p2_close', type: 'checkbox', label: 'Clean candle BODY close through IFVG confirmed' },
  { id: 'p2_c1', type: 'select', label: 'Confirmation 1 present', options: ['Liquidity Sweep', 'SMT Divergence', 'FVG Alignment'], key: 'confirmation1' },
  { id: 'p2_c2', type: 'select', label: 'Confirmation 2 present', options: ['Liquidity Sweep', 'SMT Divergence', 'FVG Alignment'], key: 'confirmation2' },
  { id: 'p2_bias_align', type: 'checkbox', label: 'Both confirmations align with daily bias' },
  { id: 'p2_rr', type: 'number', label: 'Minimum R:R available', key: 'minRR', warn: (v) => v < 1, warnMsg: 'R:R below 1:1. Suggest at least 1.5.' },
  { id: 'p2_consistency', type: 'auto', label: 'Consistency rule not violated', autoKey: 'consistencyOk' },
  { id: 'p2_target', type: 'auto', label: 'Daily profit target not already hit', autoKey: 'targetOk' },
]

const PHASE3_ITEMS = [
  { id: 'p3_sl', type: 'select', label: 'SL placement decided', options: ['Aggressive', 'Safe'], key: 'slType' },
  { id: 'p3_tp', type: 'checkbox', label: 'TP set at session high/low' },
  { id: 'p3_size', type: 'checkbox', label: 'Contract size within account limits' },
]

function computeVerdict(state, accounts) {
  // Core required items
  const required = [
    'p1_hl', 'p1_pd', 'p1_prep', 'p1_eco',
    'p2_ifvg', 'p2_close', 'p2_bias_align',
    'p3_tp', 'p3_size',
  ]

  const hasRequired = required.every((id) => state[id] === true)
  const hasBias = !!state['dailyBias']
  const hasKz = !!state['killzone']
  const hasC1 = !!state['confirmation1']
  const hasC2 = !!state['confirmation2']
  const hasSlType = !!state['slType']
  const rrVal = parseFloat(state['minRR'] ?? 0)
  const rrOk = rrVal >= 1

  const aPlus = hasRequired && hasBias && hasKz && hasC1 && hasC2 && hasSlType && rrVal >= 1.5
    && state['p1_htlt'] !== false  // optional but counts for A+
    && state['p2_consistency'] !== false && state['p2_target'] !== false

  if (aPlus) return 'A_PLUS'

  const valid = hasRequired && hasBias && hasKz && hasC1 && hasC2 && hasSlType && rrOk
    && state['p2_consistency'] !== false && state['p2_target'] !== false

  if (valid) return 'B'

  return 'NONE'
}

const VERDICT_CONFIG = {
  A_PLUS: {
    label: 'A+ Setup — TAKE THE TRADE',
    bg: 'bg-accent/10 border-accent',
    glow: 'shadow-accent/20 shadow-lg',
    icon: TrendingUp,
    iconColor: 'text-accent',
    textColor: 'text-accent',
    badge: 'green',
  },
  B: {
    label: 'B Setup — Valid, reduce size',
    bg: 'bg-warning/10 border-warning/60',
    glow: '',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    textColor: 'text-warning',
    badge: 'amber',
  },
  NONE: {
    label: 'DO NOT TRADE',
    bg: 'bg-danger/10 border-danger/60',
    glow: '',
    icon: XCircle,
    iconColor: 'text-danger',
    textColor: 'text-danger',
    badge: 'red',
  },
}

// ---- Checklist item renderers ----
function CheckItem({ item, state, onChange }) {
  const done = state[item.id] === true
  const warn = item.warn && state[item.key] !== undefined && item.warn(parseFloat(state[item.key] ?? 0))

  if (item.type === 'checkbox') {
    return (
      <button
        onClick={() => onChange(item.id, !done)}
        className="w-full flex items-center gap-3 text-left group py-1"
      >
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-border shrink-0 group-hover:text-secondary transition-colors" />
        )}
        <span className={`text-sm leading-relaxed ${done ? 'text-secondary line-through' : 'text-primary'}`}>
          {item.label}
        </span>
      </button>
    )
  }

  if (item.type === 'select') {
    const val = state[item.key] ?? ''
    return (
      <div className="flex items-center gap-3 py-1">
        {val ? (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-border shrink-0" />
        )}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm text-primary flex-1">{item.label}</span>
          <select
            value={val}
            onChange={(e) => onChange(item.key, e.target.value)}
            className="bg-surface2 border border-border rounded-lg text-xs text-primary px-2 h-8 focus:outline-none focus:border-accent/60"
          >
            <option value="">Select…</option>
            {item.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
    )
  }

  if (item.type === 'number') {
    const val = state[item.key] ?? ''
    const numVal = parseFloat(val)
    return (
      <div className="py-1">
        <div className="flex items-center gap-3">
          {val && numVal >= 1 ? (
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-border shrink-0" />
          )}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-sm text-primary flex-1">{item.label}</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={val}
              onChange={(e) => onChange(item.key, e.target.value)}
              className="w-20 bg-surface2 border border-border rounded-lg text-xs text-primary px-2 h-8 font-mono focus:outline-none focus:border-accent/60"
              placeholder="1.5"
            />
          </div>
        </div>
        {warn && (
          <div className="flex items-center gap-1.5 ml-8 mt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <p className="text-xs text-warning">{item.warnMsg}</p>
          </div>
        )}
      </div>
    )
  }

  if (item.type === 'auto') {
    const val = state[item.autoKey]
    return (
      <div className="flex items-center gap-3 py-1">
        {val === true ? (
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
        ) : val === false ? (
          <XCircle className="w-5 h-5 text-danger shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-border shrink-0" />
        )}
        <span className={`text-sm ${val === false ? 'text-danger' : 'text-primary'}`}>{item.label}</span>
        {val !== undefined && (
          <Badge variant={val ? 'green' : 'red'} className="ml-auto">
            {val ? 'OK' : 'FAIL'}
          </Badge>
        )}
      </div>
    )
  }

  return null
}

function Phase({ title, phase, items, state, onChange, complete, total }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface2 text-secondary">{phase}</span>
          <CardTitle>{title}</CardTitle>
        </div>
        <span className="text-xs font-mono text-secondary">{complete}/{total}</span>
      </CardHeader>
      <ProgressBar value={complete} max={total} showLabel={false} size="sm" className="mb-4" />
      <div className="space-y-1">
        {items.map((item) => (
          <CheckItem key={item.id} item={item} state={state} onChange={onChange} />
        ))}
      </div>
    </Card>
  )
}

const CHECKLIST_STORAGE_KEY = 'tradeedge_checklist_state'

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadStoredState() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed?.date === getTodayKey()) {
      return parsed.state ?? {}
    }
    // New day — discard yesterday's checklist
    localStorage.removeItem(CHECKLIST_STORAGE_KEY)
    return {}
  } catch {
    return {}
  }
}

export default function ChecklistPage() {
  const { data: accounts } = useAccounts()
  const [state, setState] = useState(loadStoredState)
  const [saving, setSaving] = useState(false)
  const [checklistDate, setChecklistDate] = useState(getTodayKey)

  // Persist state for the current day, and watch for the date rolling over
  // (e.g. tab left open past midnight) so the checklist resets automatically.
  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify({ date: getTodayKey(), state }))
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [state])

  useEffect(() => {
    const interval = setInterval(() => {
      const todayKey = getTodayKey()
      if (todayKey !== checklistDate) {
        setChecklistDate(todayKey)
        setState({})
        try {
          localStorage.removeItem(CHECKLIST_STORAGE_KEY)
        } catch {
          // ignore
        }
      }
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [checklistDate])

  // Auto-populate account-based checks
  useEffect(() => {
    if (!accounts?.length) return
    const acc = accounts[0]
    const consistencyOk = acc.consistencyRule
      ? (acc.todayPnl ?? 0) / Math.max(1, acc.balance - acc.startBalance) * 100 <= (acc.consistencyRule ?? 50)
      : true
    const targetOk = acc.profitTarget
      ? (acc.balance - acc.startBalance) < acc.profitTarget
      : true
    setState((s) => ({ ...s, consistencyOk, targetOk }))
  }, [accounts])

  const verdict = computeVerdict(state, accounts)
  const verdictCfg = VERDICT_CONFIG[verdict]
  const VerdictIcon = verdictCfg.icon

  function onChange(key, value) {
    setState((s) => ({ ...s, [key]: value }))
  }

  // Auto-save debounced
  const saveChecklist = useMutation({
    mutationFn: (payload) => api.post('/checklists', payload).then((r) => r.data),
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(state).length > 0) {
        saveChecklist.mutate(state)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [state])

  // Count done for each phase
  function countDone(items) {
    return items.filter((item) => {
      if (item.type === 'checkbox') return state[item.id] === true
      if (item.type === 'select') return !!state[item.key]
      if (item.type === 'number') return parseFloat(state[item.key] ?? 0) >= 1
      if (item.type === 'auto') return state[item.autoKey] === true
      return false
    }).length
  }

  function resetAll() {
    setState({})
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Pre-Trade Checklist</h1>
          <p className="text-sm text-secondary mt-0.5">Complete all phases before entering a trade</p>
        </div>
        <div className="flex items-center gap-2">
          {saveChecklist.isPending && <span className="text-xs text-secondary animate-pulse">Saving…</span>}
          <Button variant="secondary" size="sm" onClick={resetAll}>Reset</Button>
        </div>
      </div>

      {/* Live Verdict */}
      <div className={`border-2 rounded-2xl p-6 transition-all ${verdictCfg.bg} ${verdictCfg.glow}`}>
        <div className="flex items-center gap-4">
          <VerdictIcon className={`w-10 h-10 shrink-0 ${verdictCfg.iconColor}`} />
          <div>
            <p className={`text-xl font-bold ${verdictCfg.textColor}`}>{verdictCfg.label}</p>
            <p className="text-xs text-secondary mt-0.5">Updates in real-time as you complete each item</p>
          </div>
        </div>
      </div>

      <Phase
        title="Pre Killzone"
        phase="Phase 1"
        items={PHASE1_ITEMS}
        state={state}
        onChange={onChange}
        complete={countDone(PHASE1_ITEMS)}
        total={PHASE1_ITEMS.length}
      />

      <Phase
        title="In Killzone"
        phase="Phase 2"
        items={PHASE2_ITEMS}
        state={state}
        onChange={onChange}
        complete={countDone(PHASE2_ITEMS)}
        total={PHASE2_ITEMS.length}
      />

      <Phase
        title="On Entry"
        phase="Phase 3"
        items={PHASE3_ITEMS}
        state={state}
        onChange={onChange}
        complete={countDone(PHASE3_ITEMS)}
        total={PHASE3_ITEMS.length}
      />
    </div>
  )
}
