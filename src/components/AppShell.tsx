import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

const hideNav = ['/lesson', '/checkpoint', '/placement', '/welcome']

export function AppShell() {
  const { pathname } = useLocation()
  const showNav = !hideNav.some((p) => pathname.startsWith(p))

  return (
    <div className="app-shell">
      <main className={showNav ? 'safe-bottom flex-1' : 'flex-1'}>
        <Outlet />
      </main>
      {showNav ? <BottomNav /> : null}
    </div>
  )
}
