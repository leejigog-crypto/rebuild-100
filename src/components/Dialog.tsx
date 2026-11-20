import { useEffect, useRef, type ReactNode } from 'react'
import './Dialog.css'

type Props = {
  titleId: string
  /** 상단 경고 줄무늬. 없으면 생략 */
  stripe?: 'hazard' | 'warning'
  maxWidth: number
  /** 기울기(deg) */
  tilt?: number
  /** 화면 위에서 떨어진 거리(px) */
  offsetTop?: number
  tone?: 'white' | 'yellow'
  onClose?: () => void
  children: ReactNode
}

/** Modal card with a thick ink border, hard shadow and optional hazard stripe. */
export function Dialog({ titleId, stripe, maxWidth, tilt = 0, offsetTop = 220, tone = 'white', onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
    if (!onClose) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="dialog-backdrop" style={{ paddingTop: offsetTop }}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`dialog dialog--${tone}`}
        style={{ maxWidth, transform: tilt ? `rotate(${tilt}deg)` : undefined }}
      >
        {stripe && <div aria-hidden="true" className={`dialog__stripe dialog__stripe--${stripe}`} />}
        {children}
      </div>
    </div>
  )
}
