import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import RutaProtegidaObispado from './components/RutaProtegidaObispado.jsx'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Reuniones from './pages/Reuniones.jsx'
import ReunionDetalle from './pages/ReunionDetalle.jsx'
import ReunionObispado from './pages/ReunionObispado.jsx'
import Compromisos from './pages/Compromisos.jsx'
import SendaConvenios from './pages/SendaConvenios.jsx'
import Actividades from './pages/Actividades.jsx'
import Calendario from './pages/Calendario.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas autenticadas, todas comparten Sidebar + TopBar + BottomNav */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reuniones" element={<Reuniones />} />
          <Route path="/reuniones/:id" element={<ReunionDetalle />} />
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
        </Route>
      </Routes>
    </AuthProvider>
  )
}
