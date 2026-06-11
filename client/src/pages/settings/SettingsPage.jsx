import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  User, Bell, Shield, CreditCard, Database, AlertTriangle, Download, Trash2,
  Check, Zap,
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '../../lib/axios'
import { queryClient } from '../../lib/queryClient'
import { useAuth } from '../../hooks/useAuth'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { Button } from '../../components/shared/Button'
import { Input, Textarea } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Modal } from '../../components/shared/Modal'
import { cn } from '../../lib/utils'

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security',      label: 'Security',      icon: Shield },
  { id: 'subscription',  label: 'Plan',          icon: CreditCard },
  { id: 'data',          label: 'Data',          icon: Database },
]

// ── Profile Tab ──────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name:             z.string().min(2, 'Minimum 2 characters'),
  email:            z.string().email('Invalid email'),
  experienceLevel:  z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  propFirm:         z.string().optional(),
  accountSize:      z.coerce.number().positive().optional().or(z.literal('')),
  preferredSession: z.enum(['LONDON', 'NY', 'BOTH']),
  timezone:         z.string().min(1),
})

function ProfileTab({ user }) {
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:             user?.name ?? '',
      email:            user?.email ?? '',
      experienceLevel:  user?.experienceLevel ?? 'BEGINNER',
      propFirm:         user?.propFirm ?? '',
      accountSize:      user?.accountSize ?? '',
      preferredSession: user?.preferredSession ?? 'BOTH',
      timezone:         user?.timezone ?? 'America/New_York',
    },
  })

  async function onSubmit(values) {
    try {
      await api.put('/auth/profile', values)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Avatar */}
      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Avatar</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-2xl font-bold select-none">
            {user?.name?.[0]?.toUpperCase() ?? 'T'}
          </div>
          <div>
            <p className="text-sm text-primary font-medium">{user?.name}</p>
            <p className="text-xs text-secondary mt-0.5">{user?.email}</p>
            <p className="text-xs text-secondary mt-1">Avatar is auto-generated from your name initial</p>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
        </div>
      </Card>

      {/* Trading profile */}
      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Trading Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Experience level" error={errors.experienceLevel?.message} {...register('experienceLevel')}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </Select>
          <Select label="Preferred session" error={errors.preferredSession?.message} {...register('preferredSession')}>
            <option value="LONDON">London</option>
            <option value="NY">New York</option>
            <option value="BOTH">Both</option>
          </Select>
          <Input label="Primary prop firm" placeholder="e.g. Tradeify" {...register('propFirm')} />
          <Input label="Account size (USD)" type="number" placeholder="50000" {...register('accountSize')} />
        </div>
      </Card>

      {/* Timezone */}
      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Timezone</h3>
        <Select label="Your timezone" error={errors.timezone?.message} {...register('timezone')}>
          <option value="America/New_York">Eastern Time (ET), UTC 5/4</option>
          <option value="America/Chicago">Central Time (CT), UTC 6/5</option>
          <option value="America/Denver">Mountain Time (MT), UTC 7/6</option>
          <option value="America/Los_Angeles">Pacific Time (PT), UTC 8/7</option>
          <option value="America/Sao_Paulo">Brasília Time (BRT), UTC 3</option>
          <option value="Europe/London">London (GMT/BST), UTC+0/1</option>
          <option value="Europe/Berlin">Central Europe (CET), UTC+1/2</option>
          <option value="Europe/Istanbul">Turkey (TRT), UTC+3</option>
          <option value="Asia/Dubai">Dubai (GST), UTC+4</option>
          <option value="Asia/Singapore">Singapore (SGT), UTC+8</option>
          <option value="Asia/Tokyo">Tokyo (JST), UTC+9</option>
          <option value="Australia/Sydney">Sydney (AEST), UTC+10/11</option>
        </Select>
        <p className="text-xs text-secondary mt-2">
          Used to display trade times and killzone windows in your local time.
        </p>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

// ── Notifications Tab ────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        checked ? 'bg-accent' : 'bg-surface2 border border-border',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  )
}

function NotificationRow({ label, description, checked, onChange, proOnly, isPro }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
      <div className="pr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-primary">{label}</p>
          {proOnly && !isPro && (
            <span className="text-[10px] font-bold bg-warning/20 text-warning px-1.5 py-0.5 rounded-full">PRO</span>
          )}
        </div>
        <p className="text-xs text-secondary mt-0.5">{description}</p>
      </div>
      <Toggle
        checked={proOnly && !isPro ? false : checked}
        onChange={onChange}
        disabled={proOnly && !isPro}
      />
    </div>
  )
}

