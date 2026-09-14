import { useState } from 'react'
import Modal from '../Modal.jsx'
import { useUsuarios } from '../../lib/useUsuarios.js'
import { useAsignaciones } from '../../lib/AsignacionesContext.jsx'

export default function ReasignarModal({ asignacion, onClose }) {
  const { usuarios } = useUsuarios()
  const { reasignar } = useAsignaciones()
  const [nuevoResponsable, setNuevoResponsable] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Separamos el título y la descripción usando los tres guiones
  const partes = asignacion?.descripcion ? asignacion.descripcion.split(' --- ') : []
  const titulo = partes[0] || ''
  const descripcion = partes[1] || ''

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nuevoResponsable) return
    setGuardando(true)
    await reasignar(asignacion.id, nuevoResponsable)
    setGuardando(false)
    onClose()
  }

  return (
    <Modal open={!!asignacion} onClose={onClose} title="Reasignar compromiso">
      <div className="space-y-4 mb-4">
        {/* Organización / Badge */}
        {asignacion?.organizaciones?.nombre && (
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            {asignacion.organizaciones.nombre}
          </span>
        )}

        {/* Título en azul oscuro */}
        <h3 className="text-lg font-bold text-primary leading-tight">
          {titulo}
        </h3>

        {/* Recuadro con la descripción */}
        {descripcion && (
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Descripción / Detalles
            </span>
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm text-on-surface">
              {descripcion}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Nuevo responsable
          </label>
          <select
            value={nuevoResponsable}
            onChange={(e) => setNuevoResponsable(e.target.value)}
            required
            className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
          >
            <option value="">Selecciona un líder...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} {u.organizaciones?.nombre ? `· ${u.organizaciones.nombre}` : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors disabled:opacity-60 shadow-xs"
        >
          {guardando ? 'Guardando...' : 'Confirmar reasignación'}
        </button>
      </form>
    </Modal>
  )
}