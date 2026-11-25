import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../widgets/header/Header';
import Sidebar from '../../widgets/sidebar/Sidebar';
import DisplaySettings from '../../features/display-settings/DisplaySettings';
import { Skeleton } from '../../shared/ui/controls';
import './AppLayout.css';
export default function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="app">
      <a className="od-skip" href="#main-content">
        Skip to content
      </a>
      <Header />
      <DisplaySettings />
      <div className="od-layout">
        <Sidebar />
        <main id="main-content" tabIndex={-1} className="od-page-content">
          <Suspense fallback={<Skeleton />}>
            <div key={pathname} className="od-page-enter">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
