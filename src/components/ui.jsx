// Pequeños componentes reutilizados en varias páginas para no repetir clases
// de Tailwind por todos lados. Ir agregando aquí a medida que se detecten
// patrones repetidos.

export function StatusBadge({ status, children }) {
  const styles = {
    success: 'bg-status-success-bg text-status-success-text border-status-success-border',
    warning: 'bg-status-warning-bg text-status-warning-text border-status-warning-border',
    danger: 'bg-error-container text-on-error-container border-transparent',
    neutral: 'bg-surface-container text-on-surface-variant border-outline-variant/30',
    info: 'bg-secondary-container/60 text-secondary border-transparent',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] ?? styles.neutral}`}>
      {children}
    </span>
  )
}

export function KpiCard({ icon: Icon, label, value, hint, danger = false }) {
  return (
    <div
      className={`rounded-xl p-4 border shadow-xs transition-transform hover:-translate-y-0.5 ${
        danger ? 'bg-surface-container-lowest border-error-container' : 'bg-surface-container-lowest border-outline-variant/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${danger ? 'text-error' : 'text-on-surface-variant'}`}>{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-error-container/50 text-error' : 'bg-surface-container text-primary'}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${danger ? 'text-error' : 'text-primary'}`}>{value}</span>
      </div>
      {hint && <p className="mt-2 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  )
}

export function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs p-4 md:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
          <div>
            {title && <h3 className="text-lg font-semibold text-primary">{title}</h3>}
            {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
