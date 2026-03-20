# Distrivalto Chat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Crear una interfaz de chat estilo ChatGPT/Claude para Distrivalto con sidebar de historial, pantalla de bienvenida y respuestas simuladas del bot.

**Architecture:** App.jsx maneja el estado global (lista de chats y chat activo) con React hooks. El flujo cambia de WelcomeScreen a ChatView al enviar el primer mensaje. Las respuestas del bot son simuladas con un delay de 1.5s.

**Tech Stack:** Vite 5, React 18, CSS puro con variables CSS, sin dependencias adicionales de UI.

---

## Task 1: Inicializar el proyecto Vite + React

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`

**Step 1: Crear el proyecto con Vite**

```bash
cd /Users/jesusrosales/distrivalto-chat
npm create vite@latest . -- --template react
```

Cuando pregunte si desea sobreescribir la carpeta, seleccionar "Ignore files and continue".

**Step 2: Instalar dependencias**

```bash
npm install
```

**Step 3: Limpiar archivos innecesarios del template**

Eliminar el contenido por defecto:
```bash
rm -f src/assets/react.svg public/vite.svg src/App.css src/index.css
```

**Step 4: Verificar que el proyecto corre**

```bash
npm run dev
```

Expected: Servidor corriendo en `http://localhost:5173`

**Step 5: Commit**

```bash
git add .
git commit -m "feat: initialize vite react project"
```

---

## Task 2: Setup de estilos globales y variables CSS

**Files:**
- Create: `src/styles/globals.css`
- Modify: `src/main.jsx`

**Step 1: Crear el archivo de estilos globales**

Crear `src/styles/globals.css` con el siguiente contenido:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-navy: #1B1959;
  --color-blue: #32A9D9;
  --color-red: #BF1131;
  --color-white: #FFFFFF;
  --color-bg: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-400: #9CA3AF;
  --color-gray-600: #4B5563;
  --color-gray-800: #1F2937;

  --sidebar-width: 260px;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html, body, #root {
  height: 100%;
  width: 100%;
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-gray-800);
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

textarea {
  font-family: inherit;
  resize: none;
}
```

**Step 2: Importar los estilos en main.jsx**

Reemplazar el contenido de `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 3: Verificar que no hay errores de CSS**

```bash
npm run dev
```

Expected: página en blanco limpia sin errores en consola.

**Step 4: Commit**

```bash
git add src/styles/globals.css src/main.jsx
git commit -m "feat: add global styles and CSS variables"
```

---

## Task 3: Crear App.jsx con estado global

**Files:**
- Create: `src/App.jsx`, `src/App.module.css`

**Step 1: Crear App.module.css**

```css
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
```

**Step 2: Crear App.jsx**

```jsx
import { useState, useCallback } from 'react'
import styles from './App.module.css'

const BOT_RESPONSES = [
  'Gracias por tu consulta. Un agente de Distrivalto te atenderá pronto.',
  'Entendido, estamos procesando tu solicitud. ¿Hay algo más en que podamos ayudarte?',
  'Hemos recibido tu mensaje. Nuestro equipo se pondrá en contacto contigo a la brevedad.',
  'Claro, con gusto te ayudamos. ¿Puedes darnos más detalles sobre tu consulta?',
  'Gracias por comunicarte con Distrivalto. Estamos aquí para ayudarte.',
]

let chatCounter = 0

function getBotResponse() {
  const idx = Math.floor(Math.random() * BOT_RESPONSES.length)
  return BOT_RESPONSES[idx]
}

function createChat(firstMessage) {
  chatCounter += 1
  const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '')
  return {
    id: `chat-${chatCounter}`,
    title,
    messages: [],
    createdAt: new Date(),
  }
}

export default function App() {
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)

  const activeChat = chats.find(c => c.id === activeChatId) ?? null

  const handleNewChat = useCallback(() => {
    setActiveChatId(null)
  }, [])

  const handleSelectChat = useCallback((id) => {
    setActiveChatId(id)
  }, [])

  const handleSendMessage = useCallback((text) => {
    const userMessage = { id: Date.now(), role: 'user', content: text }

    setChats(prev => {
      if (!activeChatId) {
        // Primer mensaje: crear nuevo chat
        const newChat = createChat(text)
        newChat.messages = [userMessage, { id: Date.now() + 1, role: 'typing', content: '' }]
        setActiveChatId(newChat.id)
        // Simular respuesta del bot
        setTimeout(() => {
          setChats(p => p.map(c =>
            c.id === newChat.id
              ? {
                  ...c,
                  messages: [
                    ...c.messages.filter(m => m.role !== 'typing'),
                    { id: Date.now(), role: 'bot', content: getBotResponse() }
                  ]
                }
              : c
          ))
        }, 1500)
        return [...prev, newChat]
      }

      // Chat existente: agregar mensaje
      return prev.map(c => {
        if (c.id !== activeChatId) return c
        const updated = {
          ...c,
          messages: [...c.messages, userMessage, { id: Date.now() + 1, role: 'typing', content: '' }]
        }
        setTimeout(() => {
          setChats(p => p.map(chat =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages.filter(m => m.role !== 'typing'),
                    { id: Date.now(), role: 'bot', content: getBotResponse() }
                  ]
                }
              : chat
          ))
        }, 1500)
        return updated
      })
    })
  }, [activeChatId])

  // Importar Sidebar y ChatView aquí (se agregarán en tasks posteriores)
  return (
    <div className={styles.app}>
      <p>App placeholder</p>
    </div>
  )
}
```

