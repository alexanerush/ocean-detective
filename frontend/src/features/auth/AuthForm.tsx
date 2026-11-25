import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch } from '../../app/providers/store/hooks';
import { signedIn } from '../../entities/user/authSlice';
import type { User } from '../../entities/user/authSlice';
import { apiClient } from '../../shared/api/apiClient';
import { normalizeApiError } from '../../shared/api/apiError';
import { Link } from 'react-router-dom';
import { Button, Field, Panel } from '../../shared/ui/controls';
import '../../shared/ui/workflow.css';
export function AuthForm({ register = false }: { register?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const dispatch=useAppDispatch();
  const [busy,setBusy]=useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254)
      next.email = 'Enter a valid email address.';
    if (!password || (register && password.length < 12))
      next.password = register ? 'Use at least 12 characters.' : 'Enter your password.';
    if (register && confirm !== password) next.confirm = 'Passwords must match.';
    setErrors(next);
    setNotice('');
    if(Object.keys(next).length || busy) return;
    setBusy(true);
    try { const response=await apiClient.post<{user:User}>(register?'/auth/register':'/auth/login',{email,password}); setPassword('');setConfirm('');dispatch(signedIn(response.data.user)); }
    catch(error){setNotice(normalizeApiError(error).message);}
    finally{setBusy(false);}

  }
  return (
    <section className="od-workflow">
      <h2>{register ? 'Create Account' : 'Sign In'}</h2>
      <Panel>
        <p>
          Use your email and password to access your account.
        </p>
        <form className="od-workflow" noValidate onSubmit={submit}>
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Field
            label="Password"
            type="password"
            autoComplete={register ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {register && (
            <Field
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
            />
          )}
          <Button type="submit" disabled={busy}>
            {busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
          </Button>
          <p role="status">{notice}</p>
        </form>
        <Link to={register ? '/login' : '/register'}>
          {register ? 'Already have an account? Sign in' : 'Create an account'}
        </Link>
      </Panel>
    </section>
  );
}
