import { useState } from 'react'
import { ChevronDown, Lock, ShieldCheck } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'

// Las 8 secciones canónicas de la Reunión de Obispado (Manual General 7.3).
// TODO: reemplazar por agenda_items WHERE reunion_id = :id AND categoria pertenece
// al set de categorías 'obispado'
const SECCIONES = [
  { id: 1, titulo: 'Apertura y devocional', desc: 'Himno, oración, pensamiento doctrinal', estado: 'Cumplido' },
  { id: 2, titulo: 'Coordinación de la obra de salvación y exaltación', desc: 'Ministración de familias prioritarias', estado: 'En progreso' },
  { id: 3, titulo: 'Fortalecimiento de jóvenes y niños', desc: 'Énfasis Sacerdocio Aarónico y Mujeres Jóvenes', estado: 'En deliberación' },
  { id: 4, titulo: 'Preparación para ordenanzas sagradas', desc: 'Bautismos, ordenaciones, bendiciones de niños', estado: '3 casos' },
  { id: 5, titulo: 'Llamamientos a cargos del barrio', desc: 'Propuestas de relevos y vacantes', estado: 'En oración' },
  { id: 6, titulo: 'Recomendaciones para servicio misional', desc: 'Candidatos en preparación', estado: '1 candidato' },
  { id: 7, titulo: 'Organizaciones, programas y presupuesto', desc: 'Asignaciones trimestrales, bienestar temporal', estado: 'Revisado' },
  { id: 8, titulo: 'Revisión de escrituras y Manual General', desc: 'Cartas de la Primera Presidencia', estado: 'Al día' },
]

export default function ReunionObispado() {
  const [abiertas, setAbiertas] = useState({})
  function toggle(id) {
    setAbiertas((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
        <div className="bg-primary-container px-4 py-2 flex items-center justify-between text-on-primary-container">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <span className="text-xs tracking-wider uppercase font-semibold">Registro de carácter sagrado y reservado</span>
          </div>
        </div>
        <div className="p-4 md:p-6 flex items-center justify-between gap-3">
          <div>
            <StatusBadge status="info">Confidencial — Solo obispado y secretarios</StatusBadge>
            <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
              Los asuntos tratados en esta sesión involucran la dignidad espiritual, llamamientos y bienestar
              de las familias del barrio. Mantenga la estricta discreción pastoral ordenada en el Manual General.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-outline shrink-0">
            <ShieldCheck size={18} />
            <span>Acceso verificado</span>
          </div>
        </div>
      </section>

      <div>
        <h1 className="text-xl font-semibold text-primary">Agenda Ordinaria de Obispado</h1>
        <p className="text-sm text-on-surface-variant mt-1">Domingo, 18 de mayo · 06:30 – 08:00 AM · Salón del Obispado</p>
      </div>

      <div className="space-y-3">
        {SECCIONES.map((s) => (
          <div key={s.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <button
              onClick={() => toggle(s.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-surface-container/50 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-surface-container text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {s.id}
                </span>
                <div>
                  <h3 className="font-semibold text-primary">{s.titulo}</h3>
                  <span className="text-xs text-outline">{s.desc}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status="neutral">{s.estado}</StatusBadge>
                <ChevronDown size={18} className={`text-outline transition-transform ${abiertas[s.id] ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {abiertas[s.id] && (
              <div className="px-4 pb-4 pt-2 border-t border-outline-variant/20 bg-surface-container-low/30">
                <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center gap-2 text-sm text-on-surface mb-3">
                  <Lock size={16} className="text-secondary shrink-0" />
                  <span>Notas bajo discreción: nombres reservados, no visibles para el consejo general.</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Notas confidenciales de deliberación..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Card title="Asignaciones y acuerdos confidenciales" subtitle="Compromisos adquiridos durante la sesión">
        <p className="text-sm text-on-surface-variant">
          TODO: listar `asignaciones` filtradas por esta reunión, con responsable y fecha límite,
          igual que en la vista de Consejo de Barrio.
        </p>
      </Card>
    </div>
  )
}
