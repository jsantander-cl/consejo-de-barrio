import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient.js'

export default function EditarHitoModal({ hito, onClose, onGuardado }) {
  const [estado, setEstado] = useState('en_curso')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (hito) {
      setEstado(hito.estado || 'en_curso')
      setNotas(hito.notas || '')
    }
  }, [hito])

  if (!hito) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)

    try {
      const fechaCompletado = estado === 'completado' ? new Date().toISOString() : null

      const { error } = await supabase
        .from('miembro_checklist_progreso')
        .update({
          estado,
          notas: notas.trim() || null,
          fecha_completado: fechaCompletado
        })
        .eq('id', hito.id)

      if (error) throw error

      onClose()
      onGuardado()
    } catch (err) {
      alert('Error al actualizar hito: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/40">
          <div>
            <span className="text-xs uppercase text-on-surface-variant font-medium block">Actualizar Hito</span>
            <h2 className="text-base font-bold text-primary">{hito.nombreHito}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Estado del Hito
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEstado('en_curso')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                  estado === 'en_curso'
                    ? 'bg-status-warning-bg border-status-warning-text text-status-warning-text'
                    : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                En Curso
              </button>

              <button
                type="button"
                onClick={() => setEstado('completado')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                  estado === 'completado'
                    ? 'bg-secondary text-on-secondary border-secondary'
                    : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Completado
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Notas o Detalles
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Se programó fecha de ordenanza o entrevista realizada"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:border-primary text-sm resize-none"
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
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}