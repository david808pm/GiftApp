import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  giftAppGetPublicCampaignBySlug,
  giftAppCreatePublicSupportRequest,
  USE_BACKEND,
} from '../../api/giftAppService';

export default function SupportRequest() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(USE_BACKEND);
  const [documentId, setDocumentId] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    if (USE_BACKEND) setCampaignLoading(true);

    giftAppGetPublicCampaignBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setCampaign(data);
        if (USE_BACKEND) setCampaignLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCampaign(null);
        if (USE_BACKEND) setCampaignLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!documentId.trim()) newErrors.documentId = 'El ID es obligatorio.';
    if (!type) newErrors.type = 'Selecciona un tipo de problema.';
    if (!message.trim()) newErrors.message = 'El mensaje es obligatorio.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await giftAppCreatePublicSupportRequest({
        campaignId: campaign?.id || undefined,
        documentId: documentId.trim(),
        type,
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      setErrors({ form: err.message || 'Error al enviar el reporte.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (campaignLoading) {
    return (
      <div className="page-wrapper">
        <div className="page-content container">
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--gray-500)' }}>Cargando campaña...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page-wrapper">
        <div className="page-content container">
          <div className="card" style={{ textAlign: 'center' }}>
            <h2>Campaña No Encontrada</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ '--primary': campaign.primaryColor || '#2563eb' }}>
      <header className="page-header">
        <div className="container">
          <span className="logo">{campaign.logoText || 'REGALOS'}</span>
          <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            {campaign.name} - Soporte
          </span>
        </div>
      </header>
      <div className="page-content container">
        <div className="login-box">
          <div className="card">
            <h2>Reportar un Problema</h2>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--success-light)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    margin: '0 auto 16px',
                  }}
                >
                  ✓
                </div>
                <p style={{ color: 'var(--gray-600)', marginBottom: 20 }}>
                  Tu reporte ha sido enviado. Lo revisaremos y te
                  contactaremos.
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/campaign/${slug}`)}
                >
                  Volver a la Campaña
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errors.form && (
                  <p className="form-error" style={{ marginBottom: 12 }}>{errors.form}</p>
                )}
                <div className="form-group">
                  <label>Tu Número de Identificación</label>
                  <input
                    type="text"
                    value={documentId}
                    onChange={(e) => {
                      setDocumentId(e.target.value);
                      setErrors((prev) => ({ ...prev, documentId: '' }));
                    }}
                    placeholder="ej. 1001"
                    disabled={submitting}
                  />
                  {errors.documentId && (
                    <p className="form-error">{errors.documentId}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Tipo de Problema</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setErrors((prev) => ({ ...prev, type: '' }));
                    }}
                    disabled={submitting}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="NOT_FOUND">
                      No aparezco en el sistema
                    </option>
                    <option value="BENEFICIARY_DATA_INCORRECT">
                      Los datos de mi beneficiario son incorrectos
                    </option>
                    <option value="MISSING_BENEFICIARY">
                      Falta un beneficiario
                    </option>
                    <option value="AGE_GENDER_INCORRECT">
                      La edad o el género son incorrectos
                    </option>
                    <option value="GIFT_SELECTION_PROBLEM">
                      Tengo un problema con la selección de regalos
                    </option>
                    <option value="OTHER">Otro</option>
                  </select>
                  {errors.type && <p className="form-error">{errors.type}</p>}
                </div>

                <div className="form-group">
                  <label>Mensaje</label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setErrors((prev) => ({ ...prev, message: '' }));
                    }}
                    placeholder="Describe tu problema en detalle..."
                    rows={4}
                    disabled={submitting}
                  />
                  {errors.message && (
                    <p className="form-error">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={submitting}
                >
                  {submitting ? 'Enviando solicitud...' : 'Enviar Reporte'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
