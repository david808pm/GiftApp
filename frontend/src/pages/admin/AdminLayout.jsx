import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { getAdminSession, clearAdminSession } from '../../api/localStorageService';
import {
  giftAppGetAdminSession,
  giftAppClearAdminSession,
  USE_BACKEND,
} from '../../api/giftAppService';

// TODO: Replace demo localStorage auth with backend-validated authentication before production.

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/campaigns', label: 'Campañas', icon: '📋' },
  { path: '/admin/employees', label: 'Empleados', icon: '👥' },
  { path: '/admin/beneficiaries', label: 'Beneficiarios', icon: '👶' },
  { path: '/admin/gifts', label: 'Regalos', icon: '🎁' },
  { path: '/admin/selections', label: 'Selecciones', icon: '✅' },
  { path: '/admin/support-requests', label: 'Soporte', icon: '🎫' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Demo mode ──────────────────────────────────────────

  const localSession = USE_BACKEND ? null : getAdminSession();

  useEffect(() => {
    if (USE_BACKEND) return;
    if (!localSession || localSession.role !== 'ADMIN') {
      clearAdminSession();
      navigate('/admin/login', { replace: true });
    }
  }, [localSession, navigate]);

  // ── Backend mode ───────────────────────────────────────

  const [backendSession, setBackendSession] = useState(null);
  const [checking, setChecking] = useState(USE_BACKEND);

  useEffect(() => {
    if (!USE_BACKEND) return;

    let cancelled = false;

    (async () => {
      try {
        const session = await giftAppGetAdminSession();
        if (cancelled) return;

        if (!session || session.role !== 'ADMIN') {
          await giftAppClearAdminSession();
          navigate('/admin/login', { replace: true });
          return;
        }

        setBackendSession(session);
      } catch {
        if (!cancelled) {
          await giftAppClearAdminSession();
          navigate('/admin/login', { replace: true });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => { cancelled = true; };
  }, [navigate]);

  // ── Session resolution ─────────────────────────────────

  const session = USE_BACKEND ? backendSession : localSession;

  if (USE_BACKEND && checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gray-100)',
        }}
      >
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!session || session.role !== 'ADMIN') return null;

  // ── Logout ─────────────────────────────────────────────

  const handleLogout = async () => {
    if (USE_BACKEND) {
      await giftAppClearAdminSession();
    } else {
      clearAdminSession();
    }
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>GiftApp Admin</h2>
          <small>{session.name}</small>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path ? 'active' : ''
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%', color: 'var(--gray-300)', borderColor: 'var(--gray-600)' }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-mobile-header">
          <h2>GiftApp Admin</h2>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            Menú
          </button>
        </div>
        <nav className={`admin-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path ? 'active' : ''
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button
            className="btn btn-outline btn-sm"
            style={{
              margin: '8px 16px',
              color: 'var(--gray-300)',
              borderColor: 'var(--gray-600)',
            }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </nav>
        <Outlet />
      </main>
    </div>
  );
}
