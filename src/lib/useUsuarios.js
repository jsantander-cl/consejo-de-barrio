import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('usuarios')
      .select('id, nombre, rol, organizaciones ( nombre )')
      .eq('activo', true)
      .order('nombre')
      .then(({ data }) => {
        setUsuarios(data ?? [])
        setCargando(false)
      })
  }, [])

  return { usuarios, cargando }
}