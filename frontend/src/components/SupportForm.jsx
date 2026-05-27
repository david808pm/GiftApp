import { useState } from 'react';
import {
  SUPPORT_TYPES,
  validateSupportType,
  validateSupportMessage,
} from '../utils/validators';
import { SUPPORT_TYPE_LABELS } from '../constants/appConstants';
import { giftAppCreatePublicSupportRequest } from '../api/giftAppService';

export default function SupportForm({
  campaignId,
  employeeId,
  documentId,
  onSubmitted,
}) {
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setErrors({});

    const typeErr = validateSupportType(type);
    const msgErr = validateSupportMessage(message);
    if (typeErr || msgErr) {
      setErrors({ type: typeErr, message: msgErr });
      return;
    }

    setSubmitting(true);
    try {
      await giftAppCreatePublicSupportRequest({
        campaignId: campaignId || undefined,
        documentId: documentId || undefined,
        type,
        message: message.trim(),
      });
      setSent(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setErrors({ message: err.message || 'Error al enviar el reporte.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <p style={{ color: 'var(--success)', textAlign: 'center' }}>
        Tu reporte ha sido enviado. Lo revisaremos pronto.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
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
          {SUPPORT_TYPES.map((code) => (
            <option key={code} value={code}>
              {SUPPORT_TYPE_LABELS[code] || code}
            </option>
          ))}
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
          placeholder="Describe tu problema..."
          disabled={submitting}
        />
        {errors.message && <p className="form-error">{errors.message}</p>}
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar Reporte'}
      </button>
    </form>
  );
}
