import { useState, useEffect } from 'react'
import { Calendar, UserCheck, AlertTriangle, Plus, Clock, Search, X, MessageSquare, Check, Shield, Lock, AlertCircle, XCircle } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function EntrevistasObispado() {
  const [entrevistas, setEntrevistas] = useState([])
  const [padronMiembros, setPadronMiembros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busquedaMiembro, setBusquedaMiembro] = useState('')
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  
  // Filtros avanzados
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroLider, setFiltroLider] = useState('todos')

  // Estado para edición rápida de notas en la tarjeta
  const [editandoNotaId, setEditandoNotaId] = useState(null)
  const [textoNotaTemp, setTextoNotaTemp] = useState('')

  // Formulario nueva entrevista
  const [form, setForm] = useState({
    miembro_nombre: '',
    tipo_entrevista: 'regular',
    asignado_a: 'Obispo',
    fecha_programada: '',
    fecha_vencimiento: '',
    observaciones: ''
  })

  // Cargar datos desde Supabase
  const cargarDatos = async (silencioso = false) => {
    if (!silencioso) setCargando(true)
    const { data: entData } = await supabase
      .from('entrevistas_obispado')
      .select('*')
      .order('fecha_programada', { ascending: true })

    const { data: padData } = await supabase
      .from('miembros_padron')
      .select('*')
      .order('nombre')

    if (entData) setEntrevistas(entData)
    if (padData) setPadronMiembros(padData)
    if (!silencioso) setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Guardar nueva entrevista
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.miembro_nombre.trim()) return

    const datosGuardar = {
      ...form,
      fecha_vencimiento: form.tipo_entrevista === 'recomendacion_templo' ? (form.fecha_vencimiento.trim() ? form.fecha_vencimiento : null) : null
    }

    const { error } = await supabase.from('entrevistas_obispado').insert([datosGuardar])
    if (error) {
      alert('Error al registrar la entrevista: ' + error.message)
      return
    }

    setForm({
      miembro_nombre: '',
      tipo_entrevista: 'regular',
      asignado_a: 'Obispo',
      fecha_programada: '',
      fecha_vencimiento: '',
      observaciones: ''
    })
    setBusquedaMiembro('')
    setModalAbierto(false)
    cargarDatos()
  }

  // Cambiar estado de forma silenciosa
  const cambiarEstado = async (id, nuevoEstado) => {
    setEntrevistas(prev => prev.map(item => item.id === id ? { ...item, estado: nuevoEstado } : item))

    await supabase
      .from('entrevistas_obispado')
      .update({ estado: nuevoEstado })
      .eq('id', id)
    
    cargarDatos(true)
  }

  // Guardar notas o acuerdos confidenciales en la tarjeta
  const guardarNotaConfidencial = async (id) => {
    setEditandoNotaId(null)
    await supabase
      .from('entrevistas_obispado')
      .update({ observaciones: textoNotaTemp })
      .eq('id', id)
    cargarDatos(true)
  }

  // Filtrar vencimientos del mes en curso
  const fechaActual = new Date()
  const mesActual = fechaActual.getMonth()
  const anioActual = fechaActual.getFullYear()

  const vencimientosMes = entrevistas.filter(item => {
    if (!item.fecha_vencimiento) return false
    // Validamos si contiene el mes/año actual para la alerta
    return item.estado !== 'Realizada'
  })

  // Filtrar entrevistas en pantalla (Tipo + Líder asignado)
  const entrevistasFiltradas = entrevistas.filter(item => {
    if (filtroTipo === 'regular' && item.tipo_entrevista !== 'regular') return false
    if (filtroTipo === 'templo' && item.tipo_entrevista !== 'recomendacion_templo') return false
    if (filtroLider !== 'todos' && item.asignado_a !== filtroLider) return false
    return true
  })

  // Miembros filtrados para el autocompletado
  const miembrosSugeridos = padronMiembros.filter(m => 
    busquedaMiembro.trim() && m.nombre.toLowerCase().includes(busquedaMiembro.toLowerCase())
  )

  // Función para obtener clases de color según el estado seleccionado
  const obtenerEstiloSelectEstado = (estado) => {
    switch (estado) {
      case 'Realizada':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
      case 'Cancelada':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
      case 'Programada':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300 font-bold'
    }
  }

  // Función para obtener el icono indicador según el estado
  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'Realizada':
        return (
          <span title="Entrevista realizada y bloqueada" className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <Lock size={14} />
          </span>
        )
      case 'Programada':
        return (
          <span title="Entrevista programada" className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
            <Clock size={14} />
          </span>
        )
      case 'Cancelada':
        return (
          <span title="Entrevista cancelada" className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
            <XCircle size={14} />
          </span>
        )
      default:
        return (
          <span title="Entrevista pendiente" className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
            <AlertCircle size={14} />
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold flex items-center gap-1.5 uppercase tracking-wider">
            <UserCheck size={14} /> Llaves del Sacerdocio · Confidencial
          </span>
          <h1 className="text-2xl font-bold text-primary tracking-tight mt-0.5">
            Control de Entrevistas de Obispado
          </h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Programar Entrevista
        </button>
      </div>

      {/* ALERTA DE PRÓXIMOS VENCIMIENTOS */}
      <Card className="border-l-4 border-l-rose-600 bg-rose-50/40">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-primary text-base">
              Alertas de Vencimientos ({vencimientosMes.length})
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Recomendaciones de templo o entrevistas pendientes que requieren atención según el padrón.
            </p>

            {vencimientosMes.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {vencimientosMes.map(v => (
                  <div key={v.id} className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-primary block">{v.miembro_nombre}</span>
                      <span className="text-[11px] text-rose-700">Vence: {v.fecha_vencimiento}</span>
                    </div>
                    <StatusBadge status="danger">{v.tipo_entrevista === 'recomendacion_templo' ? 'Templo' : 'Regular'}</StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-medium mt-2">🎉 No hay vencimientos críticos pendientes.</p>
            )}
          </div>
        </div>
      </Card>

      {/* FILTROS AVANZADOS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-on-surface-variant">Tipo:</span>
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${filtroTipo === 'todos' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroTipo('regular')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${filtroTipo === 'regular' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
          >
            Regulares
          </button>
          <button
            onClick={() => setFiltroTipo('templo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${filtroTipo === 'templo' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
          >
            Recomendación Templo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
            <Shield size={14} /> Asignado a:
          </span>
          <select
            value={filtroLider}
            onChange={(e) => setFiltroLider(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="todos">Todos los Líderes</option>
            <option value="Obispo">Obispo</option>
            <option value="1er Consejero">1er Consejero</option>
            <option value="2do Consejero">2do Consejero</option>
          </select>
        </div>
      </div>

      {/* Listado Principal de Entrevistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargando && <p className="text-sm text-on-surface-variant col-span-full py-6 text-center">Cargando entrevistas...</p>}
        {!cargando && entrevistasFiltradas.length === 0 && (
          <p className="text-sm text-on-surface-variant italic col-span-full">No hay entrevistas registradas con estos filtros.</p>
        )}

        {entrevistasFiltradas.map(item => {
          const estaRealizada = item.estado === 'Realizada'
          return (
            <Card key={item.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.tipo_entrevista === 'recomendacion_templo' ? 'info' : 'success'}>
                    {item.tipo_entrevista === 'recomendacion_templo' ? 'Templo' : 'Regular'}
                  </StatusBadge>
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-md">
                    {item.asignado_a}
                  </span>
                </div>
                <h3 className="font-bold text-primary text-base">{item.miembro_nombre}</h3>
                {item.fecha_programada && (
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" /> Programada: {item.fecha_programada}
                  </p>
                )}
                {item.fecha_vencimiento && (
                  <p className="text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                    <Clock size={14} /> Vencimiento: {item.fecha_vencimiento}
                  </p>
                )}

                {/* NOTAS / ACUERDOS CONFIDENCIALES EDITABLES */}
                <div className="mt-2 pt-2 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                      <MessageSquare size={12} /> Notas Pastorales / Acuerdos:
                    </span>
                    {editandoNotaId !== item.id && !estaRealizada && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoNotaId(item.id)
                          setTextoNotaTemp(item.observaciones || '')
                        }}
                        className="text-[11px] font-semibold text-secondary hover:underline cursor-pointer"
                      >
                        {item.observaciones ? 'Editar' : '+ Agregar nota'}
                      </button>
                    )}
                  </div>

                  {editandoNotaId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={textoNotaTemp}
                        onChange={(e) => setTextoNotaTemp(e.target.value)}
                        placeholder="Escribir notas confidenciales..."
                        className="w-full text-xs p-2 bg-surface-container-low rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditandoNotaId(null)}
                          className="px-2.5 py-1 text-[10px] font-bold text-on-surface-variant hover:bg-surface-container rounded-md cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => guardarNotaConfidencial(item.id)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-primary text-white rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant/90 bg-surface-container-low p-2 rounded-lg border border-outline-variant/20 italic">
                      {item.observaciones ? `"${item.observaciones}"` : 'Sin notas registradas.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Selector de Estado con Icono Indicador Dinámico */}
              <div className="pt-3 border-t border-outline-variant/25 flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant">Estado:</span>
                <div className="flex items-center gap-2">
                  <select
                    value={item.estado}
                    disabled={estaRealizada}
                    onChange={(e) => cambiarEstado(item.id, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                      estaRealizada 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : `${obtenerEstiloSelectEstado(item.estado)} cursor-pointer`
                    }`}
                  >
                    <option value="Pendiente" className="bg-white text-slate-700">Pendiente</option>
                    <option value="Programada" className="bg-white text-amber-800">Programada</option>
                    <option value="Realizada" className="bg-white text-emerald-800">Realizada</option>
                    <option value="Cancelada" className="bg-white text-rose-800">Cancelada</option>
                  </select>

                  {/* Icono indicador al lado del botón según estado */}
                  {obtenerIconoEstado(item.estado)}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* MODAL NUEVA ENTREVISTA */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
              <h2 className="text-lg font-bold text-primary">Programar Nueva Entrevista</h2>
              <button type="button" onClick={() => setModalAbierto(false)} className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-surface-container-low/30">
              {/* BUSCADOR Y SELECCIÓN DE MIEMBRO DESDE EL PADRÓN */}
              <div className="relative">
                <label className="block text-xs font-bold text-on-surface mb-1">Buscar Miembro en el Padrón</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Escriba o seleccione el nombre del miembro..."
                    value={busquedaMiembro}
                    onChange={(e) => {
                      setBusquedaMiembro(e.target.value)
                      setForm({ ...form, miembro_nombre: e.target.value })
                      setMostrarSugerencias(true)
                    }}
                    onFocus={() => setMostrarSugerencias(true)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {/* Lista desplegable del Padrón con autocompletado de vencimiento (Mes y Año) */}
                {mostrarSugerencias && miembrosSugeridos.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-outline-variant/30 max-h-48 overflow-y-auto">
                    {miembrosSugeridos.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          
                          setForm({ 
                            ...form, 
                            miembro_nombre: m.nombre,
                            fecha_vencimiento: m.vencimiento || ''
                          })
                          setBusquedaMiembro(m.nombre)
                          setMostrarSugerencias(false)
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-surface-container border-b border-outline-variant/10 flex justify-between items-center cursor-pointer"
                      >
                        <span className="text-primary">{m.nombre}</span>
                        <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                          {m.tipo_recomendacion || 'Miembro'} {m.vencimiento ? `(Vence: ${m.vencimiento})` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Tipo de Entrevista</label>
                  <select
                    value={form.tipo_entrevista}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value
                      setForm({ 
                        ...form, 
                        tipo_entrevista: nuevoTipo,
                        fecha_vencimiento: nuevoTipo === 'regular' ? '' : form.fecha_vencimiento 
                      })
                    }}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="regular" className="bg-white">Regular (Presidencial / Anual)</option>
                    <option value="recomendacion_templo" className="bg-white">Recomendación para el Templo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Asignar a</label>
                  <select
                    value={form.asignado_a}
                    onChange={(e) => setForm({ ...form, asignado_a: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Obispo" className="bg-white">Obispo</option>
                    <option value="1er Consejero" className="bg-white">1er Consejero</option>
                    <option value="2do Consejero" className="bg-white">2do Consejero</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    value={form.fecha_programada}
                    onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${form.tipo_entrevista === 'regular' ? 'text-outline/40' : 'text-on-surface'}`}>
                    Vencimiento Templo (Ej. oct-26)
                  </label>
                  <input
                    type="text"
                    disabled={form.tipo_entrevista === 'regular'}
                    value={form.fecha_vencimiento}
                    onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                    placeholder="Ej. oct-26"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                      form.tipo_entrevista === 'regular' 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none select-none' 
                        : 'bg-white border-outline-variant/60 focus:ring-2 focus:ring-primary'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Observaciones / Motivo</label>
                <textarea
                  rows={2}
                  placeholder="Notas pastorales previas..."
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-container cursor-pointer"
                >
                  Guardar Entrevista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}