import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'

// TODO: reemplazar por SELECT * FROM calendario_eventos WHERE fecha_inicio
// BETWEEN :inicioMes AND :finMes — resolviendo referencia_tipo (reunion|actividad|asignacion)
const EVENTOS_DEL_DIA = [
  { hora: '07:30 - 08:30 AM', tipo: 'Reunión', badge: 'info', titulo: 'Consejo de Barrio Mensual', lugar: 'Salón del Obispado' },
  { hora: '10:00 - 11:00 AM', tipo: 'Reunión', badge: 'info', titulo: 'Reunión Sacramental Especial', lugar: 'Capilla Principal' },
  { hora: '17:00 PM', tipo: 'Vencimiento', badge: 'danger', titulo: 'Entrega de paquetes de bienvenida', lugar: 'Responsable: Mariana Torres' },
  { hora: '18:30 PM', tipo: 'Actividad', badge: 'success', titulo: 'Charla fogonera para jóvenes de estaca', lugar: 'Centro de Estaca La Portada' },
]

const DIAS_MES = Array.from({ length: 31 }, (_, i) => i + 1)
const DIAS_CON_EVENTO = { 4: 'info', 7: 'danger', 11: 'info', 14: 'neutral', 18: 'multi', 21: 'danger' }

export default function Calendario() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(18)

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-primary">Calendario General de Ministración y Consejo</h1>
        </div>
        <p className="text-sm text-on-surface-variant mt-1">
          Sincronización unificada de sesiones presidenciales, deberes de templo y convenios del barrio.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-primary">Mayo 2025</h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-surface-container text-primary"><ChevronLeft size={18} /></button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container text-primary"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-on-surface-variant mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 4 }).map((_, i) => <div key={`empty-${i}`} />)}
            {DIAS_MES.map((d) => (
              <button
                key={d}
                onClick={() => setDiaSeleccionado(d)}
                className={`h-12 rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition-all ${
                  d === diaSeleccionado ? 'bg-primary-container text-on-primary font-semibold' : 'hover:bg-surface-container text-on-surface'
                }`}
              >
                <span>{d}</span>
                {DIAS_CON_EVENTO[d] && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    DIAS_CON_EVENTO[d] === 'danger' ? 'bg-error' : DIAS_CON_EVENTO[d] === 'multi' ? 'bg-secondary' : 'bg-primary'
                  }`} />
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-container" /> Reunión</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /> Actividad</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error" /> Compromiso</span>
          </div>
        </Card>

        <Card title={`Agenda del día ${diaSeleccionado}`} subtitle={`${EVENTOS_DEL_DIA.length} eventos programados`} className="lg:col-span-5">
          <div className="space-y-3">
            {EVENTOS_DEL_DIA.map((e) => (
              <div key={e.titulo} className="bg-surface border border-outline-variant/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1"><Clock size={13} /> {e.hora}</span>
                  <StatusBadge status={e.badge}>{e.tipo}</StatusBadge>
                </div>
                <h3 className="font-bold text-primary text-sm">{e.titulo}</h3>
                <p className="text-xs text-on-surface-variant mt-1">{e.lugar}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
