import { useState, useEffect, useRef } from 'react'
import styles from './Settings.module.css'
import { api } from '../../api'

/* ── Icons ── */

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

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
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

/* ── Reusable password field ── */

function PasswordField({ id, label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.pwWrapper}>
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ── Initial state ── */

/* ── Component ── */

export default function Settings({ user }) {
  const [support, setSupport] = useState({ email: '', phone: '' })
  const [apiKey, setApiKey]         = useState('')
  const [apiStatus, setApiStatus]   = useState('idle') // 'ok' | 'error' | 'idle'
  const [testingApi, setTestingApi] = useState(false)
  const [link, setLink]             = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  // Estado original del backend para detectar cambios reales
  const [savedInfo, setSavedInfo]   = useState(null)

  const [admins, setAdmins]               = useState([])
  const [newAdmin, setNewAdmin]           = useState({ email: '', password: '', confirm: '' })
  const [newAdminError, setNewAdminError] = useState('')
  const [newAdminLoading, setNewAdminLoading] = useState(false)

  const [menuOpen, setMenuOpen]     = useState(null)
  const [menuPos, setMenuPos]       = useState({ top: 0, right: 0 })
  const menuOpenRef = useRef(null)
  useEffect(() => { menuOpenRef.current = menuOpen }, [menuOpen])

  const [editAdmin, setEditAdmin]   = useState(null)
  const [editError, setEditError]   = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const [confirmDeleteAdmin, setConfirmDeleteAdmin] = useState(null)

  const setNew = (k) => (e) => setNewAdmin(prev => ({ ...prev, [k]: e.target.value }))

  // Carga settings e lista de admins al montar
  useEffect(() => {
    api.getAdminSettings()
      .then(data => {
        const info = {
          email:  data.email  ?? '',
          phone:  data.phone  ?? '',
          link:   data.link   ?? '',
          apiKey: data.apiKey ?? '',
        }
        setSupport({ email: info.email, phone: info.phone })
        setLink(info.link)
        setApiKey(info.apiKey)
        setSavedInfo(info)
      })
      .catch(() => {})
    api.getAdminUsers()
      .then(data => setAdmins(data.admins))
      .catch(() => {})
  }, [])

  /* Close three-dot menu on outside click */
  useEffect(() => {
    function handle(e) {
      if (menuOpenRef.current === null) return
      if (!e.target.closest('[data-admin-menu]')) setMenuOpen(null)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  /* Close edit modal on Escape */
  useEffect(() => {
    function handle(e) {
      if (e.key === 'Escape') setEditAdmin(null)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  /* Guardar información — solo envía campos que cambiaron */
  const handleSaveInfo = async () => {
    const current = { email: support.email, phone: support.phone, link, apiKey }
    const changes = {}
    if (savedInfo) {
      for (const key of Object.keys(current)) {
        if (current[key] !== savedInfo[key]) changes[key] = current[key]
      }
    } else {
      Object.assign(changes, current)
    }
    if (Object.keys(changes).length === 0) return

    setSavingInfo(true)
    try {
      await api.saveAdminSettings(changes)
      setSavedInfo(current)
    } catch {
      // silent — error UI handled by disabled button state
    } finally {
      setSavingInfo(false)
    }
  }

  /* Verificar API key */
  const testApi = async () => {
    setTestingApi(true)
    try {
      await api.verifyApiKey()
      setApiStatus('ok')
    } catch {
      setApiStatus('error')
    } finally {
      setTestingApi(false)
    }
  }

  /* Add admin */
  const handleAddAdmin = async (e) => {
    e.preventDefault()
    if (!newAdmin.email.trim())                 { setNewAdminError('Ingresa un correo electrónico'); return }
    if (!EMAIL_RE.test(newAdmin.email))         { setNewAdminError('Ingresa un correo electrónico válido'); return }
    if (!newAdmin.password)                     { setNewAdminError('Ingresa una contraseña'); return }
    if (newAdmin.password !== newAdmin.confirm) { setNewAdminError('Las contraseñas no coinciden'); return }
    setNewAdminError('')
    setNewAdminLoading(true)
    try {
      const admin = await api.createAdminUser({ email: newAdmin.email.trim(), password: newAdmin.password })
      setAdmins(prev => [...prev, admin])
      setNewAdmin({ email: '', password: '', confirm: '' })
    } catch (err) {
      setNewAdminError(err?.error ?? 'Error al crear administrador')
    } finally {
      setNewAdminLoading(false)
    }
  }

  /* Delete admin */
  const handleDeleteAdmin = () => {
    const id = confirmDeleteAdmin.id
    api.deleteAdminUser(id).catch(() => {})
    setAdmins(prev => prev.filter(a => a.id !== id))
    setConfirmDeleteAdmin(null)
    setMenuOpen(null)
  }

  /* Open edit modal */
  const openEditAdmin = (admin) => {
    setEditAdmin({ id: admin.id, email: admin.email, password: '', confirm: '' })
    setEditError('')
    setEditLoading(false)
    setMenuOpen(null)
  }

  /* Save edit */
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editAdmin.email.trim())         { setEditError('Ingresa un correo electrónico'); return }
    if (!EMAIL_RE.test(editAdmin.email)) { setEditError('Ingresa un correo electrónico válido'); return }
    if (editAdmin.password && editAdmin.password !== editAdmin.confirm) { setEditError('Las contraseñas no coinciden'); return }
    setEditError('')
    setEditLoading(true)
    const body = { email: editAdmin.email.trim() }
    if (editAdmin.password) body.password = editAdmin.password
    try {
      const updated = await api.updateAdminUser(editAdmin.id, body)
      setAdmins(prev => prev.map(a => a.id === editAdmin.id ? updated : a))
      setEditAdmin(null)
    } catch (err) {
      setEditError(err?.error ?? 'Error al guardar cambios')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageGrid}>

        {/* ── Left column ── */}
        <div className={styles.leftCol}>

          {/* Información */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Información</h2>
            <div className={styles.card}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="settings-email">Email de soporte</label>
                <input
                  id="settings-email"
                  className={styles.input}
                  type="email"
                  placeholder="soporte@empresa.com"
                  value={support.email}
                  onChange={e => setSupport(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="settings-phone">Número de soporte</label>
                <input
                  id="settings-phone"
                  className={styles.input}
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={support.phone}
                  onChange={e => setSupport(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className={styles.apiRow}>
                <div className={styles.apiKeyField}>
                  <PasswordField
                    id="settings-apikey"
                    label="API key"
                    value={apiKey}
                    onChange={e => { setApiKey(e.target.value); setApiStatus('idle') }}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.apiStatusBox}>
                  <span className={`${styles.statusDot} ${
                    apiStatus === 'ok'    ? styles.statusOk :
                    apiStatus === 'error' ? styles.statusError :
                    styles.statusIdle
                  }`} />
                  <span className={styles.statusLabel}>
                    {apiStatus === 'ok' ? 'Conectado' : apiStatus === 'error' ? 'Sin conexión' : 'Sin verificar'}
                  </span>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="settings-link">Link</label>
                <input
                  id="settings-link"
                  className={styles.input}
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className={styles.btnRow}>
                <button className={styles.saveBtn} type="button" onClick={handleSaveInfo} disabled={savingInfo}>
                  {savingInfo ? 'Guardando...' : 'Guardar'}
                </button>
                <button className={styles.saveBtnSecondary} type="button" onClick={testApi} disabled={testingApi}>
                  {testingApi ? 'Verificando...' : 'Verificar conexión'}
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* ── Right column ── */}
        <div className={styles.rightCol}>

          {/* ── Administradores ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Administradores</h2>
            <div className={styles.card}>

          {/* Register new admin form */}
          <form onSubmit={handleAddAdmin} className={styles.addForm}>
            <h3 className={styles.subTitle}>Registrar administrador</h3>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="new-admin-email">Correo electrónico</label>
              <input
                id="new-admin-email"
                className={styles.input}
                type="email"
                placeholder="admin@correo.com"
                value={newAdmin.email}
                onChange={setNew('email')}
                autoComplete="off"
              />
            </div>
            <div className={styles.twoCol}>
              <PasswordField id="new-admin-password" label="Contraseña" value={newAdmin.password} onChange={setNew('password')} autoComplete="new-password" />
              <PasswordField id="new-admin-confirm" label="Confirmar contraseña" value={newAdmin.confirm} onChange={setNew('confirm')} autoComplete="new-password" />
            </div>
            {newAdminError && <p className={styles.errorMsg}>{newAdminError}</p>}
            <button className={styles.saveBtn} type="submit" disabled={newAdminLoading}>
              {newAdminLoading ? 'Agregando...' : 'Agregar administrador'}
            </button>
          </form>

          {/* Admin list */}
          <div className={styles.adminList}>
            <h3 className={styles.subTitle}>Usuarios registrados</h3>
            {admins.map(admin => (
              <div key={admin.id} className={styles.adminRow}>
                <div className={styles.adminAvatar}>{admin.email[0].toUpperCase()}</div>
                <span className={styles.adminName}>{admin.email}</span>
                <div className={styles.menuWrap} data-admin-menu>
                  <button
                    className={styles.dotsBtn}
                    type="button"
                    data-admin-menu
                    onClick={(e) => {
                      if (menuOpen === admin.id) { setMenuOpen(null); return }
                      const rect = e.currentTarget.getBoundingClientRect()
                      const dropH = 88
                      const openUp = rect.bottom + 4 + dropH > window.innerHeight
                      setMenuPos(openUp
                        ? { top: rect.top - dropH - 4, right: window.innerWidth - rect.right }
                        : { top: rect.bottom + 4,      right: window.innerWidth - rect.right }
                      )
                      setMenuOpen(admin.id)
                    }}
                  >
                    <DotsIcon />
                  </button>
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className={styles.empty}>No hay administradores registrados.</p>
            )}
          </div>

          </div>
          </section>

        </div>
      </div>

      {/* ── Three-dot dropdown (fixed to avoid viewport clipping) ── */}
      {menuOpen && (
        <div
          className={styles.dropMenu}
          style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
          data-admin-menu
        >
          <button className={styles.dropItem} type="button" onClick={() => {
            const admin = admins.find(a => a.id === menuOpen)
            if (admin) openEditAdmin(admin)
          }}>
            Editar credenciales
          </button>
          <button
            className={`${styles.dropItem} ${styles.dropItemDanger}`}
            type="button"
            disabled={admins.find(a => a.id === menuOpen)?.id === user?.id}
            onClick={() => {
              const admin = admins.find(a => a.id === menuOpen)
              if (admin) { setConfirmDeleteAdmin(admin); setMenuOpen(null) }
            }}
          >
            Eliminar
          </button>
        </div>
      )}

      {/* ── Confirm delete admin modal ── */}
      {confirmDeleteAdmin && (
        <div className={styles.modalBackdrop} onClick={() => setConfirmDeleteAdmin(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Eliminar administrador</h3>
              <button className={styles.closeBtn} type="button" onClick={() => setConfirmDeleteAdmin(null)} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            <div className={styles.modalBody}>
              ¿Estás seguro que quieres eliminar a <strong>{confirmDeleteAdmin.email}</strong>?
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} type="button" onClick={() => setConfirmDeleteAdmin(null)}>Cancelar</button>
              <button className={styles.btnConfirmDanger} type="button" onClick={handleDeleteAdmin}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit admin modal ── */}
      {editAdmin && (
        <div className={styles.modalBackdrop} onClick={() => setEditAdmin(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar credenciales</h3>
              <button className={styles.closeBtn} type="button" onClick={() => setEditAdmin(null)} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="edit-admin-email">Correo electrónico</label>
                <input
                  id="edit-admin-email"
                  className={styles.input}
                  type="email"
                  placeholder="admin@correo.com"
                  value={editAdmin.email}
                  onChange={e => setEditAdmin(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
              <PasswordField
                id="edit-admin-password"
                label="Nueva contraseña"
                value={editAdmin.password}
                onChange={e => setEditAdmin(p => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
              />
              <PasswordField
                id="edit-admin-confirm"
                label="Confirmar contraseña"
                value={editAdmin.confirm}
                onChange={e => setEditAdmin(p => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
              />
              {editError && <p className={styles.errorMsg}>{editError}</p>}
              <button className={styles.submitBtn} type="submit" disabled={editLoading}>
                {editLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
