import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch } from '../../app/providers/store/hooks';
import { signedIn,signedOut } from '../../entities/user/authSlice';
import type { User } from '../../entities/user/authSlice';
import { apiClient } from '../../shared/api/apiClient';
export function SessionProvider({children}:{children:ReactNode}) { const dispatch=useAppDispatch(); useEffect(()=>{let active=true; apiClient.get<{user:User}>('/auth/me').then(r=>{if(active)dispatch(signedIn(r.data.user));}).catch(()=>{if(active)dispatch(signedOut());});return()=>{active=false;};},[dispatch]);return <>{children}</>; }
