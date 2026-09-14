import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../lib/AuthContext.jsx'

export default function NuevoMiembroModal({ open, onClose, onCreado }) {
  const { user } = useAuth()
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('nuevo_converso')
  const [ministrantes, setMinistrantes] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim()) return

    setGuardando(true)
    try {
      // Inserción limpia: Solo insertamos los datos en 'miembros_seguimiento'.
      // El Trigger 'tr_inicializar_hitos_miembro' genera automáticamente los hitos en 'miembro_checklist_progreso'.
      const { error } = await supabase
        .from('miembros_seguimiento')
        .insert([
          {
            nombre: nombre.trim(),
            tipo,
            ministrantes: ministrantes.trim() || null,
            creado_por: user?.id ?? null,
            activo: true
          }
        ])

      if (error) throw error

      setNombre('')
      setTipo('nuevo_converso')
      setMinistrantes('')
      onClose()
      onCreado()
    } catch (err) {
      alert('Error al agregar miembro: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/40">
          <h2 className="text-lg font-bold text-primary">Agregar miembro a seguimiento</h2>
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
              Nombre completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Tipo de seguimiento
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm"
            >
              <option value="nuevo_converso">Nuevo Converso</option>
              <option value="reactivado">Reactivado / Amigo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Ministrante(s) asignados
            </label>
            <input
              type="text"
              placeholder="Ej. Hno. González y Hno. Silva"
              value={ministrantes}
              onChange={(e) => setMinistrantes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}