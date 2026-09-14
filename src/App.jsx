import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext.jsx'
import { AsignacionesProvider } from './lib/AsignacionesContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'

// Componentes de Seguridad / Guardias
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import RutaProtegidaObispado from './components/RutaProtegidaObispado.jsx'

// Páginas
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Reuniones from './pages/Reuniones.jsx'
import ReunionDetalle from './pages/ReunionDetalle.jsx'
import ReunionObispado from './pages/ReunionObispado.jsx'
import Compromisos from './pages/Compromisos.jsx'
import SendaConvenios from './pages/SendaConvenios.jsx'
import Actividades from './pages/Actividades.jsx'
import Calendario from './pages/Calendario.jsx'
import Organizaciones from './pages/Organizaciones.jsx'
import Perfil from './pages/Perfil.jsx'

export default function App() {
  return (
    <AuthProvider>
      <AsignacionesProvider>
        <Routes>
          {/* 1. Ruta pública de acceso */}
          <Route path="/login" element={<Login />} />

          {/* 2. Guardián General: Requiere sesión activa para ingresar a cualquier layout o subruta */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reuniones" element={<Reuniones />} />
              <Route path="/reuniones/:id" element={<ReunionDetalle />} />

              {/* Guardián Específico: Además de estar logueado, requiere rol de Obispado */}
              <Route
                path="/reuniones/obispado/:id?"
                element={
                  <RutaProtegidaObispado>
                    <ReunionObispado />
                  </RutaProtegidaObispado>
                }
              />

              <Route path="/compromisos" element={<Compromisos />} />
              <Route path="/senda-convenios" element={<SendaConvenios />} />
              <Route path="/actividades" element={<Actividades />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/organizaciones" element={<Organizaciones />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Route>

          {/* 3. Redirección por defecto si la URL no existe o el usuario intenta navegar a una ruta inválida */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AsignacionesProvider>
    </AuthProvider>
  )
}