**Step 3: Verificar que corre sin errores**

```bash
npm run dev
```

Expected: "App placeholder" visible, sin errores en consola.

**Step 4: Commit**

```bash
git add src/App.jsx src/App.module.css
git commit -m "feat: add App with global state management"
```

---

## Task 4: Crear el componente Sidebar

**Files:**
- Create: `src/components/Sidebar.jsx`, `src/components/Sidebar.module.css`

**Step 1: Crear Sidebar.module.css**

```css
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background-color: var(--color-navy);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  color: var(--color-white);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.newChatBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 12px;
  padding: 10px 12px;
  background-color: var(--color-blue);
  color: var(--color-white);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s ease;
}

.newChatBtn:hover {
  background-color: #2a96c3;
}

.chatList {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chatList::-webkit-scrollbar {
  width: 4px;
}

.chatList::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

.chatItem {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.15s ease, color 0.15s ease;
  margin-bottom: 2px;
}

.chatItem:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--color-white);
}

.chatItem.active {
  background-color: rgba(50, 169, 217, 0.2);
  color: var(--color-white);
}

.emptyState {
  padding: 16px 12px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
  text-align: center;
}
```

**Step 2: Crear Sidebar.jsx**

```jsx
import styles from './Sidebar.module.css'

export default function Sidebar({ chats, activeChatId, onNewChat, onSelectChat }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>Distrivalto</div>
        <button className={styles.newChatBtn} onClick={onNewChat}>
          <span>+</span>
          <span>Nuevo chat</span>
        </button>
      </div>

      <div className={styles.chatList}>
        {chats.length === 0 && (
          <p className={styles.emptyState}>No hay conversaciones aún</p>
        )}
        {chats.map(chat => (
          <button
            key={chat.id}
            className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title}
          </button>
        ))}
      </div>
    </aside>
  )
}
```

**Step 3: Integrar Sidebar en App.jsx**

Agregar el import al inicio de App.jsx:
```jsx
import Sidebar from './components/Sidebar'
```

Reemplazar el return de App.jsx:
```jsx
return (
  <div className={styles.app}>
    <Sidebar
      chats={chats}
      activeChatId={activeChatId}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
    />
    <p>ChatView placeholder</p>
  </div>
)
```

**Step 4: Verificar visualmente**

```bash
npm run dev
```

Expected: Sidebar azul marino en la izquierda con "Distrivalto", botón "+ Nuevo chat" y mensaje de lista vacía.

**Step 5: Commit**

```bash
git add src/components/Sidebar.jsx src/components/Sidebar.module.css src/App.jsx
git commit -m "feat: add Sidebar component with chat list"
```

---

## Task 5: Crear el componente ChatInput

**Files:**
- Create: `src/components/ChatInput.jsx`, `src/components/ChatInput.module.css`

**Step 1: Crear ChatInput.module.css**

```css
.wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.textarea {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-gray-800);
  background: transparent;
  max-height: 160px;
  overflow-y: auto;
}

.textarea::placeholder {
  color: var(--color-gray-400);
}

.sendBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--color-blue);
  color: var(--color-white);
  flex-shrink: 0;
  transition: background-color 0.15s ease;
}

.sendBtn:hover:not(:disabled) {
  background-color: #2a96c3;
}

.sendBtn:disabled {
  background-color: var(--color-gray-200);
  color: var(--color-gray-400);
  cursor: not-allowed;
}

.sendIcon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
```

**Step 2: Crear ChatInput.jsx**

```jsx
import { useState, useRef, useEffect } from 'react'
import styles from './ChatInput.module.css'

export default function ChatInput({ onSend, placeholder = '¿En qué podemos ayudarte?' }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
      />
      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={!value.trim()}
        aria-label="Enviar mensaje"
      >
        <svg className={styles.sendIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  )
}
```

