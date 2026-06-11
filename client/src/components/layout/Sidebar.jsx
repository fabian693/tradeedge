import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Brain,
  BarChart2,
  Calendar,
  CalendarRange,
  Wallet,
  GraduationCap,
  Settings,
  Megaphone,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { LogoIcon } from '../shared/Logo'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/checklist', icon: ClipboardList, label: 'Checklist' },
  { to: '/psychology', icon: Brain, label: 'Psychology' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/review', icon: Calendar, label: 'Weekly Review' },
  { to: '/calendar', icon: CalendarRange, label: 'Trading Calendar' },
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/learn', icon: GraduationCap, label: 'Learn' },
  { to: '/fabians-trades', icon: Megaphone, label: "Fabian's Trades" },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative',
          isActive
            ? 'text-accent bg-accent/10 font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-accent before:rounded-r-full'
            : 'text-secondary hover:text-primary hover:bg-surface2'
        )
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar({ onClose }) {
  return (
    <div className="flex flex-col h-full w-60 bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="w-7 h-7" />
          <span className="text-base font-bold tracking-tight text-primary">TradeEdge</span>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-surface2 transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Bottom info */}
      <div className="px-5 py-4 border-t border-border shrink-0">
        <p className="text-[10px] text-secondary/50 tracking-wider uppercase">v0.1.0 Beta</p>
      </div>
    </div>
  )
}
