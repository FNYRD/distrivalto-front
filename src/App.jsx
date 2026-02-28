import { useState, useCallback } from 'react'
import styles from './App.module.css'
import Sidebar from './components/Sidebar'
import ChatView from './components/ChatView'
import AuthModal from './components/AuthModal'
import AdminPanel from './components/AdminPanel'

const BOT_RESPONSES = [
  'Gracias por tu consulta. Un agente de Distrivalto te atenderá pronto.',
  'Entendido, estamos procesando tu solicitud. ¿Hay algo más en que podamos ayudarte?',
  'Hemos recibido tu mensaje. Nuestro equipo se pondrá en contacto contigo a la brevedad.',
  'Claro, con gusto te ayudamos. ¿Puedes darnos más detalles sobre tu consulta?',
  'Gracias por comunicarte con Distrivalto. Estamos aquí para ayudarte.',
]

let nextId = 1

function generateId(prefix = 'msg') {
  return `${prefix}-${nextId++}`
}

function getBotResponse() {
  return BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)]
}

function createChat(title, type) {
  return {
    id: generateId('chat'),
    title: title.length > 40 ? title.slice(0, 40) + '...' : title,
    type,
    messages: [],
    createdAt: new Date(),
  }
}

function appendBotResponse(chats, chatId) {
  return chats.map(c => {
    if (c.id !== chatId) return c
    return {
      ...c,
      messages: [
        ...c.messages.filter(m => m.role !== 'typing'),
        { id: generateId(), role: 'bot', content: getBotResponse() },
      ],
    }
  })
}

export default function App() {
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedType, setSelectedType] = useState('consulta')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)

  const activeChat = chats.find(c => c.id === activeChatId) ?? null

  const handleNewChat = useCallback(() => {
    setActiveChatId(null)
  }, [])

  const handleSelectChat = useCallback((id) => {
    setActiveChatId(id)
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

  const handleLogin = useCallback((userData) => {
    setUser(userData)
    setAuthOpen(false)
  }, [])

  const handleLogout = useCallback(() => {
    setUser(null)
  }, [])

  const handleTypeChange = useCallback((type) => {
    setSelectedType(type)
  }, [])

  const scheduleBotResponse = useCallback((chatId) => {
    setTimeout(() => {
      setChats(prev => appendBotResponse(prev, chatId))
    }, 1500)
  }, [])

  const handleSendMessage = useCallback((text) => {
    const userMessage = { id: generateId(), role: 'user', content: text }
    const typingMessage = { id: generateId(), role: 'typing', content: '' }

    if (!activeChatId) {
      const newChat = createChat(text, selectedType)
      setChats(prev => [...prev, { ...newChat, messages: [userMessage, typingMessage] }])
      setActiveChatId(newChat.id)
      setSidebarOpen(true)
      scheduleBotResponse(newChat.id)
    } else {
      setChats(prev => prev.map(c => {
        if (c.id !== activeChatId) return c
        return { ...c, messages: [...c.messages, userMessage, typingMessage] }
      }))
      scheduleBotResponse(activeChatId)
    }
  }, [activeChatId, selectedType, scheduleBotResponse])

  if (user?.isAdmin) {
    return <AdminPanel user={user} onLogout={handleLogout} />
  }

  return (
    <div className={styles.app}>
      <Sidebar
        isOpen={sidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
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
        isOpen={authOpen}
        initialMode={authMode}
        onClose={handleCloseAuth}
        onLogin={handleLogin}
      />
    </div>
  )
}
