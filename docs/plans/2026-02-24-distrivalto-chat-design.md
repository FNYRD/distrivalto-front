# Diseño: Chat Distrivalto

**Fecha:** 2026-02-24
**Stack:** Vite + React + CSS puro
**Tipo:** Frontend standalone (sin backend, respuestas simuladas)

---

## Objetivo

Crear una página principal que simule un chat de inteligencia artificial (estilo Claude/ChatGPT) para Distrivalto, con sidebar de historial de chats y transición de pantalla de bienvenida a chat activo.

---

## Arquitectura

```
distrivalto-chat/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── ChatView.jsx
│   │   ├── WelcomeScreen.jsx
│   │   ├── MessageList.jsx
│   │   ├── Message.jsx
│   │   └── ChatInput.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── docs/plans/
├── index.html
├── package.json
└── vite.config.js
```

### Estado global (App.jsx con hooks)

```js
chats: [{ id, title, messages: [], createdAt }]
activeChatId: string | null
```

---

## Paleta de colores

| Token | Color | Uso |
|---|---|---|
| `--color-navy` | `#1B1959` | Sidebar fondo, encabezado |
| `--color-blue` | `#32A9D9` | Botones primarios, burbujas usuario |
| `--color-red` | `#BF1131` | Acento hover sutil |
| `--color-white` | `#FFFFFF` | Burbujas bot, fondos |
| `--color-bg` | `#F9FAFB` | Fondo del área de chat |

---

## Componentes

### `App.jsx`
- Maneja estado global: lista de chats y chat activo
- Funciones: `createNewChat`, `addMessage`, `selectChat`
- Renderiza `<Sidebar>` + `<ChatView>`

### `Sidebar.jsx`
- Siempre visible (no responsive/mobile)
- Muestra logo/nombre "Distrivalto" en la parte superior
- Botón "+ Nuevo chat"
- Lista de chats: título = primeras palabras del primer mensaje del usuario

### `ChatView.jsx`
- Si no hay chat activo o no hay mensajes → muestra `<WelcomeScreen>`
- Si hay mensajes → muestra `<MessageList>` + `<ChatInput>` anclado al fondo

### `WelcomeScreen.jsx`
- Centrado verticalmente en el área principal
- Mensaje: *"Bienvenido al chat de Distrivalto, ¿en qué podemos ayudar?"*
- `<ChatInput>` centrado debajo del mensaje

### `MessageList.jsx`
- Lista de `<Message>` con scroll automático al último mensaje

### `Message.jsx`
- `role: 'user'` → burbuja derecha, fondo `#32A9D9`, texto blanco
- `role: 'bot'` → burbuja izquierda, fondo blanco, borde gris
- `role: 'typing'` → animación de 3 puntos (...)

### `ChatInput.jsx`
- Textarea que crece con el contenido
- Envío con Enter (Shift+Enter = salto de línea)
- Botón de enviar con ícono

---

## Flujo de interacción

```
1. Carga → App sin chats activos → WelcomeScreen visible
2. Usuario escribe y envía → se crea nuevo chat, se agrega a sidebar
3. Transición: WelcomeScreen → ChatView con mensajes
4. Bot muestra "typing..." por 1.5s → respuesta simulada aparece
5. Chat continúa normalmente
6. "Nuevo chat" → vuelve al estado de bienvenida con nuevo chat vacío
7. Click en chat del sidebar → carga historial de ese chat
```

---

## Respuestas simuladas del bot

Banco de respuestas rotativas:
- "Gracias por tu consulta. Un agente de Distrivalto te atenderá pronto."
- "Entendido, estamos procesando tu solicitud. ¿Hay algo más en que podamos ayudarte?"
- "Hemos recibido tu mensaje. Nuestro equipo se pondrá en contacto contigo a la brevedad."
- "Claro, con gusto te ayudamos. ¿Puedes darnos más detalles sobre tu consulta?"
- "Gracias por comunicarte con Distrivalto. Estamos aquí para ayudarte."

---

## Restricciones

- Solo desktop (sin diseño responsive/mobile)
- Sin autenticación
- Sin persistencia (los chats se pierden al recargar la página)
- Sin conexión a API real
