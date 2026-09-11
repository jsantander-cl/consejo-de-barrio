import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Key, Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    navigate('/')
  }

  return (
    <div className="min-h-full flex flex-col bg-surface">
      <header className="w-full pt-4 px-4 md:px-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <ShieldCheck size={16} />
          </span>
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">Estaca La Portada</span>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
          <ShieldCheck size={14} className="text-secondary" />
          <span>Conexión segura</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-primary tracking-tight mb-1">Consejo de Barrio</h1>
            <p className="text-sm text-on-surface-variant">
              Plataforma de deliberación y ministración
              <br />
              <span className="text-secondary font-medium">Barrio Cerro Moreno</span>
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
            <div className="mb-5 p-3 bg-surface-container-low rounded-lg border-l-2 border-primary-container flex items-start gap-2">
              <Lock size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-on-surface-variant leading-snug">
                Acceso reservado para integrantes del obispado, presidencias de cuórum y líderes de organizaciones auxiliares.
              </p>
            </div>

            {error && (
              <p className="mb-3 text-sm text-error bg-error-container/40 border border-error/30 rounded-lg px-3 py-2">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-on-surface mb-1">
                  Correo institucional o de miembro
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@iglesia.org"
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-semibold text-on-surface">Contraseña</label>
                  <a href="#" className="text-xs text-primary hover:underline">¿Olvidó su contraseña?</a>
                </div>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-medium shadow-sm active:scale-[0.99] transition-all"
              >
                Iniciar sesión
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              ¿No cuenta con un llamamiento registrado?{' '}
              <a href="#" className="font-medium text-primary hover:underline">Contactar al Secretario de Barrio</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
