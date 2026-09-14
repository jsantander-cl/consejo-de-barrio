import { useState } from 'react'
import Modal from '../Modal.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function NuevaReunionModal({ open, onClose, onCreada }) {
  const [fecha, setFecha] = useState('')
  const [tipo, setTipo] = useState('consejo_barrio')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  function limpiarYcerrar() {
    setFecha('')
    setTipo('consejo_barrio')
    setError(null)
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fecha) return
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('reuniones')
      .insert({ fecha, tipo, estado: 'planificada', presidida_por: user?.id })
    setGuardando(false)
    if (error) { setError(error.message); return }
    onCreada?.()
    limpiarYcerrar()
  }

  return (
    <Modal open={open} onClose={limpiarYcerrar} title="Nueva reunión">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-error bg-error-container/40 border border-error/30 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">Tipo de reunión</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest"
          >
            <option value="consejo_barrio">Consejo de Barrio</option>
            <option value="obispado">Reunión de Obispado</option>
          </select>
        </div>
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
        <button
          type="submit"
          disabled={guardando}
          className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-medium text-sm disabled:opacity-60"
        >
          {guardando ? 'Guardando...' : 'Crear reunión'}
        </button>
      </form>
    </Modal>
  )
}