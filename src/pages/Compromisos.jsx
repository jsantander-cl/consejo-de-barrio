import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { StatusBadge } from '../components/ui.jsx'
import { useAsignaciones } from '../lib/AsignacionesContext.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import NuevaAsignacionModal from '../components/modals/NuevaAsignacionModal.jsx'
import DetalleAsignacionModal from '../components/modals/DetalleAsignacionModal.jsx'

const COLUMNAS = [
  { key: 'pendiente', titulo: 'Pendiente', dot: 'bg-outline' },
  { key: 'en_proceso', titulo: 'En proceso', dot: 'bg-status-warning-text' },
  { key: 'cumplido', titulo: 'Cumplido', dot: 'bg-status-success-text' },
]

const hoy = new Date().toISOString().slice(0, 10)

export default function Compromisos() {
  const { asignaciones, cargando, cambiarEstado, eliminar } = useAsignaciones()
  const auth = useAuth()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)

  const authDataString = JSON.stringify(auth || {}).toLowerCase()

  const esObispado = 
    authDataString.includes('obisp') || 
    authDataString.includes('secretario') || 
    authDataString.includes('presidente')

  const handleEliminar = async (e, id, titulo) => {
    e.stopPropagation() // Evita abrir el modal al presionar borrar
    const confirmacion = window.confirm(`¿Estás seguro de eliminar la tarea "${titulo}"?`)
    if (!confirmacion) return

    try {
      const { error } = await eliminar(id)
      if (error) {
        console.error('Error Supabase DELETE:', error)
        alert(`No se pudo eliminar la tarea: ${error.message}`)
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      alert('Ocurrió un error inesperado al intentar eliminar.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary tracking-wide uppercase font-semibold">Seguimiento ministerial</span>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Tablero de Compromisos</h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus size={18} /> Nueva asignación
        </button>
      </div>

      {cargando && <p className="text-sm text-on-surface-variant">Cargando compromisos...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNAS.map((col) => {
          const items = asignaciones.filter((a) => a.estado === col.key)
          return (
            <div key={col.key} className="flex flex-col bg-surface-container-low/70 rounded-2xl p-3 md:p-4 border border-outline-variant/30 min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 px-1">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h2 className="font-semibold text-primary">{col.titulo}</h2>
                <span className="px-2 py-0.5 rounded-full bg-surface text-xs font-semibold text-on-surface-variant border border-outline-variant/30">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {items.length === 0 && <p className="text-xs text-on-surface-variant px-1">Sin tareas aquí.</p>}
                {items.map((item) => {
                  const vencida = item.estado !== 'cumplido' && item.fecha_limite && item.fecha_limite < hoy
                  
                  const partes = item.descripcion ? item.descripcion.split(' --- ') : ['']
                  const tituloTexto = partes[0]

                  return (
                    <article
                      key={item.id}
                      onClick={() => setTareaSeleccionada(item)}
                      className={`relative bg-surface-container-lowest rounded-xl p-4 border shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow ${
                        vencida ? 'border-2 border-red-200' : 'border-outline-variant/30'
                      }`}
                    >
                      {esObispado && (
                        <button
                          type="button"
                          onClick={(e) => handleEliminar(e, item.id, tituloTexto)}
                          title="Eliminar tarea"
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors z-20"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}

                      <div className="pr-8 space-y-1">
                        {vencida && <StatusBadge status="danger">Vencida</StatusBadge>}
                        <span className="text-xs text-secondary font-bold uppercase tracking-wider block">
                          {item.usuarios?.organizaciones?.nombre ?? 'Sin organización'}
                        </span>
                        <h3 className="font-semibold text-primary leading-snug text-base">
                          {tituloTexto}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                        <span className="font-medium text-on-surface">{item.usuarios?.nombre ?? 'Sin asignar'}</span>
                        <span className={vencida ? 'text-red-600 font-semibold' : 'text-on-surface-variant'}>{item.fecha_limite}</span>
                      </div>

                      {col.key !== 'cumplido' && (
                        <select
                          value={item.estado}
                          onClick={(e) => e.stopPropagation()} // Evita abrir el modal al cambiar el estado
                          onChange={(e) => cambiarEstado(item.id, e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:outline-none focus:border-primary cursor-default"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En proceso</option>
                          <option value="cumplido">Cumplido</option>
                        </select>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <NuevaAsignacionModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
      
      <DetalleAsignacionModal 
        open={Boolean(tareaSeleccionada)} 
        onClose={() => setTareaSeleccionada(null)} 
        asignacion={tareaSeleccionada} 
      />
    </div>
  )
}