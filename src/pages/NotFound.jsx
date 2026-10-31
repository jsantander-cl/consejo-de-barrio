import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="w-16 h-16 bg-error-container text-error rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary">Página no encontrada</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            La ruta a la que intenta acceder no existe o no cuenta con los permisos necesarios dentro del sistema del Consejo de Barrio.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl text-sm shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Volver al Tablero General</span>
        </Link>
      </div>
    </div>
  )
}