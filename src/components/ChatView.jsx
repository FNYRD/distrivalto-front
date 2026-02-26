import MessageList from './MessageList'
import ChatInput from './ChatInput'
import WelcomeScreen from './WelcomeScreen'
import styles from './ChatView.module.css'

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="3" width="18" height="1.5" rx="0.75" fill="currentColor" />
      <rect y="8.25" width="18" height="1.5" rx="0.75" fill="currentColor" />
      <rect y="13.5" width="18" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  )
}

export default function ChatView({
  activeChat,
  onSend,
  sidebarOpen,
  onToggleSidebar,
  selectedType,
  onTypeChange,
  onOpenAuth,
}) {
  const hasMessages = activeChat?.messages?.length > 0

  return (
    <div className={styles.container}>

      <div className={styles.topbar}>
        <button
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar barra lateral' : 'Abrir barra lateral'}
        >
          <MenuIcon />
        </button>

        <div className={styles.typeSelector}>
          <button
            className={`${styles.typeBtn} ${selectedType === 'consulta' ? styles.typeBtnActive : ''}`}
            onClick={() => onTypeChange('consulta')}
          >
            Consulta
          </button>
          <button
            className={`${styles.typeBtn} ${selectedType === 'garantia' ? styles.typeBtnActive : ''}`}
            onClick={() => onTypeChange('garantia')}
          >
            Garantía
          </button>
        </div>

        <div className={styles.authBtns}>
          <button className={styles.loginTopBtn} onClick={() => onOpenAuth('login')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Iniciar sesión
          </button>
          <button className={styles.registerBtn} onClick={() => onOpenAuth('register')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Registrarse
          </button>
        </div>
      </div>

      {hasMessages ? (
        <>
          <div className={styles.header}>
            {activeChat.title}
          </div>
          <MessageList messages={activeChat.messages} />
          <div className={styles.inputArea}>
            <ChatInput onSend={onSend} />
            <p className={styles.hint}>Presiona Enter para enviar · Shift+Enter para nueva línea</p>
          </div>
        </>
      ) : (
        <WelcomeScreen onSend={onSend} />
      )}

    </div>
  )
}
