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
import AgendaObispado from './pages/AgendaObispado.jsx' // Listado de obispado (img1)
import ReunionObispado from './pages/ReunionObispado.jsx' // Detalle con los 8 puntos confidenciales (img2)
import EntrevistasObispado from './pages/EntrevistasObispado.jsx'
import Discursantes from './pages/Discursantes.jsx'
import Compromisos from './pages/Compromisos.jsx'
import SendaConvenios from './pages/SendaConvenios.jsx'
import Actividades from './pages/Actividades.jsx'
import Calendario from './pages/Calendario.jsx'
import Organizaciones from './pages/Organizaciones.jsx'
import Perfil from './pages/Perfil.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <AuthProvider>
      <AsignacionesProvider>
        <Routes>
          {/* 1. Ruta pública de acceso */}
          <Route path="/login" element={<Login />} />

          {/* 2. Guardián General: Requiere sesión activa */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reuniones" element={<Reuniones />} />
              <Route path="/reuniones/:id" element={<ReunionDetalle />} />

              {/* Listado de la Agenda de Obispado (Muestra el diseño de la imagen 1) */}
              <Route
                path="/reuniones/obispado"
                element={
                  <RutaProtegidaObispado>
                    <AgendaObispado />
                  </RutaProtegidaObispado>
                }
              />

              {/* Detalle individual de la agenda de obispado (Muestra los 8 puntos de la imagen 2) */}
              <Route
                path="/reuniones/obispado/:id"
                element={
                  <RutaProtegidaObispado>
                    <ReunionObispado />
                  </RutaProtegidaObispado>
                }
              />

              {/* Nueva Sección: Control de Entrevistas de Obispado */}
              <Route
                path="/obispado/entrevistas"
                element={
                  <RutaProtegidaObispado>
                    <EntrevistasObispado />
                  </RutaProtegidaObispado>
                }
              />

              {/* Gestión reservada de Discursantes */}
              <Route
                path="/discursantes"
                element={
                  <RutaProtegidaObispado>
                    <Discursantes />
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

          {/* 3. Página 404 personalizada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AsignacionesProvider>
    </AuthProvider>
  )
}