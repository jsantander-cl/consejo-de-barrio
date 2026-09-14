import { useState } from 'react'
import Modal from '../Modal.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function NuevaActividadModal({ open, onClose, organizaciones, onCreada }) {
  const [nombre, setNombre] = useState('')
  const [organizacionId, setOrganizacionId] = useState('')
  const [fecha, setFecha] = useState('')
  const [lugar, setLugar] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  function limpiarYcerrar() {
    setNombre(''); setOrganizacionId(''); setFecha(''); setLugar(''); setError(null)
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nombre || !fecha) return
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('actividades').insert({
      nombre,
      organizacion_id: organizacionId || null,
      fecha,
      lugar,
      estado: 'propuesta',
      responsable_id: user?.id,
    })
    setGuardando(false)
    if (error) { setError(error.message); return }
    onCreada?.()
    limpiarYcerrar()
  }

  return (
    <Modal open={open} onClose={limpiarYcerrar} title="Proponer actividad">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-error bg-error-container/40 border border-error/30 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">Nombre de la actividad</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">Organización responsable</label>
          <select
            value={organizacionId}
            onChange={(e) => setOrganizacionId(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest"
          >
            <option value="">Sin especificar</option>
            {organizaciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">Lugar</label>
            <input
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-medium text-sm disabled:opacity-60"
        >
          {guardando ? 'Guardando...' : 'Proponer actividad'}
        </button>
      </form>
    </Modal>
  )
}