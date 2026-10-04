import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, Lock, ArrowLeft, Clock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

// Estructura de Secciones del Consejo de Barrio
const SECCIONES_CONSEJO = [
  { 
    id: 1, 
    titulo: 'Apertura y Espíritu de Consejo', 
    desc: 'Devocional, doctrina y revisión de acuerdos anteriores',
    subItems: [] 
  },
  { 
    id: 2, 
    titulo: 'Obra de Salvación y Exaltación (Ministración)', 
    desc: 'Familias prioritarias, necesidades de bienestar y rescate',
    subItems: [
      'Sociedad de Socorro',
      'Quórum de Élderes',
      'Primaria',
      'Hombres Jóvenes',
      'Mujeres Jóvenes'
    ] 
  },
  { 
    id: 3, 
    titulo: 'Fortalecimiento de Jóvenes y Niños', 
    desc: 'Sacerdocio Aarónico, Mujeres Jóvenes y Primaria',
    subItems: [
      'Mujeres Jóvenes',
      'Hombres Jóvenes'
    ] 
  },
  { 
    id: 4, 
    titulo: 'Obra Misional e Historia Familiar / Templo', 
    desc: 'Progreso de conversos, amigos investigadores y recomendaciones',
    subItems: [
      'Obra Misional',
      'Sociedad de Socorro',
      'Quórum de Élderes',
      'Primaria',
      'Hombres Jóvenes',
      'Mujeres Jóvenes'
    ] 
  },
  { 
    id: 5, 
    titulo: 'Coordinación de Actividades y Calendario', 
    desc: 'Aprobación de eventos, programación y asignaciones',
    subItems: [] 
  },
  { 
    id: 6, 
    titulo: 'Asuntos Adicionales y Cierre', 
    desc: 'Información general y oración final',
    subItems: [] 
  }
]

