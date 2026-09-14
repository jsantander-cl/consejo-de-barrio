import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient.js'
import { useAsignaciones } from '../../lib/AsignacionesContext.jsx'

export default function NuevaAsignacionModal({ open, onClose }) {
  const { crear } = useAsignaciones()
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [lideres, setLideres] = useState([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (open) {
      async function cargarLideres() {
        const { data } = await supabase
          .from('usuarios')
          .select('id, nombre, rol')
          .order('nombre')
        setLideres(data ?? [])
      }
      cargarLideres()
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim() || !responsableId) return

    setGuardando(true)

    // Formateamos para guardar Titulo y Descripción en la columna 'descripcion' de la BD
    const descripcionCompleta = descripcion.trim()
      ? `${titulo.trim()} --- ${descripcion.trim()}`
      : titulo.trim()

    const { error } = await crear({
      descripcion: descripcionCompleta,
      responsable_id: responsableId,
      fecha_limite: fechaLimite || null
    })

    setGuardando(false)

    if (error) {
      alert('Error al crear la asignación: ' + error.message)
    } else {
      setTitulo('')
      setDescripcion('')
      setResponsableId('')
      setFechaLimite('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/40">
          <h2 className="text-lg font-bold text-primary">Nueva asignación</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Título
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Visita al templo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Descripción de la tarea (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Ir a buscar a los jóvenes..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Responsable
            </label>
            <select
              required
              value={responsableId}
              onChange={(e) => setResponsableId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm"
            >
              <option value="">Selecciona un líder...</option>
              {lideres.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Fecha límite
            </label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="w-full py-2.5 rounded-lg font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-sm"
            >
              {guardando ? 'Creando...' : 'Crear asignación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}