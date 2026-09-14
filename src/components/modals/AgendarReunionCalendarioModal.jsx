import { useState, useEffect } from 'react'
import { X, Calendar, Clock, MapPin, FileText, User, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient.js'

export default function AgendarReunionCalendarioModal({ open, onClose, onCreado }) {
  const [titulo, setTitulo] = useState('')
  const [organizacion, setOrganizacion] = useState('Consejo de Barrio')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('10:00')
  const [lugar, setLugar] = useState('Capilla - Sala de Consejo')
  const [creadoPor, setCreadoPor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function obtenerUsuarioActual() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('nombre')
          .eq('id', user.id)
          .single()

        setCreadoPor(perfil?.nombre || user.user_metadata?.full_name || 'Jordan Santander')
      }
      const hoyStr = new Date().toISOString().split('T')[0]
      setFecha(hoyStr)
    }

    if (open) {
      obtenerUsuarioActual()
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo || !fecha) {
      alert('Por favor completa el título y la fecha.')
      return
    }

    setGuardando(true)

    const fechaHoraIso = new Date(`${fecha}T${hora}:00`).toISOString()
    const tituloTexto = `[Reunión - ${organizacion}] ${titulo}`
    const detalleNotas = `Organizado por: ${creadoPor}${descripcion ? ` | Notas: ${descripcion}` : ''}`

    // 1. Intentamos primero con la columna 'nombre'
    let payload = {
      nombre: tituloTexto,
      fecha: fechaHoraIso,
      lugar: lugar || 'Capilla',
      descripcion: detalleNotas
    }

    let { error } = await supabase.from('actividades').insert([payload])

    // 2. Si falla porque la columna se llama 'titulo' en lugar de 'nombre'
    if (error && error.message.includes("'titulo'")) {
      delete payload.nombre
      payload.titulo = tituloTexto
      const reintento = await supabase.from('actividades').insert([payload])
      error = reintento.error
    }

    setGuardando(false)

    if (error) {
      alert('Error al agendar la reunión: ' + error.message)
    } else {
      setTitulo('')
      setDescripcion('')
      onClose()
      if (onCreado) onCreado()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
          <div>
            <h3 className="text-lg font-bold text-primary">Agendar Nueva Reunión</h3>
            <p className="text-xs text-on-surface-variant">Programa una sesión para el calendario del consejo o tu organización.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">
              Título de la reunión <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Consejo de Barrio Ordinario"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
              <Building2 size={14} /> Organización / Consejo
            </label>
            <select
              value={organizacion}
              onChange={(e) => setOrganizacion(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface bg-surface-container-lowest outline-none"
            >
              <option value="Consejo de Barrio">Consejo de Barrio</option>
              <option value="Obispado">Obispado</option>
              <option value="Cuórum de Élderes">Cuórum de Élderes</option>
              <option value="Sociedad de Socorro">Sociedad de Socorro</option>
              <option value="Mujeres Jóvenes">Mujeres Jóvenes</option>
              <option value="Hombres Jóvenes">Hombres Jóvenes</option>
              <option value="Primaria">Primaria</option>
              <option value="Escuela Dominical">Escuela Dominical</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                <Calendar size={14} /> Fecha <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                <Clock size={14} /> Hora
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
              <MapPin size={14} /> Lugar / Ubicación
            </label>
            <input
              type="text"
              placeholder="Ej. Capilla - Sala de Consejo o Zoom"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
              <User size={14} /> Organizado / Creado por
            </label>
            <input
              type="text"
              value={creadoPor}
              onChange={(e) => setCreadoPor(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
              <FileText size={14} /> Puntos de Tabla / Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Añade temas a revisar, orden del día o notas..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Agendar Reunión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}