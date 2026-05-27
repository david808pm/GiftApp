import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getData,
  KEYS,
  setAdminSession,
} from '../../api/localStorageService';
import { giftAppAdminLogin } from '../../api/giftAppService';

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

/*
  NOTE: In a production application, authentication should be handled by a
  backend server with proper password hashing (e.g., bcrypt), JWT tokens,
  session management, and HTTPS. This local demo stores credentials in
  localStorage for prototype purposes only.

  When VITE_USE_BACKEND=true, authentication is delegated to the NestJS backend.
*/

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('El correo es obligatorio.');
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }

    setLoading(true);

    if (USE_BACKEND) {
      try {
        const result = await giftAppAdminLogin(email.trim(), password);

        if (!result.ok) {
          setError(result.error || 'Error de autenticación.');
          return;
        }

        navigate('/admin/dashboard');
      } catch (err) {
        setError(err?.message || 'No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // localStorage fallback (demo mode)
    const admins = getData(KEYS.ADMIN_USERS);
    const admin = admins.find(
      (a) => a.email === email.trim() && a.password === password
    );

    setLoading(false);

    if (!admin) {
      setError('Correo o contraseña inválidos.');
      return;
    }

    setAdminSession({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    navigate('/admin/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gray-100)',
        padding: 16,
      }}
    >
      <div className="login-box">
        <div className="card">
          <h2 style={{ marginBottom: 8 }}>Inicio de Sesión Admin</h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--gray-500)',
              marginBottom: 24,
              fontSize: '0.875rem',
            }}
          >
            {USE_BACKEND
              ? 'Conectado al backend. Ingresa tus credenciales de administrador.'
              : 'Ingresa tus credenciales para acceder al panel de administración.'}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="admin@demo.com"
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
              />
              {error && <p className="form-error">{error}</p>}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
