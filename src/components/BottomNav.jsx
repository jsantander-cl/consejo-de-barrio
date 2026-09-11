import { NavLink } from 'react-router-dom'
import { BOTTOM_NAV_ITEMS } from '../lib/navigation.js'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex lg:hidden justify-around items-center px-2 py-1 bg-surface shadow-sm border-t border-outline-variant/20">
      {BOTTOM_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-3 py-1 rounded-full text-xs transition-transform active:scale-95 ${
              isActive ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface-variant'
            }`
          }
        >
          <Icon size={20} />
          <span className="mt-0.5">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
