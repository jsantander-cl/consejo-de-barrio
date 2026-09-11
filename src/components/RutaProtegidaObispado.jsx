import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { ShieldAlert } from 'lucide-react'

// Regla de negocio (definida en el modelo de datos): las reuniones de tipo
// 'obispado' solo son visibles para obispado + secretarios. Este componente
// es la barrera del LADO DEL CLIENTE; la barrera real debe vivir en las
// políticas de Row Level Security (RLS) de Supabase, ya que esto solo
// oculta la UI, no protege los datos por sí solo.
export default function RutaProtegidaObispado({ children }) {
  const { puedeVerReunionesObispado } = useAuth()

  if (!puedeVerReunionesObispado) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-center">
        <ShieldAlert className="mx-auto mb-3 text-error" size={32} />
        <h2 className="text-lg font-semibold text-primary">Acceso restringido</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Esta sección es confidencial y solo está disponible para el obispado
          y los secretarios de barrio.
        </p>
      </div>
    )
  }

  return children
}
