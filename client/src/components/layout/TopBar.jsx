import { useState, useRef, useEffect } from 'react'
import { Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useAccounts } from '../../hooks/useAccounts'
import { cn } from '../../lib/utils'
import { LogoIcon } from '../shared/Logo'

function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface2 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-semibold">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-medium text-primary leading-none">{user?.name ?? 'Trader'}</p>
          <p className="text-[10px] text-secondary mt-0.5 leading-none">{user?.email}</p>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-secondary transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-surface2 border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-sm font-medium text-primary">{user?.name ?? 'Trader'}</p>
            <p className="text-xs text-secondary truncate">{user?.email}</p>
          </div>
          <div className="p-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface rounded-lg transition-colors">
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountSelector({ accounts }) {
  const [selected, setSelected] = useState(accounts?.[0]?.id ?? '')

  if (!accounts || accounts.length <= 1) return null

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="appearance-none bg-surface2 border border-border rounded-lg text-sm text-primary h-9 pl-3 pr-8 focus:outline-none focus:border-accent/60 cursor-pointer"
      >
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
    </div>
  )
}

export function TopBar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const { data: accounts } = useAccounts()

  return (
    <header className="h-14 bg-surface/80 border-b border-border backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface2 transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <LogoIcon className="w-6 h-6" />
        <span className="text-sm font-bold text-primary">TradeEdge</span>
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <AccountSelector accounts={accounts} />

        <button className="relative p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface2 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>

        <UserMenu user={user} logout={logout} />
      </div>
    </header>
  )
}
