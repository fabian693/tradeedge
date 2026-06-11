import { useState, useRef, useEffect, Fragment } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Plus, BookOpen, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Image, X, Upload, ChevronLeft, ChevronRight, Sparkles, Star, Loader2,
  FileUp, FileText,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  useTrades, useCreateTrade, useDeleteTrade,
  useAnalyzeScreenshot, useUploadScreenshot, useRateTrade, useImportCsv,
} from '../../hooks/useTrades'
import { useAccounts } from '../../hooks/useAccounts'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Input } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Modal } from '../../components/shared/Modal'
import { EmptyState } from '../../components/shared/EmptyState'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { formatCurrency, getTradeColor, cn } from '../../lib/utils'

// ---- Zod schema ----
const tradeSchema = z.object({
  tradeDate: z.string().min(1, 'Date required'),
  market: z.enum(['NQ', 'ES']),
  session: z.enum(['London', 'NY']),
  direction: z.enum(['Long', 'Short']),
  dailyBias: z.enum(['Bullish', 'Bearish']),
  killzoneConfirmed: z.enum(['Yes', 'No']),
  ifvgTimeframe: z.enum(['1min', '2min', '5min', '15min']),
  setupGrade: z.enum(['A+', 'A', 'B']),
  confirmation1: z.enum(['Liquidity Sweep', 'SMT Divergence', 'FVG Alignment']),
  confirmation2: z.enum(['Liquidity Sweep', 'SMT Divergence', 'FVG Alignment']),
  entryPrice: z.coerce.number(),
  stopLoss: z.coerce.number(),
  stopLossType: z.enum(['Aggressive', 'Safe']),
  takeProfit: z.coerce.number(),
  contracts: z.coerce.number().int().positive(),
  accountId: z.string().optional(),
  exitPrice: z.coerce.number(),
  result: z.enum(['Win', 'Loss', 'Breakeven']),
  ruleViolation: z.enum(['Yes', 'No']),
  violationDescription: z.string().optional(),
  wentWell: z.string().optional(),
  toImprove: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
})

// ---- Helpers ----
function calcRR(entry, sl, tp) {
  if (!entry || !sl || !tp) return null
  const risk = Math.abs(entry - sl)
  const reward = Math.abs(tp - entry)
  if (!risk) return null
  return (reward / risk).toFixed(2)
}

function calcPnL(entry, exit, contracts, direction) {
  if (!entry || !exit || !contracts) return null
  const pts = direction === 'Long' ? exit - entry : entry - exit
  return pts * contracts * 20 // NQ/ES point value approx
}

// Signed R:R achieved — positive for wins, negative for losses
function calcSignedRR(entry, sl, exit, direction) {
  if (!entry || !sl || !exit) return null
  const risk = Math.abs(entry - sl)
  if (!risk) return null
  const pts = direction === 'Long' ? exit - entry : entry - exit
  return (pts / risk).toFixed(2)
}

// Map UI form values <-> API enum values
const SESSION_TO_API = { London: 'LONDON', NY: 'NY' }
const SESSION_FROM_API = { LONDON: 'London', NY: 'NY' }
const DIRECTION_TO_API = { Long: 'LONG', Short: 'SHORT' }
const DIRECTION_FROM_API = { LONG: 'Long', SHORT: 'Short' }
const BIAS_TO_API = { Bullish: 'BULLISH', Bearish: 'BEARISH' }
const IFVG_TO_API = { '1min': 'M1', '2min': 'M2', '5min': 'M5', '15min': 'M15' }
const IFVG_FROM_API = { M1: '1min', M2: '2min', M5: '5min', M15: '15min' }
const SETUP_TO_API = { 'A+': 'A_PLUS', A: 'A', B: 'B' }
const SETUP_FROM_API = { A_PLUS: 'A+', A: 'A', B: 'B' }
const CONFIRM_TO_API = {
  'Liquidity Sweep': 'LIQUIDITY_SWEEP',
  'SMT Divergence': 'SMT_DIVERGENCE',
  'FVG Alignment': 'FVG_ALIGNMENT',
}
const CONFIRM_FROM_API = {
  LIQUIDITY_SWEEP: 'Liquidity Sweep',
  SMT_DIVERGENCE: 'SMT Divergence',
  FVG_ALIGNMENT: 'FVG Alignment',
}
const SLTYPE_TO_API = { Aggressive: 'AGGRESSIVE', Safe: 'SAFE' }
const RESULT_TO_API = { Win: 'WIN', Loss: 'LOSS', Breakeven: 'BREAKEVEN' }
const RESULT_FROM_API = { WIN: 'Win', LOSS: 'Loss', BREAKEVEN: 'Breakeven' }

