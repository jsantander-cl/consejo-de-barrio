import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { Card, StatusBadge } from '../components/ui.jsx'
import { Users, Mail } from 'lucide-react'

export default function Organizaciones() {
  const [organizaciones, setOrganizaciones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [{ data: orgs }, { data: users }] = await Promise.all([
        supabase.from('organizaciones').select('id, nombre').order('nombre'),
        supabase.from('usuarios').select('id, nombre, rol, organizacion_id').eq('activo', true),
      ])
      setOrganizaciones(orgs ?? [])
      setUsuarios(users ?? [])
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) {
    return <p className="text-sm text-on-surface-variant">Cargando organizaciones...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary tracking-tight">Organizaciones</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Directorio de organizaciones del barrio y sus líderes / miembros activos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {organizaciones.map((org) => {
          const miembros = usuarios.filter((u) => u.organizacion_id === org.id)
          const lider = miembros.find((m) =>
            ['obispo', 'consejero', 'sec_ejecutivo', 'sec_barrio', 'lider_organizacion'].includes(m.rol)
          )

          return (
            <Card key={org.id} title={org.nombre}>
              {lider ? (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold shrink-0">
                    {lider.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{lider.nombre}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{lider.rol.replace('_', ' ')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic mb-3">Sin líder asignado</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Users size={14} /> {miembros.length} miembro(s) registrado(s)
                </span>
                <StatusBadge status={miembros.length > 0 ? 'success' : 'neutral'}>
                  {miembros.length > 0 ? 'Activa' : 'Sin actividad'}
                </StatusBadge>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}