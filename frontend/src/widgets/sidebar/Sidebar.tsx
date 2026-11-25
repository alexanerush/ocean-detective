import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../../shared/ui/Icon';
import type { IconName } from '../../shared/ui/Icon';
import './Sidebar.css';

const navigation: {
  path: string;
  label: string;
  short: string;
  icon: IconName;
}[] = [
  { path: '/', label: 'Dashboard', short: 'Home', icon: 'home' },
  { path: '/analysis', label: 'Satellite Analysis', short: 'Analysis', icon: 'analysis' },
  { path: '/experiments', label: 'ML Experiments', short: 'Models', icon: 'experiments' },
  { path: '/history', label: 'Analysis History', short: 'History', icon: 'history' },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  const accountActive = pathname === '/login' || pathname === '/register';

  return (
    <aside className="od-sidebar">
      <span className="od-sidebar-label">WORKSPACE</span>

      <nav aria-label="Main navigation">
        {navigation.map(({ path, label, short, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `od-nav-link${isActive ? ' od-nav-link-active' : ''}`
            }
          >
            <span aria-hidden="true">
              <Icon name={icon} />
            </span>

            <span className="od-nav-full">{label}</span>
            <span className="od-nav-short">{short}</span>
          </NavLink>
        ))}

        <NavLink
          to="/login"
          aria-current={accountActive ? 'page' : undefined}
          className={`od-nav-link od-account-link${
            accountActive ? ' od-nav-link-active' : ''
          }`}
        >
          <span aria-hidden="true">
            <Icon name="user" />
          </span>

          <span>Account</span>
        </NavLink>
      </nav>
    </aside>
  );
}
