import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Loading…</div>;
  
  if (user) {
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'VENDOR':
        return <Navigate to="/vendor" replace />;
      case 'WAREHOUSE_STAFF':
        return <Navigate to="/warehouse/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return <Outlet />;
}