function NotificationsTab({ user }) {
  const isPro = user?.tier === 'PRO'
  const [prefs, setPrefs] = useState({
    londonKillzone:     true,
    nyKillzone:         true,
    dailyCheckin:       true,
    weeklyReview:       true,
    consistencyWarning: true,
    drawdownWarning:    true,
    emailDigest:        false,
  })
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  async function save() {
    try {
      await api.put('/auth/preferences', { notifications: prefs })
      toast.success('Notification preferences saved!')
    } catch {
      toast.error('Failed to save preferences')
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Killzone Reminders</h3>
        <p className="text-xs text-secondary mb-4">Browser notifications 30 minutes before each killzone opens.</p>
        <NotificationRow
          label="London killzone reminder"
          description="30 min before 02:00 EST, 01:30 EST"
          checked={prefs.londonKillzone}
          onChange={() => toggle('londonKillzone')}
          proOnly isPro={isPro}
        />
        <NotificationRow
          label="NY killzone reminder"
          description="30 min before 08:30 EST, 08:00 EST"
          checked={prefs.nyKillzone}
          onChange={() => toggle('nyKillzone')}
          proOnly isPro={isPro}
        />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Session Reminders</h3>
        <p className="text-xs text-secondary mb-4">Prompts to help you stay consistent with your routine.</p>
        <NotificationRow
          label="Daily checkin reminder"
          description="Reminded when you open the app without completing today's checkin"
          checked={prefs.dailyCheckin}
          onChange={() => toggle('dailyCheckin')}
          proOnly isPro={isPro}
        />
        <NotificationRow
          label="Weekly review reminder"
          description="Prompt every Sunday evening to complete your weekly review"
          checked={prefs.weeklyReview}
          onChange={() => toggle('weeklyReview')}
        />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Account Warnings</h3>
        <p className="text-xs text-secondary mb-4">Alerts when approaching prop firm rule limits.</p>
        <NotificationRow
          label="Consistency rule warning"
          description="Alert when a day's P&L approaches 35% of total profit"
          checked={prefs.consistencyWarning}
          onChange={() => toggle('consistencyWarning')}
          proOnly isPro={isPro}
        />
        <NotificationRow
          label="Drawdown buffer warning"
          description="Alert when drawdown buffer drops below 25%"
          checked={prefs.drawdownWarning}
          onChange={() => toggle('drawdownWarning')}
          proOnly isPro={isPro}
        />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Email</h3>
        <p className="text-xs text-secondary mb-4">Weekly performance digest sent to your email.</p>
        <NotificationRow
          label="Weekly performance email"
          description="Receive a summary of your week's trades and psychology scores every Monday morning"
          checked={prefs.emailDigest}
          onChange={() => toggle('emailDigest')}
          proOnly isPro={isPro}
        />
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>Save Preferences</Button>
      </div>
    </div>
  )
}

// ── Security Tab ─────────────────────────────────────────────────────────────
const pwSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword:     z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function SecurityTab({ user }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(pwSchema),
  })

  async function onSubmit(values) {
    try {
      await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword:     values.newPassword,
      })
      toast.success('Password updated!')
      reset()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to update password')
    }
  }

  return (
    <div className="space-y-5">
      {user?.googleId && !user?.passwordHash && (
        <div className="bg-surface2 border border-border rounded-xl p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-secondary shrink-0" />
          <p className="text-sm text-secondary">
            Your account uses Google sign-in. Password change is not available for Google accounts.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Change Password</h3>
          <div className="space-y-4">
            <Input
              label="Current password"
              type="password"
              placeholder="••••••••"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
          <div className="flex justify-end mt-5">
            <Button type="submit" loading={isSubmitting}>Update Password</Button>
          </div>
        </Card>
      </form>

      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Active Sessions</h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-primary">Current session</p>
            <p className="text-xs text-secondary mt-0.5">Signed in now · {user?.email}</p>
          </div>
          <span className="text-xs bg-accent/15 text-accent px-2 py-1 rounded-full font-medium">Active</span>
        </div>
      </Card>
    </div>
  )
}

// ── Subscription Tab ─────────────────────────────────────────────────────────
const PRO_FEATURES = [
  'Unlimited trade logging',
  'Full learning centre & method course',
  'Full analytics dashboard',
  'Confirmation combo tracking',
  'Prop firm rules tracker',
  'Multiple accounts',
  'Screenshot uploads',
  'Weekly review format',
  'CSV export',
  'Streak tracker & personal bests',
  'Killzone reminder notifications',
  'Weekly performance email',
]

function SubscriptionTab({ user }) {
  const isPro = user?.tier === 'PRO'

  return (
    <div className="space-y-5">
      {/* Current plan */}
      <Card className={isPro ? 'border-accent/30' : ''}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-primary">{isPro ? 'TradeEdge Pro' : 'Free Plan'}</h3>
              {isPro && (
                <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">Active</span>
              )}
            </div>
            {isPro ? (
              <p className="text-sm text-secondary">£20/month · Full access to all features</p>
            ) : (
              <p className="text-sm text-secondary">5 trades/month · Psychology system included</p>
            )}
          </div>
          {isPro && (
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-accent">£20</p>
              <p className="text-xs text-secondary">/ month</p>
            </div>
          )}
        </div>

        {isPro && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-secondary">Next billing date: not scheduled</p>
            <button className="text-xs text-secondary hover:text-danger transition-colors underline underline-offset-2">
              Cancel subscription
            </button>
          </div>
        )}
      </Card>

      {/* Upgrade CTA */}
      {!isPro && (
        <div className="bg-accent/8 border border-accent/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-primary">Upgrade to TradeEdge Pro</h3>
          </div>
          <p className="text-sm text-secondary mb-5 leading-relaxed">
            Get full access to the learning centre, unlimited trade logging, advanced analytics, and everything you need to grow as a funded trader.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-xs text-primary/90">{f}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => toast('Stripe integration coming soon!')}
          >
            <Zap className="w-4 h-4" />
            Upgrade to Pro: £20/month
          </Button>
          <p className="text-center text-xs text-secondary mt-3">Cancel anytime · Secure payment via Stripe</p>
        </div>
      )}
    </div>
  )
}

