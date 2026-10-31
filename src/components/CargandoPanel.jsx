import { Loader2 } from 'lucide-react'

export default function CargandoPanel({ mensaje = "Cargando información del Consejo..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-2xs space-y-3 w-full">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-xs font-semibold text-on-surface-variant tracking-wide">{mensaje}</p>
    </div>
  )
}