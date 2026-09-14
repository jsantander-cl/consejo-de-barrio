import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext'; // Importado desde tu carpeta lib actual

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};