import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

export const ROLES_ACCESO_OBISPADO = ['obispo', 'consejero', 'sec_ejecutivo', 'sec_barrio']

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(true)

  async function cargarPerfil(authUser) {
    if (!authUser) { 
      setUser(null)
      return 
    }
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

  // Función signIn mejorada que fuerza la espera de la sesión
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // Forzamos a que el contexto verifique inmediatamente la sesión activa
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session?.user) {
      await cargarPerfil(sessionData.session.user)
    }
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const puedeVerReunionesObispado = user ? ROLES_ACCESO_OBISPADO.includes(user.rol) : false

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-container-low">
        <p className="text-sm font-medium text-on-surface-variant animate-pulse">Cargando sesión de Barrio Cerro Moreno...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, cargando, puedeVerReunionesObispado, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}