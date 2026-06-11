import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { useCreateTrade } from '../../hooks/useTrades'
import { Card } from '../../components/shared/Card'
import { Input, Textarea } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Button } from '../../components/shared/Button'
import { PriceInput } from '../../components/shared/PriceInput'
import { RRInput } from '../../components/shared/RRInput'

const schema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10).toUpperCase(),
  direction: z.enum(['LONG', 'SHORT'], { required_error: 'Direction is required' }),
  setup: z.string().optional(),
  entryPrice: z.coerce.number().positive('Entry price must be positive'),
  exitPrice: z.coerce.number().positive('Exit price must be positive').optional(),
  stopLoss: z.coerce.number().positive().optional(),
  takeProfit: z.coerce.number().positive().optional(),
  size: z.coerce.number().positive('Size must be positive'),
  rr: z.coerce.number().optional(),
  pnl: z.coerce.number().optional(),
  preTradeNotes: z.string().optional(),
  postTradeNotes: z.string().optional(),
  tags: z.string().optional(),
  tradeDate: z.string().min(1, 'Date is required'),
  emotion: z.string().optional(),
})

const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'FOMO', 'Revenge', 'Bored', 'Focused']
const SETUPS = ['ORB', 'VWAP', 'Breakout', 'Reversal', 'Continuation', 'News Play', 'Other']

export default function NewTradePage() {
  const navigate = useNavigate()
  const createTrade = useCreateTrade()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tradeDate: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(values) {
    try {
      await createTrade.mutateAsync(values)
      toast.success('Trade logged!')
      navigate('/journal')
    } catch {
      toast.error('Failed to log trade. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary">Log Trade</h1>
          <p className="text-sm text-secondary">Record a new trade in your journal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Trade basics */}
        <Card>
          <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Trade Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Symbol"
              placeholder="NQ, ES, AAPL…"
              error={errors.symbol?.message}
              className="uppercase"
              {...register('symbol')}
            />
            <Select
              label="Direction"
              error={errors.direction?.message}
              {...register('direction')}
            >
              <option value="">Select…</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </Select>
            <Select label="Setup" {...register('setup')}>
              <option value="">Select setup…</option>
              {SETUPS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input
              label="Date"
              type="date"
              error={errors.tradeDate?.message}
              {...register('tradeDate')}
            />
          </div>
        </Card>

        {/* Prices */}
        <Card>
          <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Prices & Size</h2>
          <div className="grid grid-cols-2 gap-4">
            <PriceInput
              label="Entry Price"
              placeholder="4500.00"
              currency=""
              error={errors.entryPrice?.message}
              {...register('entryPrice')}
            />
            <PriceInput
              label="Exit Price"
              placeholder="4510.00"
              currency=""
              {...register('exitPrice')}
            />
            <PriceInput
              label="Stop Loss"
              placeholder="4490.00"
              currency=""
              {...register('stopLoss')}
            />
            <PriceInput
              label="Take Profit"
              placeholder="4520.00"
              currency=""
              {...register('takeProfit')}
            />
            <Input
              label="Size / Contracts"
              type="number"
              step="0.01"
              placeholder="1"
              error={errors.size?.message}
              {...register('size')}
            />
            <RRInput label="Actual R:R" placeholder="2.0" {...register('rr')} />
            <PriceInput
              label="P&L ($)"
              placeholder="240.00"
              error={errors.pnl?.message}
              {...register('pnl')}
            />
            <Select label="Emotion during trade" {...register('emotion')}>
              <option value="">Select…</option>
              {EMOTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
            </Select>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Notes</h2>
          <div className="space-y-4">
            <Textarea
              label="Pre-trade thesis"
              placeholder="Why are you taking this trade? What's your edge?"
              rows={3}
              {...register('preTradeNotes')}
            />
            <Textarea
              label="Post-trade review"
              placeholder="What went well? What would you do differently?"
              rows={3}
              {...register('postTradeNotes')}
            />
            <Input
              label="Tags (comma-separated)"
              placeholder="A+ setup, discipline, FOMO"
              {...register('tags')}
            />
          </div>
        </Card>

        <div className="flex gap-3 justify-end pb-6">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || createTrade.isPending}>
            Save Trade
          </Button>
        </div>
      </form>
    </div>
  )
}
