import { NavLink } from 'react-router-dom'
import { BOTTOM_NAV_ITEMS } from '../lib/navigation.js'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex lg:hidden justify-around items-center px-2 py-1.5 bg-primary shadow-lg border-t border-primary/20">
      {BOTTOM_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-3 py-1 rounded-2xl text-xs transition-all active:scale-95 ${
              isActive 
                ? 'bg-white/20 text-white font-bold scale-105' 
                : 'text-white/70 hover:text-white'
            }`
          }
        >
          <Icon size={20} className="text-white" />
          <span className="mt-0.5 text-[10px] text-white tracking-tight">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}