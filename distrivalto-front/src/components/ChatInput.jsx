import { useState, useRef, useEffect } from 'react'
import styles from './ChatInput.module.css'

export default function ChatInput({ onSend, placeholder = '¿En qué podemos ayudarte?', centered = false }) {
  const [value, setValue] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const isEmpty = !value.trim() && !file

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function handleChange(e) {
    setValue(e.target.value)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    e.target.value = ''
  }

  function handleRemoveFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
  }

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed && !file) return
    onSend(trimmed, file ?? null)
    setValue('')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
  }

  const isImage = file?.type?.startsWith('image/')

  return (
    <div className={styles.wrapper}>
      {previewUrl && (
        <div className={styles.previewRow}>
          {isImage ? (
            <img src={previewUrl} className={styles.previewImg} alt="Vista previa" />
          ) : (
            <div className={styles.previewFile}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className={styles.previewFileName}>{file.name}</span>
            </div>
          )}
          <button className={styles.previewRemove} onClick={handleRemoveFile} aria-label="Quitar archivo">×</button>
        </div>
      )}

      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          id="chat-input"
          aria-label="Escribe tu mensaje"
          className={`${styles.textarea}${centered ? ` ${styles.textareaCentered}` : ''}`}
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
          <input
            ref={fileInputRef}
            type="file"
            name="attachment"
            accept="image/*,video/*"
            className={styles.fileInput}
            aria-label="Adjuntar foto o video"
            onChange={handleFileChange}
          />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <span>Adjuntar foto o video</span>
        </label>
      </div>
    </div>
  )
}