**Step 3: Verificar importando temporalmente en App.jsx**

Agregar import temporal para validar que no hay errores:
```jsx
import ChatInput from './components/ChatInput'
```

Agregar debajo del Sidebar en el return:
```jsx
<ChatInput onSend={(text) => console.log('send:', text)} />
```

```bash
npm run dev
```

Expected: Input visible, se puede escribir y el botón se activa. Enter envía.

**Step 4: Revertir el import temporal de App.jsx** (se integrará correctamente en Task 8).

**Step 5: Commit**

```bash
git add src/components/ChatInput.jsx src/components/ChatInput.module.css
git commit -m "feat: add ChatInput component with auto-resize"
```

---

## Task 6: Crear el componente WelcomeScreen

**Files:**
- Create: `src/components/WelcomeScreen.jsx`, `src/components/WelcomeScreen.module.css`

**Step 1: Crear WelcomeScreen.module.css**

```css
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background-color: var(--color-bg);
}

.title {
  font-size: 26px;
  font-weight: 600;
  color: var(--color-navy);
  text-align: center;
  max-width: 500px;
  line-height: 1.4;
  margin-bottom: 32px;
}

.title span {
  color: var(--color-blue);
}

.inputWrapper {
  width: 100%;
  max-width: 640px;
}
```

**Step 2: Crear WelcomeScreen.jsx**

```jsx
import ChatInput from './ChatInput'
import styles from './WelcomeScreen.module.css'

export default function WelcomeScreen({ onSend }) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Bienvenido al chat de <span>Distrivalto</span>,<br />
        ¿en qué podemos ayudar?
      </h1>
      <div className={styles.inputWrapper}>
        <ChatInput onSend={onSend} placeholder="Escribe tu consulta aquí..." />
      </div>
    </div>
  )
}
```

**Step 3: Verificar visualmente**

Agregar import temporal en App.jsx:
```jsx
import WelcomeScreen from './components/WelcomeScreen'
```
Y en el return reemplazar el placeholder:
```jsx
<WelcomeScreen onSend={(t) => console.log(t)} />
```

```bash
npm run dev
```

Expected: Pantalla de bienvenida centrada con título en azul marino/azul y el input abajo.

**Step 4: Revertir cambios temporales en App.jsx.**

**Step 5: Commit**

```bash
git add src/components/WelcomeScreen.jsx src/components/WelcomeScreen.module.css
git commit -m "feat: add WelcomeScreen component"
```

---

## Task 7: Crear los componentes Message y MessageList

**Files:**
- Create: `src/components/Message.jsx`, `src/components/Message.module.css`
- Create: `src/components/MessageList.jsx`, `src/components/MessageList.module.css`

**Step 1: Crear Message.module.css**

```css
.row {
  display: flex;
  margin-bottom: 16px;
}

.row.user {
  justify-content: flex-end;
}

.row.bot,
.row.typing {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}

.row.user .bubble {
  background-color: var(--color-blue);
  color: var(--color-white);
  border-bottom-right-radius: 4px;
}

.row.bot .bubble {
  background-color: var(--color-white);
  color: var(--color-gray-800);
  border: 1px solid var(--color-gray-200);
  border-bottom-left-radius: 4px;
}

.row.typing .bubble {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-bottom-left-radius: 4px;
  padding: 14px 20px;
}

.typingDots {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 16px;
}

.typingDots span {
  width: 7px;
  height: 7px;
  background-color: var(--color-gray-400);
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}

.typingDots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typingDots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
```

**Step 2: Crear Message.jsx**

```jsx
import styles from './Message.module.css'

export default function Message({ message }) {
  const { role, content } = message

  if (role === 'typing') {
    return (
      <div className={`${styles.row} ${styles.typing}`}>
        <div className={styles.bubble}>
          <div className={styles.typingDots}>
            <span /><span /><span />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.row} ${styles[role]}`}>
      <div className={styles.bubble}>{content}</div>
    </div>
  )
}
```

**Step 3: Crear MessageList.module.css**

```css
.list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
}

.list::-webkit-scrollbar {
  width: 6px;
}

.list::-webkit-scrollbar-thumb {
  background: var(--color-gray-200);
  border-radius: 4px;
}
```

**Step 4: Crear MessageList.jsx**

```jsx
import { useEffect, useRef } from 'react'
import Message from './Message'
import styles from './MessageList.module.css'

