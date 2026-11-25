import { useState } from 'react';
import { useAppDispatch,useAppSelector } from '../../app/providers/store/hooks';
import { signedOut } from '../../entities/user/authSlice';
import { apiClient } from '../../shared/api/apiClient';
import { normalizeApiError } from '../../shared/api/apiError';
import { Button,Panel,Skeleton } from '../../shared/ui/controls';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthForm } from '../../features/auth/AuthForm';
import './AccountPage.css';

export default function AccountPage() {
  const { pathname } = useLocation();
  const isRegister = pathname === '/register';

  const auth=useAppSelector(s=>s.auth);
  const dispatch=useAppDispatch();
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function logout(){setBusy(true);setError('');try{await apiClient.post('/auth/logout');dispatch(signedOut());}catch(e){setError(normalizeApiError(e).message);}finally{setBusy(false);}}
  if(auth.status==='checking')return <Skeleton/>;
  if(auth.user)return <section className="od-account-page"><Panel title="Your account"><p>{auth.user.email}</p><Button disabled={busy} onClick={logout}>Sign out</Button><p role="status">{error}</p></Panel></section>;
  return (
    <section className="od-account-page">
      <nav className="od-auth-switch" aria-label="Authentication options">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `od-auth-option${isActive ? ' od-auth-option-active' : ''}`
          }
        >
          Sign In
        </NavLink>

        <NavLink
          to="/register"
          className={({ isActive }) =>
            `od-auth-option${isActive ? ' od-auth-option-active' : ''}`
          }
        >
          Create Account
        </NavLink>
      </nav>

      <AuthForm key={isRegister ? 'register' : 'login'} register={isRegister} />
    </section>
  );
}
