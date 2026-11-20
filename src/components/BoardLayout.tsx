import type { ReactNode } from 'react'
import { PixelCloud } from './Icons'
import { Logo } from './Logo'
import { SiteMenu } from './SiteMenu'
import './BoardLayout.css'

type Props = {
  title: string
  lead?: ReactNode
  /** 제목 오른쪽 (탭 등) */
  aside?: ReactNode
  children: ReactNode
}

/** 갤러리·랭킹·내 집·공유 화면 공통 틀 (하늘색 배경, 로고, 메뉴). */
export function BoardLayout({ title, lead, aside, children }: Props) {
  return (
    <div className="board">
      <PixelCloud className="board__cloud board__cloud--a" width={120} height={48} />
      <PixelCloud className="board__cloud board__cloud--b" width={90} height={36} />
      <Logo />
      <SiteMenu variant="home" />
      <main className="board__inner container">
        <header className="board__head">
          <div>
            <h1 className="stroke-title board__title">{title}</h1>
            {lead && <p className="board__lead">{lead}</p>}
          </div>
          {aside}
        </header>
        {children}
      </main>
    </div>
  )
}

/** 빈 목록·연결 안 됨 안내 */
export function BoardNotice({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="board__notice card">
      <p>{children}</p>
      {action}
    </div>
  )
}
