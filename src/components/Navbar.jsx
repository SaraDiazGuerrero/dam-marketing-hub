import { logoutUser } from '../services/authService'

export default function Navbar({ user }) {
  async function handleLogout() {
    await logoutUser()
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo" aria-hidden="true">
          DAM
        </div>
        <div className="navbar-brand-text">
          <h1>Marketing Hub</h1>
          <span>Gestión de activos digitales</span>
        </div>
      </div>
      <div className="navbar-user">
        <span className="navbar-email" title={user.email}>
          {user.email}
        </span>
        <button type="button" className="btn-secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
