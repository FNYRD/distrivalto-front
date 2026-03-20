import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import styles from './Chats.module.css'
import logo from '../../../logo.png'
import { api } from '../../api'

const LIMIT = 10

/* ── Helpers ── */

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours}h`
  if (days === 1) return 'ayer'
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

/* ── Icons ── */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

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

/* ── Chat card ── */

function ChatCard({ chat, onClick, onDelete, isActive }) {
  const lastMsg = chat.messages?.[chat.messages.length - 1]
  return (
    <div
      className={`${styles.chatCard} ${isActive ? styles.chatCardActive : ''}`}
      onClick={() => onClick(chat.id)}
    >
      <div className={styles.cardTop}>
        <span className={`${styles.typeBadge} ${chat.type === 'garantia' ? styles.typeBadgeGarantia : styles.typeBadgeConsulta}`}>
          {chat.type === 'garantia' ? 'Garantía' : 'Consulta'}
        </span>
        <div className={styles.cardTopRight}>
          <span className={styles.cardDate}>{formatDate(chat.createdAt)}</span>
          <button
            className={styles.deleteBtn}
            onClick={e => { e.stopPropagation(); onDelete(chat.id) }}
            aria-label="Eliminar chat"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <p className={styles.cardTitle}>{chat.title}</p>
      <div className={styles.cardMeta}>
        <span className={styles.cardCountry}>{chat.country}</span>
        {chat.messages && (
          <span className={styles.cardMsgCount}>
            <MessageIcon />
            {chat.messages.length}
          </span>
        )}
      </div>
      {lastMsg && (
        <p className={styles.cardLastMsg}>
          <span className={styles.lastMsgRole}>{lastMsg.role === 'user' ? 'Cliente:' : 'IA:'}</span>
          {' '}{lastMsg.content}
        </p>
      )}
    </div>
  )
}

/* ── Chat detail ── */

function ChatDetail({ chat }) {
  if (!chat) {
    return (
      <div className={styles.detailEmpty}>
        <p>Selecciona un chat para ver la conversación</p>
      </div>
    )
  }

  const hasMessages = chat.messages?.length > 0

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailMeta}>
          <span className={`${styles.typeBadge} ${chat.type === 'garantia' ? styles.typeBadgeGarantia : styles.typeBadgeConsulta}`}>
            {chat.type === 'garantia' ? 'Garantía' : 'Consulta'}
          </span>
          <span className={styles.detailCountry}>{chat.country}</span>
          <span className={styles.detailDate}>
            {new Date(chat.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h3 className={styles.detailTitle}>{chat.title}</h3>
      </div>
      <div className={styles.messagesWrapper}>
        <img src={logo} className={styles.watermark} alt="" aria-hidden="true" />
        {hasMessages ? (
          <div className={styles.messages}>
            {chat.messages.map((msg, i) => (
              <div key={msg.id ?? i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgBot}`}>
                <span className={styles.msgRole}>{msg.role === 'user' ? 'Cliente' : 'IA'}</span>
                <p className={styles.msgContent}>{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.detailEmpty}>
            <p>Cargando conversación...</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function Chats() {
  const [chats, setChats]         = useState([])
  const [total, setTotal]         = useState(0)
  const [offset, setOffset]       = useState(0)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeId, setActiveId]   = useState(null)
  const [query, setQuery]         = useState('')

  const chatsRef = useRef([])
  useEffect(() => { chatsRef.current = chats }, [chats])
  const offsetRef = useRef(0)
  useEffect(() => { offsetRef.current = offset }, [offset])
  const loadingMoreRef = useRef(false)

  // Carga inicial al montar — primeras 10 tarjetas
  useEffect(() => {
    api.getAdminChats(0, LIMIT)
      .then(data => {
        setChats(data.chats)
        setTotal(data.total)
        setOffset(LIMIT)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Carga on-demand al clicar "ver más" — acumula las siguientes 10
  const handleLoadMore = useCallback(() => {
    if (loadingMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    api.getAdminChats(offsetRef.current, LIMIT)
      .then(data => {
        setChats(prev => [...prev, ...data.chats])
        setTotal(data.total)
        offsetRef.current = offsetRef.current + LIMIT
        setOffset(offsetRef.current)
      })
      .catch(() => {})
      .finally(() => {
        loadingMoreRef.current = false
        setLoadingMore(false)
      })
  }, [])

  // Carga on-demand al clicar una tarjeta — solo si no tiene mensajes ya
  const handleSelect = useCallback((id) => {
    setActiveId(id)
    const chat = chatsRef.current.find(c => c.id === id)
    if (!chat?.messages) {
      api.getAdminChat(id)
        .then(fullChat => setChats(prev => prev.map(c => c.id === id ? fullChat : c)))
        .catch(() => {})
    }
  }, [])

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const handleDelete = useCallback((id) => {
    setConfirmDeleteId(id)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    api.deleteAdminChat(id).catch(() => {})
    setChats(prev => prev.filter(c => c.id !== id))
    setTotal(prev => prev - 1)
    setActiveId(prev => prev === id ? null : prev)
  }, [confirmDeleteId])

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chats
    return chats.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.messages?.some(m => m.content.toLowerCase().includes(q))
    )
  }, [query, chats])

  const hasMore = chats.length < total
  const activeChat = chats.find(c => c.id === activeId) ?? null

  return (
    <div className={styles.container}>

      {/* Left panel */}
      <div className={styles.listPanel}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por palabra, país o tipo..."
            value={query}
            onChange={handleQueryChange}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')}>×</button>
          )}
        </div>

        <p className={styles.listCount}>
          {filtered.length} {filtered.length === 1 ? 'conversación' : 'conversaciones'}
          {total > chats.length && ` de ${total}`}
        </p>

        <div className={styles.list}>
          {loading ? (
            <p className={styles.emptyMsg}>Cargando conversaciones...</p>
          ) : filtered.length === 0 ? (
            <p className={styles.emptyMsg}>No se encontraron resultados</p>
          ) : (
            <>
              {filtered.map(chat => (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  onClick={handleSelect}
                  onDelete={handleDelete}
                  isActive={chat.id === activeId}
                />
              ))}
              {!query && hasMore && (
                <button
                  className={styles.loadMore}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Cargando...' : 'ver más conversaciones'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.detailPanel}>
        <ChatDetail chat={activeChat} />
      </div>

      {confirmDeleteId && (
        <div className={styles.modalBackdrop} onClick={() => setConfirmDeleteId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Eliminar conversación</h3>
              <button className={styles.closeBtn} type="button" onClick={() => setConfirmDeleteId(null)} aria-label="Cerrar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.</p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} type="button" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button className={styles.btnConfirmDanger} type="button" onClick={handleConfirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
