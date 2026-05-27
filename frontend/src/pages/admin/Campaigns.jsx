import { useState, useEffect } from 'react';
import { validateRequired, validateSlug } from '../../utils/validators';
import { formatDate } from '../../utils/dates';
import {
  giftAppGetCampaigns,
  giftAppCreateCampaign,
  giftAppUpdateCampaign,
  giftAppDeleteCampaign,
  giftAppUploadCampaignLogo,
  USE_BACKEND,
} from '../../api/giftAppService';
import Modal from '../../components/Modal';
import Toast, { useToast } from '../../components/Toast';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

// TODO: Move referential integrity checks to server-side before production.

const EMPTY_CAMPAIGN = {
  name: '',
  slug: '',
  welcomeText: '',
  rulesText: '',
  status: 'ACTIVE',
  logoText: '',
  primaryColor: '#2563eb',
  logoImageUrl: '',
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [errors, setErrors] = useState({});
  const { toasts, addToast, removeToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(USE_BACKEND);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  const loadCampaigns = async () => {
    if (USE_BACKEND) setLoading(true);
    try {
      const data = await giftAppGetCampaigns();
      setCampaigns(data);
    } catch (err) {
      if (USE_BACKEND) addToast(err.message || 'Error al cargar las campañas.', 'error');
    } finally {
      if (USE_BACKEND) setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const filtered = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_CAMPAIGN);
    setErrors({});
    setLogoFile(null);
    setShowModal(true);
  };

  const openEdit = (campaign) => {
    setEditing(campaign);
    setForm({ ...campaign });
    setErrors({});
    setLogoFile(null);
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    const nameErr = validateRequired(form.name, 'Nombre');
    if (nameErr) errs.name = nameErr;
    const slugErr = validateSlug(form.slug);
    if (slugErr) errs.slug = slugErr;

    if (!editing) {
      const existing = campaigns.find((c) => c.slug === form.slug);
      if (existing) errs.slug = 'El slug debe ser único.';
    } else {
      const existing = campaigns.find(
        (c) => c.slug === form.slug && c.id !== editing.id
      );
      if (existing) errs.slug = 'El slug debe ser único.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      let result;
      if (editing) {
        result = await giftAppUpdateCampaign(editing.id, form);
      } else {
        result = await giftAppCreateCampaign(form);
      }

      const campaignId = result?.id || editing?.id;
      if (USE_BACKEND && logoFile && campaignId) {
        await giftAppUploadCampaignLogo(campaignId, logoFile);
      }

      await loadCampaigns();
      setShowModal(false);
      setLogoFile(null);
      addToast(editing ? 'Campaña actualizada.' : 'Campaña creada.');
    } catch (err) {
      addToast(err.message || 'Error al guardar la campaña.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await giftAppDeleteCampaign(deleteTarget.id);
      await loadCampaigns();
      setDeleteTarget(null);
      addToast('Campaña eliminada.');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (USE_BACKEND && loading) {
    return (
      <div>
        <div className="admin-topbar"><h1>Campañas</h1></div>
        <div className="admin-body">
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
            Cargando campañas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1>Campañas</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Nueva Campaña
        </button>
      </div>
      <div className="admin-body">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar campañas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Sin campañas" message="Crea tu primera campaña." />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Slug</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td><code>{c.slug}</code></td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>
                        {c.status === 'ACTIVE' ? 'Activo' : 'Cerrado'}
                      </span>
                    </td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(c)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Campaña' : 'Nueva Campaña'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Nombre</label>
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            placeholder="ej. navidad-2026"
          />
          {errors.slug && <p className="form-error">{errors.slug}</p>}
        </div>
        <div className="form-group">
          <label>Texto de Bienvenida</label>
          <textarea
            value={form.welcomeText}
            onChange={(e) => updateField('welcomeText', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Texto de Reglas</label>
          <textarea
            value={form.rulesText}
            onChange={(e) => updateField('rulesText', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Estado</label>
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="ACTIVE">Activo</option>
            <option value="CLOSED">Cerrado</option>
          </select>
        </div>
        <div className="form-group">
          <label>Texto del Logo</label>
          <input
            value={form.logoText}
            onChange={(e) => updateField('logoText', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Color Principal</label>
          <input
            type="color"
            value={form.primaryColor}
            onChange={(e) => updateField('primaryColor', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Logo de la Empresa</label>
          {form.logoImageUrl && !logoFile && (
            <div style={{ marginBottom: 8 }}>
              <img
                src={form.logoImageUrl}
                alt="Logo actual"
                style={{ maxWidth: 160, maxHeight: 80, borderRadius: 6, border: '1px solid var(--gray-200)' }}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
                  addToast('Solo se permiten imágenes PNG, JPEG, JPG o WebP.', 'error');
                  e.target.value = '';
                  return;
                }
                if (file.size > 2 * 1024 * 1024) {
                  addToast('El logo no puede superar los 2MB.', 'error');
                  e.target.value = '';
                  return;
                }
                setLogoFile(file);
              }
            }}
          />
          {logoFile && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: 4 }}>
              {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar Campaña"
        message={`¿Estás seguro de que deseas eliminar "${deleteTarget?.name}"?`}
        confirmText="Eliminar"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
