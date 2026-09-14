import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient.js'

const AsignacionesContext = createContext(null)

export function AsignacionesProvider({ children }) {
  const [asignaciones, setAsignaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('asignaciones')
      .select('id, descripcion, estado, fecha_limite, responsable_id, usuarios ( nombre, organizaciones ( nombre ) )')
      .order('fecha_limite', { ascending: true })
    if (!error) setAsignaciones(data ?? [])
    setCargando(false)
  }, [])

  useEffect(() => { recargar() }, [recargar])

  async function crear({ descripcion, responsable_id, fecha_limite }) {
    const { error } = await supabase
      .from('asignaciones')
      .insert({ descripcion, responsable_id, fecha_limite, estado: 'pendiente' })
    if (!error) await recargar()
    return { error }
  }

  async function reasignar(id, nuevo_responsable_id) {
    const { error } = await supabase
      .from('asignaciones')
      .update({ responsable_id: nuevo_responsable_id })
      .eq('id', id)
    if (!error) await recargar()
    return { error }
  }

  async function cambiarEstado(id, estado) {
    const { error } = await supabase
      .from('asignaciones')
      .update({ estado })
      .eq('id', id)
    if (!error) await recargar()
    return { error }
  }

  async function eliminar(id) {
    const { error } = await supabase
      .from('asignaciones')
      .delete()
      .eq('id', id)

    if (!error) {
      await recargar()
    }
    return { error }
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const vencidas = asignaciones.filter((a) => a.estado !== 'cumplido' && a.fecha_limite && a.fecha_limite < hoy)

  return (
    <AsignacionesContext.Provider value={{ asignaciones, vencidas, cargando, crear, reasignar, cambiarEstado, eliminar }}>
      {children}
    </AsignacionesContext.Provider>
  )
}

export function useAsignaciones() {
  const ctx = useContext(AsignacionesContext)
  if (!ctx) throw new Error('useAsignaciones debe usarse dentro de AsignacionesProvider')
  return ctx
}