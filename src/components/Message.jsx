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
