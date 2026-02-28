import { useState, useEffect, useRef } from 'react'
import styles from './Sidebar.module.css'
import logo from '../../logo.png'

export default function Sidebar({ isOpen, chats, activeChatId, onNewChat, onSelectChat, user, onChangeCreds, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const name    = user?.name ?? 'Desconocido'
  const initial = name[0].toUpperCase()

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

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
                {chat.title}
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
              onClick={() => { setMenuOpen(false); onLogout() }}
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
