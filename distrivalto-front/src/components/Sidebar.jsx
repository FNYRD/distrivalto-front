import { useState, useEffect, useRef } from 'react'
import styles from './Sidebar.module.css'
import logo from '../../logo.png'
import { api } from '../api'

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

export default function Sidebar({ isOpen, chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, user, onChangeCreds, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const menuOpenRef = useRef(false)
  useEffect(() => { menuOpenRef.current = menuOpen }, [menuOpen])

  const name    = user?.name ?? 'Desconocido'
  const initial = (name[0] || 'U').toUpperCase()

  useEffect(() => {
    function handleClick(e) {
      if (!menuOpenRef.current) return
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <aside className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
      <div className={styles.header}>
        <a href="https://www.distrivalto.com/" target="_blank" rel="noopener noreferrer" className={styles.logo}>
          <img src={logo} alt="Distrivalto" className={styles.logoMark} />
          <span className={styles.logoText}>Distrivalto</span>
        </a>
        <button className={styles.newChatBtn} onClick={onNewChat}>
          <span>+</span>
          <span>Nuevo chat</span>
        </button>
      </div>

      <div className={styles.chatList}>
        {chats.length > 0 ? (
          <>
            <p className={styles.sectionLabel}>Recientes</p>
            {chats.map(chat => (
              <button
                key={chat.id}
                className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <span className={styles.chatTitle}>{chat.title}</span>
                <span
                  role="button"
                  aria-label="Eliminar chat"
                  className={styles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id) }}
                >
                  <TrashIcon />
                </span>
              </button>
            ))}
          </>
        ) : (
          <p className={styles.emptyState}>No hay conversaciones aún</p>
        )}
      </div>

      <div className={styles.footer} ref={menuRef}>
        {menuOpen && user?.isClient && (
          <div className={styles.userMenu}>
            <button
              className={styles.userMenuItem}
              onClick={() => { setMenuOpen(false); onChangeCreds() }}
            >
              Cambiar credenciales
            </button>
            <button
              className={styles.userMenuItem}
              onClick={() => { setMenuOpen(false); api.logout().catch(() => {}); onLogout() }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
        <div
          className={`${styles.userSection} ${user?.isClient ? styles.userSectionClickable : ''}`}
          onClick={() => { if (user?.isClient) setMenuOpen(p => !p) }}
        >
          <div className={styles.userAvatar}>{initial}</div>
          <span className={styles.userName}>{name}</span>
        </div>
      </div>
    </aside>
  )
}
