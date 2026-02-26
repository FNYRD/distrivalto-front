import styles from './Sidebar.module.css'
import logo from '../../logo.png'

export default function Sidebar({ isOpen, chats, activeChatId, onNewChat, onSelectChat }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={logo} alt="Distrivalto" className={styles.logoMark} />
          <span className={styles.logoText}>Distrivalto</span>
        </div>
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

      <div className={styles.footer}>
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>D</div>
          <span className={styles.userName}>Desconocido</span>
        </div>
      </div>
    </aside>
  )
}
