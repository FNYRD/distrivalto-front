import { useState, useRef, useEffect } from 'react'
import styles from './ChatInput.module.css'

export default function ChatInput({ onSend, placeholder = '¿En qué podemos ayudarte?', centered = false }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)
  const isEmpty = !value.trim()

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function handleChange(e) {
    setValue(e.target.value)
  }

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
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          style={centered ? { textAlign: 'center' } : undefined}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={isEmpty}
          aria-label="Enviar mensaje"
        >
          <svg className={styles.sendIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      <div className={styles.attachRow}>
        <label className={styles.attachBtn}>
          <input type="file" accept="image/*,video/*" className={styles.fileInput} />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <span>Adjuntar foto o video</span>
        </label>
      </div>
    </div>
  )
}
