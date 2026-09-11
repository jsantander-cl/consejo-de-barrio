import {
  LayoutDashboard, CalendarClock, ClipboardCheck, Flag, CalendarDays, Users, Lock,
} from 'lucide-react'

// Fuente única de verdad para la navegación. Cambia aquí y se refleja en
// el Sidebar de escritorio, el drawer móvil y el BottomNav.
export const NAV_ITEMS = [
  { to: '/', label: 'Tablero General', icon: LayoutDashboard, end: true },
  { to: '/reuniones', label: 'Consejo de Barrio', icon: CalendarClock },
  { to: '/reuniones/obispado', label: 'Obispado', icon: Lock, restringido: true },
  { to: '/compromisos', label: 'Compromisos y Tareas', icon: ClipboardCheck },
  { to: '/senda-convenios', label: 'Senda de Convenios', icon: Flag },
  { to: '/actividades', label: 'Planificador de Actividades', icon: CalendarDays },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/organizaciones', label: 'Organizaciones', icon: Users },
]

// Subconjunto mostrado en la barra inferior móvil (espacio limitado)
export const BOTTOM_NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/reuniones', label: 'Agenda', icon: CalendarClock },
  { to: '/compromisos', label: 'Tareas', icon: ClipboardCheck },
  { to: '/senda-convenios', label: 'Senda', icon: Flag },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
]