// Convert form values (display strings) into the payload shape expected by the API
function mapFormToApiPayload(values) {
  const rrTarget = calcRR(values.entryPrice, values.stopLoss, values.takeProfit)
  const rrAchieved = calcSignedRR(values.entryPrice, values.stopLoss, values.exitPrice, values.direction)
  const pnl = values.exitPrice && values.entryPrice
    ? calcPnL(values.entryPrice, values.exitPrice, values.contracts, values.direction)
    : null

  return {
    accountId: values.accountId || undefined,
    dateTime: values.tradeDate ? new Date(values.tradeDate).toISOString() : undefined,
    market: values.market,
    session: SESSION_TO_API[values.session] ?? values.session,
    direction: DIRECTION_TO_API[values.direction] ?? values.direction,
    dailyBias: BIAS_TO_API[values.dailyBias] ?? values.dailyBias,
    ifvgTimeframe: IFVG_TO_API[values.ifvgTimeframe] ?? values.ifvgTimeframe,
    setupGrade: SETUP_TO_API[values.setupGrade] ?? values.setupGrade,
    confirmation1: CONFIRM_TO_API[values.confirmation1] ?? values.confirmation1,
    confirmation2: CONFIRM_TO_API[values.confirmation2] ?? values.confirmation2,
    entryPrice: values.entryPrice,
    slPrice: values.stopLoss,
    slType: SLTYPE_TO_API[values.stopLossType] ?? values.stopLossType,
    tpPrice: values.takeProfit,
    contracts: values.contracts,
    rrTarget: rrTarget != null ? Number(rrTarget) : undefined,
    exitPrice: values.exitPrice,
    rrAchieved: rrAchieved != null ? Number(rrAchieved) : undefined,
    pnl: pnl != null ? Number(pnl) : undefined,
    result: RESULT_TO_API[values.result] ?? values.result,
    ruleViolation: values.ruleViolation === 'Yes',
    violationDescription: values.violationDescription || undefined,
    wentWell: values.wentWell || undefined,
    toImprove: values.toImprove || undefined,
    notes: values.notes || undefined,
    killzoneConfirmed: values.killzoneConfirmed === 'Yes',
    isPublic: !!values.isPublic,
  }
}

// Convert AI-extracted fields (API enum values) into display values for the form
function mapAiFieldsToForm(fields) {
  const out = {}
  if (fields.market) out.market = fields.market
  if (fields.direction) out.direction = DIRECTION_FROM_API[fields.direction] ?? fields.direction
  if (fields.session) out.session = SESSION_FROM_API[fields.session] ?? fields.session
  if (fields.entryPrice != null) out.entryPrice = fields.entryPrice
  if (fields.stopLoss != null) out.stopLoss = fields.stopLoss
  if (fields.takeProfit != null) out.takeProfit = fields.takeProfit
  if (fields.exitPrice != null) out.exitPrice = fields.exitPrice
  return out
}

// ---- Direction indicator ----
function DirectionCell({ direction }) {
  const display = DIRECTION_FROM_API[direction] ?? direction
  return display === 'Long' ? (
    <span className="inline-flex items-center gap-1 text-accent font-medium text-sm">
      <ArrowUp className="w-3.5 h-3.5" /> Long
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-danger font-medium text-sm">
      <ArrowDown className="w-3.5 h-3.5" /> Short
    </span>
  )
}

// ---- Result badge ----
function ResultBadge({ result }) {
  const display = RESULT_FROM_API[result] ?? result
  const v = display === 'Win' ? 'green' : display === 'Loss' ? 'red' : 'gray'
  return <Badge variant={v}>{display}</Badge>
}

