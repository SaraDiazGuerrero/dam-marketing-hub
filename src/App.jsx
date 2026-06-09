import app, { isFirebaseConfigured } from './services/firebase'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>DAM Marketing Hub</h1>
        <p>Sistema de gestión de activos digitales</p>
      </header>
      <main className="app-main">
        {isFirebaseConfigured ? (
          <p>
            Firebase conectado al proyecto:{' '}
            <strong>{app.options.projectId}</strong>
          </p>
        ) : (
          <p>
            Crea el archivo <code>.env</code> a partir de <code>.env.example</code>{' '}
            y reinicia el servidor de desarrollo.
          </p>
        )}
      </main>
    </div>
  )
}

export default App
