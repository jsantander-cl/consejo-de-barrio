import { createContext, useContext, useState } from 'react'

// Roles definidos en el modelo de datos: obispo, consejero, sec_ejecutivo,
// sec_barrio, lider_organizacion, invitado.
// Estos dos roles son los ÚNICOS con acceso a reuniones tipo "obispado".
export const ROLES_ACCESO_OBISPADO = ['obispo', 'consejero', 'sec_ejecutivo', 'sec_barrio']

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // TODO: reemplazar por sesión real de Supabase (supabase.auth.getUser())
  const [user, setUser] = useState({
    id: 'demo-user',
    nombre: 'Juan Galleguillos',
    rol: 'obispo',
    organizacion: null,
  })

  const puedeVerReunionesObispado = user ? ROLES_ACCESO_OBISPADO.includes(user.rol) : false

  return (
    <AuthContext.Provider value={{ user, setUser, puedeVerReunionesObispado }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
