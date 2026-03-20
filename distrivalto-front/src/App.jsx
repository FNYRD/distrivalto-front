import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { api } from './api'
import styles from './App.module.css'
import Sidebar from './components/Sidebar'
import ChatView from './components/ChatView'
import AuthModal from './components/AuthModal'
import AdminPanel from './components/AdminPanel'

let nextId = 1

function generateId(prefix = 'msg') {
  return `${prefix}-${nextId++}`
}

// Reintenta una función async hasta maxAttempts veces antes de lanzar error
async function withRetry(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxAttempts) throw err
      await new Promise(r => setTimeout(r, delayMs * attempt))
    }
  }
}

export default function App() {
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedType, setSelectedType] = useState('consulta')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])

  // Refs para leer valores actuales dentro de callbacks asíncronos
  const activeChatIdRef = useRef(activeChatId)
  useEffect(() => { activeChatIdRef.current = activeChatId }, [activeChatId])
  const chatsRef = useRef(chats)
  useEffect(() => { chatsRef.current = chats }, [chats])

  useEffect(() => {
    api.getSession()
      .then(data => {
        setUser(data.user)
        setChats(data.chats)
      })
      .catch(() => { })
  }, [])

  const activeChat = useMemo(
    () => chats.find(c => c.id === activeChatId) ?? null,
    [chats, activeChatId]
  )

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((chatId, chatTitle) => {
    const id = generateId('notif')
    setNotifications(prev => [...prev, { id, chatId, chatTitle }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const handleNewChat = useCallback(() => {
    setActiveChatId(null)
  }, [])

  const handleSelectChat = useCallback((id) => {
    setActiveChatId(id)
    setNotifications(prev => prev.filter(n => n.chatId !== id))
    const chat = chatsRef.current.find(c => c.id === id)
    if (!chat?.messages?.length) {
      api.getChat(id)
        .then(fullChat => {
          setChats(prev => prev.map(c => c.id === id ? fullChat : c))
        })
        .catch(() => {})
    }
  }, [])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const handleOpenAuth = useCallback((mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }, [])

  const handleOpenChangeCreds = useCallback(() => {
    setAuthMode('change-creds')
    setAuthOpen(true)
  }, [])

  const handleCloseAuth = useCallback(() => {
    setAuthOpen(false)
  }, [])

  const handleLogin = useCallback((data) => {
    setUser(data.user)
    setChats(data.chats)
    setAuthOpen(false)
  }, [])

  const handleUpdateUser = useCallback((userData) => {
    setUser(userData)
    setAuthOpen(false)
  }, [])

  const handleDeleteChat = useCallback((id) => {
    api.deleteChat(id).catch(() => {})
    setChats(prev => prev.filter(c => c.id !== id))
    setActiveChatId(prev => prev === id ? null : prev)
  }, [])

  const handleLogout = useCallback(() => {
    api.logout().catch(() => {})
    setUser(null)
    setChats([])
    setActiveChatId(null)
  }, [])

  const handleTypeChange = useCallback((type) => {
    setSelectedType(type)
  }, [])

  const handleSendMessage = useCallback(async (text, file = null) => {
    let imageDataUrl = null
    if (file) {
      imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    }

    const userMessage = { id: generateId(), role: 'user', content: text, image: imageDataUrl }
    const typingMessage = { id: generateId(), role: 'typing', content: '' }

    const apiPayload = (base) => imageDataUrl ? { ...base, image: imageDataUrl } : base

    if (!activeChatId) {
      const tempId = generateId('chat')
      const tempTitle = text.length > 40 ? text.slice(0, 40) + '...' : text
      setChats(prev => [...prev, {
        id: tempId,
        title: tempTitle,
        type: selectedType,
        messages: [userMessage, typingMessage],
        createdAt: new Date(),
      }])
      setActiveChatId(tempId)
      setSidebarOpen(true)

      try {
        const newChat = await withRetry(() => api.createChat(apiPayload({ type: selectedType, message: text })))
        setChats(prev => prev.map(c => c.id === tempId ? {
          ...newChat,
          messages: newChat.messages.map((m, i) => i === 0 ? { ...m, image: imageDataUrl } : m),
        } : c))
        setActiveChatId(prev => prev === tempId ? newChat.id : prev)
        if (activeChatIdRef.current !== tempId) {
          addNotification(newChat.id, newChat.title)
        }
      } catch {
        setChats(prev => prev.map(c => {
          if (c.id !== tempId) return c
          return {
            ...c,
            messages: [
              ...c.messages.filter(m => m.role !== 'typing'),
              { id: generateId(), role: 'bot', content: 'No se pudo obtener respuesta. Por favor intenta de nuevo.' },
            ],
          }
        }))
      }
    } else {
      const currentChatId = activeChatId
      const chatTitle = chatsRef.current.find(c => c.id === currentChatId)?.title ?? ''

      setChats(prev => prev.map(c => {
        if (c.id !== currentChatId) return c
        return { ...c, messages: [...c.messages, userMessage, typingMessage] }
      }))

      try {
        const botMsg = await withRetry(() => api.sendMessage(currentChatId, apiPayload({ message: text })))
        setChats(prev => prev.map(c => {
          if (c.id !== currentChatId) return c
          return {
            ...c,
            messages: [
              ...c.messages.filter(m => m.role !== 'typing'),
              { id: generateId(), role: 'bot', content: botMsg.content },
            ],
          }
        }))
        if (activeChatIdRef.current !== currentChatId) {
          addNotification(currentChatId, chatTitle)
        }
      } catch {
        setChats(prev => prev.map(c => {
          if (c.id !== currentChatId) return c
          return {
            ...c,
            messages: [
              ...c.messages.filter(m => m.role !== 'typing'),
              { id: generateId(), role: 'bot', content: 'No se pudo obtener respuesta. Por favor intenta de nuevo.' },
            ],
          }
        }))
      }
    }
  }, [activeChatId, selectedType, addNotification])

  if (user?.isAdmin) {
    return <AdminPanel user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
  }

  return (
    <div className={styles.app}>
      {sidebarOpen && (
        <div className={styles.sidebarBackdrop} onClick={handleToggleSidebar} />
      )}
      <Sidebar
        isOpen={sidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        user={user}
        onChangeCreds={handleOpenChangeCreds}
        onLogout={handleLogout}
      />
      <ChatView
        activeChat={activeChat}
        onSend={handleSendMessage}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        onOpenAuth={handleOpenAuth}
        user={user}
      />
      <AuthModal
        key={`${authMode}-${authOpen}`}
        isOpen={authOpen}
        initialMode={authMode}
        onClose={handleCloseAuth}
        onLogin={handleLogin}
        onUpdateUser={handleUpdateUser}
        user={user}
      />

      {notifications.length > 0 && (
        <div className={styles.notifications}>
          {notifications.map(n => (
            <div key={n.id} className={styles.notification}>
              <span>La IA respondió en <strong>{n.chatTitle}</strong></span>
              <button
                className={styles.notifClose}
                onClick={() => dismissNotification(n.id)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
