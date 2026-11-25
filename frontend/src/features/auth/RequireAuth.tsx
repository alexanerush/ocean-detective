import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/providers/store/hooks';
export function RequireAuth() {
  const status = useAppSelector((s) => s.auth.status);
  const authenticated = status === 'authenticated';
  const location = useLocation();
  if(status==='checking') return <p role="status">Checking session…</p>;
  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}
