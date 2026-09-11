import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, Lock } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'

// Las 7 secciones canónicas definidas en el instructivo de Consejo de Barrio.
// TODO: reemplazar por SELECT * FROM agenda_items WHERE reunion_id = :id ORDER BY orden
const SECCIONES = [
  { id: 1, titulo: 'Apertura', desc: 'Himno inicial, invocación y bienvenida', estado: 'Completada' },
  { id: 2, titulo: 'Informe de asignaciones anteriores', desc: 'Revisión de compromisos de la última reunión', estado: '4 cumplidas' },
  { id: 3, titulo: 'Coordinación misional', desc: 'Líder misional, misioneros y amigos de la Iglesia', estado: '3 investigadores' },
  { id: 4, titulo: 'Bienestar espiritual y temporal', desc: 'Familias necesitadas, apoyo alimentario', estado: '2 casos', confidencial: true },
  { id: 5, titulo: 'Obra del templo e historia familiar', desc: 'Preparación para recomendación, nuevos conversos', estado: 'Meta: 75%' },
  { id: 6, titulo: 'Autosuficiencia', desc: 'Grupos de finanzas personales, idiomas y educación', estado: '2 grupos activos' },
  { id: 7, titulo: 'Asignaciones y cierre', desc: 'Resumen de compromisos pactados y última oración', estado: '3 nuevas' },
]

export default function ReunionDetalle() {
  const { id } = useParams()
  const [abiertas, setAbiertas] = useState({ 1: true })

  function toggle(sid) {
    setAbiertas((prev) => ({ ...prev, [sid]: !prev[sid] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-surface-container px-2.5 py-0.5 rounded-full border border-outline-variant/40">
          Reunión mensual · ID {id}
        </span>
        <h1 className="text-2xl font-semibold text-primary mt-2">Consejo de Barrio - Mayo 2025</h1>
        <p className="text-sm text-on-surface-variant mt-1">Domingo 18 de Mayo, 07:30 - 08:30 AM · Oficina del Obispado</p>
      </div>

      <Card>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-primary">Tiempo transcurrido: 28 min / 60 min máximo</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-primary font-semibold">32 min restantes</span>
        </div>
        <div className="mt-3 w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
          <div className="bg-secondary h-2.5 rounded-full" style={{ width: '46.6%' }} />
        </div>
      </Card>

      <div className="space-y-3">
        {SECCIONES.map((s) => (
          <div key={s.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <button
              onClick={() => toggle(s.id)}
              className="w-full p-4 bg-surface-container-low/40 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-primary text-on-primary text-sm font-semibold flex items-center justify-center shrink-0">
                  {s.id}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-primary">{s.titulo}</h3>
                    {s.confidencial && <Lock size={14} className="text-on-surface-variant" />}
                  </div>
                  <span className="text-sm text-on-surface-variant">{s.desc}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status="info">{s.estado}</StatusBadge>
                <ChevronDown size={18} className={`text-on-surface-variant transition-transform ${abiertas[s.id] ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {abiertas[s.id] && (
              <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-3">
                <textarea
                  rows={2}
                  placeholder="Notas y observaciones de esta sección..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    placeholder="Agregar asignación derivada de esta sección..."
                    className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button className="px-4 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-primary text-sm font-medium hover:bg-surface-container-high">
                    Registrar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