export default function MessageList({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.list}>
      {messages.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
```

**Step 5: Verificar sin errores**

```bash
npm run dev
```

Expected: Sin errores en consola (los componentes aún no están integrados en el árbol visible).

**Step 6: Commit**

```bash
git add src/components/Message.jsx src/components/Message.module.css src/components/MessageList.jsx src/components/MessageList.module.css
git commit -m "feat: add Message and MessageList components with typing animation"
```

---

## Task 8: Crear ChatView e integrar todo en App.jsx

**Files:**
- Create: `src/components/ChatView.jsx`, `src/components/ChatView.module.css`
- Modify: `src/App.jsx`

**Step 1: Crear ChatView.module.css**

```css
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg);
}

.header {
  padding: 16px 40px;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-gray-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inputArea {
  padding: 16px 40px 24px;
  background-color: var(--color-bg);
}

.hint {
  text-align: center;
  font-size: 11px;
  color: var(--color-gray-400);
  margin-top: 8px;
}
```

**Step 2: Crear ChatView.jsx**

```jsx
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import WelcomeScreen from './WelcomeScreen'
import styles from './ChatView.module.css'

export default function ChatView({ activeChat, onSend }) {
  const hasMessages = activeChat && activeChat.messages.length > 0

  if (!hasMessages) {
    return (
      <div className={styles.container}>
        <WelcomeScreen onSend={onSend} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {activeChat.title}
      </div>
      <MessageList messages={activeChat.messages} />
      <div className={styles.inputArea}>
        <ChatInput onSend={onSend} />
        <p className={styles.hint}>Presiona Enter para enviar · Shift+Enter para nueva línea</p>
      </div>
    </div>
  )
}
```

**Step 3: Actualizar App.jsx — reemplazar el return completo**

Actualizar los imports en App.jsx:
```jsx
import { useState, useCallback } from 'react'
import styles from './App.module.css'
import Sidebar from './components/Sidebar'
import ChatView from './components/ChatView'
```

Reemplazar el return de App.jsx:
```jsx
return (
  <div className={styles.app}>
    <Sidebar
      chats={chats}
      activeChatId={activeChatId}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
    />
    <ChatView
      activeChat={activeChat}
      onSend={handleSendMessage}
    />
  </div>
)
```

**Step 4: Verificar el flujo completo**

```bash
npm run dev
```

Probar:
- [ ] La pantalla de bienvenida aparece al cargar
- [ ] Al escribir y enviar un mensaje, se crea un chat en el sidebar
- [ ] El "typing..." animado aparece por ~1.5s
- [ ] La respuesta del bot aparece después del delay
- [ ] El botón "Nuevo chat" vuelve a la bienvenida
- [ ] Hacer click en un chat del sidebar carga su historial

**Step 5: Commit**

```bash
git add src/components/ChatView.jsx src/components/ChatView.module.css src/App.jsx
git commit -m "feat: integrate ChatView and complete chat flow"
```

---

## Task 9: Pulir detalles visuales finales

**Files:**
- Modify: `src/components/WelcomeScreen.module.css`
- Modify: `src/components/Sidebar.module.css`

**Step 1: Agregar un separador de fecha en el sidebar**

Agregar en `Sidebar.module.css`:
```css
.sectionLabel {
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.35);
}
```

Agregar en `Sidebar.jsx` dentro del `.chatList`, encima del map:
```jsx
{chats.length > 0 && (
  <p className={styles.sectionLabel}>Recientes</p>
)}
```

**Step 2: Agregar un subtítulo en WelcomeScreen**

En `WelcomeScreen.module.css` agregar:
```css
.subtitle {
  font-size: 14px;
  color: var(--color-gray-400);
  margin-top: -20px;
  margin-bottom: 32px;
}
```

En `WelcomeScreen.jsx` agregar debajo del `<h1>`:
```jsx
<p className={styles.subtitle}>
  Escribe tu consulta y un agente te responderá a la brevedad.
</p>
```

**Step 3: Verificar visualmente**

```bash
npm run dev
```

Expected: Sidebar con label "Recientes", subtítulo descriptivo en la pantalla de bienvenida.

**Step 4: Build final para verificar que no hay errores de producción**

```bash
npm run build
```

Expected: Build exitoso sin warnings críticos.

**Step 5: Commit final**

```bash
git add -A
git commit -m "feat: polish UI details and verify production build"
```

---

## Resultado esperado

Al finalizar todos los tasks, la aplicación debe:

1. Mostrar la pantalla de bienvenida con el mensaje de Distrivalto al cargar
2. Al enviar un mensaje, crear un chat en el sidebar y mostrar la conversación
3. El bot responde con animación de typing y luego con una respuesta simulada
4. Se puede navegar entre chats desde el sidebar
5. El botón "Nuevo chat" vuelve a la pantalla de bienvenida
6. El diseño usa los colores corporativos: `#1B1959`, `#32A9D9`, `#BF1131` y blanco
