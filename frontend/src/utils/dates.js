const DEFAULT_LOCALE = 'es-CO';
const DEFAULT_TIME_ZONE = 'America/Bogota';

function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (!isValidDate(date)) return '';
  return date.toLocaleDateString(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DEFAULT_TIME_ZONE,
  });
}

function formatShortDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (!isValidDate(date)) return '';
  return date.toLocaleDateString(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: DEFAULT_TIME_ZONE,
  });
}

export { formatDate, formatShortDate };

