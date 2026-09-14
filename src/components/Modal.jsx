import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-lg w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20 sticky top-0 bg-surface-container-lowest">
          <h2 className="text-base font-semibold text-primary">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}