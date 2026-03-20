import { useState, useEffect } from 'react'
import styles from './AdminPanel.module.css'
import Dashboard from './admin/Dashboard'
import Chats from './admin/Chats'
import Settings from './admin/Settings'
import logo from '../../logo.png'
import { api } from '../api'

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function PasswordField({ label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.pwWrapper}>
        <input
          className={styles.fieldInput}
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PAGES = [
  { id: 'dashboard',       label: 'Dashboard' },
  { id: 'chats',           label: 'Chats' },
  { id: 'configuraciones', label: 'Configuraciones' },
]

export default function AdminPanel({ user, onLogout, onUpdateUser }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [credsOpen, setCredsOpen] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)

  const openCreds = () => {
    setForm({ currentPassword: '', email: user.email ?? '', password: '', confirm: '' })
    setError('')
    setLoading(false)
    setCredsOpen(true)
  }

  const handleNavTab = (pageId) => {
    if (pageId === 'configuraciones' && activePage !== 'configuraciones') {
      setVerifyPassword('')
      setVerifyError('')
      setVerifyLoading(false)
      setVerifyOpen(true)
    } else {
      setActivePage(pageId)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    if (!verifyPassword) { setVerifyError('Ingresa tu contraseña'); return }
    setVerifyError('')
    setVerifyLoading(true)
    try {
      await api.login({ email: user.email, password: verifyPassword })
      setVerifyOpen(false)
      setActivePage('configuraciones')
    } catch {
      setVerifyError('Contraseña incorrecta')
    } finally {
      setVerifyLoading(false)
    }
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setCredsOpen(false)
        setVerifyOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const handleSubmitCreds = async (e) => {
    e.preventDefault()
    if (!form.currentPassword) { setError('Ingresa tu contraseña actual'); return }
    if (form.email && !EMAIL_RE.test(form.email)) { setError('Ingresa un correo electrónico válido'); return }
    if (form.password && form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }

    setError('')
    setLoading(true)

    const body = { current_password: form.currentPassword }
    if (form.email)    body.email    = form.email
    if (form.password) body.password = form.password

    try {
      const { user: updated } = await api.updateMe(body)
      onUpdateUser(updated)
      setCredsOpen(false)
    } catch (err) {
      setError(err?.error ?? 'Error al guardar cambios')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="Distrivalto" className={styles.brandLogo} />
          <span className={styles.brandName}>Distrivalto</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navTabs}>
            {PAGES.map(page => (
              <button
                key={page.id}
                className={`${styles.navTab} ${activePage === page.id ? styles.navTabActive : ''}`}
                onClick={() => handleNavTab(page.id)}
              >
                {page.label}
              </button>
            ))}
          </div>
        </nav>

        <div className={styles.headerRight}>
          <button className={styles.adminUserBtn} onClick={openCreds}>
            {user.name}
          </button>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {activePage === 'dashboard'       && <Dashboard />}
        {activePage === 'chats'           && <Chats />}
        {activePage === 'configuraciones' && <Settings user={user} />}
      </main>

      {verifyOpen && (
        <div className={styles.modalBackdrop} onClick={() => setVerifyOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Verificar identidad</h3>
              <button className={styles.closeBtn} onClick={() => setVerifyOpen(false)} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleVerifySubmit}>
              <p className={styles.verifyHint}>Ingresa tu contraseña para acceder a Configuraciones.</p>
              <PasswordField
                label="Contraseña"
                value={verifyPassword}
                onChange={e => setVerifyPassword(e.target.value)}
                autoComplete="current-password"
              />
              {verifyError && <p className={styles.errorMsg}>{verifyError}</p>}
              <button className={styles.submitBtn} type="submit" disabled={verifyLoading}>
                {verifyLoading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {credsOpen && (
        <div className={styles.modalBackdrop} onClick={() => setCredsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cambiar credenciales</h3>
              <button className={styles.closeBtn} onClick={() => setCredsOpen(false)} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmitCreds}>
              <PasswordField
                label="Contraseña actual"
                value={form.currentPassword}
                onChange={set('currentPassword')}
                autoComplete="current-password"
              />
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nuevo correo electrónico</label>
                <input
                  className={styles.fieldInput}
                  type="email"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              <PasswordField label="Nueva contraseña" value={form.password} onChange={set('password')} autoComplete="new-password" />
              <PasswordField label="Confirmar contraseña" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
