import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.configured || !auth.session || auth.status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'authentication-required' }} />;
  }

  return <Outlet />;
}
