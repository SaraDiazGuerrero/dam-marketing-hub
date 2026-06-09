import { useEffect, useState } from 'react'
import { subscribeToAuthChanges } from './services/authService'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return <div className="app-loading">Cargando...</div>
  }

  return user ? <DashboardPage user={user} /> : <LoginPage />
}

export default App
