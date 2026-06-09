import Navbar from '../components/Navbar'
import UploadForm from '../components/UploadForm'

export default function DashboardPage({ user }) {
  return (
    <div className="dashboard">
      <Navbar user={user} />
      <main className="dashboard-main page-container">
        <header className="page-header">
          <h2>Panel de control</h2>
          <p>Gestiona y organiza los activos digitales de tu agencia.</p>
        </header>

        <p className="dashboard-welcome">
          Hola, <strong>{user.email}</strong>
        </p>

        <UploadForm user={user} />
      </main>
    </div>
  )
}
