import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  resetDemoData,
} from '../../api/localStorageService';
import { giftAppGetDashboardStats, USE_BACKEND } from '../../api/giftAppService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast, { useToast } from '../../components/Toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [showReset, setShowReset] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(USE_BACKEND);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    if (USE_BACKEND) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await giftAppGetDashboardStats();
      setStats(data);
    } catch {
      if (USE_BACKEND) {
        setError('No fue posible cargar las estadísticas.');
      }
    } finally {
      if (USE_BACKEND) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleReset = () => {
    resetDemoData();
    loadStats();
    setShowReset(false);
    addToast('Los datos demo han sido restablecidos exitosamente.');
  };

  if (USE_BACKEND && loading) {
    return (
      <div className="admin-body">
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
          Cargando estadísticas...
        </p>
      </div>
    );
  }

  if (USE_BACKEND && error) {
    return (
      <div className="admin-body">
        <p style={{ color: 'var(--danger)', fontSize: '0.9375rem' }}>
          {error}
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        {!USE_BACKEND && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowReset(true)}
            >
              Restablecer Datos Demo
            </button>
          </div>
        )}
      </div>
      <div className="admin-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.campaigns}</div>
            <div className="stat-label">Campañas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.companies ?? 0}</div>
            <div className="stat-label">Empresas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.employees}</div>
            <div className="stat-label">Empleados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.beneficiaries}</div>
            <div className="stat-label">Beneficiarios</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.gifts}</div>
            <div className="stat-label">Regalos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.selections}</div>
            <div className="stat-label">Selecciones Confirmadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.stock}</div>
            <div className="stat-label">Stock Disponible</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.supportRequests}</div>
            <div className="stat-label">Solicitudes de Soporte</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Acciones Rápidas</h2>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/admin/campaigns')}
            >
              Gestionar Campañas
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/admin/employees')}
            >
              Gestionar Empleados
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/admin/gifts')}
            >
              Gestionar Regalos
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/admin/selections')}
            >
              Ver Selecciones
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/admin/support-requests')}
            >
              Solicitudes de Soporte
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showReset}
        title="Restablecer Datos Demo"
        message="Esto restablecerá todos los datos al estado demo original. Cualquier cambio que hayas hecho se perderá. ¿Continuar?"
        confirmText="Restablecer Datos"
        cancelText="Cancelar"
        danger
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
      />
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
