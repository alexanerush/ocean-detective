import { SessionProvider } from '../features/auth/SessionProvider';
import AppRouter from './router/AppRouter';
import StoreProvider from './providers/store/StoreProvider';
import { ToastProvider } from '../shared/ui/Toast';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import './styles/notifications.css';
export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ToastProvider>
          <SessionProvider><AppRouter /></SessionProvider>
        </ToastProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
