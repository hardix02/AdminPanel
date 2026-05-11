import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  { to: '/', label: 'Algo Accounts', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'AD';
  const title = location.pathname === '/users' ? 'User Management' : 'Algo Access Dashboard';
  const note = location.pathname === '/users' ? 'User administration' : 'EX5 operations';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="dashboard-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="sidebar-subtitle">Admin Console</p>
              <h1 className="sidebar-title">CodeSoftix</h1>
            </div>
          </div>

          <div className="sidebar-nav">
            <p className="sidebar-section-title">Workspace</p>
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;

              return (
                <Link key={to} to={to} className={`nav-item${active ? ' active' : ''}`}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="sidebar-user-card">
            <div className="sidebar-user-header">
              <div className="user-avatar">{initials}</div>
              <div>
                <p className="sidebar-user-name">{user?.name ?? 'Admin User'}</p>
                <p className="sidebar-user-email">{user?.email ?? 'admin@example.com'}</p>
              </div>
            </div>

            <button type="button" onClick={handleLogout} className="logout-button">
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <div className="dashboard-main">
          <header className="topbar">
            <div>
              <p className="topbar-note">{note}</p>
              <h2>{title}</h2>
            </div>

            <div className="topbar-user-meta">{user?.email ?? 'admin@example.com'}</div>
          </header>

          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
