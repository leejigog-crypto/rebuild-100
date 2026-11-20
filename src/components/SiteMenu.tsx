import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { saveProgressNow } from '../data/progress'
import { isServerEnabled } from '../lib/supabase'
import { CloseIcon, HamburgerIcon } from './Icons'
import { toast } from '../lib/toast'
import './SiteMenu.css'

type Props = {
  /** `home`: 메인·인트로. `game`: 진행 중 화면 (저장하기·나가기 추가). */
  variant?: 'home' | 'game'
}

const links = [
  { label: '게임 소개', to: '/#steps' },
  { label: '갤러리', to: '/gallery' },
  { label: '랭킹', to: '/gallery?tab=rank' },
  { label: '내 집', to: '/my' },
]

export function SiteMenu({ variant = 'home' }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const save = async () => {
    if (!isServerEnabled) {
      toast('이 브라우저에 저장돼 있어요.')
      return
    }
    setSaving(true)
    const ok = await saveProgressNow()
    setSaving(false)
    toast(ok ? '진행 상황을 저장했어요!' : '저장하지 못했어요. 잠시 뒤 다시 해 주세요.', ok ? 'ok' : 'error')
    if (ok) close()
  }

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <HamburgerIcon />}
      </button>

      {open && (
        <nav id="site-menu" aria-label="주요 메뉴" className={`site-menu site-menu--${variant}`}>
          {links.map((l) => (
            <Link key={l.label} to={l.to} onClick={close} className="site-menu__link">
              {l.label}
            </Link>
          ))}
          {variant === 'game' && (
            <>
              <span className="site-menu__rule" aria-hidden="true" />
              <button type="button" className="site-menu__sub" onClick={save} disabled={saving}>
                {saving ? '저장 중…' : '저장하기'}
              </button>
              <Link to="/" onClick={close} className="site-menu__sub">
                나가기
              </Link>
            </>
          )}
        </nav>
      )}
    </>
  )
}
