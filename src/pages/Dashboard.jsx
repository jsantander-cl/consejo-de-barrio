import { Link } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, UserSearch, CalendarDays, Lock, ArrowRight } from 'lucide-react'
import { KpiCard, Card, StatusBadge } from '../components/ui.jsx'

// TODO: reemplazar por datos reales desde Supabase (tablas: asignaciones,
// miembros_seguimiento, miembro_checklist_progreso, actividades)
const KPIS = [
  { icon: CheckCircle2, label: 'Compromisos pendientes', value: 14, hint: '8 para este domingo' },
  { icon: AlertTriangle, label: 'Compromisos vencidos', value: 3, hint: 'Requieren atención inmediata', danger: true },
  { icon: UserSearch, label: 'Miembros en seguimiento', value: 28, hint: '+2 este mes en la senda' },
  { icon: CalendarDays, label: 'Próxima reunión general', value: '18 May', hint: 'Consejo de Barrio completo' },
]

const COMPROMISOS_POR_ORG = [
  { org: 'Sociedad de Socorro', total: 10, cumplido: 70, proceso: 20, pendiente: 10 },
  { org: 'Cuórum de Élderes', total: 12, cumplido: 50, proceso: 33, pendiente: 17 },
  { org: 'Mujeres Jóvenes', total: 8, cumplido: 75, proceso: 25, pendiente: 0 },
  { org: 'Primaria', total: 6, cumplido: 83, proceso: 17, pendiente: 0 },
  { org: 'Escuela Dominical', total: 4, cumplido: 50, proceso: 50, pendiente: 0 },
]

const SENDA = [
  { label: 'Inicio / Primeros pasos', count: 10, pct: 25, color: 'bg-primary-fixed-dim' },
  { label: 'En proceso ministerial', count: 14, pct: 35, color: 'bg-secondary' },
  { label: 'Preparando ordenanzas', count: 10, pct: 25, color: 'bg-secondary-container' },
  { label: 'Completado / Sostenido', count: 6, pct: 15, color: 'bg-tertiary-container' },
]

const PROXIMAS_ACTIVIDADES = [
  { dia: 'JUE', num: 15, org: 'Templo e Historia Familiar', titulo: 'Noche de Historia Familiar', hora: '19:00 hrs · Centro de Estaca' },
  { dia: 'SÁB', num: 17, org: 'Hombres y Mujeres Jóvenes', titulo: 'Campamento de Jóvenes del Barrio', hora: '08:00 hrs · Parque Los Cipreses' },
  { dia: 'MAR', num: 20, org: 'Sociedad de Socorro', titulo: 'Taller de Autosuficiencia y Nutrición', hora: '18:30 hrs · Salón Auxiliar' },
]

const VENCIDAS = [
  { titulo: 'Visita a Familia Morales', persona: 'Hno. Roberto Tapia · Cuórum de Élderes', dias: 'Venció hace 4d' },
  { titulo: 'Coordinación de Bienestar Temporal', persona: 'Hna. Elena Fuentes · Sociedad de Socorro', dias: 'Venció ayer' },
  { titulo: 'Permisos de Transporte Campamento', persona: 'Hno. Carlos Vega · Hombres Jóvenes', dias: 'Venció hace 2d' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">3er Trimestre 2026</span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight mt-1">Tablero del Consejo</h1>
          <p className="text-sm text-on-surface-variant">Coordinación y estado de deliberación del Barrio Cerro Moreno.</p>
        </div>
      </div>

      {/* Tarjeta de acceso reservado — solo obispado/secretarios la ven en el sidebar,
          pero mostramos el enlace igual porque RutaProtegidaObispado filtra el acceso real */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary uppercase font-bold tracking-wider">Acceso reservado · Obispado</span>
                <StatusBadge status="info">Confidencial</StatusBadge>
              </div>
              <h2 className="text-base font-semibold text-on-surface mt-0.5">
                Próxima reunión de obispado: Domingo 18 May · 06:30 AM
              </h2>
            </div>
          </div>
          <Link
            to="/reuniones/obispado"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-container bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/40 shadow-xs shrink-0"
          >
            Ver agenda confidencial <ArrowRight size={16} />
          </Link>
        </div>
      </Card>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          title="Compromisos por organización"
          subtitle="Balance de cumplimiento asignado en el consejo"
          className="lg:col-span-7"
        >
          <div className="space-y-4">
            {COMPROMISOS_POR_ORG.map((o) => (
              <div key={o.org} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-on-surface">{o.org}</span>
                  <span className="text-xs text-on-surface-variant">{o.total} tareas · {o.cumplido}% cumplido</span>
                </div>
                <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden flex">
                  <div className="bg-secondary h-full" style={{ width: `${o.cumplido}%` }} />
                  <div className="bg-status-warning-text/70 h-full" style={{ width: `${o.proceso}%` }} />
                  <div className="bg-error h-full" style={{ width: `${o.pendiente}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Progreso senda de convenios"
          subtitle="Distribución de 40 miembros en acompañamiento"
          className="lg:col-span-5"
        >
          <div className="flex flex-col gap-2">
            {SENDA.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${s.color}`} />
                  <span className="text-on-surface">{s.label}</span>
                </div>
                <span className="font-bold text-primary">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Próximas actividades" action={<Link to="/calendario" className="text-xs text-primary font-semibold hover:underline">Ver calendario</Link>}>
          <div className="space-y-2">
            {PROXIMAS_ACTIVIDADES.map((a) => (
              <div key={a.titulo} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest/70 flex flex-col items-center justify-center shrink-0 text-primary">
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">{a.dia}</span>
                  <span className="text-lg font-bold leading-tight">{a.num}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-secondary block">{a.org}</span>
                  <h4 className="text-sm font-semibold text-primary truncate">{a.titulo}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{a.hora}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Asignaciones vencidas críticas"
          action={<StatusBadge status="danger">{VENCIDAS.length} pendientes</StatusBadge>}
        >
          <div className="space-y-3">
            {VENCIDAS.map((v) => (
              <div key={v.titulo} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-outline-variant/15 first:border-0 first:pt-0">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-primary">{v.titulo}</h4>
                    <StatusBadge status="danger">{v.dias}</StatusBadge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{v.persona}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-3 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-xs font-medium text-primary">Contactar</button>
                  <button className="px-3 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-xs font-medium text-on-surface">Reasignar</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
