import { useState, useEffect } from 'react'
import styles from './Settings.module.css'

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

function PasswordField({ label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.pwWrapper}>
        <input
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

/* ── Initial state ── */

const INITIAL_ADMINS = [
  { id: 1, name: 'admin' },
]

/* ── Component ── */

export default function Settings() {
  const [support, setSupport] = useState({
    email: 'soporte@distrivalto.com',
    phone: '+57 300 123 4567',
  })

  const [apiKey, setApiKey]       = useState('sk-ant-api03-placeholder')
  const [apiStatus, setApiStatus] = useState('idle') // 'ok' | 'error' | 'idle'
  const [testingApi, setTestingApi] = useState(false)

  const [admins, setAdmins]           = useState(INITIAL_ADMINS)
  const [newAdmin, setNewAdmin]       = useState({ username: '', password: '', confirm: '' })
  const [newAdminError, setNewAdminError] = useState('')

  const [menuOpen, setMenuOpen]   = useState(null)
  const [editAdmin, setEditAdmin] = useState(null)
  const [editError, setEditError] = useState('')

  const setNew = (k) => (e) => setNewAdmin(prev => ({ ...prev, [k]: e.target.value }))

  /* Close three-dot menu on outside click */
  useEffect(() => {
    if (menuOpen === null) return
    function handle(e) {
      if (!e.target.closest('[data-admin-menu]')) setMenuOpen(null)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  /* Close edit modal on Escape */
  useEffect(() => {
    if (!editAdmin) return
    function handle(e) {
      if (e.key === 'Escape') setEditAdmin(null)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [editAdmin])

  /* API verification (simulated) */
  const testApi = () => {
    setTestingApi(true)
    setTimeout(() => {
      setApiStatus(apiKey.trim().length > 10 ? 'ok' : 'error')
      setTestingApi(false)
    }, 1200)
  }

  /* Add admin */
  const handleAddAdmin = (e) => {
    e.preventDefault()
    if (!newAdmin.username.trim())              { setNewAdminError('Ingresa un nombre de usuario'); return }
    if (!newAdmin.password)                     { setNewAdminError('Ingresa una contraseña'); return }
    if (newAdmin.password !== newAdmin.confirm) { setNewAdminError('Las contraseñas no coinciden'); return }
    setAdmins(prev => [...prev, { id: Date.now(), name: newAdmin.username.trim() }])
    setNewAdmin({ username: '', password: '', confirm: '' })
    setNewAdminError('')
  }

  /* Delete admin */
  const handleDeleteAdmin = (id) => {
    setAdmins(prev => prev.filter(a => a.id !== id))
    setMenuOpen(null)
  }

  /* Open edit modal */
  const openEditAdmin = (admin) => {
    setEditAdmin({ id: admin.id, username: admin.name, password: '', confirm: '' })
    setEditError('')
    setMenuOpen(null)
  }

  /* Save edit */
  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editAdmin.username.trim()) { setEditError('Ingresa un nombre de usuario'); return }
    if (editAdmin.password && editAdmin.password !== editAdmin.confirm) { setEditError('Las contraseñas no coinciden'); return }
    setAdmins(prev => prev.map(a => a.id === editAdmin.id ? { ...a, name: editAdmin.username.trim() } : a))
    setEditAdmin(null)
    setEditError('')
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
                <label className={styles.label}>Email de soporte</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="soporte@empresa.com"
                  value={support.email}
                  onChange={e => setSupport(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Número de soporte</label>
                <input
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
                    label="Clave de API"
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
              <div className={styles.btnRow}>
                <button className={styles.saveBtn} type="button">Guardar</button>
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
              <label className={styles.label}>Nombre de usuario</label>
              <input
                className={styles.input}
                type="text"
                placeholder="nuevo_admin"
                value={newAdmin.username}
                onChange={setNew('username')}
                autoComplete="off"
              />
            </div>
            <div className={styles.twoCol}>
              <PasswordField label="Contraseña" value={newAdmin.password} onChange={setNew('password')} autoComplete="new-password" />
              <PasswordField label="Confirmar contraseña" value={newAdmin.confirm} onChange={setNew('confirm')} autoComplete="new-password" />
            </div>
            {newAdminError && <p className={styles.errorMsg}>{newAdminError}</p>}
            <button className={styles.saveBtn} type="submit">Agregar administrador</button>
          </form>

          {/* Admin list */}
          <div className={styles.adminList}>
            <h3 className={styles.subTitle}>Usuarios registrados</h3>
            {admins.map(admin => (
              <div key={admin.id} className={styles.adminRow}>
                <div className={styles.adminAvatar}>{admin.name[0].toUpperCase()}</div>
                <span className={styles.adminName}>{admin.name}</span>
                <div className={styles.menuWrap} data-admin-menu>
                  <button
                    className={styles.dotsBtn}
                    type="button"
                    data-admin-menu
                    onClick={() => setMenuOpen(menuOpen === admin.id ? null : admin.id)}
                  >
                    <DotsIcon />
                  </button>
                  {menuOpen === admin.id && (
                    <div className={styles.dropMenu} data-admin-menu>
                      <button className={styles.dropItem} type="button" onClick={() => openEditAdmin(admin)}>
                        Editar credenciales
                      </button>
                      <button
                        className={`${styles.dropItem} ${styles.dropItemDanger}`}
                        type="button"
                        onClick={() => handleDeleteAdmin(admin.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
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
                <label className={styles.label}>Nombre de usuario</label>
                <input
                  className={styles.input}
                  type="text"
                  value={editAdmin.username}
                  onChange={e => setEditAdmin(p => ({ ...p, username: e.target.value }))}
                  autoComplete="username"
                />
              </div>
              <PasswordField
                label="Nueva contraseña"
                value={editAdmin.password}
                onChange={e => setEditAdmin(p => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirmar contraseña"
                value={editAdmin.confirm}
                onChange={e => setEditAdmin(p => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
              />
              {editError && <p className={styles.errorMsg}>{editError}</p>}
              <button className={styles.submitBtn} type="submit">Guardar cambios</button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
