import { useState } from 'react'
import { loginUser, registerUser } from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await registerUser(email, password)
      } else {
        await loginUser(email, password)
      }
    } catch (err) {
      setError(getAuthErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <h2>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      <p className="login-subtitle">
        Accede al DAM Marketing Hub para gestionar activos digitales.
      </p>

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@agencia.com"
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Entrar'}
        </button>
      </form>

      <button
        type="button"
        className="btn-link"
        onClick={() => {
          setIsRegister(!isRegister)
          setError('')
        }}
      >
        {isRegister
          ? '¿Ya tienes cuenta? Inicia sesión'
          : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  )
}

function getAuthErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  }
  return messages[code] || 'Ocurrió un error. Intenta de nuevo.'
}
