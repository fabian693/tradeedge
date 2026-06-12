import { useState } from 'react'
import { Plus, Wallet, TrendingUp, Edit2, Trash2, Target, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { format, addDays, differenceInDays } from 'date-fns'
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '../../hooks/useAccounts'
import { useTrades } from '../../hooks/useTrades'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { Input } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Modal } from '../../components/shared/Modal'
import { EmptyState } from '../../components/shared/EmptyState'
import { Badge } from '../../components/shared/Badge'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { formatCurrency, formatPercent } from '../../lib/utils'

const accountSchema = z.discriminatedUnion('accountType', [
  z.object({
    accountType: z.literal('BACKTEST'),
    name: z.string().min(1, 'Name required'),
    startingBalance: z.coerce.number().optional(),
    currentBalance: z.coerce.number().optional(),
    notes: z.string().optional(),
  }),
  z.object({
    accountType: z.literal('LIVE'),
    name: z.string().min(1, 'Name required'),
    propFirm: z.string().optional(),
    accountSize: z.coerce.number().positive('Must be positive'),
    startingBalance: z.coerce.number().positive('Must be positive'),
    currentBalance: z.coerce.number().positive('Must be positive'),
    profitTarget: z.coerce.number().positive('Must be positive'),
    maxDrawdownType: z.enum(['Trailing EOD', 'Static', 'Daily Loss Limit', 'Custom']),
    maxDrawdownValue: z.coerce.number().positive('Must be positive'),
    dailyLossLimit: z.coerce.number().optional(),
    consistencyRule: z.coerce.number().optional(),
    maxContracts: z.coerce.number().int().positive().optional(),
    payoutFrequency: z.enum(['Daily', 'Weekly', 'Every 5 days', 'Monthly']),
    notes: z.string().optional(),
  }),
])

function getDrawdownColor(pct) {
  if (pct >= 60) return 'bg-accent'
  if (pct >= 30) return 'bg-warning'
  return 'bg-danger'
}

