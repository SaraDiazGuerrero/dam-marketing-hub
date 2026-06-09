import Navbar from '../components/Navbar'

export default function DashboardPage({ user }) {
  return (
    <div className="dashboard">
      <Navbar user={user} />
      <main className="dashboard-main">
        <h2>Bienvenido al panel</h2>
        <p>
          Hola, <strong>{user.email}</strong>. Aquí podrás subir y organizar
          activos digitales.
        </p>
        <p className="dashboard-hint">
          Próximo paso: formulario de carga de archivos (Paso 4).
        </p>
      </main>
    </div>
  )
}
