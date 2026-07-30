import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRoute() {
  const auth = useAuth();

  if (!auth.roles.includes('admin') && !auth.roles.includes('super_admin')) {
    return <Navigate to="/dashboard" replace state={{ reason: 'admin-required' }} />;
  }

  return <Outlet />;
}
