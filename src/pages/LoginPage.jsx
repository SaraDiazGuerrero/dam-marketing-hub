import Login from '../components/Login'

export default function LoginPage() {
  return (
    <div className="login-page">
      <aside className="login-hero">
        <span className="login-hero-badge">Sistema DAM · Firebase</span>
        <h1>DAM Marketing Hub</h1>
        <p>
          Centraliza imágenes, videos y documentos de tus campañas en un solo
          lugar. Organiza, consulta y comparte activos digitales.
        </p>
        <div className="login-hero-features">
          <span>✓ Almacenamiento en Firebase Storage</span>
          <span>✓ Metadatos en Firestore</span>
          <span>✓ Acceso seguro con autenticación</span>
        </div>
      </aside>

      <div className="login-panel">
        <header className="login-page-header">
          <h1>DAM Marketing Hub</h1>
          <p>Centraliza los activos digitales de tu agencia</p>
        </header>
        <Login />
      </div>
    </div>
  )
}
