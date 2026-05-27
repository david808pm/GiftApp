import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { giftAppGetPublicCampaignBySlug, USE_BACKEND } from '../../api/giftAppService';

export default function CampaignWelcome() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(USE_BACKEND);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (USE_BACKEND) setLoading(true);

    giftAppGetPublicCampaignBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setCampaign(data);
        if (USE_BACKEND) setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        if (USE_BACKEND) {
          setError('Campaña no encontrada.');
          setLoading(false);
        } else {
          setCampaign(null);
        }
      });

    return () => { cancelled = true; };
  }, [slug]);

  if (USE_BACKEND && loading) {
    return (
      <div className="welcome-page">
        <div className="welcome-card">
          <p style={{ color: 'var(--gray-500)' }}>Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (USE_BACKEND && error) {
    return (
      <div className="welcome-page">
        <div className="welcome-card">
          <h1>Campaña No Encontrada</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="welcome-page">
        <div className="welcome-card">
          <h1>Campaña No Encontrada</h1>
          <p>La campaña que buscas no existe.</p>
        </div>
      </div>
    );
  }

  if (campaign.status !== 'ACTIVE') {
    return (
      <div className="welcome-page">
        <div className="welcome-card">
          {campaign.logoImageUrl && (
            <img src={campaign.logoImageUrl} alt={campaign.logoText || campaign.name} style={{ maxHeight: 80, maxWidth: 200, marginBottom: 16, objectFit: 'contain' }} />
          )}
          <div className="logo-text">{campaign.logoText || 'REGALOS'}</div>
          <h1>{campaign.name}</h1>
          <p>Esta campaña no está disponible actualmente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-page" style={{ '--primary': campaign.primaryColor || '#2563eb' }}>
      <div className="welcome-card">
        {campaign.logoImageUrl && (
          <img src={campaign.logoImageUrl} alt={campaign.logoText || campaign.name} style={{ maxHeight: 80, maxWidth: 200, marginBottom: 16, objectFit: 'contain' }} />
        )}
        <div className="logo-text">{campaign.logoText || 'REGALOS'}</div>
        <h1>{campaign.name}</h1>
        <p>{campaign.welcomeText || '¡Bienvenido a la selección de regalos!'}</p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate(`/campaign/${slug}/login`)}
        >
          Iniciar Selección
        </button>
      </div>
    </div>
  );
}
