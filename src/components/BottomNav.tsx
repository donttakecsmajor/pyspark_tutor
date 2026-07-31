import { NavLink } from 'react-router-dom'
import { BookOpen, Home, RotateCcw, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Path', icon: Home, end: true },
  { to: '/practice', label: 'Practice', icon: RotateCcw },
  { to: '/reference', label: 'Reference', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  return (
    <nav className="nav-safe fixed bottom-0 left-0 right-0 z-40 border-t border-teal-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[480px] justify-around px-2 pt-2 pb-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium transition ${
                isActive ? 'text-brand' : 'text-ink-muted'
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
