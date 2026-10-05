import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, Lock, ShieldCheck, ArrowLeft, Clock } from 'lucide-react'
import { StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'

const SECCIONES_OBISPADO = [
  { id: 1, titulo: 'Apertura y devocional', desc: 'Himno, oración, pensamiento doctrinal' },
  { id: 2, titulo: 'Coordinación de la obra de salvación y exaltación', desc: 'Ministración de familias prioritarias' },
  { id: 3, titulo: 'Fortalecimiento de jóvenes y niños', desc: 'Énfasis Sacerdocio Aarónico y Mujeres Jóvenes' },
  { id: 4, titulo: 'Preparación para ordenanzas sagradas', desc: 'Bautismos, ordenaciones, bendiciones de niños' },
  { id: 5, titulo: 'Llamamientos a cargos del barrio', desc: 'Propuestas de relevos y vacantes' },
  { id: 6, titulo: 'Recomendaciones para servicio misional', desc: 'Candidatos en preparación' },
  { id: 7, titulo: 'Organizaciones, programas y presupuesto', desc: 'Asignaciones trimestrales, bienestar temporal' },
  { id: 8, titulo: 'Revisión de escrituras y Manual General', desc: 'Cartas de la Primera Presidencia' },
]

const ESTADOS_CONFIG = {
  'Pendiente': { bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  'En progreso': { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  'En deliberación': { bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  'Cumplido': { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' },
  'Revisado': { bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' },
  'En oración': { bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' }
}

const ESTADOS_OBISPADO = ['Pendiente', 'En progreso', 'En deliberación', 'Cumplido', 'Revisado', 'En oración']

export default function ReunionObispado() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reunion, setReunion] = useState(null)
  const [abiertas, setAbiertas] = useState({})
  const [notasAgenda, setNotasAgenda] = useState({})
  const [cargando, setCargando] = useState(true)
  const [guardandoId, setGuardandoId] = useState(null)

  const [menuEstadoAbierto, setMenuEstadoAbierto] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    async function cargarReunionYNotas() {
      setCargando(true)

      if (id) {
        const { data: revData } = await supabase
          .from('reuniones')
          .select('*, presidida:usuarios!reuniones_presidida_por_fkey(nombre)')
          .eq('id', id)
          .single()

        if (revData) setReunion(revData)

        const { data: notasData } = await supabase
          .from('reunion_agenda_notas')
          .select('*')
          .eq('reunion_id', id)

        if (notasData) {
          const mapaNotas = {}
          notasData.forEach(n => {
            mapaNotas[n.seccion_id] = { estado: n.estado, notas: n.notas || '', dbId: n.id }
          })
          setNotasAgenda(mapaNotas)
        }
      }
      setCargando(false)
    }

    cargarReunionYNotas()

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuEstadoAbierto(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [id])

  const toggle = (seccionId) => {
    setAbiertas(prev => ({ ...prev, [seccionId]: !prev[seccionId] }))
  }

  const actualizarSeccion = async (seccionId, campo, valor) => {
    const actual = notasAgenda[seccionId] || { estado: 'Pendiente', notas: '' }
    const nuevoObjeto = { ...actual, [campo]: valor }

    setNotasAgenda(prev => ({
      ...prev,
      [seccionId]: nuevoObjeto
    }))

    if (campo === 'estado') {
      setMenuEstadoAbierto(null)
    }

    if (id) {
      setGuardandoId(seccionId)
      await supabase
        .from('reunion_agenda_notas')
        .upsert({
          reunion_id: id,
          seccion_id: seccionId,
          estado: nuevoObjeto.estado,
          notas: nuevoObjeto.notas,
          updated_at: new Date()
        }, { onConflict: 'reunion_id,seccion_id' })
      setGuardandoId(null)
    }
  }

  if (cargando) {
    return <div className="p-8 text-sm text-on-surface-variant">Cargando agenda confidencial de obispado...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/reuniones')}
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30"
        >
          <ArrowLeft size={16} /> Volver al Calendario
        </button>
      </div>

      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="bg-primary-container px-4 py-2 flex items-center justify-between text-on-primary-container">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <span className="text-white text-xs tracking-wider uppercase font-semibold">Registro de carácter sagrado y reservado</span>
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
        <h1 className="text-2xl font-bold text-primary tracking-tight">Agenda Ordinaria de Obispado</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {reunion?.fecha ? new Date(reunion.fecha).toLocaleDateString('es-ES', { dateStyle: 'full' }) : 'Domingo · Sesión Ordinaria'}
          {reunion?.presidida?.nombre && ` · Preside: ${reunion.presidida.nombre}`}
        </p>
      </div>

      <div className="space-y-3">
        {SECCIONES_OBISPADO.map((s) => {
          const infoSeccion = notasAgenda[s.id] || { estado: 'Pendiente', notas: '' }
          const estaAbierto = !!abiertas[s.id]
          const estaGuardando = guardandoId === s.id
          const configEstado = ESTADOS_CONFIG[infoSeccion.estado] || ESTADOS_CONFIG['Pendiente']
          const menuAbiertoEste = menuEstadoAbierto === s.id

          return (
            /* Se removió overflow-hidden para permitir el despliegue flotante libre del menú */
            <div key={s.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs transition-all">
              <div className="w-full p-4 flex items-center justify-between hover:bg-surface-container/30 rounded-2xl">
                <button
                  onClick={() => toggle(s.id)}
                  className="flex items-center gap-3 text-left flex-1 focus:outline-none"
                >
                  <span className="w-8 h-8 rounded-full bg-surface-container text-primary text-sm font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {s.id}
                  </span>
                  <div>
                    <h3 className="font-bold text-primary text-sm md:text-base">{s.titulo}</h3>
                    <span className="text-xs text-on-surface-variant">{s.desc}</span>
                  </div>
                </button>

                <div className="flex items-center gap-3 shrink-0 relative" ref={menuAbiertoEste ? menuRef : null}>
                  {/* PÍLDORA DESPLEGABLE CON Z-50 ABSOLUTO */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuEstadoAbierto(menuAbiertoEste ? null : s.id)
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-xs cursor-pointer ${configEstado.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${configEstado.dot}`} />
                      <span>{infoSeccion.estado}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${menuAbiertoEste ? 'rotate-180' : ''}`} />
                    </button>

                    {menuAbiertoEste && (
                      <div className="absolute right-0 mt-2 w-48 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {ESTADOS_OBISPADO.map((est) => {
                          const cfg = ESTADOS_CONFIG[est]
                          const seleccionado = infoSeccion.estado === est
                          return (
                            <button
                              key={est}
                              type="button"
                              onClick={() => actualizarSeccion(s.id, 'estado', est)}
                              className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                                seleccionado ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              <span>{est}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <button onClick={() => toggle(s.id)} className="p-1 text-outline">
                    <ChevronDown size={18} className={`transition-transform ${estaAbierto ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {estaAbierto && (
                <div className="px-4 pb-4 pt-2 border-t border-outline-variant/20 bg-surface-container-low/30 space-y-3 rounded-b-2xl">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
                    <span className="flex items-center gap-1 text-secondary font-medium">
                      <Lock size={14} /> Notas bajo discreción: nombres reservados, no visibles para el consejo general.
                    </span>
                    {estaGuardando && (
                      <span className="text-emerald-700 font-medium flex items-center gap-1 animate-pulse">
                        <Clock size={12} /> Guardando...
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={infoSeccion.notas}
                    onChange={(e) => actualizarSeccion(s.id, 'notas', e.target.value)}
                    placeholder="Notas confidenciales de deliberación..."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}