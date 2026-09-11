import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

// Roles definidos en el modelo de datos: obispo, consejero, sec_ejecutivo,
// sec_barrio, lider_organizacion, invitado.
// Estos cuatro roles son los ÚNICOS con acceso a reuniones tipo "obispado".
export const ROLES_ACCESO_OBISPADO = ['obispo', 'consejero', 'sec_ejecutivo', 'sec_barrio']

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(true)

  async function cargarPerfil(authUser) {
    if (!authUser) { setUser(null); return }
    const { data } = await supabase
      .from('usuarios')
      .select('id, nombre, rol, organizacion_id, organizaciones ( nombre )')
      .eq('id', authUser.id)
      .single()
    setUser(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      cargarPerfil(session?.user).finally(() => setCargando(false))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      cargarPerfil(session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const puedeVerReunionesObispado = user ? ROLES_ACCESO_OBISPADO.includes(user.rol) : false

  return (
    <AuthContext.Provider value={{ user, cargando, puedeVerReunionesObispado }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
