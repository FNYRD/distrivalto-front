import { useState, useEffect, useCallback } from 'react'
import styles from './AuthModal.module.css'

/* ── Icons ── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

/* ── Social buttons shared ── */

function SocialButtons() {
  return (
    <div className={styles.socialRow}>
      <button className={styles.socialBtn} type="button">
        <GoogleIcon />
        <span>Google</span>
      </button>
      <button className={styles.socialBtn} type="button">
        <AppleIcon />
        <span>Apple</span>
      </button>
      <button className={styles.socialBtn} type="button">
        <PhoneIcon />
        <span>Teléfono</span>
      </button>
    </div>
  )
}

/* ── Divider ── */

function Divider() {
  return (
    <div className={styles.divider}>
      <span>o continúa con</span>
    </div>
  )
}

/* ── Login form ── */

function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.email === 'admin' && form.password === 'admin') {
      onLogin({ name: 'Admin', isAdmin: true, email: 'admin' })
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>Correo electrónico</label>
        <input
          className={styles.input}
          type="text"
          placeholder="usuario o correo"
          value={form.email}
          onChange={set('email')}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Contraseña</label>
        <input
          className={styles.input}
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set('password')}
          autoComplete="current-password"
        />
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
      <button className={styles.submitBtn} type="submit">Iniciar sesión</button>

      <Divider />
      <SocialButtons />
    </form>
  )
}

/* ── Register form ── */

function RegisterForm() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', country: '', city: '',
  })
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <form className={styles.form} onSubmit={e => e.preventDefault()}>
      <div className={styles.field}>
        <label className={styles.label}>Nombre completo</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Juan Pérez"
          value={form.name}
          onChange={set('name')}
          autoComplete="name"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Correo electrónico</label>
        <input
          className={styles.input}
          type="email"
          placeholder="tu@correo.com"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Contraseña</label>
        <input
          className={styles.input}
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set('password')}
          autoComplete="new-password"
        />
      </div>

      <p className={styles.optionalHeading}>Información adicional <span>(opcional)</span></p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Edad</label>
          <input
            className={styles.input}
            type="number"
            placeholder="25"
            min="1"
            max="120"
            value={form.age}
            onChange={set('age')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>País</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Colombia"
            value={form.country}
            onChange={set('country')}
            autoComplete="country-name"
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Ciudad</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Bogotá"
          value={form.city}
          onChange={set('city')}
          autoComplete="address-level2"
        />
      </div>

      <button className={styles.submitBtn} type="submit">Crear cuenta</button>

      <Divider />
      <SocialButtons />
    </form>
  )
}

/* ── Modal ── */

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onLogin }) {
  const [mode, setMode] = useState(initialMode)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, handleKey])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => setMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => setMode('register')}
            >
              Registrarse
            </button>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.body}>
          {mode === 'login' ? <LoginForm onLogin={onLogin} /> : <RegisterForm />}
        </div>

      </div>
    </div>
  )
}