// ---- Sortable column header ----
function SortHeader({ label, field, sort, onSort }) {
  const active = sort.field === field
  return (
    <th
      className="text-left pb-3 pr-3 text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          sort.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : null}
      </span>
    </th>
  )
}

// ---- Expanded trade detail ----
function TradeDetail({ trade, onRate }) {
  return (
    <tr>
      <td colSpan={14} className="py-4 px-4 bg-surface2/40 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-secondary mb-1">Setup Grade</p>
            <p className="text-primary font-medium">{SETUP_FROM_API[trade.setupGrade] ?? trade.setupGrade}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Confirmations</p>
            <p className="text-primary">
              {(CONFIRM_FROM_API[trade.confirmation1] ?? trade.confirmation1) || '—'}
              {trade.confirmation2 ? ` + ${CONFIRM_FROM_API[trade.confirmation2] ?? trade.confirmation2}` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">SL Type</p>
            <p className="text-primary">{trade.slType ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Daily Bias</p>
            <p className="text-primary">{trade.dailyBias}</p>
          </div>
          {trade.wentWell && (
            <div className="col-span-2">
              <p className="text-xs text-secondary mb-1">What went well</p>
              <p className="text-primary leading-relaxed">{trade.wentWell}</p>
            </div>
          )}
          {trade.toImprove && (
            <div className="col-span-2">
              <p className="text-xs text-secondary mb-1">To improve</p>
              <p className="text-primary leading-relaxed">{trade.toImprove}</p>
            </div>
          )}
          {trade.notes && (
            <div className="col-span-4">
              <p className="text-xs text-secondary mb-1">Notes</p>
              <p className="text-primary leading-relaxed">{trade.notes}</p>
            </div>
          )}
          {trade.ruleViolation && (
            <div className="col-span-4">
              <Badge variant="red">Rule Violation</Badge>
              {trade.violationDescription && (
                <p className="text-sm text-danger/80 mt-1">{trade.violationDescription}</p>
              )}
            </div>
          )}
          {trade.screenshotUrl && (
            <div className="col-span-4">
              <p className="text-xs text-secondary mb-2">Screenshot</p>
              <img
                src={trade.screenshotUrl}
                alt="Trade screenshot"
                className="max-w-sm rounded-xl border border-border cursor-zoom-in hover:opacity-90"
                onClick={() => window.open(trade.screenshotUrl, '_blank')}
              />
            </div>
          )}

          {/* Trade quality rating */}
          <div className="col-span-4 pt-2 border-t border-border/60">
            {trade.ratingType === 'SELF' && trade.selfRating != null ? (
              <div>
                <p className="text-xs text-secondary mb-1">Your rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn('w-4 h-4', n <= trade.selfRating ? 'text-accent fill-accent' : 'text-secondary/30')} />
                  ))}
                </div>
              </div>
            ) : trade.ratingType === 'AI' && trade.aiRating != null ? (
              <div>
                <p className="text-xs text-secondary mb-1 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent" /> AI rating
                </p>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn('w-4 h-4', n <= trade.aiRating ? 'text-accent fill-accent' : 'text-secondary/30')} />
                  ))}
                </div>
                {trade.aiFeedback && <p className="text-primary leading-relaxed">{trade.aiFeedback}</p>}
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => onRate?.(trade)}>
                Rate this trade
              </Button>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