function AccountDetailModal({ account, onClose, trades }) {
  const updateAccount = useUpdateAccount()
  const [editing, setEditing] = useState(false)
  const isBacktest = account.accountType === 'BACKTEST'

  const pnl = (account.currentBalance ?? 0) - (account.startingBalance ?? 0)
  const profitPct = account.profitTarget ? ((pnl / account.profitTarget) * 100) : 0
  const drawdownUsed = (account.startingBalance ?? 0) - (account.currentBalance ?? 0)
  const drawdownPct = account.maxDrawdownValue ? (100 - ((drawdownUsed / account.maxDrawdownValue) * 100)) : 0
  const cappedDrawdown = Math.max(0, Math.min(100, drawdownPct))

  // Projected completion
  const tradesForAccount = trades?.filter((t) => t.accountId === String(account.id)) ?? []
  const avgDailyPnl = tradesForAccount.length > 0
    ? pnl / Math.max(1, differenceInDays(new Date(), new Date(account.createdAt ?? Date.now())))
    : 0
  const remainingProfit = (account.profitTarget ?? 0) - pnl
  const daysToTarget = !isBacktest && account.profitTarget && avgDailyPnl > 0 ? Math.ceil(remainingProfit / avgDailyPnl) : null
  const projectedDate = daysToTarget ? format(addDays(new Date(), daysToTarget), 'MMM d, yyyy') : null

  const dailyCap = (account.profitTarget ?? 0) * 0.2

  return (
    <Modal open onClose={onClose} title={account.name} size="lg">
      <div className="space-y-6">
        {/* Balance overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface2 rounded-xl p-4">
            <p className="text-xs text-secondary mb-1">Current Balance</p>
            <p className="text-2xl font-mono font-bold text-primary">{formatCurrency(account.currentBalance)}</p>
          </div>
          <div className="bg-surface2 rounded-xl p-4">
            <p className="text-xs text-secondary mb-1">Total P&L</p>
            <p className={`text-2xl font-mono font-bold ${pnl >= 0 ? 'text-accent' : 'text-danger'}`}>
              {formatCurrency(pnl)}
            </p>
          </div>
        </div>

        {/* Progress bars */}
        {!isBacktest && (
          <div className="space-y-4">
            <ProgressBar
              label={`Profit Target (${formatCurrency(account.profitTarget)})`}
              value={Math.max(0, profitPct)}
              max={100}
              color="bg-accent"
              showLabel
            />
            <ProgressBar
              label={`Drawdown Remaining (${formatCurrency((account.maxDrawdownValue ?? 0) - drawdownUsed)} of ${formatCurrency(account.maxDrawdownValue ?? 0)})`}
              value={cappedDrawdown}
              max={100}
              color={getDrawdownColor(cappedDrawdown)}
              colorAuto={false}
              showLabel
            />
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Win Rate', value: `${tradesForAccount.length ? ((tradesForAccount.filter((t) => t.result === 'Win').length / tradesForAccount.length) * 100).toFixed(0) : '—'}%` },
            { label: 'Total Trades', value: tradesForAccount.length },
            { label: 'Total P&L', value: formatCurrency(pnl) },
          ].map((s) => (
            <div key={s.label} className="bg-surface2 rounded-xl p-3 text-center">
              <p className="text-xs text-secondary mb-1">{s.label}</p>
              <p className="font-mono font-bold text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Projected completion */}
        {projectedDate && (
          <div className="bg-accent/10 border border-accent/25 rounded-xl p-4">
            <p className="text-sm font-medium text-primary">Projected completion: <span className="text-accent">{projectedDate}</span></p>
            <p className="text-xs text-secondary mt-0.5">Based on average daily P&L of {formatCurrency(avgDailyPnl)}</p>
          </div>
        )}

        {/* Daily cap warning */}
        {!isBacktest && (
          <div className={`rounded-xl p-4 ${pnl > dailyCap ? 'bg-warning/10 border border-warning/30' : 'bg-surface2'}`}>
            <div className="flex items-center gap-2">
              {pnl > dailyCap && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
              <p className="text-sm text-primary">
                Daily profit cap recommendation: <span className="font-mono font-bold text-accent">{formatCurrency(dailyCap)}</span>
              </p>
            </div>
            {pnl > dailyCap && (
              <p className="text-xs text-warning mt-1">You have exceeded the recommended daily cap. Consider stopping for today.</p>
            )}
          </div>
        )}

        {/* Recent trades */}
        {tradesForAccount.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Recent Trades</p>
            <div className="space-y-2">
              {tradesForAccount.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-surface2 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-primary">{t.market}</span>
                    <Badge variant={t.direction === 'Long' ? 'green' : 'red'}>{t.direction}</Badge>
                  </div>
                  <span className={`font-mono text-sm font-semibold ${t.pnl >= 0 ? 'text-accent' : 'text-danger'}`}>
                    {formatCurrency(t.pnl)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)}>
            Edit Account
          </Button>
          <Button className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

function AccountCard({ account, onClick }) {
  const isBacktest = account.accountType === 'BACKTEST'
  const pnl = (account.currentBalance ?? 0) - (account.startingBalance ?? 0)
  const profitPct = Math.max(0, Math.min(100, (pnl / Math.max(1, account.profitTarget || 0)) * 100))
  const drawdownUsed = Math.max(0, (account.startingBalance ?? 0) - (account.currentBalance ?? 0))
  const drawdownRemaining = Math.max(0, (account.maxDrawdownValue || 0) - drawdownUsed)
  const drawdownPct = (drawdownRemaining / Math.max(1, account.maxDrawdownValue || 0)) * 100

  return (
    <Card
      className="hover:border-accent/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-semibold text-primary">{account.name}</p>
            <p className="text-xs text-secondary">
              {isBacktest ? 'Backtest' : (account.propFirmName ?? account.propFirm ?? account.broker ?? 'Self-managed')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isBacktest && <Badge variant="gray">Backtest</Badge>}
          <Badge variant={pnl >= 0 ? 'green' : 'red'}>
            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
          </Badge>
        </div>
      </div>

      <p className="text-3xl font-mono font-bold text-primary mb-4">
        {formatCurrency(account.currentBalance)}
      </p>

      {isBacktest ? null : (
        <div className="space-y-3">
          <ProgressBar
            label={`Profit Target — ${formatCurrency(account.profitTarget)}`}
            value={profitPct}
            max={100}
            color="bg-accent"
            colorAuto={false}
            size="sm"
          />
          <ProgressBar
            label={`Drawdown Remaining — ${formatCurrency(drawdownRemaining)}`}
            value={drawdownPct}
            max={100}
            color={getDrawdownColor(drawdownPct)}
            colorAuto={false}
            size="sm"
          />
        </div>
      )}

      {!isBacktest && account.consistencyRule && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-secondary">Consistency Rule: max <span className="text-primary font-mono">{account.consistencyRule}%</span> per day</p>
        </div>
      )}
    </Card>
  )
}

export default function AccountsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const { data: accounts, isLoading } = useAccounts()
  const { data: tradesData } = useTrades({ limit: 200 })
  const createAccount = useCreateAccount()
  const deleteAccount = useDeleteAccount()

  const trades = tradesData?.trades ?? tradesData ?? []

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountType: 'LIVE',
      maxDrawdownType: 'Static',
      payoutFrequency: 'Monthly',
    },
  })

  const accountType = watch('accountType')
  const isBacktest = accountType === 'BACKTEST'

  async function onSubmit(values) {
    try {
      await createAccount.mutateAsync(values)
      toast.success('Account created!')
      setShowAdd(false)
      reset()
    } catch {
      toast.error('Failed to create account.')
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!window.confirm('Delete this account?')) return
    try {
      await deleteAccount.mutateAsync(id)
      toast.success('Account deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Accounts</h1>
          <p className="text-sm text-secondary mt-0.5">Track your prop firm and personal accounts</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : !accounts?.length ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add your first trading account to start tracking performance and rules."
          action={() => setShowAdd(true)}
          actionLabel="Add Account"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="relative group">
              <AccountCard account={acc} onClick={() => setSelectedAccount(acc)} />
              <button
                onClick={(e) => handleDelete(acc.id, e)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-secondary opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-surface2 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); reset() }} title="Add Account" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Account Type" {...register('accountType')}>
            <option value="LIVE">Live / Prop Firm / Personal</option>
            <option value="BACKTEST">Backtest</option>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Account Name" placeholder={isBacktest ? 'Backtest — NQ Strategy A' : 'Main Funded Account'} error={errors.name?.message} {...register('name')} />
            {!isBacktest && (
              <Input label="Prop Firm Name" placeholder="Apex, FTMO, TopStep…" {...register('propFirm')} />
            )}
          </div>

          {isBacktest ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Starting Balance ($) — optional" type="number" placeholder="100000" {...register('startingBalance')} />
              <Input label="Current Balance ($) — optional" type="number" placeholder="100000" {...register('currentBalance')} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Account Size ($)" type="number" placeholder="100000" error={errors.accountSize?.message} {...register('accountSize')} />
                <Input label="Starting Balance ($)" type="number" placeholder="100000" error={errors.startingBalance?.message} {...register('startingBalance')} />
                <Input label="Current Balance ($)" type="number" placeholder="100000" error={errors.currentBalance?.message} {...register('currentBalance')} />
              </div>
              <Input label="Profit Target ($)" type="number" placeholder="10000" error={errors.profitTarget?.message} {...register('profitTarget')} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Max Drawdown Type" {...register('maxDrawdownType')}>
                  <option value="Trailing EOD">Trailing EOD</option>
                  <option value="Static">Static</option>
                  <option value="Daily Loss Limit">Daily Loss Limit</option>
                  <option value="Custom">Custom</option>
                </Select>
                <Input label="Max Drawdown Value ($)" type="number" placeholder="3000" error={errors.maxDrawdownValue?.message} {...register('maxDrawdownValue')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Daily Loss Limit ($) — optional" type="number" placeholder="1000" {...register('dailyLossLimit')} />
                <Input label="Consistency Rule (%) — optional" type="number" placeholder="30" hint="Max % of total profit per day" {...register('consistencyRule')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Max Contracts — optional" type="number" placeholder="5" {...register('maxContracts')} />
                <Select label="Payout Frequency" {...register('payoutFrequency')}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Every 5 days">Every 5 days</option>
                  <option value="Monthly">Monthly</option>
                </Select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wider block mb-1.5">Notes</label>
            <textarea rows={2} className="w-full bg-surface2 border border-border rounded-lg text-sm text-primary placeholder-secondary/60 px-3 py-2.5 resize-none focus:outline-none focus:border-accent/60" placeholder="Any notes about this account…" {...register('notes')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowAdd(false); reset() }}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={createAccount.isPending}>Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* Account Detail Modal */}
      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          trades={trades}
        />
      )}
    </div>
  )
}
