import { useEffect, useState } from 'react'
import { TOAST_EVENT as EVENT, type ToastMessage } from '../lib/toast'
import './Toaster.css'

export function Toaster() {
  const [items, setItems] = useState<ToastMessage[]>([])

  useEffect(() => {
    const onToast = (e: Event) => {
      const msg = (e as CustomEvent<ToastMessage>).detail
      setItems((list) => [...list.slice(-2), msg])
      window.setTimeout(() => setItems((list) => list.filter((m) => m.id !== msg.id)), 2600)
    }
    window.addEventListener(EVENT, onToast)
    return () => window.removeEventListener(EVENT, onToast)
  }, [])

  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((m) => (
        <p key={m.id} className={`toaster__item is-${m.tone}`}>
          {m.text}
        </p>
      ))}
    </div>
  )
}