// ---- Log Trade Modal (3-step) ----
function LogTradeModal({ open, onClose, accounts, onLogged }) {
  const [step, setStep] = useState(1)
  const [screenshot, setScreenshot] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)
  const createTrade = useCreateTrade()
  const uploadScreenshot = useUploadScreenshot()
  const analyzeScreenshot = useAnalyzeScreenshot()

  const {
    register, handleSubmit, watch, control, setValue,
    formState: { errors },
    trigger,
    reset,
  } = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      market: 'NQ', session: 'NY', direction: 'Long', dailyBias: 'Bullish',
      killzoneConfirmed: 'Yes', ifvgTimeframe: '2min', setupGrade: 'A',
      confirmation1: 'Liquidity Sweep', confirmation2: 'FVG Alignment',
      stopLossType: 'Safe', result: 'Win', ruleViolation: 'No',
      contracts: 1,
      isPublic: false,
      tradeDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  // Default to the user's first account if none chosen yet
  useEffect(() => {
    if (accounts?.length && !watch('accountId')) {
      setValue('accountId', accounts[0].id)
    }
  }, [accounts]) // eslint-disable-line react-hooks/exhaustive-deps

  const entry = watch('entryPrice')
  const sl = watch('stopLoss')
  const tp = watch('takeProfit')
  const exit = watch('exitPrice')
  const direction = watch('direction')
  const contracts = watch('contracts')
  const ruleViolation = watch('ruleViolation')

  const rrTarget = calcRR(entry, sl, tp)
  const rrAchieved = calcSignedRR(entry, sl, exit, direction)
  const pnl = exit && entry ? calcPnL(entry, exit, contracts, direction) : null

  const STEP_FIELDS = {
    1: ['tradeDate', 'market', 'session', 'direction', 'dailyBias', 'killzoneConfirmed'],
    2: ['ifvgTimeframe', 'setupGrade', 'confirmation1', 'confirmation2', 'entryPrice', 'stopLoss', 'stopLossType', 'takeProfit', 'contracts'],
  }

  async function nextStep() {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => s + 1)
  }

  function handleFile(file) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setScreenshot({ file, url })
  }

  async function handleAnalyze() {
    if (!screenshot?.file) return
    try {
      const { fields } = await analyzeScreenshot.mutateAsync(screenshot.file)
      const formValues = mapAiFieldsToForm(fields)
      Object.entries(formValues).forEach(([key, val]) => setValue(key, val, { shouldValidate: true }))
      toast.success('Screenshot analyzed — fields prefilled. Double check before saving.')
    } catch (err) {
      if (err?.response?.status === 503) {
        toast.error('AI analysis is not configured yet (missing API key).')
      } else {
        toast.error('Could not analyze screenshot.')
      }
    }
  }

  async function onSubmit(values) {
    try {
      const payload = mapFormToApiPayload(values)
      const { trade } = await createTrade.mutateAsync(payload)

      if (screenshot?.file && trade?.id) {
        try {
          await uploadScreenshot.mutateAsync({ id: trade.id, file: screenshot.file })
        } catch {
          toast.error('Trade saved, but the screenshot failed to upload.')
        }
      }

      toast.success('Trade logged!')
      onClose()
      reset()
      setStep(1)
      setScreenshot(null)
      onLogged?.(trade)
    } catch {
      toast.error('Failed to log trade.')
    }
  }

  function handleClose() {
    onClose()
    reset()
    setStep(1)
    setScreenshot(null)
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Log Trade — Step ${step} of 3`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Session & Bias */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Date & Time"
              type="datetime-local"
              error={errors.tradeDate?.message}
              {...register('tradeDate')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Market" error={errors.market?.message} {...register('market')}>
                <option value="NQ">NQ</option>
                <option value="ES">ES</option>
              </Select>
              <Select label="Session" error={errors.session?.message} {...register('session')}>
                <option value="London">London</option>
                <option value="NY">NY</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Direction" error={errors.direction?.message} {...register('direction')}>
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </Select>
              <Select label="Daily Bias" error={errors.dailyBias?.message} {...register('dailyBias')}>
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
              </Select>
            </div>
            <Select label="Killzone Confirmed" error={errors.killzoneConfirmed?.message} {...register('killzoneConfirmed')}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Select>
          </div>
        )}

        {/* Step 2: Setup */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="IFVG Timeframe" {...register('ifvgTimeframe')}>
                <option value="1min">1 min</option>
                <option value="2min">2 min</option>
                <option value="5min">5 min</option>
                <option value="15min">15 min</option>
              </Select>
              <Select label="Setup Grade" {...register('setupGrade')}>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Confirmation 1" {...register('confirmation1')}>
                <option value="Liquidity Sweep">Liquidity Sweep</option>
                <option value="SMT Divergence">SMT Divergence</option>
                <option value="FVG Alignment">FVG Alignment</option>
              </Select>
              <Select label="Confirmation 2" {...register('confirmation2')}>
                <option value="Liquidity Sweep">Liquidity Sweep</option>
                <option value="SMT Divergence">SMT Divergence</option>
                <option value="FVG Alignment">FVG Alignment</option>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Entry Price" type="number" step="0.25" error={errors.entryPrice?.message} {...register('entryPrice')} />
              <Input label="Stop Loss" type="number" step="0.25" error={errors.stopLoss?.message} {...register('stopLoss')} />
              <Input label="Take Profit" type="number" step="0.25" error={errors.takeProfit?.message} {...register('takeProfit')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="SL Type" {...register('stopLossType')}>
                <option value="Aggressive">Aggressive</option>
                <option value="Safe">Safe</option>
              </Select>
              <Input label="Contracts" type="number" min="1" error={errors.contracts?.message} {...register('contracts')} />
            </div>
            {rrTarget && (
              <div className="bg-surface2 border border-border rounded-xl p-3">
                <p className="text-xs text-secondary">Target R:R</p>
                <p className="text-xl font-mono font-bold text-accent">{rrTarget}R</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Result & Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Exit Price" type="number" step="0.25" error={errors.exitPrice?.message} {...register('exitPrice')} />
              <Select label="Result" {...register('result')}>
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
                <option value="Breakeven">Breakeven</option>
              </Select>
            </div>
            {(rrAchieved || pnl !== null) && (
              <div className="grid grid-cols-2 gap-4">
                {rrAchieved && (
                  <div className="bg-surface2 border border-border rounded-xl p-3">
                    <p className="text-xs text-secondary">Achieved R:R</p>
                    <p className={`text-xl font-mono font-bold ${parseFloat(rrAchieved) >= 0 ? 'text-accent' : 'text-danger'}`}>
                      {rrAchieved}R
                    </p>
                  </div>
                )}
                {pnl !== null && (
                  <div className="bg-surface2 border border-border rounded-xl p-3">
                    <p className="text-xs text-secondary">P&L (est.)</p>
                    <p className={`text-xl font-mono font-bold ${pnl >= 0 ? 'text-accent' : 'text-danger'}`}>
                      {formatCurrency(pnl)}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Select label="Rule Violation" {...register('ruleViolation')}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
              {accounts?.length > 0 && (
                <Select label="Account" {...register('accountId')}>
                  <option value="">Select account…</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              )}
            </div>
            {ruleViolation === 'Yes' && (
              <Input
                label="Violation description"
                placeholder="Describe the rule you violated…"
                {...register('violationDescription')}
              />
            )}
            <label className="flex items-center gap-2.5 bg-surface2 border border-border rounded-xl px-3 py-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-accent" {...register('isPublic')} />
              <div>
                <p className="text-sm text-primary">Share on Fabian's Trades</p>
                <p className="text-xs text-secondary">Make this trade visible on the public trades page</p>
              </div>
            </label>
            <div>
              <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">What went well</label>
              <textarea rows={2} className="w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60 px-3 py-2.5 resize-none focus:outline-none focus:border-accent/60" placeholder="What worked in this trade…" {...register('wentWell')} />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">To improve</label>
              <textarea rows={2} className="w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60 px-3 py-2.5 resize-none focus:outline-none focus:border-accent/60" placeholder="What you would do differently…" {...register('toImprove')} />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">Notes</label>
              <textarea rows={2} className="w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60 px-3 py-2.5 resize-none focus:outline-none focus:border-accent/60" placeholder="Any additional notes…" {...register('notes')} />
            </div>

            {/* Screenshot drop zone */}
            <div>
              <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">Screenshot</label>
              {screenshot ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img src={screenshot.url} alt="Preview" className="w-full max-h-48 object-cover rounded-xl border border-border" />
                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      className="absolute top-2 right-2 p-1 bg-background/80 rounded-full text-secondary hover:text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={handleAnalyze}
                    loading={analyzeScreenshot.isPending}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Analyze with AI & prefill
                  </Button>
                  <p className="text-xs text-secondary/60">
                    The screenshot is saved with this trade for future reference either way.
                  </p>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-sm text-secondary">Drop screenshot here or click to upload</p>
                  <p className="text-xs text-secondary/60 mt-1">PNG, JPG up to 10MB</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" className="flex-1" onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button type="submit" className="flex-1" loading={createTrade.isPending}>
              Log Trade
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}

// ---- Rate Trade Modal ----
function RateTradeModal({ trade, onClose }) {
  const [mode, setMode] = useState(null) // 'self' | 'ai' | null
  const [stars, setStars] = useState(0)
  const [aiResult, setAiResult] = useState(null)
  const rateTrade = useRateTrade()

  const open = !!trade

  function handleClose() {
    setMode(null)
    setStars(0)
    setAiResult(null)
    onClose()
  }

  async function submitSelfRating() {
    if (!stars) return
    try {
      await rateTrade.mutateAsync({ id: trade.id, ratingType: 'SELF', selfRating: stars })
      toast.success('Rating saved.')
      handleClose()
    } catch {
      toast.error('Failed to save rating.')
    }
  }

  async function submitAiRating() {
    try {
      const { trade: updated } = await rateTrade.mutateAsync({ id: trade.id, ratingType: 'AI' })
      setAiResult(updated)
      toast.success('AI rating ready.')
    } catch (err) {
      if (err?.response?.status === 503) {
        toast.error('AI rating is not configured yet (missing API key).')
      } else {
        toast.error('Failed to get AI rating.')
      }
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Rate this trade">
      {!mode && (
        <div className="space-y-3">
          <p className="text-sm text-secondary">
            How would you like to rate the quality of this trade's process?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('self')}
              className="border border-border rounded-xl p-4 text-left hover:border-accent/50 transition-colors"
            >
              <Star className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-semibold text-primary">Rate it myself</p>
              <p className="text-xs text-secondary mt-1">Give your own 1-5 quality score.</p>
            </button>
            <button
              type="button"
              onClick={() => { setMode('ai'); submitAiRating() }}
              className="border border-border rounded-xl p-4 text-left hover:border-accent/50 transition-colors"
            >
              <Sparkles className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-semibold text-primary">Get AI rating</p>
              <p className="text-xs text-secondary mt-1">Let AI review your trade and screenshot.</p>
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>Skip for now</Button>
        </div>
      )}

      {mode === 'self' && (
        <div className="space-y-4">
          <p className="text-sm text-secondary">Rate the quality of this trade's process from 1 to 5.</p>
          <div className="flex items-center gap-2 justify-center py-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setStars(n)}>
                <Star className={cn('w-8 h-8 transition-colors', n <= stars ? 'text-accent fill-accent' : 'text-secondary/30')} />
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setMode(null)}>Back</Button>
            <Button className="flex-1" onClick={submitSelfRating} loading={rateTrade.isPending} disabled={!stars}>
              Save rating
            </Button>
          </div>
        </div>
      )}

      {mode === 'ai' && (
        <div className="space-y-4">
          {rateTrade.isPending && (
            <div className="flex flex-col items-center gap-2 py-8 text-secondary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Analyzing your trade…</p>
            </div>
          )}
          {aiResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={cn('w-8 h-8', n <= aiResult.aiRating ? 'text-accent fill-accent' : 'text-secondary/30')} />
                ))}
              </div>
              {aiResult.aiFeedback && (
                <p className="text-sm text-primary leading-relaxed bg-surface2 border border-border rounded-xl p-3">
                  {aiResult.aiFeedback}
                </p>
              )}
              <Button className="w-full" onClick={handleClose}>Done</Button>
            </div>
          )}
          {!rateTrade.isPending && !aiResult && (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setMode(null)}>Back</Button>
              <Button className="flex-1" onClick={submitAiRating}>Try again</Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function ImportCsvModal({ open, onClose, accounts }) {
  const [file, setFile] = useState(null)
  const [accountId, setAccountId] = useState(accounts?.[0]?.id || '')
  const [result, setResult] = useState(null)
  const importCsv = useImportCsv()
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setFile(null)
      setResult(null)
      setAccountId(accounts?.[0]?.id || '')
    }
  }, [open, accounts])

  async function handleImport() {
    if (!file || !accountId) return
    try {
      const data = await importCsv.mutateAsync({ file, accountId })
      setResult(data)
      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} trade${data.imported !== 1 ? 's' : ''}.`)
      }
      if (data.skipped > 0) {
        toast.error(`Skipped ${data.skipped} row${data.skipped !== 1 ? 's' : ''}.`)
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to import CSV.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Trades from CSV">
      <div className="space-y-4">
        <p className="text-sm text-secondary">
          Upload a CSV export from your broker or trading journal. We'll do our best to map common
          columns (date, symbol, direction, entry/exit price, stop loss, take profit, size, P&amp;L)
          automatically. Any missing fields will be filled with sensible defaults.
        </p>

        <Select label="Import into account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {(accounts ?? []).map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>

        <div
          className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-accent/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <FileText className="w-5 h-5 text-accent" />
              <span className="text-sm">{file.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-secondary">
              <FileUp className="w-6 h-6" />
              <span className="text-sm">Click to choose a CSV file</span>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white/5 rounded-xl p-4 text-sm space-y-1">
            <p className="text-primary">Total rows: {result.total}</p>
            <p className="text-success">Imported: {result.imported}</p>
            <p className="text-danger">Skipped: {result.skipped}</p>
            {result.errors?.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-secondary list-disc list-inside max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button
            onClick={handleImport}
            disabled={!file || !accountId || importCsv.isPending}
            leftIcon={importCsv.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          >
            {importCsv.isPending ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const PAGE_SIZE = 20

export default function JournalPage() {
  const [market, setMarket] = useState('')
  const [session, setSession] = useState('')
  const [result, setResult] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ field: 'tradeDate', dir: 'desc' })
  const [expandedId, setExpandedId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [rateTradeTarget, setRateTradeTarget] = useState(null)

  const { data: tradesData, isLoading } = useTrades({
    symbol: market || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit: PAGE_SIZE,
  })
  const { data: accounts } = useAccounts()
  const deleteTrade = useDeleteTrade()

  const trades = tradesData?.trades ?? tradesData ?? []
  const total = tradesData?.total ?? trades.length

  // Client-side filter/sort on top of server results
  let visible = [...trades]
  if (session) visible = visible.filter((t) => (SESSION_FROM_API[t.session] ?? t.session) === session)
  if (result) visible = visible.filter((t) => (RESULT_FROM_API[t.result] ?? t.result) === result)
  visible.sort((a, b) => {
    const av = a[sort.field] ?? ''
    const bv = b[sort.field] ?? ''
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sort.dir === 'asc' ? cmp : -cmp
  })

  function toggleSort(field) {
    setSort((s) => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' })
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this trade?')) return
    try {
      await deleteTrade.mutateAsync(id)
      toast.success('Trade deleted.')
    } catch {
      toast.error('Failed to delete trade.')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Trade Journal</h1>
          <p className="text-sm text-secondary mt-0.5">{total} trade{total !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={<FileUp className="w-4 h-4" />} onClick={() => setShowImportModal(true)}>
            Import CSV
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Log Trade
          </Button>
        </div>
      </div>

      <ImportCsvModal open={showImportModal} onClose={() => setShowImportModal(false)} accounts={accounts} />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={market} onChange={(e) => setMarket(e.target.value)} containerClassName="w-28" className="h-9">
          <option value="">All Markets</option>
          <option value="NQ">NQ</option>
          <option value="ES">ES</option>
        </Select>
        <Select value={session} onChange={(e) => setSession(e.target.value)} containerClassName="w-32" className="h-9">
          <option value="">All Sessions</option>
          <option value="London">London</option>
          <option value="NY">NY</option>
        </Select>
        <Select value={result} onChange={(e) => setResult(e.target.value)} containerClassName="w-32" className="h-9">
          <option value="">All Results</option>
          <option value="Win">Win</option>
          <option value="Loss">Loss</option>
          <option value="Breakeven">BE</option>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} containerClassName="w-40" className="h-9" placeholder="From" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} containerClassName="w-40" className="h-9" placeholder="To" />
        {(market || session || result || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setMarket(''); setSession(''); setResult(''); setDateFrom(''); setDateTo('') }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No trades yet"
            description="Log your first trade to see it here."
            action={() => setShowModal(true)}
            actionLabel="Log Trade"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface2/50">
                  <SortHeader label="Date" field="dateTime" sort={sort} onSort={toggleSort} />
                  <SortHeader label="Market" field="market" sort={sort} onSort={toggleSort} />
                  <th className="text-left pb-3 pr-3 text-xs font-medium text-secondary uppercase tracking-wider pl-4">Session</th>
                  <SortHeader label="Dir." field="direction" sort={sort} onSort={toggleSort} />
                  <th className="text-left pb-3 pr-3 text-xs font-medium text-secondary uppercase tracking-wider">Setup</th>
                  <th className="text-left pb-3 pr-3 text-xs font-medium text-secondary uppercase tracking-wider">Confirms</th>
                  <SortHeader label="Entry" field="entryPrice" sort={sort} onSort={toggleSort} />
                  <th className="text-left pb-3 pr-3 text-xs font-medium text-secondary uppercase tracking-wider">SL</th>
                  <th className="text-left pb-3 pr-3 text-xs font-medium text-secondary uppercase tracking-wider">TP</th>
                  <th className="text-left pb-3 pr-3 text-xs font-medium text-secondary uppercase tracking-wider">Exit</th>
                  <SortHeader label="R:R" field="rrAchieved" sort={sort} onSort={toggleSort} />
                  <SortHeader label="P&L" field="pnl" sort={sort} onSort={toggleSort} />
                  <SortHeader label="Result" field="result" sort={sort} onSort={toggleSort} />
                  <th className="text-left pb-3 text-xs font-medium text-secondary uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((trade) => (
                  <Fragment key={trade.id}>
                    <tr
                      className="hover:bg-surface2/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                    >
                      <td className="py-3 pr-3 pl-4 font-mono text-xs text-secondary whitespace-nowrap">
                        {trade.dateTime ? format(new Date(trade.dateTime), 'MMM d HH:mm') : '—'}
                      </td>
                      <td className="py-3 pr-3 font-mono font-bold text-primary">{trade.market}</td>
                      <td className="py-3 pr-3 text-secondary">{SESSION_FROM_API[trade.session] ?? trade.session}</td>
                      <td className="py-3 pr-3"><DirectionCell direction={trade.direction} /></td>
                      <td className="py-3 pr-3 text-secondary">{SETUP_FROM_API[trade.setupGrade] ?? trade.setupGrade ?? '—'}</td>
                      <td className="py-3 pr-3 text-secondary text-xs">
                        {trade.confirmation1
                          ? `${(CONFIRM_FROM_API[trade.confirmation1] ?? trade.confirmation1).split(' ')[0]}${trade.confirmation2 ? ` + ${(CONFIRM_FROM_API[trade.confirmation2] ?? trade.confirmation2).split(' ')[0]}` : ''}`
                          : '—'}
                      </td>
                      <td className="py-3 pr-3 font-mono text-secondary">{trade.entryPrice ?? '—'}</td>
                      <td className="py-3 pr-3 font-mono text-secondary">{trade.slPrice ?? '—'}</td>
                      <td className="py-3 pr-3 font-mono text-secondary">{trade.tpPrice ?? '—'}</td>
                      <td className="py-3 pr-3 font-mono text-secondary">{trade.exitPrice ?? '—'}</td>
                      <td className={`py-3 pr-3 font-mono font-semibold ${getTradeColor(trade.rrAchieved)}`}>
                        {trade.rrAchieved != null ? `${trade.rrAchieved > 0 ? '+' : ''}${trade.rrAchieved}R` : '—'}
                      </td>
                      <td className={`py-3 pr-3 font-mono font-semibold ${getTradeColor(trade.pnl)}`}>
                        {trade.pnl != null ? formatCurrency(trade.pnl) : '—'}
                      </td>
                      <td className="py-3 pr-3">
                        {trade.result ? <ResultBadge result={trade.result} /> : '—'}
                      </td>
                      <td className="py-3">
                        <button
                          className="p-1.5 text-secondary hover:text-danger transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleDelete(trade.id) }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                    {expandedId === trade.id && (
                      <TradeDetail trade={trade} onRate={setRateTradeTarget} />
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Prev
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next
            </Button>
          </div>
        </div>
      )}

      <LogTradeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        accounts={accounts ?? []}
        onLogged={(trade) => trade?.id && setRateTradeTarget(trade)}
      />
      <RateTradeModal trade={rateTradeTarget} onClose={() => setRateTradeTarget(null)} />
    </div>
  )
}
