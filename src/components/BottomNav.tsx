import { NavLink } from 'react-router-dom'
import { BookOpen, Home, RotateCcw, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Learn', icon: Home, end: true },
  { to: '/practice', label: 'Practice', icon: RotateCcw },
  { to: '/reference', label: 'Glossary', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  return (
    <nav className="nav-safe fixed right-0 bottom-0 left-0 z-40 border-t-2 border-line bg-white">
      <div className="mx-auto flex max-w-[480px] justify-around px-2 pt-2 pb-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-2xl border-2 px-3 py-1.5 text-[11px] font-extrabold tracking-wide uppercase transition ${
                isActive
                  ? 'border-brand/30 bg-brand-soft text-brand'
                  : 'border-transparent text-ink-muted'
              }`
            }
          >
            <Icon className="h-6 w-6" strokeWidth={2.5} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
