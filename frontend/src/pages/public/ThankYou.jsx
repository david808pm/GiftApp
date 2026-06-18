import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  giftAppGetPublicCampaignBySlug,
  giftAppClearPublicEmployeeSession,
  USE_BACKEND,
} from '../../api/giftAppService';

export default function ThankYou() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(USE_BACKEND);

  useEffect(() => {
    const confirmed = sessionStorage.getItem(`giftapp_confirmed_${slug}`);
    if (confirmed !== 'true') {
      navigate(`/campaign/${slug}/login`, { replace: true });
      return;
    }
  }, [slug, navigate]);

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
        setCampaign(null);
        if (USE_BACKEND) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  if (USE_BACKEND && loading) {
    return (
      <div className="page-wrapper">
        <div className="thank-you-page">
          <div className="thank-you-card">
            <p style={{ color: 'var(--gray-500)' }}>Cargando confirmación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ '--primary': campaign?.primaryColor || '#2563eb' }}>
      <header className="page-header">
        <div className="container">
          {campaign?.logoImageUrl && (
            <img
              src={campaign.logoImageUrl}
              alt={campaign.logoText || campaign.name}
              style={{ maxHeight: 44, maxWidth: 160, marginRight: 12, objectFit: 'contain' }}
            />
          )}
          <span className="logo">{campaign?.logoText || 'REGALOS'}</span>
          <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            {campaign?.name}
          </span>
        </div>
      </header>
      <div className="thank-you-page">
        <div className="thank-you-card">
          <div className="check-icon">✓</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
            ¡Gracias!
          </h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>
            Gracias por usar la plataforma de selección de regalos
          </p>
          <button
            className="btn btn-outline"
            onClick={async () => {
              sessionStorage.removeItem(`giftapp_confirmed_${slug}`);
              sessionStorage.removeItem(`giftapp_session_${slug}`);
              sessionStorage.removeItem(`giftapp_selections_${slug}`);
              // Also clear the employee JWT so the session fully ends.
              await giftAppClearPublicEmployeeSession();
              navigate(`/campaign/${slug}/login`);
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
