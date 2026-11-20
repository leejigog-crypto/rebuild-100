import type { ReactNode } from 'react'
import { photoStyle, type PhotoKey } from '../data/images'
import { Logo } from './Logo'
import { SiteMenu } from './SiteMenu'
import './GameScreen.css'

type Props = {
  photo: PhotoKey
  photoAlt: string
  /** 배경 사진 진입 효과: 천천히 줌아웃(kenburns) 또는 어둠에서 밝아짐(wake) */
  photoEffect?: 'kenburns' | 'wake'
  /** 사진 위 어둡게 깔리는 그라디언트 */
  shade: string
  hud?: ReactNode
  /** 콘텐츠를 아래(end) 또는 위(start)부터 쌓기 */
  align?: 'end' | 'start'
  /** 게임 진행 화면 전체를 덮는 대화상자 */
  dialog?: ReactNode
  children: ReactNode
}

/** Shared full-bleed layout for stage screens 2–5 (photo, logo, HUD, menu, content). */
export function GameScreen({ photo, photoAlt, photoEffect = 'kenburns', shade, hud, align = 'end', dialog, children }: Props) {
  return (
    <div className="game-screen">
      <div role="img" aria-label={photoAlt} className={`game-screen__photo photo is-${photoEffect}`} style={photoStyle(photo)} />
      <div aria-hidden="true" className="game-screen__shade" style={{ background: shade }} />
      <Logo />
      {hud}
      <SiteMenu variant="game" />
      <main className={`game-screen__body container is-${align}`}>{children}</main>
      {dialog}
    </div>
  )
}
