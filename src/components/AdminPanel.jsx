import { useState } from 'react'
import styles from './AdminPanel.module.css'
import Dashboard from './admin/Dashboard'
import logo from '../../logo.png'

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

const PAGES = [
  { id: 'dashboard', label: 'Dashboard' },
]

export default function AdminPanel({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')

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
                onClick={() => setActivePage(page.id)}
              >
                {page.label}
              </button>
            ))}
          </div>
        </nav>

        <div className={styles.headerRight}>
          <span className={styles.userName}>{user.name}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {activePage === 'dashboard' && <Dashboard />}
      </main>
    </div>
  )
}
