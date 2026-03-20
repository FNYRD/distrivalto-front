import { useState, useEffect, useCallback } from 'react'
import styles from './AuthModal.module.css'
import { api } from '../api'

/* ── Icons ── */

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
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

/* ── Reusable password field with eye toggle ── */

function PasswordField({ id, label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.passwordWrapper}>
        <input
          id={id}
          className={styles.input}
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button type="button" className={styles.eyeBtn} onClick={() => setShow(p => !p)} tabIndex={-1}>
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}

/* ── Login form ── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(form.email)) {
      setError('Ingresa un correo electrónico válido')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await api.login({ email: form.email, password: form.password })
      onLogin(data)
    } catch (err) {
      setError(err?.error ?? 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          className={styles.input}
          type="email"
          placeholder="tu@correo.com"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
        />
      </div>
      <PasswordField
        id="login-password"
        label="Contraseña"
        value={form.password}
        onChange={set('password')}
        autoComplete="current-password"
      />
      {error && <p className={styles.errorMsg}>{error}</p>}
      <button className={styles.submitBtn} type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

/* ── Register / Edit-profile form ── */

function RegisterForm({ prefilled = null, currentPassword, onSuccess }) {
  const [form, setForm] = useState({
    name:     prefilled?.name    ?? '',
    email:    prefilled?.email   ?? '',
    password: '',
    confirm:  '',
    age:      prefilled?.age != null ? String(prefilled.age) : '',
    country:  prefilled?.country ?? '',
    city:     prefilled?.city    ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(form.email)) {
      setError('Ingresa un correo electrónico válido')
      return
    }
    if (form.password && form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setError('')
    setLoading(true)
    const { confirm: _confirm, ...payload } = form
    if (!payload.password) delete payload.password

    try {
      if (prefilled) {
        // Modo cambio de credenciales — PATCH /api/auth/me/
        const { user } = await api.updateMe({ current_password: currentPassword, ...payload })
        onSuccess(user)
      } else {
        // Modo registro — POST /api/auth/register/
        const data = await api.register(payload)
        onSuccess(data)
      }
    } catch (err) {
      setError(err?.error ?? 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="reg-name">Nombre completo</label>
        <input id="reg-name" className={styles.input} type="text" placeholder="Juan Pérez"
          value={form.name} onChange={set('name')} autoComplete="name" />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="reg-email">Correo electrónico</label>
        <input id="reg-email" className={styles.input} type="email" placeholder="tu@correo.com"
          value={form.email} onChange={set('email')} autoComplete="email" />
      </div>
      <PasswordField id="reg-password" label="Contraseña" value={form.password} onChange={set('password')} autoComplete="new-password" />
      <PasswordField id="reg-confirm" label="Confirmar contraseña" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
      {error && <p className={styles.errorMsg}>{error}</p>}

      <p className={styles.optionalHeading}>Información adicional <span>(opcional)</span></p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-age">Edad</label>
          <input id="reg-age" className={styles.input} type="number" placeholder="25" min="1" max="120"
            value={form.age} onChange={set('age')} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-country">País</label>
          <input id="reg-country" className={styles.input} type="text" placeholder="Colombia"
            value={form.country} onChange={set('country')} autoComplete="country-name" />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="reg-city">Ciudad</label>
        <input id="reg-city" className={styles.input} type="text" placeholder="Bogotá"
          value={form.city} onChange={set('city')} autoComplete="address-level2" />
      </div>

      <button className={styles.submitBtn} type="submit" disabled={loading}>
        {loading ? 'Guardando...' : prefilled ? 'Guardar cambios' : 'Crear cuenta'}
      </button>
    </form>
  )
}

/* ── Confirm current credentials (step 1 of change-creds) ── */

function ConfirmCredsForm({ onConfirm }) {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.password) { setError('Ingresa tu contraseña actual'); return }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    setError('')
    onConfirm(form.password)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.confirmHint}>Ingresa tu contraseña actual dos veces para verificar tu identidad.</p>
      <PasswordField id="confirm-password" label="Contraseña actual" value={form.password} onChange={set('password')} autoComplete="current-password" />
      <PasswordField id="confirm-password2" label="Confirmar contraseña actual" value={form.confirm} onChange={set('confirm')} autoComplete="current-password" />
      {error && <p className={styles.errorMsg}>{error}</p>}
      <button className={styles.submitBtn} type="submit">Continuar</button>
    </form>
  )
}

/* ── Modal ── */

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onLogin, onUpdateUser, user }) {
  const [mode, setMode] = useState(initialMode)
  const [changeStep, setChangeStep] = useState('confirm')
  const [currentPassword, setCurrentPassword] = useState('')

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, handleKey])

  if (!isOpen) return null

  const isChangeCreds = mode === 'change-creds'

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          {isChangeCreds ? (
            <h3 className={styles.modalTitle}>
              {changeStep === 'confirm' ? 'Verificar identidad' : 'Editar perfil'}
            </h3>
          ) : (
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
          )}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.body}>
          {mode === 'login'    && <LoginForm onLogin={onLogin} />}
          {mode === 'register' && (
            <RegisterForm onSuccess={(data) => onLogin(data)} />
          )}
          {mode === 'change-creds' && changeStep === 'confirm' && (
            <ConfirmCredsForm onConfirm={(pwd) => { setCurrentPassword(pwd); setChangeStep('edit') }} />
          )}
          {mode === 'change-creds' && changeStep === 'edit' && (
            <RegisterForm prefilled={user} currentPassword={currentPassword} onSuccess={(userData) => onUpdateUser(userData)} />
          )}
        </div>

      </div>
    </div>
  )
}
