import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] Faltan variables de entorno. Copia .env.example a .env y completa tus credenciales del proyecto Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