// ── Data Tab ─────────────────────────────────────────────────────────────────
function DataTab({ user }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [exporting, setExporting] = useState(false)
  const { logout } = useAuth()

  async function handleExport() {
    setExporting(true)
    try {
      const response = await api.get('/trades/export/csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `tradeedge-trades-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Trade log exported!')
    } catch {
      toast.error('Export failed, try again')
    } finally {
      setExporting(false)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: () => api.delete('/auth/account'),
    onSuccess: () => {
      toast.success('Account deleted')
      logout()
    },
    onError: () => toast.error('Failed to delete account'),
  })

  const canDelete = deleteConfirm === user?.email

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Export Data</h3>
        <p className="text-sm text-secondary mb-4 leading-relaxed">
          Download your complete trade log as a CSV file, including all fields: entry, SL, TP, RR, P&L, confirmations, psychology score, and notes.
        </p>
        <Button
          variant="secondary"
          leftIcon={<Download className="w-4 h-4" />}
          loading={exporting}
          onClick={handleExport}
        >
          Export Trade Log (CSV)
        </Button>
      </Card>

      <Card className="border-danger/20">
        <h3 className="text-sm font-semibold text-danger uppercase tracking-wider mb-1">Danger Zone</h3>
        <p className="text-sm text-secondary mb-4 leading-relaxed">
          Permanently delete your TradeEdge account and all associated data. This action cannot be undone. All trades, psychology data, accounts, and reviews will be removed immediately.
        </p>
        <Button
          variant="danger"
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={() => setDeleteOpen(true)}
        >
          Delete Account
        </Button>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteConfirm('') }}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-danger/10 border border-danger/20 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-primary/90">
              This will permanently delete <strong>all your data</strong>: trades, psychology records, accounts, and weekly reviews. This cannot be undone.
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-2">
              Type your email address to confirm: <span className="text-primary font-mono">{user?.email}</span>
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={user?.email}
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:border-danger/60"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setDeleteOpen(false); setDeleteConfirm('') }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={!canDelete}
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState('profile')
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-secondary mt-0.5">Manage your account, notifications, and preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1',
              tab === id
                ? 'bg-surface2 text-primary shadow-sm'
                : 'text-secondary hover:text-primary'
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'profile'       && <ProfileTab user={user} />}
      {tab === 'notifications' && <NotificationsTab user={user} />}
      {tab === 'security'      && <SecurityTab user={user} />}
      {tab === 'subscription'  && <SubscriptionTab user={user} />}
      {tab === 'data'          && <DataTab user={user} />}
    </div>
  )
}