const ESTADOS_CONFIG = {
  'Pendiente': { bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  'En progreso': { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  'En deliberación': { bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  'Cumplido': { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' },
  'Revisado': { bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' },
  'En oración': { bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' }
}

const ESTADOS_DISPONIBLES = ['Pendiente', 'En progreso', 'En deliberación', 'Cumplido', 'Revisado', 'En oración']

export default function ReunionDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [reunion, setReunion] = useState(null)
  const [abiertas, setAbiertas] = useState({ 1: true })
  const [subAbiertas, setSubAbiertas] = useState({})
  
  const [notasAgenda, setNotasAgenda] = useState({})
  const [cargando, setCargando] = useState(true)
  const [guardandoId, setGuardandoId] = useState(null)
  
  const [menuEstadoAbierto, setMenuEstadoAbierto] = useState(null)
  const menuRef = useRef(null)

  // Ajuste automático de altura según el contenido escrito
  const autoResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  useEffect(() => {
    async function cargarReunionYNotas() {
      setCargando(true)
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
          let notasGen = ''
          let subMapa = {}

          if (n.notas) {
            try {
              const parsed = JSON.parse(n.notas)
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                notasGen = parsed.general || ''
                subMapa = parsed.sub || {}
              } else {
                notasGen = n.notas
              }
            } catch {
              notasGen = n.notas
            }
          }

          mapaNotas[n.seccion_id] = {
            estado: n.estado || 'Pendiente',
            notasGeneral: notasGen,
            subNotas: subMapa
          }
        })
        setNotasAgenda(mapaNotas)
      }
      setCargando(false)
    }

    if (id) cargarReunionYNotas()

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

  const toggleSub = (key) => {
    setSubAbiertas(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const guardarEnBaseDatos = async (seccionId, estado, notasGeneral, subNotas) => {
    setGuardandoId(seccionId)
    const contenidoString = JSON.stringify({
      general: notasGeneral || '',
      sub: subNotas || {}
    })

    await supabase
      .from('reunion_agenda_notas')
      .upsert({
        reunion_id: id,
        seccion_id: Number(seccionId),
        estado: estado,
        notas: contenidoString,
        updated_at: new Date()
      }, { onConflict: 'reunion_id,seccion_id' })

    setGuardandoId(null)
  }

  const actualizarEstado = (seccionId, nuevoEstado) => {
    const actual = notasAgenda[seccionId] || { estado: 'Pendiente', notasGeneral: '', subNotas: {} }
    const nuevoObj = { ...actual, estado: nuevoEstado }
    setNotasAgenda(prev => ({ ...prev, [seccionId]: nuevoObj }))
    setMenuEstadoAbierto(null)
    guardarEnBaseDatos(seccionId, nuevoEstado, nuevoObj.notasGeneral, nuevoObj.subNotas)
  }

  const actualizarNotasGeneral = (seccionId, texto) => {
    const actual = notasAgenda[seccionId] || { estado: 'Pendiente', notasGeneral: '', subNotas: {} }
    const nuevoObj = { ...actual, notasGeneral: texto }
    setNotasAgenda(prev => ({ ...prev, [seccionId]: nuevoObj }))
    guardarEnBaseDatos(seccionId, nuevoObj.estado, texto, nuevoObj.subNotas)
  }

  const actualizarSubNota = (seccionId, subNombre, texto) => {
    const actual = notasAgenda[seccionId] || { estado: 'Pendiente', notasGeneral: '', subNotas: {} }
    const nuevosSub = { ...actual.subNotas, [subNombre]: texto }
    const nuevoObj = { ...actual, subNotas: nuevosSub }
    setNotasAgenda(prev => ({ ...prev, [seccionId]: nuevoObj }))
    guardarEnBaseDatos(seccionId, nuevoObj.estado, nuevoObj.notasGeneral, nuevosSub)
  }

  if (cargando) {
    return <div className="p-8 text-sm text-on-surface-variant">Cargando detalles de la reunión...</div>
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
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-container text-on-primary-container uppercase tracking-wider">
          Consejo de Barrio
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Consejo Ordinario de Barrio</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Fecha: {new Date(reunion?.fecha).toLocaleDateString('es-ES', { dateStyle: 'full' })} 
          {reunion?.presidida?.nombre && ` · Preside: ${reunion.presidida.nombre}`}
        </p>
      </div>

      <div className="space-y-3">
        {SECCIONES_CONSEJO.map((s) => {
          const infoSeccion = notasAgenda[s.id] || { estado: 'Pendiente', notasGeneral: '', subNotas: {} }
          const estaAbierto = !!abiertas[s.id]
          const estaGuardando = guardandoId === s.id
          const configEstado = ESTADOS_CONFIG[infoSeccion.estado] || ESTADOS_CONFIG['Pendiente']
          const menuAbiertoEste = menuEstadoAbierto === s.id
          const tieneSubItems = s.subItems && s.subItems.length > 0

          return (
            <div key={s.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs transition-all">
              <div className="w-full p-4 flex items-center justify-between hover:bg-surface-container/30 rounded-2xl">
                <button
                  onClick={() => toggle(s.id)}
                  className="flex items-center gap-3 text-left flex-1 focus:outline-none"
                >
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                    {s.id}
                  </span>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-primary text-sm md:text-base leading-snug">{s.titulo}</h3>
                    <span className="text-xs text-on-surface-variant leading-tight">{s.desc}</span>
                  </div>
                </button>

                <div className="flex items-center gap-3 shrink-0 relative" ref={menuAbiertoEste ? menuRef : null}>
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
                        {ESTADOS_DISPONIBLES.map((est) => {
                          const cfg = ESTADOS_CONFIG[est]
                          const seleccionado = infoSeccion.estado === est
                          return (
                            <button
                              key={est}
                              type="button"
                              onClick={() => actualizarEstado(s.id, est)}
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
                <div className="px-4 pb-4 pt-2 border-t border-outline-variant/20 bg-surface-container-low/30 space-y-4 rounded-b-2xl">
                  
                  {!tieneSubItems && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Lock size={14} className="text-secondary" /> Notas generales de deliberación y acuerdos
                        </span>
                        {estaGuardando && (
                          <span className="text-emerald-700 font-medium flex items-center gap-1 animate-pulse">
                            <Clock size={12} /> Guardando...
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={infoSeccion.notasGeneral}
                        onInput={autoResize}
                        onChange={(e) => actualizarNotasGeneral(s.id, e.target.value)}
                        placeholder="Escriba aquí los acuerdos generales..."
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-xs overflow-hidden resize-none transition-all"
                      />
                    </div>
                  )}

                  {tieneSubItems && (
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                          Informes por Organización (Desplegables)
                        </p>
                        {estaGuardando && (
                          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 animate-pulse">
                            <Clock size={12} /> Guardando...
                          </span>
                        )}
                      </div>
                      
                      {s.subItems.map((subNombre) => {
                        const subKey = `${s.id}-${subNombre}`
                        const textoSub = infoSeccion.subNotas[subNombre] || ''
                        const subAbierto = !!subAbiertas[subKey]

                        return (
                          <div key={subKey} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-2xs">
                            <div 
                              onClick={() => toggleSub(subKey)}
                              className="w-full p-3.5 flex items-center justify-between cursor-pointer hover:bg-surface-container/40 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                                {/* Título de organización aumentado a text-sm font-bold */}
                                <span className="text-sm font-bold text-primary tracking-tight">{subNombre}</span>
                              </div>

                              <button onClick={() => toggleSub(subKey)} className="p-1 text-outline">
                                <ChevronDown size={18} className={`transition-transform ${subAbierto ? 'rotate-180' : ''}`} />
                              </button>
                            </div>

                            {subAbierto && (
                              <div className="p-3.5 border-t border-outline-variant/20 bg-surface-container-low/50 space-y-2">
                                <textarea
                                  rows={2}
                                  value={textoSub}
                                  onInput={autoResize}
                                  onChange={(e) => actualizarSubNota(s.id, subNombre, e.target.value)}
                                  placeholder={`Apuntes específicos de ${subNombre}...`}
                                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs overflow-hidden resize-none transition-all"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}