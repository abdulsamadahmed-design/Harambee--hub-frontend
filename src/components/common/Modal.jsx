import { useEffect } from 'react'
import Button from './Button'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
}) {
  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <Button variant="secondary" size="small" onClick={onClose}>
            Close
          </Button>
        </header>

        <div className="modal-content">{children}</div>
      </section>
    </div>
  )
}
