import { useState, useEffect } from 'react'
import ChatInput from './ChatInput'
import styles from './WelcomeScreen.module.css'
import logo from '../../logo.png'

const LINE1_PREFIX = 'Bienvenido al chat de '
const LINE1_BRAND  = 'Distrivalto'
const LINE1        = LINE1_PREFIX + LINE1_BRAND
const LINE2        = '¿en qué podemos ayudar?'
const CHAR_DELAY   = 42

export default function WelcomeScreen({ onSend }) {
  const [typed1, setTyped1] = useState('')
  const [typed2, setTyped2] = useState('')
  const [phase,  setPhase]  = useState('line1')

  useEffect(() => {
    if (phase === 'line1') {
      if (typed1.length < LINE1.length) {
        const t = setTimeout(() => setTyped1(LINE1.slice(0, typed1.length + 1)), CHAR_DELAY)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('line2'), 380)
        return () => clearTimeout(t)
      }
    }
    if (phase === 'line2') {
      if (typed2.length < LINE2.length) {
        const t = setTimeout(() => setTyped2(LINE2.slice(0, typed2.length + 1)), CHAR_DELAY)
        return () => clearTimeout(t)
      } else {
        setPhase('done')
      }
    }
  }, [phase, typed1, typed2])

  const brandTyped = typed1.slice(LINE1_PREFIX.length)
  const logoVisible = typed1.length >= LINE1.length

  return (
    <div className={styles.container}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>
          {typed1.slice(0, LINE1_PREFIX.length)}
          <span className={styles.brand}>
            <img
              src={logo}
              alt="Distrivalto"
              className={`${styles.logoInline} ${logoVisible ? styles.logoVisible : ''}`}
            />
            {brandTyped}
          </span>
          {phase === 'line1' && <span className={styles.cursor} />}
        </h1>

        {phase !== 'line1' && (
          <p className={styles.line2}>
            {typed2}
            {phase !== 'done' && <span className={styles.cursor} />}
          </p>
        )}
      </div>

      <p className={styles.subtitle}>
        Escribe tu consulta y un agente te responderá a la brevedad.
      </p>

      <div className={styles.inputWrapper}>
        <ChatInput onSend={onSend} placeholder="¿En qué podemos ayudarte?" centered />
      </div>
    </div>
  )
}
