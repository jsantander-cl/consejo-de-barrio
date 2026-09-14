import { X, Calendar, User, Building, Clock } from 'lucide-react'
import { StatusBadge } from '../ui.jsx'

export default function DetalleAsignacionModal({ open, onClose, asignacion }) {
  if (!open || !asignacion) return null

  const partes = asignacion.descripcion ? asignacion.descripcion.split(' --- ') : ['']
  const tituloTexto = partes[0]
  const detalleTexto = partes.length > 1 ? partes[1] : null

  const hoy = new Date().toISOString().slice(0, 10)
  const vencida = asignacion.estado !== 'cumplido' && asignacion.fecha_limite && asignacion.fecha_limite < hoy

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden space-y-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
        >
          <X size={20} />
        </button>

        <div className="space-y-2 pr-6">
          {vencida && <StatusBadge status="danger">Vencida</StatusBadge>}
          
          <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
            <Building size={14} />
            <span>{asignacion.usuarios?.organizaciones?.nombre ?? 'Sin organización'}</span>
          </div>

          <h2 className="text-xl font-bold text-primary leading-tight">
            {tituloTexto}
          </h2>
        </div>

        {detalleTexto && (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Descripción / Detalles
            </span>
            <div className="bg-surface-container-low/60 p-3.5 rounded-xl border border-outline-variant/20 text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {detalleTexto}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            <div>
              <p className="font-semibold text-on-surface">Responsable</p>
              <p>{asignacion.usuarios?.nombre ?? 'Sin asignar'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className={vencida ? 'text-error' : 'text-primary'} />
            <div>
              <p className="font-semibold text-on-surface">Fecha Límite</p>
              <p className={vencida ? 'text-error font-bold' : ''}>{asignacion.fecha_limite ?? 'Sin fecha'}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}