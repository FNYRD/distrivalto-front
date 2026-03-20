import { useEffect, useRef } from 'react'
import Message from './Message'
import styles from './MessageList.module.css'

export default function MessageList({ messages }) {
  const bottomRef = useRef(null)

  const lastId = messages[messages.length - 1]?.id
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lastId])

  return (
    <div className={styles.list}>
      {messages.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
