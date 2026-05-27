import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { giftAppGetPublicCampaignBySlug, USE_BACKEND } from '../../api/giftAppService';

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
    sessionStorage.removeItem(`giftapp_confirmed_${slug}`);
    sessionStorage.removeItem(`giftapp_session_${slug}`);
    sessionStorage.removeItem(`giftapp_selections_${slug}`);
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
      <div className="thank-you-page">
        <div className="thank-you-card">
          <p style={{ color: 'var(--gray-500)' }}>Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="thank-you-page" style={{ '--primary': campaign?.primaryColor || '#2563eb' }}>
      <div className="thank-you-card">
        <div className="check-icon">✓</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
          ¡Gracias!
        </h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>
          Tu selección de regalos ha sido confirmada exitosamente.
        </p>
        <button
          className="btn btn-outline"
          onClick={() => navigate(`/campaign/${slug}`)}
        >
          Volver a la Campaña
        </button>
      </div>
    </div>
  );
}
