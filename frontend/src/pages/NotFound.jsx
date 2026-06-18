export default function NotFound() {
  return (
    <div className="page-wrapper">
      <div className="page-content container">
        <div className="card">
          <h2>Página no encontrada</h2>
          <p>La ruta solicitada no existe.</p>
          <a href="/admin/login" className="btn btn-primary">
            Ir al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}
