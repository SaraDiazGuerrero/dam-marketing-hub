import { logoutUser } from '../services/authService'

export default function Navbar({ user }) {
  async function handleLogout() {
    await logoutUser()
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>DAM Marketing Hub</h1>
        <span>Gestión de activos digitales</span>
      </div>
      <div className="navbar-user">
        <span>{user.email}</span>
        <button type="button" className="btn-secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
