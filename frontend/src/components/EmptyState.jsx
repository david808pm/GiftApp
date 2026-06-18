export default function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <h3>{title || 'Sin datos'}</h3>
      <p>{message || 'No hay elementos para mostrar.'}</p>
    </div>
  );
}
