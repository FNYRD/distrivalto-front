import styles from './Message.module.css'

export default function Message({ message }) {
  const { role, content, image } = message

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
      <div className={styles.bubble}>
        {image && (
          <img src={image} alt="Imagen adjunta" className={styles.attachedImage} />
        )}
        {content && <span>{content}</span>}
      </div>
    </div>
  )
}
