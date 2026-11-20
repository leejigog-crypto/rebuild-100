import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CloseIcon, HamburgerIcon } from './Icons'
import './SiteMenu.css'

type Props = {
  /** `home`: 메인·인트로 (로그인). `game`: 진행 중 화면 (저장하기·나가기). */
  variant?: 'home' | 'game'
}

const links = [
  { label: '게임 소개', hash: '#steps' },
  { label: '갤러리', hash: '#gallery' },
  { label: '랭킹', hash: '#gallery' },
  { label: '내 집', hash: '#gallery' },
]

export function SiteMenu({ variant = 'home' }: Props) {
  const [open, setOpen] = useState(false)
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
            <Link key={l.label} to={{ pathname: '/', hash: l.hash }} onClick={close} className="site-menu__link">
              {l.label}
            </Link>
          ))}
          <span className="site-menu__rule" aria-hidden="true" />
          {variant === 'home' ? (
            <Link to="/" onClick={close} className="site-menu__sub">
              로그인
            </Link>
          ) : (
            <>
              {/* TODO(기능): 진행 상황 저장 */}
              <button type="button" className="site-menu__sub">
                저장하기
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
